/**
 * Gestionnaire central des appels API pour éviter le rate limiting
 * Coordonne tous les appels API avec une queue et un throttling
 */

interface BaseApiCall {
  id: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  execute: () => Promise<unknown>;
  resolve: (value: unknown) => void;
  reject: (error: Error) => void;
  timestamp: number;
  maxRetries: number;
  currentRetries: number;
}

type ApiCall<T = unknown> = {
  id: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  execute: () => Promise<T>;
  resolve: (value: T) => void;
  reject: (error: Error) => void;
  timestamp: number;
  maxRetries: number;
  currentRetries: number;
};

// Cache des résultats récents pour éviter les appels en double
interface CachedResult {
  data: unknown;
  timestamp: number;
  expiresAt: number;
}

// Pending promises pour déduplication
type PendingPromise = {
  promise: Promise<unknown>;
  timestamp: number;
};

class ApiCallCoordinator {
  private static instance: ApiCallCoordinator;
  private queue: BaseApiCall[] = [];
  private isProcessing: boolean = false;
  private lastCallTime: number = 0;
  private minInterval: number = 1000; // 1 seconde minimum entre appels (réduit)
  private concurrentCalls: Set<string> = new Set();
  private maxConcurrentCalls: number = 3; // Augmenté à 3
  private rateLimitedUntil: number = 0;
  
  // Cache des résultats récents (évite les appels identiques)
  private resultCache: Map<string, CachedResult> = new Map();
  private readonly CACHE_TTL = 30000; // 30 secondes de cache par défaut
  
  // Pending promises pour déduplication (évite les appels parallèles identiques)
  private pendingCalls: Map<string, PendingPromise> = new Map();

  public static getInstance(): ApiCallCoordinator {
    if (!ApiCallCoordinator.instance) {
      ApiCallCoordinator.instance = new ApiCallCoordinator();
    }
    return ApiCallCoordinator.instance;
  }

  /**
   * Ajoute un appel API à la queue avec priorité
   * Avec cache et déduplication automatique
   */
  public async scheduleApiCall<T>(
    id: string,
    apiCall: () => Promise<T>,
    priority: 'low' | 'medium' | 'high' | 'critical' = 'medium',
    maxRetries: number = 2,
    cacheTTL?: number // TTL personnalisé en ms (0 = pas de cache)
  ): Promise<T> {
    const effectiveCacheTTL = cacheTTL ?? this.CACHE_TTL;
    
    // 1. Vérifier le cache d'abord (sauf si cacheTTL = 0)
    if (effectiveCacheTTL > 0) {
      const cached = this.resultCache.get(id);
      if (cached && Date.now() < cached.expiresAt) {
        console.log(`📦 Cache hit: ${id}`);
        return cached.data as T;
      }
    }
    
    // 2. Vérifier si un appel identique est déjà en cours (déduplication)
    const pending = this.pendingCalls.get(id);
    if (pending && Date.now() - pending.timestamp < 60000) { // 60s max pour pending
      console.log(`⏳ Appel API ${id} déjà en cours, réutilisation de la promesse`);
      return pending.promise as Promise<T>;
    }
    
    // 3. Créer une nouvelle promesse et l'enregistrer comme pending
    const callPromise = new Promise<T>((resolve, reject) => {
      const call: ApiCall<T> = {
        id,
        priority,
        execute: apiCall,
        resolve: (value: T) => {
          // Mettre en cache le résultat
          if (effectiveCacheTTL > 0) {
            this.resultCache.set(id, {
              data: value,
              timestamp: Date.now(),
              expiresAt: Date.now() + effectiveCacheTTL
            });
          }
          // Nettoyer le pending
          this.pendingCalls.delete(id);
          resolve(value);
        },
        reject: (error: Error) => {
          this.pendingCalls.delete(id);
          reject(error);
        },
        timestamp: Date.now(),
        maxRetries,
        currentRetries: 0
      };

      this.queue.push(call as BaseApiCall);
      this.sortQueue();
      this.processQueue();
    });
    
    // Enregistrer comme pending
    this.pendingCalls.set(id, { promise: callPromise, timestamp: Date.now() });
    
    return callPromise;
  }

  /**
   * Trie la queue par priorité et timestamp
   */
  private sortQueue(): void {
    this.queue.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return a.timestamp - b.timestamp; // FIFO pour même priorité
    });
  }

  /**
   * Traite la queue d'appels API
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }

    // Vérifier si on est rate limité
    if (Date.now() < this.rateLimitedUntil) {
      const waitTime = this.rateLimitedUntil - Date.now();
      console.log(`⏰ Rate limité, attente de ${Math.ceil(waitTime / 1000)}s`);
      setTimeout(() => this.processQueue(), waitTime);
      return;
    }

    // Vérifier le nombre d'appels concurrents
    if (this.concurrentCalls.size >= this.maxConcurrentCalls) {
      return; // Attendre qu'un appel se termine
    }

    this.isProcessing = true;

    try {
      const call = this.queue.shift();
      if (!call) {
        this.isProcessing = false;
        return;
      }

      // Respecter l'intervalle minimum
      const now = Date.now();
      const timeSinceLastCall = now - this.lastCallTime;
      if (timeSinceLastCall < this.minInterval) {
        const waitTime = this.minInterval - timeSinceLastCall;
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }

      // Marquer comme en cours
      this.concurrentCalls.add(call.id);
      this.lastCallTime = Date.now();

      console.log(`🚀 Exécution appel API: ${call.id} (priorité: ${call.priority})`);

      try {
        const result = await call.execute();
        call.resolve(result);
        console.log(`✅ Succès appel API: ${call.id}`);
      } catch (error: unknown) {
        const errorObj = error as { status?: number; message?: string; data?: { retryAfter?: number } };
        // Gestion du rate limiting
        if (errorObj.status === 429 || errorObj.message?.includes('429')) {
          this.handleRateLimit(errorObj);
          
          // Remettre en queue si on peut réessayer
          if (call.currentRetries < call.maxRetries) {
            call.currentRetries++;
            this.queue.unshift(call as BaseApiCall); // Remettre en priorité
            console.log(`🔄 Remise en queue: ${call.id} (tentative ${call.currentRetries}/${call.maxRetries})`);
          } else {
            call.reject(new Error(errorObj.message || 'Rate limit exceeded'));
            console.error(`❌ Échec définitif: ${call.id} après ${call.maxRetries} tentatives`);
          }
        } else {
          // Autres erreurs
          if (call.currentRetries < call.maxRetries) {
            call.currentRetries++;
            this.queue.push(call as BaseApiCall); // Remettre à la fin
            console.log(`🔄 Retry: ${call.id} (tentative ${call.currentRetries}/${call.maxRetries})`);
          } else {
            call.reject(error instanceof Error ? error : new Error(errorObj.message || 'Unknown error'));
            console.error(`❌ Échec: ${call.id}`, errorObj.message || 'Unknown error');
          }
        }
      } finally {
        // Retirer de la liste des appels en cours
        this.concurrentCalls.delete(call.id);
      }

    } finally {
      this.isProcessing = false;
      
      // Continuer le traitement s'il y a encore des éléments
      if (this.queue.length > 0) {
        setTimeout(() => this.processQueue(), 100);
      }
    }
  }

  /**
   * Gère le rate limiting avec backoff exponentiel
   */
  private handleRateLimit(errorObj: { status?: number; message?: string; data?: { retryAfter?: number } }): void {
    // Calculer le temps d'attente avec backoff
    const baseWait = errorObj.data?.retryAfter || 10000; // 10s par défaut (réduit)
    const currentWait = this.rateLimitedUntil > Date.now() 
      ? Math.min((this.rateLimitedUntil - Date.now()) * 1.5, 60000) // Backoff max 60s
      : baseWait;
    
    this.rateLimitedUntil = Date.now() + currentWait;
    this.minInterval = Math.min(Math.max(this.minInterval, 2000), 5000); // Entre 2s et 5s
    
    console.warn(`🚨 Rate limit détecté, pause de ${Math.ceil(currentWait / 1000)}s jusqu'à ${new Date(this.rateLimitedUntil).toLocaleTimeString()}`);
  }
  
  /**
   * Invalide le cache pour un endpoint spécifique
   */
  public invalidateCache(idPattern: string): void {
    for (const key of this.resultCache.keys()) {
      if (key.includes(idPattern)) {
        this.resultCache.delete(key);
        console.log(`🗑️ Cache invalidé: ${key}`);
      }
    }
  }
  
  /**
   * Nettoie le cache expiré
   */
  public cleanupCache(): void {
    const now = Date.now();
    for (const [key, value] of this.resultCache.entries()) {
      if (now > value.expiresAt) {
        this.resultCache.delete(key);
      }
    }
    // Aussi nettoyer les pending calls expirés
    for (const [key, value] of this.pendingCalls.entries()) {
      if (now - value.timestamp > 60000) {
        this.pendingCalls.delete(key);
      }
    }
  }

  /**
   * Annule tous les appels en queue pour un service donné
   */
  public cancelCallsForService(servicePrefix: string): void {
    const cancelledCalls = this.queue.filter(call => call.id.startsWith(servicePrefix));
    this.queue = this.queue.filter(call => !call.id.startsWith(servicePrefix));
    
    cancelledCalls.forEach(call => {
      call.reject(new Error('Appel annulé'));
    });
    
    console.log(`🚫 ${cancelledCalls.length} appels annulés pour ${servicePrefix}`);
  }

  /**
   * Obtient les statistiques de la queue
   */
  public getStats(): {
    queueLength: number;
    concurrentCalls: number;
    isRateLimited: boolean;
    nextAvailableTime: number;
  } {
    return {
      queueLength: this.queue.length,
      concurrentCalls: this.concurrentCalls.size,
      isRateLimited: Date.now() < this.rateLimitedUntil,
      nextAvailableTime: Math.max(this.rateLimitedUntil, this.lastCallTime + this.minInterval)
    };
  }

  /**
   * Force la réinitialisation (pour les tests)
   */
  public reset(): void {
    this.queue = [];
    this.concurrentCalls.clear();
    this.isProcessing = false;
    this.rateLimitedUntil = 0;
    this.minInterval = 1000;
    this.lastCallTime = 0;
    this.resultCache.clear();
    this.pendingCalls.clear();
  }
  
  /**
   * Vérifie si on est actuellement rate limité
   */
  public isRateLimited(): boolean {
    return Date.now() < this.rateLimitedUntil;
  }
  
  /**
   * Obtient le temps restant avant fin du rate limit
   */
  public getRateLimitRemaining(): number {
    return Math.max(0, this.rateLimitedUntil - Date.now());
  }
}

// Nettoyage périodique du cache (toutes les 60s)
setInterval(() => {
  ApiCallCoordinator.getInstance().cleanupCache();
}, 60000);

export const apiCoordinator = ApiCallCoordinator.getInstance();
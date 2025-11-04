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

class ApiCallCoordinator {
  private static instance: ApiCallCoordinator;
  private queue: BaseApiCall[] = [];
  private isProcessing: boolean = false;
  private lastCallTime: number = 0;
  private minInterval: number = 2000; // 2 secondes minimum entre appels
  private concurrentCalls: Set<string> = new Set();
  private maxConcurrentCalls: number = 2;
  private rateLimitedUntil: number = 0;

  public static getInstance(): ApiCallCoordinator {
    if (!ApiCallCoordinator.instance) {
      ApiCallCoordinator.instance = new ApiCallCoordinator();
    }
    return ApiCallCoordinator.instance;
  }

  /**
   * Ajoute un appel API à la queue avec priorité
   */
  public async scheduleApiCall<T>(
    id: string,
    apiCall: () => Promise<T>,
    priority: 'low' | 'medium' | 'high' | 'critical' = 'medium',
    maxRetries: number = 3
  ): Promise<T> {
    // Si déjà en cours, ne pas dupliquer
    if (this.concurrentCalls.has(id)) {
      console.log(`⏳ Appel API ${id} déjà en cours, ignoré`);
      throw new Error(`Appel ${id} déjà en cours`);
    }

    return new Promise<T>((resolve, reject) => {
      const call: ApiCall<T> = {
        id,
        priority,
        execute: apiCall,
        resolve,
        reject,
        timestamp: Date.now(),
        maxRetries,
        currentRetries: 0
      };

      this.queue.push(call as BaseApiCall);
      this.sortQueue();
      this.processQueue();
    });
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
   * Gère le rate limiting
   */
  private handleRateLimit(errorObj: { status?: number; message?: string; data?: { retryAfter?: number } }): void {
    const retryAfter = errorObj.data?.retryAfter || 30000; // 30s par défaut
    this.rateLimitedUntil = Date.now() + retryAfter;
    this.minInterval = Math.max(this.minInterval, 5000); // Augmenter l'intervalle minimum
    
    console.warn(`🚨 Rate limit détecté, pause jusqu'à ${new Date(this.rateLimitedUntil).toLocaleTimeString()}`);
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
    this.minInterval = 2000;
    this.lastCallTime = 0;
  }
}

export const apiCoordinator = ApiCallCoordinator.getInstance();
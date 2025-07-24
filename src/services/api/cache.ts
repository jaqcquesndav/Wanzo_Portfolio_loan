// src/services/api/cache.ts

/**
 * Durée de vie par défaut du cache en millisecondes (5 minutes)
 */
const DEFAULT_CACHE_TTL = 5 * 60 * 1000;

/**
 * Interface pour les entrées du cache
 */
interface CacheEntry<T> {
  data: T;
  expiry: number;
}

/**
 * Options de mise en cache
 */
export interface CacheOptions {
  /**
   * Durée de vie en millisecondes
   */
  ttl?: number;
  
  /**
   * Clé de cache personnalisée
   */
  key?: string;
  
  /**
   * Si true, ignore le cache et force une nouvelle requête
   */
  forceRefresh?: boolean;
}

/**
 * Type pour les valeurs de paramètres acceptées
 */
type ParamValue = string | number | boolean | null | undefined;

/**
 * Cache en mémoire pour les requêtes API
 */
class ApiCache {
  private cache: Record<string, CacheEntry<unknown>> = {};
  
  /**
   * Récupère une entrée du cache
   * @param key Clé de l'entrée
   * @returns Données si présentes et valides, null sinon
   */
  get<T>(key: string): T | null {
    const entry = this.cache[key];
    
    if (!entry) {
      return null;
    }
    
    // Vérifie si l'entrée est expirée
    if (entry.expiry < Date.now()) {
      this.delete(key);
      return null;
    }
    
    return entry.data as T;
  }
  
  /**
   * Ajoute ou met à jour une entrée dans le cache
   * @param key Clé de l'entrée
   * @param data Données à mettre en cache
   * @param ttl Durée de vie en millisecondes
   */
  set<T>(key: string, data: T, ttl = DEFAULT_CACHE_TTL): void {
    this.cache[key] = {
      data,
      expiry: Date.now() + ttl
    };
  }
  
  /**
   * Supprime une entrée du cache
   * @param key Clé de l'entrée
   */
  delete(key: string): void {
    delete this.cache[key];
  }
  
  /**
   * Vérifie si une entrée existe dans le cache et est valide
   * @param key Clé de l'entrée
   * @returns true si l'entrée existe et est valide
   */
  has(key: string): boolean {
    const entry = this.cache[key];
    
    if (!entry) {
      return false;
    }
    
    if (entry.expiry < Date.now()) {
      this.delete(key);
      return false;
    }
    
    return true;
  }
  
  /**
   * Vide toutes les entrées du cache
   */
  clear(): void {
    this.cache = {};
  }
  
  /**
   * Supprime toutes les entrées expirées du cache
   */
  clearExpired(): void {
    const now = Date.now();
    
    Object.keys(this.cache).forEach(key => {
      if (this.cache[key].expiry < now) {
        this.delete(key);
      }
    });
  }
  
  /**
   * Fonction utilitaire pour générer une clé de cache à partir d'un endpoint et de paramètres
   * @param endpoint URL de l'endpoint
   * @param params Paramètres optionnels
   * @returns Clé de cache
   */
  generateKey(endpoint: string, params?: Record<string, ParamValue>): string {
    if (!params) {
      return endpoint;
    }
    
    // Trie les clés pour garantir la cohérence des clés de cache
    const sortedParams = Object.keys(params)
      .sort()
      .reduce<Record<string, ParamValue>>((acc, key) => {
        acc[key] = params[key];
        return acc;
      }, {});
    
    return `${endpoint}:${JSON.stringify(sortedParams)}`;
  }
}

// Exporte une instance singleton du cache
export const apiCache = new ApiCache();

/**
 * Décorateur de fonction pour mettre en cache les résultats d'une fonction asynchrone
 * @param fn Fonction à décorer
 * @param options Options de mise en cache
 * @returns Fonction décorée
 */
export function withCache<T, Args extends unknown[]>(
  fn: (...args: Args) => Promise<T>,
  options?: CacheOptions
) {
  return async function(...args: Args): Promise<T> {
    const ttl = options?.ttl ?? DEFAULT_CACHE_TTL;
    const keyFn = options?.key ?? apiCache.generateKey.bind(apiCache);
    const forceRefresh = options?.forceRefresh ?? false;
    
    // Génère une clé basée sur la fonction et ses arguments
    const cacheKey = typeof keyFn === 'string' 
      ? keyFn 
      : keyFn(fn.name, { argsHash: JSON.stringify(args) });
    
    // Si on ne force pas le rafraîchissement, vérifie le cache
    if (!forceRefresh) {
      const cachedData = apiCache.get<T>(cacheKey);
      if (cachedData !== null) {
        return cachedData;
      }
    }
    
    // Exécute la fonction et met en cache le résultat
    const result = await fn(...args);
    apiCache.set(cacheKey, result, ttl);
    
    return result;
  };
}

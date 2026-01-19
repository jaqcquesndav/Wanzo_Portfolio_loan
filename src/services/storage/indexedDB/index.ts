// src/services/storage/indexedDB/index.ts
/**
 * Point d'entrée principal pour les services IndexedDB
 * 
 * IndexedDB est utilisé pour:
 * - Cache des données du backend (mode offline)
 * - Queue de synchronisation (opérations en attente)
 * - Persistance des données entre sessions
 */

// Export de la base de données
export { 
  openDatabase, 
  STORES,
  DB_NAME,
  DB_VERSION,
  type StoreName,
  type SyncQueueItem,
  type CacheItem 
} from './database';

// Export des opérations génériques
export {
  getById,
  getAll,
  getByIndex,
  put,
  add,
  remove,
  clear,
  putMany,
  setCache,
  getCache,
  cleanExpiredCache,
  getPendingSyncItems,
  markAsSynced,
  addToSyncQueue,
} from './operations';

// Export des stores spécifiques
export { portfolioStore } from './portfolioStore';
export { companyStore } from './companyStore';
export { creditRequestStore, creditContractStore } from './creditStore';
export { guaranteeStore } from './guaranteeStore';

// Export du gestionnaire de synchronisation
export {
  sync,
  startAutoSync,
  stopAutoSync,
  hasPendingSync,
  getPendingSyncCount,
  stores,
} from './syncManager';

// Fonction d'initialisation globale
export async function initializeIndexedDB(): Promise<void> {
  const { openDatabase } = await import('./database');
  
  try {
    console.log('🗄️ [IndexedDB] Initialisation...');
    await openDatabase();
    console.log('✅ [IndexedDB] Base de données prête');
    
    // Nettoyer le cache expiré au démarrage
    const { cleanExpiredCache } = await import('./operations');
    await cleanExpiredCache();
    
  } catch (error) {
    console.error('❌ [IndexedDB] Erreur d\'initialisation:', error);
    throw error;
  }
}

// Fonction pour vérifier si IndexedDB est supporté
export function isIndexedDBSupported(): boolean {
  return typeof indexedDB !== 'undefined';
}

// Fonction pour obtenir la taille approximative de la base de données
export async function getDatabaseSize(): Promise<{ usage: number; quota: number } | null> {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    const estimate = await navigator.storage.estimate();
    return {
      usage: estimate.usage || 0,
      quota: estimate.quota || 0,
    };
  }
  return null;
}

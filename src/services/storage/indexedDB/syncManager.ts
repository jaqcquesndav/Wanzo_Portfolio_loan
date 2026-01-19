// src/services/storage/indexedDB/syncManager.ts
/**
 * Gestionnaire de synchronisation pour IndexedDB
 * 
 * Gère la synchronisation bidirectionnelle entre le cache IndexedDB et le backend:
 * - Télécharge les données du backend vers IndexedDB (sync down)
 * - Envoie les modifications locales vers le backend (sync up)
 * - Gère les conflits et les retries
 */

import { 
  getPendingSyncItems, 
  markAsSynced, 
  incrementRetryCount,
  cleanExpiredCache 
} from './operations';
import { portfolioStore } from './portfolioStore';
import { companyStore } from './companyStore';
import { creditRequestStore, creditContractStore } from './creditStore';
import { guaranteeStore } from './guaranteeStore';
import { STORES, SyncQueueItem, StoreName } from './database';

const MAX_RETRY_COUNT = 3;
const SYNC_INTERVAL = 30000; // 30 secondes

let syncIntervalId: ReturnType<typeof setInterval> | null = null;
let isSyncing = false;

/**
 * Interface pour les handlers de synchronisation par store
 */
interface SyncHandler {
  create: (data: unknown) => Promise<void>;
  update: (data: unknown) => Promise<void>;
  delete: (data: { id: string }) => Promise<void>;
}

/**
 * Configuration des handlers de synchronisation par store
 * À personnaliser avec les vraies API
 */
const syncHandlers: Partial<Record<StoreName, SyncHandler>> = {
  [STORES.PORTFOLIOS]: {
    create: async (data) => {
      // Appeler l'API de création de portefeuille
      console.log('🔄 [Sync] Création portefeuille:', (data as { id: string }).id);
      // const response = await traditionalPortfolioApi.createPortfolio(data);
      // await portfolioStore.save(response);
    },
    update: async (data) => {
      console.log('🔄 [Sync] Mise à jour portefeuille:', (data as { id: string }).id);
      // await traditionalPortfolioApi.updatePortfolio(data.id, data);
    },
    delete: async (data) => {
      console.log('🔄 [Sync] Suppression portefeuille:', data.id);
      // await traditionalPortfolioApi.deletePortfolio(data.id);
    },
  },
  [STORES.CREDIT_REQUESTS]: {
    create: async (data) => {
      console.log('🔄 [Sync] Création demande de crédit:', (data as { id: string }).id);
    },
    update: async (data) => {
      console.log('🔄 [Sync] Mise à jour demande de crédit:', (data as { id: string }).id);
    },
    delete: async (data) => {
      console.log('🔄 [Sync] Suppression demande de crédit:', data.id);
    },
  },
  // Ajouter d'autres handlers selon les besoins
};

/**
 * Synchronise un élément de la queue
 */
async function syncItem(item: SyncQueueItem): Promise<boolean> {
  const handler = syncHandlers[item.storeName];
  
  if (!handler) {
    console.warn(`⚠️ [Sync] Pas de handler pour le store "${item.storeName}"`);
    return false;
  }
  
  try {
    switch (item.operation) {
      case 'create':
        await handler.create(item.data);
        break;
      case 'update':
        await handler.update(item.data);
        break;
      case 'delete':
        await handler.delete(item.data as { id: string });
        break;
    }
    
    // Marquer comme synchronisé
    await markAsSynced(item.id);
    console.log(`✅ [Sync] Élément synchronisé: ${item.id}`);
    return true;
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    console.error(`❌ [Sync] Erreur de synchronisation pour ${item.id}:`, errorMessage);
    
    // Incrémenter le compteur de retry
    await incrementRetryCount(item.id, errorMessage);
    return false;
  }
}

/**
 * Traite la queue de synchronisation
 */
async function processSyncQueue(): Promise<{ success: number; failed: number }> {
  const items = await getPendingSyncItems();
  
  // Filtrer les éléments qui ont dépassé le max de retries
  const itemsToSync = items.filter(item => item.retryCount < MAX_RETRY_COUNT);
  const expiredItems = items.filter(item => item.retryCount >= MAX_RETRY_COUNT);
  
  // Supprimer les éléments expirés
  for (const item of expiredItems) {
    await markAsSynced(item.id);
    console.warn(`⚠️ [Sync] Élément abandonné après ${MAX_RETRY_COUNT} tentatives:`, item.id);
  }
  
  let success = 0;
  let failed = 0;
  
  // Traiter les éléments par ordre chronologique
  const sortedItems = itemsToSync.sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
  
  for (const item of sortedItems) {
    const result = await syncItem(item);
    if (result) {
      success++;
    } else {
      failed++;
    }
  }
  
  return { success, failed };
}

/**
 * Vérifie si l'application est en ligne
 */
function isOnline(): boolean {
  return navigator.onLine;
}

/**
 * Démarre la synchronisation automatique
 */
export function startAutoSync(): void {
  if (syncIntervalId) {
    console.warn('⚠️ [Sync] Auto-sync déjà en cours');
    return;
  }
  
  console.log('🔄 [Sync] Démarrage de l\'auto-sync...');
  
  // Sync immédiate au démarrage
  sync().catch(console.error);
  
  // Sync périodique
  syncIntervalId = setInterval(() => {
    if (isOnline() && !isSyncing) {
      sync().catch(console.error);
    }
  }, SYNC_INTERVAL);
  
  // Écouter les événements de connexion
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
}

/**
 * Arrête la synchronisation automatique
 */
export function stopAutoSync(): void {
  if (syncIntervalId) {
    clearInterval(syncIntervalId);
    syncIntervalId = null;
    console.log('⏹️ [Sync] Auto-sync arrêté');
  }
  
  window.removeEventListener('online', handleOnline);
  window.removeEventListener('offline', handleOffline);
}

/**
 * Handler pour l'événement online
 */
function handleOnline(): void {
  console.log('🌐 [Sync] Connexion rétablie, synchronisation...');
  sync().catch(console.error);
}

/**
 * Handler pour l'événement offline
 */
function handleOffline(): void {
  console.log('📴 [Sync] Connexion perdue, mode offline activé');
}

/**
 * Lance une synchronisation manuelle
 */
export async function sync(): Promise<{ success: number; failed: number }> {
  if (isSyncing) {
    console.log('⏳ [Sync] Synchronisation déjà en cours...');
    return { success: 0, failed: 0 };
  }
  
  if (!isOnline()) {
    console.log('📴 [Sync] Pas de connexion, synchronisation reportée');
    return { success: 0, failed: 0 };
  }
  
  isSyncing = true;
  
  try {
    console.log('🔄 [Sync] Début de la synchronisation...');
    
    // Nettoyer le cache expiré
    await cleanExpiredCache();
    
    // Traiter la queue de synchronisation
    const result = await processSyncQueue();
    
    if (result.success > 0 || result.failed > 0) {
      console.log(`✅ [Sync] Terminé: ${result.success} succès, ${result.failed} échecs`);
    }
    
    return result;
    
  } finally {
    isSyncing = false;
  }
}

/**
 * Vérifie s'il y a des éléments en attente de synchronisation
 */
export async function hasPendingSync(): Promise<boolean> {
  const items = await getPendingSyncItems();
  return items.length > 0;
}

/**
 * Obtient le nombre d'éléments en attente de synchronisation
 */
export async function getPendingSyncCount(): Promise<number> {
  const items = await getPendingSyncItems();
  return items.length;
}

/**
 * Exporte les stores pour un accès centralisé
 */
export const stores = {
  portfolios: portfolioStore,
  companies: companyStore,
  creditRequests: creditRequestStore,
  creditContracts: creditContractStore,
  guarantees: guaranteeStore,
};

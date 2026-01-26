// src/services/storage/indexedDB/syncManager.ts
/**
 * Gestionnaire de synchronisation pour IndexedDB
 * 
 * Gère la synchronisation bidirectionnelle entre le cache IndexedDB et le backend:
 * - Télécharge les données du backend vers IndexedDB (sync down)
 * - Envoie les modifications locales vers le backend (sync up)
 * - Gère les conflits et les retries
 * - Affiche des notifications toast pour informer l'utilisateur
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
import { traditionalPortfolioApi } from '../../api/traditional/portfolio.api';
import { creditRequestApi } from '../../api/traditional/credit-request.api';
import { creditContractApi } from '../../api/traditional/credit-contract.api';
import { guaranteeApi } from '../../api/traditional/guarantee.api';
import { productionErrorHandler, ErrorType } from '../../api/productionErrorHandler';
import { isProduction } from '../../../config/environment';

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
 * Ces handlers appellent les vraies API en production
 */
const syncHandlers: Partial<Record<StoreName, SyncHandler>> = {
  [STORES.PORTFOLIOS]: {
    create: async (data) => {
      const portfolio = data as { id: string; name: string; [key: string]: unknown };
      console.log('🔄 [Sync] Création portefeuille:', portfolio.id);
      
      if (isProduction) {
        // En production, appeler l'API réelle
        const response = await traditionalPortfolioApi.createPortfolio(portfolio as Parameters<typeof traditionalPortfolioApi.createPortfolio>[0]);
        // Mettre à jour le store IndexedDB avec la réponse du serveur
        await portfolioStore.save(response);
      }
    },
    update: async (data) => {
      const portfolio = data as { id: string; [key: string]: unknown };
      console.log('🔄 [Sync] Mise à jour portefeuille:', portfolio.id);
      
      if (isProduction) {
        await traditionalPortfolioApi.updatePortfolio(portfolio.id, portfolio);
      }
    },
    delete: async (data) => {
      console.log('🔄 [Sync] Suppression portefeuille:', data.id);
      
      if (isProduction) {
        await traditionalPortfolioApi.deletePortfolio(data.id);
      }
    },
  },
  [STORES.CREDIT_REQUESTS]: {
    create: async (data) => {
      const request = data as { id: string; [key: string]: unknown };
      console.log('🔄 [Sync] Création demande de crédit:', request.id);
      
      if (isProduction) {
        const response = await creditRequestApi.createRequest(request as Parameters<typeof creditRequestApi.createRequest>[0]);
        await creditRequestStore.save(response);
      }
    },
    update: async (data) => {
      const request = data as { id: string; status?: string; [key: string]: unknown };
      console.log('🔄 [Sync] Mise à jour demande de crédit:', request.id);
      
      if (isProduction && request.status) {
        await creditRequestApi.updateRequestStatus(request.id, request.status as Parameters<typeof creditRequestApi.updateRequestStatus>[1]);
      }
    },
    delete: async (data) => {
      console.log('🔄 [Sync] Suppression demande de crédit:', data.id);
      // Note: L'API peut ne pas supporter la suppression directe
    },
  },
  [STORES.CREDIT_CONTRACTS]: {
    create: async (data) => {
      const contract = data as { id: string; portfolioId?: string; [key: string]: unknown };
      console.log('🔄 [Sync] Création contrat de crédit:', contract.id);
      
      if (isProduction && contract.portfolioId) {
        const response = await creditContractApi.createContract(contract.portfolioId, contract as Parameters<typeof creditContractApi.createContract>[1]);
        await creditContractStore.save(response);
      }
    },
    update: async (data) => {
      const contract = data as { id: string; portfolioId?: string; [key: string]: unknown };
      console.log('🔄 [Sync] Mise à jour contrat de crédit:', contract.id);
      
      if (isProduction && contract.portfolioId) {
        await creditContractApi.updateContract(contract.portfolioId, contract.id, contract);
      }
    },
    delete: async (data) => {
      console.log('🔄 [Sync] Suppression contrat de crédit:', data.id);
    },
  },
  [STORES.GUARANTEES]: {
    create: async (data) => {
      const guarantee = data as { id: string; portfolioId?: string; contractId?: string; [key: string]: unknown };
      console.log('🔄 [Sync] Création garantie:', guarantee.id);
      
      if (isProduction && guarantee.portfolioId && guarantee.contractId) {
        const response = await guaranteeApi.createGuarantee(
          guarantee.portfolioId, 
          guarantee.contractId, 
          guarantee as Parameters<typeof guaranteeApi.createGuarantee>[2]
        );
        await guaranteeStore.save(response);
      }
    },
    update: async (data) => {
      const guarantee = data as { id: string; portfolioId?: string; contractId?: string; [key: string]: unknown };
      console.log('🔄 [Sync] Mise à jour garantie:', guarantee.id);
      
      if (isProduction && guarantee.portfolioId && guarantee.contractId) {
        await guaranteeApi.updateGuarantee(
          guarantee.portfolioId, 
          guarantee.contractId, 
          guarantee.id, 
          guarantee
        );
      }
    },
    delete: async (data) => {
      console.log('🔄 [Sync] Suppression garantie:', data.id);
    },
  },
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
  
  // Notifier l'utilisateur des éléments expirés
  for (const item of expiredItems) {
    await markAsSynced(item.id);
    console.warn(`⚠️ [Sync] Élément abandonné après ${MAX_RETRY_COUNT} tentatives:`, item.id);
    
    // Notifier l'utilisateur que certaines modifications n'ont pas pu être synchronisées
    productionErrorHandler.showWarning(
      `Une modification n'a pas pu être synchronisée après ${MAX_RETRY_COUNT} tentatives.`,
      { duration: 5000 }
    );
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
  
  // Notifier l'utilisateur
  productionErrorHandler.showInfo('Connexion rétablie. Synchronisation en cours...', { duration: 3000 });
  
  // Lancer la synchronisation
  sync().then(result => {
    if (result.success > 0) {
      productionErrorHandler.showSuccess(
        `${result.success} modification(s) synchronisée(s) avec succès.`,
        { duration: 3000 }
      );
    }
  }).catch(console.error);
}

/**
 * Handler pour l'événement offline
 */
function handleOffline(): void {
  console.log('📴 [Sync] Connexion perdue, mode offline activé');
  
  // Notifier l'utilisateur
  productionErrorHandler.showWarning(
    'Connexion perdue. Vos modifications seront synchronisées lors de la reconnexion.',
    { duration: 5000 }
  );
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

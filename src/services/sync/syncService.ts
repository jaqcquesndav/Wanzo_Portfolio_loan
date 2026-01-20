import { networkService } from './networkService';
import { apiClient } from '../api/base.api';
import { getAccessToken } from '../api/authHeaders';
import { API_CONFIG } from '../../config/api';

export interface SyncQueueItem {
  id: string;
  action: 'create' | 'update' | 'delete';
  entity: string;
  data: Record<string, unknown>;
  timestamp: number;
  retries: number;
  priority: number;
}

// Helper functions for localStorage
const LOCAL_STORAGE_PREFIX = 'wanzo_';

/**
 * Helper functions to work with localStorage instead of IndexedDB
 */
const localStorageDB = {
  add: (store: string, item: Record<string, unknown>): void => {
    const storeKey = `${LOCAL_STORAGE_PREFIX}${store}`;
    const currentData = JSON.parse(localStorage.getItem(storeKey) || '[]');
    currentData.push(item);
    localStorage.setItem(storeKey, JSON.stringify(currentData));
  },
  
  update: (store: string, id: string, data: Record<string, unknown>): void => {
    const storeKey = `${LOCAL_STORAGE_PREFIX}${store}`;
    const currentData = JSON.parse(localStorage.getItem(storeKey) || '[]');
    const index = currentData.findIndex((item: Record<string, unknown>) => item.id === id);
    
    if (index >= 0) {
      currentData[index] = { ...currentData[index], ...data };
      localStorage.setItem(storeKey, JSON.stringify(currentData));
    }
  },
  
  delete: (store: string, id: string): void => {
    const storeKey = `${LOCAL_STORAGE_PREFIX}${store}`;
    const currentData = JSON.parse(localStorage.getItem(storeKey) || '[]');
    const filtered = currentData.filter((item: Record<string, unknown>) => item.id !== id);
    localStorage.setItem(storeKey, JSON.stringify(filtered));
  },
  
  getAll: (store: string): Record<string, unknown>[] => {
    const storeKey = `${LOCAL_STORAGE_PREFIX}${store}`;
    return JSON.parse(localStorage.getItem(storeKey) || '[]');
  },
  
  clearStore: (store: string): void => {
    const storeKey = `${LOCAL_STORAGE_PREFIX}${store}`;
    localStorage.setItem(storeKey, '[]');
  }
};

class SyncService {
  private syncInterval: number = 5 * 60 * 1000; // 5 minutes
  private intervalId?: number;
  private isSyncing: boolean = false;
  private retryTimeout: number = 60 * 1000; // 60 seconds (augmenté)
  private consecutiveErrors: number = 0;
  private maxConsecutiveErrors: number = 3; // Arrêter après 3 erreurs consécutives
  private syncDisabledUntil: number = 0; // Timestamp jusqu'auquel la sync est désactivée
  private readonly SYNC_PAUSE_DURATION = 2 * 60 * 1000; // 2 minutes de pause après erreurs répétées

  async checkSyncStatus(): Promise<{ canSync: boolean; message?: string }> {
    try {
      // For demo/development, return success
      if (import.meta.env.DEV) {
        return { canSync: true };
      }

      const response = await apiClient.get(API_CONFIG.endpoints.sync.status);
      if (typeof response === 'object' && response !== null && 'status' in response) {
        return {
          canSync: (response as { status: string }).status === 'ready',
          message: (response as { message?: string }).message
        };
      }
      return {
        canSync: false,
        message: 'Invalid response from sync status endpoint'
      };
    } catch (error) {
      console.error('Error checking sync status:', error);
      return {
        canSync: false,
        message: 'Failed to check sync status'
      };
    }
  }

  startSync(): void {
    // Vérifier si l'utilisateur est connecté
    const token = getAccessToken();
    if (!token) {
      console.warn('No authentication token found, sync disabled');
      return;
    }

    // Arrêter toute synchronisation existante
    this.stopSync();
    
    // Réinitialiser les compteurs d'erreurs
    this.consecutiveErrors = 0;
    this.syncDisabledUntil = 0;

    // Démarrer la nouvelle synchronisation avec un intervalle plus long
    this.intervalId = window.setInterval(() => {
      // Vérifier si la sync n'est pas désactivée temporairement
      if (Date.now() < this.syncDisabledUntil) {
        console.log(`⏸️ Sync désactivée temporairement (${Math.ceil((this.syncDisabledUntil - Date.now()) / 1000)}s restantes)`);
        return;
      }
      void this.sync();
    }, this.syncInterval);

    // Écouter les changements de connectivité (avec debounce)
    let onlineTimeout: number | undefined;
    networkService.addListener('online', () => {
      // Debounce pour éviter les appels multiples
      if (onlineTimeout) window.clearTimeout(onlineTimeout);
      onlineTimeout = window.setTimeout(() => {
        if (Date.now() >= this.syncDisabledUntil) {
          void this.sync();
        }
      }, 5000); // Attendre 5s après reconnexion
    });

    // Synchronisation initiale différée (attendre que l'app soit prête)
    setTimeout(() => {
      void this.sync();
    }, 10000); // 10s après démarrage
  }

  stopSync(): void {
    if (this.intervalId) {
      window.clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
  }

  private async sync(): Promise<void> {
    // Protection contre les appels multiples
    if (this.isSyncing) {
      console.log('⏳ Sync déjà en cours, ignoré');
      return;
    }
    
    // Vérifier si la sync est désactivée
    if (Date.now() < this.syncDisabledUntil) {
      return;
    }
    
    // Vérifier la connectivité sans faire de requête HTTP
    if (!networkService.isOnline()) {
      return;
    }

    this.isSyncing = true;

    try {
      // Permettre de désactiver la synchronisation réseau (offline)
      const { SYNC_ENABLED } = await import('../../config/sync');
      if (!SYNC_ENABLED) {
        console.info('Synchronisation réseau désactivée (mode offline)');
        this.isSyncing = false;
        return;
      }

      // Vérifier la connectivité (utilise le cache si disponible)
      const isConnected = await networkService.checkConnectivity();
      if (!isConnected) {
        // Ne pas compter comme erreur, juste skip
        this.isSyncing = false;
        return;
      }

      const token = getAccessToken();
      if (!token) {
        this.isSyncing = false;
        return;
      }

      // Vérifier l'état de la synchronisation
      const syncStatus = await this.checkSyncStatus();
      if (!syncStatus.canSync) {
        console.log('Sync not needed:', syncStatus.message);
        // Succès, réinitialiser le compteur d'erreurs
        this.consecutiveErrors = 0;
        this.isSyncing = false;
        return;
      }

      // Récupérer les modifications du serveur
      const serverChanges = await apiClient.get(API_CONFIG.endpoints.sync.pull);
      // Appliquer les modifications du serveur (si tableau)
      if (Array.isArray(serverChanges)) {
        await this.applyServerChanges(serverChanges);
      }

      // Récupérer les modifications locales
      const localChanges = await this.getLocalChanges();
      
      // Envoyer les modifications locales
      if (localChanges.length > 0) {
        await apiClient.post(API_CONFIG.endpoints.sync.push, { changes: localChanges });
        
        // Vider la file de synchronisation
        localStorageDB.clearStore('sync_queue');
      }
      
      // Succès, réinitialiser le compteur d'erreurs
      this.consecutiveErrors = 0;
      
    } catch (error) {
      this.consecutiveErrors++;
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Ne loguer que si c'est une vraie erreur (pas juste "no network")
      if (!errorMessage.includes('network') && !errorMessage.includes('No network')) {
        console.error('Sync error:', {
          message: errorMessage,
          timestamp: new Date().toISOString(),
          consecutiveErrors: this.consecutiveErrors
        });
      }

      // Si trop d'erreurs consécutives, désactiver temporairement la sync
      if (this.consecutiveErrors >= this.maxConsecutiveErrors) {
        this.syncDisabledUntil = Date.now() + this.SYNC_PAUSE_DURATION;
        console.warn(`⚠️ Sync désactivée pour ${this.SYNC_PAUSE_DURATION / 1000}s après ${this.consecutiveErrors} erreurs consécutives`);
        this.consecutiveErrors = 0; // Reset pour permettre un nouveau cycle après la pause
      }

      // Ne PAS retry automatiquement - laisser l'intervalle normal gérer ça
      // Cela évite les boucles de retry qui causent le rate limiting
    } finally {
      this.isSyncing = false;
    }
  }

  private async applyServerChanges(changes: unknown[]): Promise<void> {
    for (const change of changes) {
      try {
        if (
          typeof change === 'object' && change !== null &&
          'type' in change && 'entity' in change && 'data' in change
        ) {
          const typedChange = change as { type: string; entity: string; data: { id: string }; id?: string };
          // Only allow string entity keys
          if (typeof typedChange.entity === 'string') {
            const entity = typedChange.entity;
            // Only allow create/update/delete for non-cache/sync_queue stores with minimal type check
            if (entity !== 'cache' && entity !== 'sync_queue') {
              switch (typedChange.type) {
                case 'create':
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  localStorageDB.add(entity, typedChange.data as any);
                  break;
                case 'update':
                  if (typedChange.id) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    localStorageDB.update(entity, typedChange.id, typedChange.data as any);
                  }
                  break;
                case 'delete':
                  if (typedChange.id) {
                    localStorageDB.delete(entity, typedChange.id);
                  }
                  break;
              }
            } else {
              console.warn('Skipping server change for reserved store:', entity);
            }
          } else {
            console.warn('Invalid entity type for change:', typedChange.entity);
          }
        } else {
          console.warn('Invalid change object from server:', change);
        }
      } catch (error) {
        console.error(`Error applying server change:`, error);
        // Log the failed change for retry
        if (typeof change === 'object' && change !== null) {
          await this.logFailedChange(change as Record<string, unknown>);
        }
      }
    }
  }

  private async getLocalChanges(): Promise<SyncQueueItem[]> {
    try {
      // Première conversion en unknown pour contourner le problème de typage
      const items = localStorageDB.getAll('sync_queue');
      
      // Conversion en tableau de SyncQueueItem après filtrage
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (items as any[]).filter((item: any): item is SyncQueueItem => 
        typeof item === 'object' && 
        item !== null && 
        'id' in item &&
        'action' in item &&
        'entity' in item &&
        'data' in item &&
        'timestamp' in item &&
        'retries' in item &&
        'priority' in item
      );
    } catch (error) {
      console.error('Error getting local changes:', error);
      return [];
    }
  }

  private async logFailedChange(change: Record<string, unknown>): Promise<void> {
    try {
      // Respecte la structure de sync_queue
      localStorageDB.add('sync_queue', {
        ...(change as {
          id: string;
          action: 'create' | 'update' | 'delete';
          entity: string;
          data: Record<string, unknown>;
          priority?: number;
        }),
        retries: 0,
        timestamp: Date.now(),
        priority: (change as { priority?: number }).priority ?? 0
      });
    } catch (error) {
      console.error('Error logging failed change:', error);
    }
  }
}

export const syncService = new SyncService();
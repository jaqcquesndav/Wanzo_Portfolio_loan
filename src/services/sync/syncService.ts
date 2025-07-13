import { networkService } from './networkService';
import { apiClient } from '../api/base.api';
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
  private retryTimeout: number = 30 * 1000; // 30 seconds
  // private maxRetries: number = 3;

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
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('No authentication token found, sync disabled');
      return;
    }

    // Arrêter toute synchronisation existante
    this.stopSync();

    // Démarrer la nouvelle synchronisation
    this.intervalId = window.setInterval(() => {
      void this.sync();
    }, this.syncInterval);

    // Écouter les changements de connectivité
    networkService.addListener('online', () => {
      void this.sync();
    });

    // Synchronisation initiale
    void this.sync();
  }

  stopSync(): void {
    if (this.intervalId) {
      window.clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
  }

  private async sync(): Promise<void> {
    if (this.isSyncing || !networkService.isOnline()) {
      return;
    }

    this.isSyncing = true;

    try {
      // Permettre de désactiver la synchronisation réseau (offline)
      const { SYNC_ENABLED } = await import('../../config/sync');
      if (!SYNC_ENABLED) {
        console.info('Synchronisation réseau désactivée (mode offline)');
        return;
      }

      // Vérifier la connectivité et l'authentification
      const isConnected = await networkService.checkConnectivity();
      if (!isConnected) {
        throw new Error('No network connection');
      }

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token');
      }

      // Vérifier l'état de la synchronisation
      const syncStatus = await this.checkSyncStatus();
      if (!syncStatus.canSync) {
        console.log('Sync not needed:', syncStatus.message);
        return;
      }

      // Récupérer les modifications du serveur
      const serverChanges = await apiClient.get(API_CONFIG.endpoints.sync.pull);
      // Appliquer les modifications du serveur (si tableau)
      if (Array.isArray(serverChanges)) {
        await this.applyServerChanges(serverChanges);
      } else {
        console.warn('Server changes is not an array:', serverChanges);
      }

      // Récupérer les modifications locales
      const localChanges = await this.getLocalChanges();
      
      // Envoyer les modifications locales
      if (localChanges.length > 0) {
        await apiClient.post(API_CONFIG.endpoints.sync.push, { changes: localChanges });
        
        // Vider la file de synchronisation
        localStorageDB.clearStore('sync_queue');
      }
    } catch (error) {
      console.error('Sync error:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });

      // Store failed sync attempt in localStorage for retry
      try {
        localStorageDB.add('sync_queue', {
          id: crypto.randomUUID(),
          action: 'update',
          entity: 'sync_error',
          data: { error: error instanceof Error ? error.message : 'Unknown error' },
          timestamp: Date.now(),
          retries: 0,
          priority: 0
        });
      } catch (e) {
        console.error('Failed to log sync error:', e);
      }

      // Retry logic for network errors
      if (error instanceof Error && 
         (error.message.includes('network') || error.message.includes('timeout'))) {
        setTimeout(() => void this.sync(), this.retryTimeout);
      }
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
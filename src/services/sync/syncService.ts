import { db } from '../db/indexedDB';
import { networkService } from './networkService';
import { apiClient } from '../api/base.api';
import { API_CONFIG } from '../../config/api';
import { useNotification } from '../../contexts/NotificationContext';

class SyncService {
  private syncInterval: number = 5 * 60 * 1000; // 5 minutes
  private intervalId?: number;
  private isSyncing: boolean = false;
  private retryTimeout: number = 30 * 1000; // 30 seconds
  private maxRetries: number = 3;

  async checkSyncStatus(): Promise<{ canSync: boolean; message?: string }> {
    try {
      // For demo/development, return success
      if (import.meta.env.DEV) {
        return { canSync: true };
      }

      const response = await apiClient.get(API_CONFIG.endpoints.sync.status);
      return {
        canSync: response.status === 'ready',
        message: response.message
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
      
      // Appliquer les modifications du serveur
      await this.applyServerChanges(serverChanges);

      // Récupérer les modifications locales
      const localChanges = await this.getLocalChanges();
      
      // Envoyer les modifications locales
      if (localChanges.length > 0) {
        await apiClient.post(API_CONFIG.endpoints.sync.push, { changes: localChanges });
        
        // Vider la file de synchronisation
        await db.clearStore('sync_queue');
      }
    } catch (error) {
      console.error('Sync error:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });

      // Store failed sync attempt in IndexedDB for retry
      try {
        await db.add('sync_queue', {
          id: crypto.randomUUID(),
          timestamp: Date.now(),
          error: error instanceof Error ? error.message : 'Unknown error',
          retries: 0
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

  private async applyServerChanges(changes: any[]): Promise<void> {
    for (const change of changes) {
      try {
        switch (change.type) {
          case 'create':
            await db.add(change.entity, change.data);
            break;
          case 'update':
            await db.update(change.entity, change.id, change.data);
            break;
          case 'delete':
            await db.delete(change.entity, change.id);
            break;
        }
      } catch (error) {
        console.error(`Error applying server change:`, error);
        // Log the failed change for retry
        await this.logFailedChange(change);
      }
    }
  }

  private async getLocalChanges(): Promise<any[]> {
    try {
      return await db.getAll('sync_queue');
    } catch (error) {
      console.error('Error getting local changes:', error);
      return [];
    }
  }

  private async logFailedChange(change: any): Promise<void> {
    try {
      await db.add('sync_queue', {
        ...change,
        retries: 0,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Error logging failed change:', error);
    }
  }
}

export const syncService = new SyncService();
// Service pour la sauvegarde locale des formulaires via IndexedDB
import { openDB, type IDBPDatabase } from 'idb';
import { getAuthHeaders } from './api/authHeaders';

interface PendingForm {
  id: string;
  type: 'portfolio' | 'credit_request' | 'credit_contract';
  data: Record<string, unknown>;
  timestamp: number;
  status: 'pending' | 'synced' | 'failed';
}

class LocalStorageService {
  private db: IDBPDatabase | null = null;
  private dbName = 'WanzoPortfolioForms';
  private dbVersion = 1;

  async initDB(): Promise<void> {
    try {
      this.db = await openDB(this.dbName, this.dbVersion, {
        upgrade(db) {
          if (!db.objectStoreNames.contains('pending_forms')) {
            const store = db.createObjectStore('pending_forms', {
              keyPath: 'id'
            });
            store.createIndex('type', 'type');
            store.createIndex('status', 'status');
            store.createIndex('timestamp', 'timestamp');
          }
        },
      });
    } catch (error) {
      console.error('Erreur lors de l\'initialisation de IndexedDB:', error);
      throw error;
    }
  }

  async saveForm(type: PendingForm['type'], data: Record<string, unknown>): Promise<string> {
    if (!this.db) await this.initDB();
    
    const id = `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const pendingForm: PendingForm = {
      id,
      type,
      data,
      timestamp: Date.now(),
      status: 'pending'
    };

    try {
      await this.db!.put('pending_forms', pendingForm);
      console.log(`Formulaire ${type} sauvegardé localement:`, id);
      return id;
    } catch (error) {
      console.error('Erreur lors de la sauvegarde locale:', error);
      throw error;
    }
  }

  async getPendingForms(type?: PendingForm['type']): Promise<PendingForm[]> {
    if (!this.db) await this.initDB();

    try {
      if (type) {
        return await this.db!.getAllFromIndex('pending_forms', 'type', type);
      }
      return await this.db!.getAll('pending_forms');
    } catch (error) {
      console.error('Erreur lors de la récupération des formulaires:', error);
      return [];
    }
  }

  async updateFormStatus(id: string, status: PendingForm['status']): Promise<void> {
    if (!this.db) await this.initDB();

    try {
      const form = await this.db!.get('pending_forms', id);
      if (form) {
        form.status = status;
        await this.db!.put('pending_forms', form);
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      throw error;
    }
  }

  async deleteForm(id: string): Promise<void> {
    if (!this.db) await this.initDB();

    try {
      await this.db!.delete('pending_forms', id);
    } catch (error) {
      console.error('Erreur lors de la suppression du formulaire:', error);
      throw error;
    }
  }

  async syncPendingForms(): Promise<{ success: number; failed: number }> {
    if (!this.db) await this.initDB();
    
    const pendingForms = await this.getPendingForms();
    const pendingOnly = pendingForms.filter(form => form.status === 'pending');
    
    let success = 0;
    let failed = 0;

    for (const form of pendingOnly) {
      try {
        // Tentative de synchronisation avec le backend
        await this.syncFormToBackend(form);
        await this.updateFormStatus(form.id, 'synced');
        success++;
      } catch (error) {
        console.error(`Échec de synchronisation pour ${form.id}:`, error);
        await this.updateFormStatus(form.id, 'failed');
        failed++;
      }
    }

    return { success, failed };
  }

  private async syncFormToBackend(form: PendingForm): Promise<void> {
    // Endpoints API pour la synchronisation
    const endpoints = {
      portfolio: '/api/portfolios',
      credit_request: '/api/credit-requests',
      credit_contract: '/api/credit-contracts'
    };

    const response = await fetch(endpoints[form.type], {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(form.data)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  }

  async getFormCount(): Promise<number> {
    if (!this.db) await this.initDB();
    
    try {
      return await this.db!.count('pending_forms');
    } catch (error) {
      console.error('Erreur lors du comptage des formulaires:', error);
      return 0;
    }
  }

  async clearSyncedForms(): Promise<void> {
    if (!this.db) await this.initDB();
    
    try {
      const syncedForms = await this.db!.getAllFromIndex('pending_forms', 'status', 'synced');
      for (const form of syncedForms) {
        await this.deleteForm(form.id);
      }
    } catch (error) {
      console.error('Erreur lors du nettoyage des formulaires synchronisés:', error);
    }
  }
}

export const localStorageService = new LocalStorageService();
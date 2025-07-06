import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface FinanceFlowDB extends DBSchema {
  operations: {
    key: string;
    value: any;
    indexes: { 'by-date': string; 'by-status': string; 'by-type': string };
  };
  messages: {
    key: string;
    value: any;
    indexes: { 'by-date': string; 'by-status': string; 'by-category': string };
  };
  meetings: {
    key: string;
    value: any;
    indexes: { 'by-date': string; 'by-status': string; 'by-type': string };
  };
  portfolios: {
    key: string;
    value: any;
    indexes: { 'by-type': string; 'by-status': string };
  };
  companies: {
    key: string;
    value: any;
    indexes: { 'by-sector': string; 'by-status': string };
  };
  sync_queue: {
    key: string;
    value: {
      id: string;
      action: 'create' | 'update' | 'delete';
      entity: string;
      data: any;
      timestamp: number;
      retries: number;
      priority: number;
    };
  };
  cache: {
    key: string;
    value: {
      data: any;
      timestamp: number;
      expiresIn: number;
    };
  };
}

class IndexedDBService {
  private db: IDBPDatabase<FinanceFlowDB> | null = null;
  private dbName = 'financeflow_db';
  private version = 1;
  private initPromise: Promise<void> | null = null;
  private cacheExpiryTime = 5 * 60 * 1000; // 5 minutes

  async init(): Promise<void> {
    if (this.initPromise) return this.initPromise;

    this.initPromise = new Promise(async (resolve, reject) => {
      try {
        this.db = await openDB<FinanceFlowDB>(this.dbName, this.version, {
          upgrade: (db, oldVersion, newVersion, transaction) => {
            // Create stores and indexes
            if (!db.objectStoreNames.contains('operations')) {
              const operationsStore = db.createObjectStore('operations', { keyPath: 'id' });
              operationsStore.createIndex('by-date', 'created_at');
              operationsStore.createIndex('by-status', 'status');
              operationsStore.createIndex('by-type', 'type');
            }

            if (!db.objectStoreNames.contains('messages')) {
              const messagesStore = db.createObjectStore('messages', { keyPath: 'id' });
              messagesStore.createIndex('by-date', 'created_at');
              messagesStore.createIndex('by-status', 'status');
              messagesStore.createIndex('by-category', 'category');
            }

            if (!db.objectStoreNames.contains('meetings')) {
              const meetingsStore = db.createObjectStore('meetings', { keyPath: 'id' });
              meetingsStore.createIndex('by-date', 'date');
              meetingsStore.createIndex('by-status', 'status');
              meetingsStore.createIndex('by-type', 'type');
            }

            if (!db.objectStoreNames.contains('portfolios')) {
              const portfoliosStore = db.createObjectStore('portfolios', { keyPath: 'id' });
              portfoliosStore.createIndex('by-type', 'type');
              portfoliosStore.createIndex('by-status', 'status');
            }

            if (!db.objectStoreNames.contains('companies')) {
              const companiesStore = db.createObjectStore('companies', { keyPath: 'id' });
              companiesStore.createIndex('by-sector', 'sector');
              companiesStore.createIndex('by-status', 'status');
            }

            if (!db.objectStoreNames.contains('sync_queue')) {
              const syncQueueStore = db.createObjectStore('sync_queue', { keyPath: 'id' });
              syncQueueStore.createIndex('by-priority', 'priority');
            }

            if (!db.objectStoreNames.contains('cache')) {
              db.createObjectStore('cache', { keyPath: 'id' });
            }
          }
        });
        resolve();
      } catch (error) {
        reject(error);
        this.initPromise = null; // Reset to allow retrying
      }
    });

    return this.initPromise;
  }

  // Cache methods
  async setCache(key: string, data: any, expiresIn: number = this.cacheExpiryTime): Promise<void> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');
    
    await this.db.put('cache', {
      id: key,
      data,
      timestamp: Date.now(),
      expiresIn
    });
  }

  async getCache<T>(key: string): Promise<T | null> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');
    
    const cached = await this.db.get('cache', key);
    
    if (!cached) return null;
    
    if (Date.now() - cached.timestamp > cached.expiresIn) {
      await this.db.delete('cache', key);
      return null;
    }
    
    return cached.data as T;
  }

  async clearCache(): Promise<void> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');
    await this.db.clear('cache');
  }

  // CRUD methods
  async add<T extends { id: string }>(storeName: keyof FinanceFlowDB, item: T): Promise<string> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');
    
    try {
      await this.db.add(storeName, item);
      return item.id;
    } catch (error) {
      if ((error as any).name === 'ConstraintError') {
        await this.update(storeName, item.id, item);
        return item.id;
      }
      throw error;
    }
  }

  async update<T>(storeName: keyof FinanceFlowDB, id: string, item: T): Promise<void> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');
    await this.db.put(storeName, { ...item, id });
  }

  async delete(storeName: keyof FinanceFlowDB, id: string): Promise<void> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');
    await this.db.delete(storeName, id);
  }

  async get<T>(storeName: keyof FinanceFlowDB, id: string): Promise<T | undefined> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');
    return this.db.get(storeName, id);
  }

  async getAll<T>(storeName: keyof FinanceFlowDB): Promise<T[]> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');
    return this.db.getAll(storeName);
  }

  async getByIndex<T>(
    storeName: keyof FinanceFlowDB,
    indexName: string,
    value: any
  ): Promise<T[]> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');
    
    const store = this.db.transaction(storeName).store;
    const index = store.index(indexName);
    return index.getAll(value);
  }

  // Utility methods
  async clearStore(storeName: keyof FinanceFlowDB): Promise<void> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');
    await this.db.clear(storeName);
  }

  async count(storeName: keyof FinanceFlowDB): Promise<number> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');
    return this.db.count(storeName);
  }
}

export const db = new IndexedDBService();
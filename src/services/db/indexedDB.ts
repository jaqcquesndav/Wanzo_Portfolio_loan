import { openDB, DBSchema, IDBPDatabase } from 'idb';

// Define strict types for each store
export interface Operation {
  id: string;
  created_at: string;
  status: string;
  type: string;
  [key: string]: unknown;
}
export interface Message {
  id: string;
  created_at: string;
  status: string;
  category: string;
  [key: string]: unknown;
}
export interface Meeting {
  id: string;
  date: string;
  status: string;
  type: string;
  [key: string]: unknown;
}
export interface Portfolio {
  id: string;
  type: string;
  status: string;
  [key: string]: unknown;
}
export interface Company {
  id: string;
  sector: string;
  status: string;
  [key: string]: unknown;
}
export interface SyncQueueItem {
  id: string;
  action: 'create' | 'update' | 'delete';
  entity: string;
  data: Record<string, unknown>;
  timestamp: number;
  retries: number;
  priority: number;
}
export interface CacheItem<T = unknown> {
  id: string;
  data: T;
  timestamp: number;
  expiresIn: number;
}

export interface FinanceFlowDB extends DBSchema {
  operations: {
    key: string;
    value: Operation;
    indexes: { 'by-date': string; 'by-status': string; 'by-type': string };
  };
  messages: {
    key: string;
    value: Message;
    indexes: { 'by-date': string; 'by-status': string; 'by-category': string };
  };
  meetings: {
    key: string;
    value: Meeting;
    indexes: { 'by-date': string; 'by-status': string; 'by-type': string };
  };
  portfolios: {
    key: string;
    value: Portfolio;
    indexes: { 'by-type': string; 'by-status': string };
  };
  companies: {
    key: string;
    value: Company;
    indexes: { 'by-sector': string; 'by-status': string };
  };
  sync_queue: {
    key: string;
    value: SyncQueueItem;
    indexes: { 'by-priority': number };
  };
  cache: {
    key: string;
    value: CacheItem;
  };
}

export type StoreName =
  | 'operations'
  | 'messages'
  | 'meetings'
  | 'portfolios'
  | 'companies'
  | 'sync_queue'
  | 'cache';

class IndexedDBService {
  private db: IDBPDatabase<FinanceFlowDB> | null = null;
  private dbName = 'financeflow_db';
  private version = 1;
  private initPromise: Promise<void> | null = null;
  private cacheExpiryTime = 5 * 60 * 1000; // 5 minutes

  async init(): Promise<void> {
    if (this.initPromise) return this.initPromise;


    this.initPromise = new Promise((resolve, reject) => {
      openDB<FinanceFlowDB>(this.dbName, this.version, {
        upgrade: (db) => {
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
      })
        .then((db) => {
          this.db = db;
          resolve();
        })
        .catch((error) => {
          reject(error);
          this.initPromise = null; // Reset to allow retrying
        });
    });

    return this.initPromise;
  }

  // Cache methods
  async setCache<T = unknown>(key: string, data: T, expiresIn: number = this.cacheExpiryTime): Promise<void> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');
    await this.db.put('cache', {
      id: key,
      data,
      timestamp: Date.now(),
      expiresIn
    });
  }

  async getCache<T = unknown>(key: string): Promise<T | null> {
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
  async add<K extends StoreName>(storeName: K, item: FinanceFlowDB[K]['value']): Promise<string> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');
    try {
      await this.db.add(storeName, item);
      // All store values have id
      return (item as { id: string }).id;
    } catch (error) {
      if ((error as Error).name === 'ConstraintError') {
        await this.update(storeName, (item as { id: string }).id, item);
        return (item as { id: string }).id;
      }
      throw error;
    }
  }

  async update<K extends StoreName>(storeName: K, id: string, item: FinanceFlowDB[K]['value']): Promise<void> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');
    await this.db.put(storeName, { ...item, id });
  }

  async delete<K extends StoreName>(storeName: K, id: string): Promise<void> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');
    await this.db.delete(storeName, id);
  }

  async get<K extends StoreName>(storeName: K, id: string): Promise<FinanceFlowDB[K]['value'] | undefined> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');
    return this.db.get(storeName, id);
  }

  async getAll<K extends StoreName>(storeName: K): Promise<FinanceFlowDB[K]['value'][]> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');
    return this.db.getAll(storeName);
  }

  /**
   * Get all items by index. TypeScript cannot strictly type indexName/value generically for IDB.
   * @param storeName Store name
   * @param indexName Index name (string)
   * @param value Index value (IDBValidKey)
   */
  async getByIndex<K extends StoreName>(
    storeName: K,
    indexName: string,
    value: IDBValidKey
  ): Promise<FinanceFlowDB[K]['value'][]> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');
    const store = this.db.transaction(storeName).store;
    // TypeScript cannot strictly type indexName/value generically for IDB, so we cast to any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const index = (store.index as any)(indexName);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (index.getAll as any)(value);
  }

  // Utility methods
  async clearStore<K extends StoreName>(storeName: K): Promise<void> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');
    await this.db.clear(storeName);
  }

  async count<K extends StoreName>(storeName: K): Promise<number> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');
    return this.db.count(storeName);
  }
}

export const db = new IndexedDBService();
import { db } from '../indexedDB';

interface SyncQueueItem {
  id: string;
  action: 'create' | 'update' | 'delete';
  entity: string;
  data: any;
  timestamp: number;
  retries: number;
  priority: number;
}

class SyncQueueStore {
  private readonly storeName = 'sync_queue';

  async add(item: Omit<SyncQueueItem, 'id' | 'timestamp' | 'retries'>): Promise<string> {
    const queueItem: SyncQueueItem = {
      ...item,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      retries: 0
    };
    return db.add(this.storeName, queueItem);
  }

  async update(id: string, updates: Partial<SyncQueueItem>): Promise<void> {
    const item = await this.get(id);
    if (item) {
      await db.update(this.storeName, id, { ...item, ...updates });
    }
  }

  async delete(id: string): Promise<void> {
    await db.delete(this.storeName, id);
  }

  async get(id: string): Promise<SyncQueueItem | undefined> {
    return db.get<SyncQueueItem>(this.storeName, id);
  }

  async getAll(): Promise<SyncQueueItem[]> {
    return db.getAll<SyncQueueItem>(this.storeName);
  }

  async getPendingItems(batchSize: number = 5): Promise<SyncQueueItem[]> {
    const items = await this.getAll();
    return items
      .sort((a, b) => (b.priority || 0) - (a.priority || 0))
      .slice(0, batchSize);
  }

  async incrementRetry(id: string): Promise<void> {
    const item = await this.get(id);
    if (item) {
      await this.update(id, {
        retries: item.retries + 1,
        timestamp: Date.now()
      });
    }
  }

  async clear(): Promise<void> {
    await db.clearStore(this.storeName);
  }
}

export const syncQueueStore = new SyncQueueStore();
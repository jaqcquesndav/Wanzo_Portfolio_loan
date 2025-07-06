import { db } from '../indexedDB';
import type { Operation } from '../../../types/operations';

class OperationsStore {
  private readonly storeName = 'operations';

  async add(operation: Operation): Promise<string> {
    return db.add(this.storeName, operation);
  }

  async update(id: string, operation: Operation): Promise<void> {
    await db.update(this.storeName, id, operation);
  }

  async delete(id: string): Promise<void> {
    await db.delete(this.storeName, id);
  }

  async get(id: string): Promise<Operation | undefined> {
    return db.get<Operation>(this.storeName, id);
  }

  async getAll(): Promise<Operation[]> {
    return db.getAll<Operation>(this.storeName);
  }

  async getByStatus(status: string): Promise<Operation[]> {
    return db.getByIndex<Operation>(this.storeName, 'by-status', status);
  }

  async getByType(type: string): Promise<Operation[]> {
    return db.getByIndex<Operation>(this.storeName, 'by-type', type);
  }

  async getByDateRange(startDate: string, endDate: string): Promise<Operation[]> {
    const allOperations = await this.getAll();
    return allOperations.filter(op => 
      op.created_at >= startDate && op.created_at <= endDate
    );
  }
}

export const operationsStore = new OperationsStore();
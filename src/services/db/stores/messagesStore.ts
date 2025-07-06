import { db } from '../indexedDB';
import type { Message } from '../../../types/messages';

class MessagesStore {
  private readonly storeName = 'messages';

  async add(message: Message): Promise<string> {
    return db.add(this.storeName, message);
  }

  async update(id: string, message: Message): Promise<void> {
    await db.update(this.storeName, id, message);
  }

  async delete(id: string): Promise<void> {
    await db.delete(this.storeName, id);
  }

  async get(id: string): Promise<Message | undefined> {
    return db.get<Message>(this.storeName, id);
  }

  async getAll(): Promise<Message[]> {
    return db.getAll<Message>(this.storeName);
  }

  async getByStatus(status: string): Promise<Message[]> {
    return db.getByIndex<Message>(this.storeName, 'by-status', status);
  }

  async getByCategory(category: string): Promise<Message[]> {
    return db.getByIndex<Message>(this.storeName, 'by-category', category);
  }

  async markAsRead(id: string): Promise<void> {
    const message = await this.get(id);
    if (message) {
      await this.update(id, { ...message, status: 'read' });
    }
  }
}

export const messagesStore = new MessagesStore();
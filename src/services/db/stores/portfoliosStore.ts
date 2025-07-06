import { db } from '../indexedDB';
import type { Portfolio } from '../../../types/portfolio';

class PortfoliosStore {
  private readonly storeName = 'portfolios';

  async add(portfolio: Portfolio): Promise<string> {
    return db.add(this.storeName, portfolio);
  }

  async update(id: string, portfolio: Portfolio): Promise<void> {
    await db.update(this.storeName, id, portfolio);
  }

  async delete(id: string): Promise<void> {
    await db.delete(this.storeName, id);
  }

  async get(id: string): Promise<Portfolio | undefined> {
    return db.get<Portfolio>(this.storeName, id);
  }

  async getAll(): Promise<Portfolio[]> {
    return db.getAll<Portfolio>(this.storeName);
  }

  async getByType(type: string): Promise<Portfolio[]> {
    return db.getByIndex<Portfolio>(this.storeName, 'by-type', type);
  }

  async getByStatus(status: string): Promise<Portfolio[]> {
    return db.getByIndex<Portfolio>(this.storeName, 'by-status', status);
  }

  async addProduct(portfolioId: string, product: any): Promise<void> {
    const portfolio = await this.get(portfolioId);
    if (portfolio) {
      portfolio.products = [...portfolio.products, product];
      await this.update(portfolioId, portfolio);
    }
  }

  async updateProduct(portfolioId: string, productId: string, updates: any): Promise<void> {
    const portfolio = await this.get(portfolioId);
    if (portfolio) {
      portfolio.products = portfolio.products.map(p =>
        p.id === productId ? { ...p, ...updates } : p
      );
      await this.update(portfolioId, portfolio);
    }
  }
}

export const portfoliosStore = new PortfoliosStore();
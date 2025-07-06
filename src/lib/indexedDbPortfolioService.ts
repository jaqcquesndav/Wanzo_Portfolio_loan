// src/lib/indexedDbPortfolioService.ts
// Service générique IndexedDB pour tous types de portefeuilles
import { openDB, DBSchema, IDBPDatabase } from 'idb';

export type PortfolioType = 'traditional' | 'leasing' | 'investment';


// Harmonize with Portfolio type
import type { Portfolio } from '../types/portfolio';

// Use Portfolio as the base for all portfolio types
export type BasePortfolio = Portfolio;



// Utiliser le type unique et complet pour FinancialProduct


export interface LeasingEquipment {
  id: string;
  name: string;
  [key: string]: unknown;
}

export interface InvestmentAsset {
  id: string;
  name: string;
  [key: string]: unknown;
}

export interface TraditionalPortfolio extends BasePortfolio {
  type: 'traditional';
  // ...autres champs spécifiques (description, manager_id, institution_id, etc.)
  description: string;
  manager_id: string;
  institution_id: string;
}

export interface LeasingPortfolio extends BasePortfolio {
  type: 'leasing';
  equipments: LeasingEquipment[];
  // ...autres champs spécifiques
}

export interface InvestmentPortfolio extends BasePortfolio {
  type: 'investment';
  assets: InvestmentAsset[];
  // ...autres champs spécifiques
}

export type AnyPortfolio = TraditionalPortfolio | LeasingPortfolio | InvestmentPortfolio;

interface PortfolioDB extends DBSchema {
  portfolios: {
    key: string;
    value: AnyPortfolio;
    indexes: { 'by-type': string };
  };
}

let dbPromise: Promise<IDBPDatabase<PortfolioDB>> | null = null;

function getDb() {
  if (!dbPromise) {
    dbPromise = openDB<PortfolioDB>('portfolio-db', 1, {
      upgrade(db) {
        const store = db.createObjectStore('portfolios', { keyPath: 'id' });
        store.createIndex('by-type', 'type');
      },
    });
  }
  return dbPromise;
}

export const indexedDbPortfolioService = {
  async getPortfolio(id: string): Promise<AnyPortfolio | undefined> {
    const db = await getDb();
    return db.get('portfolios', id);
  },
  async getPortfoliosByType(type: PortfolioType): Promise<AnyPortfolio[]> {
    const db = await getDb();
    return db.getAllFromIndex('portfolios', 'by-type', type);
  },
  async addOrUpdatePortfolio(portfolio: AnyPortfolio): Promise<void> {
    const db = await getDb();
    await db.put('portfolios', { ...portfolio, updated_at: new Date().toISOString() });
  },
  async deletePortfolio(id: string): Promise<void> {
    const db = await getDb();
    await db.delete('portfolios', id);
  },
  async getAllPortfolios(): Promise<AnyPortfolio[]> {
    const db = await getDb();
    return db.getAll('portfolios');
  },
};

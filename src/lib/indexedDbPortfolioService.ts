// Utilitaires pour injecter les mocks au démarrage si la base est vide
import { mockInvestmentPortfolios } from '../data/mockInvestmentPortfolios';
import { mockTraditionalPortfolios } from '../data/mockTraditionalPortfolios';
import { mockLeasingPortfolios } from '../data/mockLeasingPortfolios';
// Injecte les portefeuilles investment mockés si aucun n'existe
import { mockInvestmentRequests } from '../data/mockInvestmentRequests';
import { mockInvestmentTransactions } from '../data/mockInvestmentTransactions';
export async function seedMockInvestmentPortfoliosIfNeeded() {
  const db = await getDb();
  const existing = await db.getAllFromIndex('portfolios', 'by-type', 'investment');
  if (!existing || existing.length === 0) {
    for (const p of mockInvestmentPortfolios) {
      // Associer les mocks métiers à chaque portefeuille
      const requests = mockInvestmentRequests.filter(r => r.portfolioId === p.id);
      const transactions = mockInvestmentTransactions.filter(t => t.portfolioId === p.id);
      await db.put('portfolios', {
        ...p,
        requests,
        transactions,
        type: 'investment', // Assure explicitement le type pour harmonisation
        updated_at: new Date().toISOString(),
      });
    }
  }
}

export async function seedMockTraditionalPortfoliosIfNeeded() {
  const db = await getDb();
  const existing = await db.getAllFromIndex('portfolios', 'by-type', 'traditional');
  if (!existing || existing.length === 0) {
    for (const p of mockTraditionalPortfolios) {
      await db.put('portfolios', { ...p, type: 'traditional', updated_at: new Date().toISOString() });
    }
  }
}

import { mockLeasingTransactions } from '../data/mockLeasingTransactions';
export async function seedMockLeasingPortfoliosIfNeeded() {
  const db = await getDb();
  const existing = await db.getAllFromIndex('portfolios', 'by-type', 'leasing');
  if (!existing || existing.length === 0) {
    for (const p of mockLeasingPortfolios) {
      // Associer les mocks métiers à chaque portefeuille
      const transactions = mockLeasingTransactions.filter(t => t.portfolioId === p.id);
      // Si le champ cash existe, on l'ignore, sinon on passe tout
      // Nettoyage du champ cash si présent dans les mocks (type-safe, sans casser le typage)
      // Évite l'utilisation de 'any' en nettoyant cash via une fonction utilitaire
      function omitCash<T extends object>(obj: T): T {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { cash: _unused, ...rest } = obj as Record<string, unknown>;
        return rest as T;
      }
      const portfolioToInsert = omitCash(p);
      await db.put('portfolios', {
        ...portfolioToInsert,
        transactions,
        type: 'leasing', // Assure explicitement le type
        updated_at: new Date().toISOString(),
      });
    }
  }
}
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

import type { LeasingTransaction } from '../types/leasing-transaction';
// Harmonisation avec le type métier (src/types/leasing.ts)
export interface LeasingPortfolio extends BasePortfolio {
  type: 'leasing';
  equipment_catalog: import('../types/leasing').Equipment[];
  leasing_terms?: {
    min_duration: number;
    max_duration: number;
    interest_rate_range: {
      min: number;
      max: number;
    };
    maintenance_included: boolean;
    insurance_required: boolean;
  };
  transactions?: LeasingTransaction[];
  // ...autres champs spécifiques
}

import type {
  InvestmentRequest,
  InvestmentTransaction,
  PortfolioCompanyReport,
  ExitEvent
} from '../types/investment-portfolio';

export interface InvestmentPortfolio extends BasePortfolio {
  type: 'investment';
  assets: InvestmentAsset[];
  requests?: InvestmentRequest[];
  transactions?: InvestmentTransaction[];
  reports?: PortfolioCompanyReport[];
  exitEvents?: ExitEvent[];
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

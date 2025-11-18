// src/data/mockTreasuryData.ts
import type { TreasuryData } from '../types/company';

/**
 * Données de trésorerie mockées conformes à SYSCOHADA
 * Utilisées pour fallback en cas de problème de connexion
 */

// Fonction helper pour générer des périodes hebdomadaires
function generateWeeklyPeriods(count: number = 12): Array<{
  periodId: string;
  startDate: string;
  endDate: string;
  totalBalance: number;
  accountsCount: number;
}> {
  const periods = [];
  const now = new Date();
  
  for (let i = count - 1; i >= 0; i--) {
    const endDate = new Date(now);
    endDate.setDate(now.getDate() - (i * 7));
    
    const startDate = new Date(endDate);
    startDate.setDate(endDate.getDate() - 6);
    
    const weekNum = getWeekNumber(endDate);
    const year = endDate.getFullYear();
    
    // Variation progressive du solde (entre 100M et 135M CDF)
    const baseBalance = 100000000;
    const variation = (count - i) * 3000000;
    const randomFactor = Math.random() * 5000000;
    
    periods.push({
      periodId: `${year}-W${weekNum.toString().padStart(2, '0')}`,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      totalBalance: baseBalance + variation + randomFactor,
      accountsCount: 3
    });
  }
  
  return periods;
}

// Fonction helper pour générer des périodes mensuelles
function generateMonthlyPeriods(count: number = 12): Array<{
  periodId: string;
  startDate: string;
  endDate: string;
  totalBalance: number;
  accountsCount: number;
}> {
  const periods = [];
  const now = new Date();
  
  for (let i = count - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    
    // Variation progressive du solde
    const baseBalance = 95000000;
    const variation = (count - i) * 2000000;
    const randomFactor = Math.random() * 8000000;
    
    periods.push({
      periodId: `${year}-${month.toString().padStart(2, '0')}`,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      totalBalance: baseBalance + variation + randomFactor,
      accountsCount: 3
    });
  }
  
  return periods;
}

// Fonction helper pour générer des périodes trimestrielles
function generateQuarterlyPeriods(count: number = 4): Array<{
  periodId: string;
  startDate: string;
  endDate: string;
  totalBalance: number;
  accountsCount: number;
}> {
  const periods = [];
  const now = new Date();
  const currentQuarter = Math.floor(now.getMonth() / 3) + 1;
  const currentYear = now.getFullYear();
  
  for (let i = count - 1; i >= 0; i--) {
    let quarter = currentQuarter - i;
    let year = currentYear;
    
    while (quarter <= 0) {
      quarter += 4;
      year--;
    }
    
    const startMonth = (quarter - 1) * 3;
    const startDate = new Date(year, startMonth, 1);
    const endDate = new Date(year, startMonth + 3, 0);
    
    const baseBalance = 85000000;
    const variation = (count - i) * 7000000;
    const randomFactor = Math.random() * 12000000;
    
    periods.push({
      periodId: `${year}-Q${quarter}`,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      totalBalance: baseBalance + variation + randomFactor,
      accountsCount: i < 2 ? 2 : 3 // Anciens trimestres avec moins de comptes
    });
  }
  
  return periods;
}

// Fonction helper pour générer des périodes annuelles
function generateAnnualPeriods(count: number = 3): Array<{
  periodId: string;
  startDate: string;
  endDate: string;
  totalBalance: number;
  accountsCount: number;
}> {
  const periods = [];
  const currentYear = new Date().getFullYear();
  
  for (let i = count - 1; i >= 0; i--) {
    const year = currentYear - i;
    
    const baseBalance = 70000000;
    const variation = (count - i) * 15000000;
    const randomFactor = Math.random() * 20000000;
    
    periods.push({
      periodId: `${year}`,
      startDate: `${year}-01-01`,
      endDate: `${year}-12-31`,
      totalBalance: baseBalance + variation + randomFactor,
      accountsCount: i === 0 ? 2 : 3
    });
  }
  
  return periods;
}

// Helper pour obtenir le numéro de semaine
function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

/**
 * Données de trésorerie pour TechInnovate SARL
 */
export const mockTreasuryTechInnovate: TreasuryData = {
  total_treasury_balance: 125000000.00,
  accounts: [
    {
      code: '521001',
      name: 'Rawbank - Compte Courant CDF',
      type: 'bank',
      balance: 75000000.00,
      currency: 'CDF',
      bankName: 'Rawbank',
      accountNumber: 'CD39-1234-5678-9012-3456'
    },
    {
      code: '521002',
      name: 'Equity Bank - Compte USD',
      type: 'bank',
      balance: 20000000.00,
      currency: 'USD',
      bankName: 'Equity Bank',
      accountNumber: 'CD39-9876-5432-1098-7654'
    },
    {
      code: '531001',
      name: 'Caisse Principale CDF',
      type: 'cash',
      balance: 15000000.00,
      currency: 'CDF'
    },
    {
      code: '541001',
      name: 'Dépôts à terme - Equity Bank',
      type: 'investment',
      balance: 35000000.00,
      currency: 'USD',
      bankName: 'Equity Bank'
    }
  ],
  timeseries: {
    weekly: generateWeeklyPeriods(12),
    monthly: generateMonthlyPeriods(12),
    quarterly: generateQuarterlyPeriods(4),
    annual: generateAnnualPeriods(3)
  }
};

/**
 * Données de trésorerie pour AgroPlus Services
 */
export const mockTreasuryAgroPlus: TreasuryData = {
  total_treasury_balance: 85000000.00,
  accounts: [
    {
      code: '521001',
      name: 'BCDC - Compte Courant CDF',
      type: 'bank',
      balance: 45000000.00,
      currency: 'CDF',
      bankName: 'BCDC',
      accountNumber: 'CD39-1111-2222-3333-4444'
    },
    {
      code: '531001',
      name: 'Caisse Principale',
      type: 'cash',
      balance: 8000000.00,
      currency: 'CDF'
    },
    {
      code: '531002',
      name: 'Caisse Secondaire USD',
      type: 'cash',
      balance: 2000000.00,
      currency: 'USD'
    },
    {
      code: '541001',
      name: 'Placements Court Terme',
      type: 'investment',
      balance: 30000000.00,
      currency: 'CDF',
      bankName: 'BCDC'
    }
  ],
  timeseries: {
    weekly: generateWeeklyPeriods(12).map(p => ({ ...p, totalBalance: p.totalBalance * 0.68 })),
    monthly: generateMonthlyPeriods(12).map(p => ({ ...p, totalBalance: p.totalBalance * 0.68 })),
    quarterly: generateQuarterlyPeriods(4).map(p => ({ ...p, totalBalance: p.totalBalance * 0.68 })),
    annual: generateAnnualPeriods(3).map(p => ({ ...p, totalBalance: p.totalBalance * 0.68 }))
  }
};

/**
 * Données de trésorerie pour CommerceHub SA
 */
export const mockTreasuryCommerceHub: TreasuryData = {
  total_treasury_balance: 165000000.00,
  accounts: [
    {
      code: '521001',
      name: 'Rawbank - Compte Principal CDF',
      type: 'bank',
      balance: 95000000.00,
      currency: 'CDF',
      bankName: 'Rawbank',
      accountNumber: 'CD39-5555-6666-7777-8888'
    },
    {
      code: '521002',
      name: 'FBN Bank - Compte USD',
      type: 'bank',
      balance: 40000000.00,
      currency: 'USD',
      bankName: 'FBN Bank',
      accountNumber: 'CD39-9999-8888-7777-6666'
    },
    {
      code: '531001',
      name: 'Caisse Centrale',
      type: 'cash',
      balance: 18000000.00,
      currency: 'CDF'
    },
    {
      code: '571001',
      name: 'Virements Internes en Transit',
      type: 'transit',
      balance: 12000000.00,
      currency: 'CDF'
    }
  ],
  timeseries: {
    weekly: generateWeeklyPeriods(12).map(p => ({ ...p, totalBalance: p.totalBalance * 1.32 })),
    monthly: generateMonthlyPeriods(12).map(p => ({ ...p, totalBalance: p.totalBalance * 1.32 })),
    quarterly: generateQuarterlyPeriods(4).map(p => ({ ...p, totalBalance: p.totalBalance * 1.32 })),
    annual: generateAnnualPeriods(3).map(p => ({ ...p, totalBalance: p.totalBalance * 1.32 }))
  }
};

/**
 * Données de trésorerie pour PME Agro Sarl (COMP-0001)
 */
export const mockTreasuryPMEAgro: TreasuryData = {
  total_treasury_balance: 145000000.00,
  accounts: [
    {
      code: '521001',
      name: 'Equity Bank - Compte Courant CDF',
      type: 'bank',
      balance: 85000000.00,
      currency: 'CDF',
      bankName: 'Equity Bank',
      accountNumber: 'CD39-2001-5678-9012-3456'
    },
    {
      code: '521002',
      name: 'BCDC - Compte USD',
      type: 'bank',
      balance: 25000000.00,
      currency: 'USD',
      bankName: 'BCDC',
      accountNumber: 'CD39-2002-8765-4321-0987'
    },
    {
      code: '531001',
      name: 'Caisse Principale CDF',
      type: 'cash',
      balance: 18000000.00,
      currency: 'CDF'
    },
    {
      code: '531002',
      name: 'Caisse Secondaire USD',
      type: 'cash',
      balance: 5000000.00,
      currency: 'USD'
    },
    {
      code: '541001',
      name: 'Placements à terme - Equity Bank',
      type: 'investment',
      balance: 12000000.00,
      currency: 'CDF',
      bankName: 'Equity Bank'
    }
  ],
  timeseries: {
    weekly: generateWeeklyPeriods(12).map(p => ({ ...p, totalBalance: p.totalBalance * 1.16, accountsCount: 5 })),
    monthly: generateMonthlyPeriods(12).map(p => ({ ...p, totalBalance: p.totalBalance * 1.16, accountsCount: 5 })),
    quarterly: generateQuarterlyPeriods(4).map(p => ({ ...p, totalBalance: p.totalBalance * 1.16, accountsCount: p.periodId.includes('2023') ? 3 : 5 })),
    annual: generateAnnualPeriods(3).map(p => ({ ...p, totalBalance: p.totalBalance * 1.16, accountsCount: parseInt(p.periodId) < 2024 ? 3 : 5 }))
  }
};

/**
 * Map de toutes les données de trésorerie mockées par companyId
 */
export const mockTreasuryDataMap: Record<string, TreasuryData> = {
  '1': mockTreasuryTechInnovate,    // TechInnovate SARL (legacy)
  '2': mockTreasuryAgroPlus,        // AgroPlus Services (legacy)
  '3': mockTreasuryCommerceHub,     // CommerceHub SA (legacy)
  'COMP-0001': mockTreasuryPMEAgro, // PME Agro Sarl
  'COMP-0002': mockTreasuryCommerceHub, // TransLogistics (reuse CommerceHub data)
  'COMP-0003': mockTreasuryAgroPlus,    // BTP Services (reuse AgroPlus data)
  'COMP-0004': mockTreasuryTechInnovate, // InnoBiotech (reuse TechInnovate data)
  'COMP-0005': mockTreasuryTechInnovate, // Digital Solutions (reuse TechInnovate data)
  'COMP-0006': mockTreasuryCommerceHub,  // Eco-Construct (reuse CommerceHub data)
  'COMP-0007': mockTreasuryPMEAgro,      // AgroTech Innovations (reuse PME Agro data)
  'COMP-0008': mockTreasuryAgroPlus,     // MediHealth Plus (reuse AgroPlus data)
};

/**
 * Fonction helper pour obtenir les données de trésorerie d'une entreprise
 */
export function getMockTreasuryData(companyId: string): TreasuryData | undefined {
  return mockTreasuryDataMap[companyId];
}

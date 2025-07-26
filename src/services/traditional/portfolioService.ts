// src/services/traditional/portfolioService.ts
import { TraditionalPortfolio } from '../../types/traditional-portfolio';

// Type pour les données d'échéancier
export interface ScheduleItem {
  id: string;
  contract_id: string;
  due_date: string;
  principal_amount: number;
  interest_amount: number;
  total_amount: number;
  status: 'pending' | 'paid' | 'partial' | 'late' | 'defaulted';
  actual_payment_date?: string;
  actual_payment_amount?: number;
  created_at: string;
  updated_at?: string;
}

/**
 * Récupère un portefeuille par son ID
 */
export const getPortfolioById = async (id: string): Promise<TraditionalPortfolio | null> => {
  try {
    // Simuler un appel API (à remplacer par un vrai appel API)
    return {
      id,
      name: `Portefeuille ${id}`,
      description: `Description du portefeuille ${id}`,
      manager_id: 'mgr-123',
      institution_id: 'inst-456',
      type: 'traditional',
      currency: 'XOF',
      status: 'active',
      target_amount: 5000000,
      target_return: 0.15,
      target_sectors: ['agriculture', 'commerce'],
      risk_profile: 'moderate',
      products: [],
      metrics: {
        net_value: 4500000,
        average_return: 0.12,
        risk_portfolio: 0.05,
        sharpe_ratio: 1.2,
        volatility: 0.08,
        alpha: 0.02,
        beta: 0.85,
        asset_allocation: [
          { type: 'credit', percentage: 80 },
          { type: 'treasury', percentage: 20 }
        ]
      },
      manager: { 
        id: 'mgr-123',
        name: 'Gestionnaire par défaut',
        email: 'gestionnaire@wanzo.com'
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    } as TraditionalPortfolio;
  } catch (error) {
    console.error(`Erreur lors de la récupération du portefeuille ${id}:`, error);
    return null;
  }
};

/**
 * Récupère l'échéancier d'un contrat de crédit
 */
export const getContractSchedule = async (contractId: string): Promise<ScheduleItem[]> => {
  try {
    // Simuler un appel API (à remplacer par un vrai appel API)
    // Génère un échéancier fictif avec 6 mensualités
    const now = new Date();
    const scheduleItems: ScheduleItem[] = [];
    
    for (let i = 0; i < 6; i++) {
      const dueDate = new Date(now);
      dueDate.setMonth(dueDate.getMonth() + i + 1);
      
      scheduleItems.push({
        id: `schedule-${contractId}-${i+1}`,
        contract_id: contractId,
        due_date: dueDate.toISOString(),
        principal_amount: 50000,
        interest_amount: 5000,
        total_amount: 55000,
        status: i === 0 ? 'paid' : (i === 1 ? 'partial' : 'pending'),
        created_at: new Date().toISOString()
      });
    }
    
    return scheduleItems;
  } catch (error) {
    console.error(`Erreur lors de la récupération de l'échéancier ${contractId}:`, error);
    return [];
  }
};

// src/services/api/shared/risk.api.ts
import { apiClient } from '../base.api';
import type { 
  CreditRiskEntry, 
  LeasingRiskEntry, 
  InvestmentRiskEntry 
} from '../../../data/mockCentraleRisque';

/**
 * API pour les opérations liées à la centrale de risque
 */
export const riskApi = {
  /**
   * Récupère les données de risque crédit pour une entreprise
   */
  getCreditRisk: (companyId: string) => {
    return apiClient.get<CreditRiskEntry>(`/risk/credit/${companyId}`);
  },

  /**
   * Récupère les données de risque leasing pour une entreprise
   */
  getLeasingRisk: (companyId: string) => {
    return apiClient.get<LeasingRiskEntry>(`/risk/leasing/${companyId}`);
  },

  /**
   * Récupère les données de risque investissement pour une entreprise
   */
  getInvestmentRisk: (companyId: string) => {
    return apiClient.get<InvestmentRiskEntry>(`/risk/investment/${companyId}`);
  },

  /**
   * Soumet une nouvelle entrée de risque
   */
  submitRiskEntry: (type: 'credit' | 'leasing' | 'investment', entry: unknown) => {
    return apiClient.post<{ id: string; status: string }>(`/risk/${type}`, entry);
  },

  /**
   * Met à jour une entrée de risque existante
   */
  updateRiskEntry: (type: 'credit' | 'leasing' | 'investment', id: string, updates: unknown) => {
    return apiClient.put<{ status: string }>(`/risk/${type}/${id}`, updates);
  },

  /**
   * Récupère un rapport de synthèse des risques
   */
  getRiskSummary: (filters?: { 
    portfolioId?: string; 
    fromDate?: string; 
    toDate?: string;
    riskLevel?: 'low' | 'medium' | 'high' | 'critical';
  }) => {
    const params = new URLSearchParams();
    if (filters?.portfolioId) params.append('portfolioId', filters.portfolioId);
    if (filters?.fromDate) params.append('fromDate', filters.fromDate);
    if (filters?.toDate) params.append('toDate', filters.toDate);
    if (filters?.riskLevel) params.append('riskLevel', filters.riskLevel);

    return apiClient.get<{
      totalEntries: number;
      riskDistribution: Record<string, number>;
      topRiskyCompanies: Array<{
        companyId: string;
        companyName: string;
        riskScore: number;
        riskLevel: string;
      }>;
    }>(`/risk/summary?${params.toString()}`);
  },
};

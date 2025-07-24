// src/services/api/shared/centrale-risque.api.ts
import { apiClient } from '../base.api';

/**
 * API pour la centrale de risque
 */
export const centraleRisqueApi = {
  /**
   * Recherche des informations de risque pour une entreprise
   */
  getCompanyRiskProfile: (companyId: string) => {
    return apiClient.get<{
      companyId: string;
      companyName: string;
      creditScore: number;
      riskCategory: 'low' | 'medium' | 'high' | 'very_high';
      financialHealth: {
        solvabilite: number;
        liquidite: number;
        rentabilite: number;
        endettement: number;
        scoreGlobal: number;
      };
      creditHistory: {
        encoursTotalActuel: number;
        encoursTotalHistorique: number;
        repartitionParType: {
          creditsBancaires: number;
          creditsBail: number;
          lignesDeCredit: number;
          autres: number;
        };
        incidents: {
          total: number;
          cheques: number;
          effets: number;
          retards: number;
        };
      };
      defaultProbability: number;
      recommendedActions: string[];
      lastUpdate: string;
    }>(`/risk/central/company/${companyId}`);
  },

  /**
   * Récupère les incidents de paiement pour une entreprise
   */
  getCompanyPaymentIncidents: (companyId: string, period?: string) => {
    const params = new URLSearchParams();
    if (period) params.append('period', period);

    return apiClient.get<{
      companyId: string;
      companyName: string;
      incidents: Array<{
        id: string;
        type: 'cheque' | 'effet' | 'retard' | 'defaut';
        date: string;
        amount: number;
        days?: number;
        institution: string;
        description: string;
        status: 'ouvert' | 'régularisé';
        regularisationDate?: string;
      }>;
      summary: {
        totalIncidents: number;
        totalAmount: number;
        byType: Record<string, number>;
        byStatus: Record<string, number>;
        averageDaysLate: number;
      };
    }>(`/risk/central/company/${companyId}/incidents?${params.toString()}`);
  },

  /**
   * Récupère les engagements d'une entreprise
   */
  getCompanyEngagements: (companyId: string) => {
    return apiClient.get<{
      companyId: string;
      companyName: string;
      totalEngagement: number;
      engagements: Array<{
        id: string;
        institution: string;
        type: 'credit' | 'leasing' | 'ligne_credit' | 'garantie' | 'autre';
        startDate: string;
        endDate?: string;
        initialAmount: number;
        currentAmount: number;
        currency: string;
        status: 'actif' | 'cloture' | 'en_defaut';
        paymentStatus: 'normal' | 'retard' | 'defaut';
        daysLate?: number;
      }>;
      summary: {
        byType: Record<string, number>;
        byStatus: Record<string, number>;
        byPaymentStatus: Record<string, number>;
      };
    }>(`/risk/central/company/${companyId}/engagements`);
  },

  /**
   * Ajoute une entrée de risque pour une entreprise
   */
  addRiskEntry: (entry: {
    companyId: string;
    type: 'incident_paiement' | 'credit' | 'defaut' | 'alerte' | 'autre';
    date: string;
    amount?: number;
    description: string;
    severity: 'low' | 'medium' | 'high';
    source: string;
    attachmentUrls?: string[];
  }) => {
    return apiClient.post<{
      id: string;
      companyId: string;
      type: 'incident_paiement' | 'credit' | 'defaut' | 'alerte' | 'autre';
      date: string;
      amount?: number;
      description: string;
      severity: 'low' | 'medium' | 'high';
      source: string;
      attachmentUrls?: string[];
      created_at: string;
    }>('/risk/central/entries', entry);
  },

  /**
   * Met à jour une entrée de risque
   */
  updateRiskEntry: (id: string, updates: {
    type?: 'incident_paiement' | 'credit' | 'defaut' | 'alerte' | 'autre';
    date?: string;
    amount?: number;
    description?: string;
    severity?: 'low' | 'medium' | 'high';
    status?: 'active' | 'resolved' | 'false_positive';
    resolution?: string;
    attachmentUrls?: string[];
  }) => {
    return apiClient.put<{
      id: string;
      companyId: string;
      type: 'incident_paiement' | 'credit' | 'defaut' | 'alerte' | 'autre';
      date: string;
      amount?: number;
      description: string;
      severity: 'low' | 'medium' | 'high';
      status: 'active' | 'resolved' | 'false_positive';
      resolution?: string;
      source: string;
      attachmentUrls?: string[];
      created_at: string;
      updated_at: string;
    }>(`/risk/central/entries/${id}`, updates);
  },

  /**
   * Récupère les alertes de risque actives
   */
  getActiveRiskAlerts: (filters?: {
    severity?: 'low' | 'medium' | 'high';
    type?: 'market' | 'credit' | 'operational' | 'compliance' | 'liquidity';
    page?: number;
    limit?: number;
  }) => {
    const params = new URLSearchParams();
    if (filters?.severity) params.append('severity', filters.severity);
    if (filters?.type) params.append('type', filters.type);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    return apiClient.get<{
      data: Array<{
        id: string;
        type: 'market' | 'credit' | 'operational' | 'compliance' | 'liquidity';
        severity: 'low' | 'medium' | 'high';
        title: string;
        description: string;
        affectedEntities: Array<{
          id: string;
          type: 'company' | 'portfolio' | 'sector' | 'region';
          name: string;
        }>;
        createdAt: string;
        status: 'new' | 'acknowledged' | 'in_progress' | 'resolved';
      }>;
      meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      };
    }>(`/risk/central/alerts?${params.toString()}`);
  },

  /**
   * Récupère les statistiques de risque
   */
  getRiskStatistics: () => {
    return apiClient.get<{
      totalCompanies: number;
      riskDistribution: {
        low: number;
        medium: number;
        high: number;
        very_high: number;
      };
      sectorRiskHeatmap: Array<{
        sector: string;
        riskScore: number;
        exposure: number;
        companies: number;
      }>;
      defaultRates: {
        overall: number;
        byCompanySize: Record<string, number>;
        bySector: Record<string, number>;
      };
      trends: {
        period: string;
        defaultRate: Array<{ date: string; value: number }>;
        riskDistribution: Array<{ date: string; low: number; medium: number; high: number; very_high: number }>;
      };
    }>('/risk/central/statistics');
  },

  /**
   * Récupère le rapport de risque complet
   */
  getFullRiskReport: (companyId: string) => {
    return apiClient.get<{
      companyId: string;
      companyName: string;
      generateDate: string;
      creditScore: number;
      riskCategory: 'low' | 'medium' | 'high' | 'very_high';
      financialAnalysis: {
        balanceSheet: Record<string, number>;
        incomeStatement: Record<string, number>;
        cashFlow: Record<string, number>;
        keyRatios: Record<string, number>;
        trends: Record<string, Array<{ year: string; value: number }>>;
      };
      creditHistory: {
        engagements: Array<{
          institution: string;
          type: string;
          amount: number;
          startDate: string;
          status: string;
        }>;
        incidents: Array<{
          type: string;
          date: string;
          amount: number;
          status: string;
        }>;
      };
      marketAnalysis: {
        sectorRisk: number;
        sectorTrend: string;
        competitivePosition: string;
        marketShareTrend: string;
      };
      managementAssessment: {
        experienceScore: number;
        stabilityScore: number;
        complianceScore: number;
        observations: string[];
      };
      recommendation: {
        maxExposure: number;
        suggestedCollateral: string[];
        monitoringFrequency: string;
        additionalConditions: string[];
      };
    }>(`/risk/central/company/${companyId}/full-report`);
  },

  /**
   * Récupère l'historique des risques
   */
  getRiskHistory: (companyId: string, startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    return apiClient.get<{
      companyId: string;
      companyName: string;
      history: Array<{
        date: string;
        creditScore: number;
        riskCategory: 'low' | 'medium' | 'high' | 'very_high';
        significantChanges?: {
          type: string;
          description: string;
          impact: 'positive' | 'negative' | 'neutral';
        }[];
      }>;
      trend: 'improving' | 'stable' | 'deteriorating';
      volatility: number;
    }>(`/risk/central/company/${companyId}/history?${params.toString()}`);
  }
};

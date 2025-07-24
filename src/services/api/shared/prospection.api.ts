// src/services/api/shared/prospection.api.ts
import { apiClient } from '../base.api';

/**
 * API pour la prospection
 */
export const prospectionApi = {
  /**
   * Récupère toutes les opportunités de prospection
   */
  getAllOpportunities: (filters?: {
    status?: 'new' | 'qualified' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';
    portfolioType?: 'traditional' | 'investment' | 'leasing';
    assignedTo?: string;
    minAmount?: number;
    maxAmount?: number;
    sector?: string;
    page?: number;
    limit?: number;
  }) => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.portfolioType) params.append('portfolioType', filters.portfolioType);
    if (filters?.assignedTo) params.append('assignedTo', filters.assignedTo);
    if (filters?.minAmount) params.append('minAmount', filters.minAmount.toString());
    if (filters?.maxAmount) params.append('maxAmount', filters.maxAmount.toString());
    if (filters?.sector) params.append('sector', filters.sector);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    return apiClient.get<{
      data: Array<{
        id: string;
        companyId: string;
        companyName: string;
        type: 'funding' | 'investment' | 'leasing';
        amount: number;
        probability: number;
        expectedCloseDate: string;
        status: 'new' | 'qualified' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';
        assignedTo: string;
        notes: string;
        created_at: string;
        updated_at: string;
      }>;
      meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      };
    }>(`/prospection/opportunities?${params.toString()}`);
  },

  /**
   * Récupère une opportunité de prospection par son ID
   */
  getOpportunityById: (id: string) => {
    return apiClient.get<{
      id: string;
      companyId: string;
      companyName: string;
      type: 'funding' | 'investment' | 'leasing';
      amount: number;
      probability: number;
      expectedCloseDate: string;
      status: 'new' | 'qualified' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';
      assignedTo: string;
      notes: string;
      activities: Array<{
        id: string;
        type: 'call' | 'meeting' | 'email' | 'note';
        date: string;
        description: string;
        createdBy: string;
      }>;
      documents: Array<{
        id: string;
        name: string;
        type: string;
        url: string;
        uploadedAt: string;
        uploadedBy: string;
      }>;
      created_at: string;
      updated_at: string;
    }>(`/prospection/opportunities/${id}`);
  },

  /**
   * Crée une nouvelle opportunité de prospection
   */
  createOpportunity: (opportunity: {
    companyId: string;
    type: 'funding' | 'investment' | 'leasing';
    amount: number;
    probability: number;
    expectedCloseDate: string;
    status: 'new' | 'qualified' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';
    assignedTo: string;
    notes: string;
  }) => {
    return apiClient.post<{
      id: string;
      companyId: string;
      companyName: string;
      type: 'funding' | 'investment' | 'leasing';
      amount: number;
      probability: number;
      expectedCloseDate: string;
      status: 'new' | 'qualified' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';
      assignedTo: string;
      notes: string;
      created_at: string;
      updated_at: string;
    }>('/prospection/opportunities', opportunity);
  },

  /**
   * Met à jour une opportunité de prospection
   */
  updateOpportunity: (id: string, updates: {
    type?: 'funding' | 'investment' | 'leasing';
    amount?: number;
    probability?: number;
    expectedCloseDate?: string;
    status?: 'new' | 'qualified' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';
    assignedTo?: string;
    notes?: string;
  }) => {
    return apiClient.put<{
      id: string;
      companyId: string;
      companyName: string;
      type: 'funding' | 'investment' | 'leasing';
      amount: number;
      probability: number;
      expectedCloseDate: string;
      status: 'new' | 'qualified' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';
      assignedTo: string;
      notes: string;
      created_at: string;
      updated_at: string;
    }>(`/prospection/opportunities/${id}`, updates);
  },

  /**
   * Supprime une opportunité de prospection
   */
  deleteOpportunity: (id: string) => {
    return apiClient.delete(`/prospection/opportunities/${id}`);
  },

  /**
   * Ajoute une activité à une opportunité de prospection
   */
  addOpportunityActivity: (opportunityId: string, activity: {
    type: 'call' | 'meeting' | 'email' | 'note';
    date: string;
    description: string;
  }) => {
    return apiClient.post<{
      id: string;
      opportunityId: string;
      type: 'call' | 'meeting' | 'email' | 'note';
      date: string;
      description: string;
      createdBy: string;
      created_at: string;
    }>(`/prospection/opportunities/${opportunityId}/activities`, activity);
  },

  /**
   * Ajoute un document à une opportunité de prospection
   */
  addOpportunityDocument: (opportunityId: string, document: {
    name: string;
    type: string;
    url: string;
  }) => {
    return apiClient.post<{
      id: string;
      opportunityId: string;
      name: string;
      type: string;
      url: string;
      uploadedAt: string;
      uploadedBy: string;
    }>(`/prospection/opportunities/${opportunityId}/documents`, document);
  },

  /**
   * Récupère les campagnes de prospection
   */
  getAllCampaigns: (filters?: {
    status?: 'draft' | 'active' | 'completed' | 'cancelled';
    type?: 'email' | 'call' | 'event' | 'other';
    page?: number;
    limit?: number;
  }) => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.type) params.append('type', filters.type);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    return apiClient.get<{
      data: Array<{
        id: string;
        name: string;
        description: string;
        type: 'email' | 'call' | 'event' | 'other';
        status: 'draft' | 'active' | 'completed' | 'cancelled';
        startDate: string;
        endDate: string;
        target: {
          sectors?: string[];
          regions?: string[];
          minRevenue?: number;
          maxRevenue?: number;
          companySize?: string;
        };
        metrics: {
          reached: number;
          responded: number;
          converted: number;
          roi: number;
        };
        created_at: string;
        updated_at: string;
      }>;
      meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      };
    }>(`/prospection/campaigns?${params.toString()}`);
  },

  /**
   * Récupère les leads potentiels basés sur des critères
   */
  searchLeads: (criteria: {
    sector?: string[];
    region?: string[];
    minRevenue?: number;
    maxRevenue?: number;
    companySize?: string;
    growthRate?: number;
    creditScore?: number;
  }) => {
    return apiClient.post<{
      leads: Array<{
        id: string;
        companyName: string;
        sector: string;
        region: string;
        revenue: number;
        employees: number;
        foundedYear: number;
        growthRate: number;
        creditScore: number;
        contactInfo: {
          name: string;
          position: string;
          email: string;
          phone: string;
        };
        lastContact?: string;
        score: number;
        recommendation: string;
      }>;
      total: number;
      averageScore: number;
    }>('/prospection/leads/search', criteria);
  },

  /**
   * Récupère les statistiques de prospection
   */
  getProspectionStats: (period: 'week' | 'month' | 'quarter' | 'year') => {
    return apiClient.get<{
      period: 'week' | 'month' | 'quarter' | 'year';
      newOpportunities: number;
      qualifiedOpportunities: number;
      wonOpportunities: number;
      lostOpportunities: number;
      conversionRate: number;
      averageDealSize: number;
      totalPotentialValue: number;
      averageSalesCycle: number;
      topPerformers: Array<{
        userId: string;
        name: string;
        opportunities: number;
        closed: number;
        value: number;
      }>;
      byType: {
        funding: number;
        investment: number;
        leasing: number;
      };
      byStage: {
        new: number;
        qualified: number;
        proposal: number;
        negotiation: number;
      };
    }>(`/prospection/stats?period=${period}`);
  }
};

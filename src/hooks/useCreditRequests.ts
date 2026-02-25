import { useState, useEffect, useCallback } from 'react';
import { CreditRequest, CreditRequestStatus } from '../types/credit';
import { 
  mockMembers,
  mockCreditProducts,
  mockCreditManagers
} from '../data';

/**
 * Mapping des identifiants produits API → labels affichables
 * Le backend renvoie des identifiants courts (ex: 'lineOfCredit') pas des UUIDs
 */
const PRODUCT_LABELS: Record<string, string> = {
  lineOfCredit: 'Ligne de crédit',
  term_loan: 'Crédit à terme',
  microfinance: 'Microfinance',
  mortgage: 'Crédit hypothécaire',
  equipment: 'Crédit équipement',
  operating_capital: 'Fonds de roulement',
  pledge: 'Nantissement',
  revolving: 'Crédit revolving',
  overdraft: 'Découvert',
  personal_loan: 'Prêt personnel',
  agricultural_loan: 'Crédit agricole',
  group_loan: 'Crédit de groupe',
};
import { creditRequestApi } from '../services/api/traditional/credit-request.api';

export function useCreditRequests(portfolioId?: string) {
  const [requests, setRequests] = useState<CreditRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRequests = useCallback(async (pid?: string, filters?: {
    status?: CreditRequestStatus;
    clientId?: string;
    productType?: string;
    dateFrom?: string;
    dateTo?: string;
    search?: string;
  }) => {
    try {
      setLoading(true);
      // Appel au service API avec filtres optionnels
      const raw = await creditRequestApi.getAllRequests(pid, filters);
      // L'API peut retourner { data: CreditRequest[], meta: {...} } ou CreditRequest[] directement
      const data: CreditRequest[] = Array.isArray(raw)
        ? raw
        : Array.isArray((raw as { data?: unknown }).data)
          ? (raw as { data: CreditRequest[] }).data
          : [];
      setRequests(data);
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement des demandes de crédit');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests(portfolioId);
  }, [fetchRequests, portfolioId]);

  const addRequest = useCallback(async (request: Omit<CreditRequest, 'id' | 'createdAt' | 'status'>) => {
    try {
      setLoading(true);
      
      const newRequest = await creditRequestApi.createRequest({
        ...request,
        status: 'pending',
      } as Omit<CreditRequest, 'id' | 'createdAt'>);
      
      // Mettre à jour l'état local
      setRequests(prev => [...prev, newRequest]);
      return newRequest;
    } catch (err) {
      setError("Erreur lors de l'ajout de la demande de crédit");
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateRequest = useCallback(async (id: string, updates: Partial<CreditRequest>) => {
    try {
      setLoading(true);
      
      const updatedRequest = await creditRequestApi.updateRequest(id, updates);
      
      // Mettre à jour l'état local
      setRequests(prev => prev.map(req => req.id === id ? updatedRequest : req));
      return updatedRequest;
    } catch (err) {
      setError(`Erreur lors de la mise à jour de la demande de crédit ${id}`);
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const changeRequestStatus = useCallback(async (id: string, status: CreditRequestStatus) => {
    try {
      setLoading(true);
      
      const updatedRequest = await creditRequestApi.updateRequestStatus(id, status);
      
      // Mettre à jour l'état local
      setRequests(prev => prev.map(req => req.id === id ? updatedRequest : req));
      return updatedRequest;
    } catch (err) {
      setError(`Erreur lors du changement de statut de la demande de crédit ${id}`);
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ============================================================================
  // NOUVELLES MÉTHODES CONFORMES À LA DOCUMENTATION API
  // ============================================================================

  /**
   * Soumettre une demande pour examen
   * POST /portfolios/traditional/credit-requests/{id}/submit
   */
  const submitRequest = useCallback(async (id: string) => {
    try {
      setLoading(true);
      
      const updatedRequest = await creditRequestApi.submitRequest(id);
      
      setRequests(prev => prev.map(req => req.id === id ? updatedRequest : req));
      return updatedRequest;
    } catch (err) {
      setError(`Erreur lors de la soumission de la demande ${id}`);
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Approuver une demande
   * POST /portfolios/traditional/credit-requests/{id}/approve
   * Payload: { notes?: string }
   */
  const approveRequest = useCallback(async (id: string, payload?: { notes?: string }) => {
    try {
      setLoading(true);
      const updatedRequest = await creditRequestApi.approveRequest(id, payload);
      setRequests(prev => prev.map(req => req.id === id ? updatedRequest : req));
      return updatedRequest;
    } catch (err) {
      setError(`Erreur lors de l'approbation de la demande ${id}`);
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Rejeter une demande
   * POST /portfolios/traditional/credit-requests/{id}/reject
   * Payload: { reason: string (REQUIS), notes?: string }
   */
  const rejectRequest = useCallback(async (id: string, payload: { reason: string; notes?: string }) => {
    try {
      setLoading(true);
      const updatedRequest = await creditRequestApi.rejectRequest(id, payload);
      setRequests(prev => prev.map(req => req.id === id ? updatedRequest : req));
      return updatedRequest;
    } catch (err) {
      setError(`Erreur lors du rejet de la demande ${id}`);
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Annuler une demande
   * POST /portfolios/traditional/credit-requests/{id}/cancel
   */
  const cancelRequest = useCallback(async (id: string, reason: string) => {
    try {
      setLoading(true);
      
      const updatedRequest = await creditRequestApi.cancelRequest(id, reason);
      
      setRequests(prev => prev.map(req => req.id === id ? updatedRequest : req));
      return updatedRequest;
    } catch (err) {
      setError(`Erreur lors de l'annulation de la demande ${id}`);
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Créer une analyse de crédit
   * POST /portfolios/traditional/credit-requests/{id}/analysis
   */
  const analyzeRequest = useCallback(async (id: string, analysisData: {
    financialData: {
      income: number;
      expenses: number;
      existingDebts: number;
      assets: number;
    };
    creditAssessment: {
      debtToIncomeRatio: number;
      creditScore: number;
      repaymentCapacity: number;
      riskLevel: 'low' | 'medium' | 'high';
    };
    recommendation: 'approve' | 'reject' | 'pending';
    comments: string;
  }) => {
    try {
      setLoading(true);
      
      const result = await creditRequestApi.createAnalysis(id, analysisData);
      
      // Rafraîchir la demande après analyse
      await fetchRequests();
      return result;
    } catch (err) {
      setError(`Erreur lors de l'analyse de la demande ${id}`);
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchRequests]);

  /**
   * Synchroniser depuis la gestion commerciale
   * POST /portfolios/traditional/credit-requests/sync
   */
  const syncFromCommercial = useCallback(async (syncData: {
    sourceRequestId: string;
    memberId: string;
    memberName?: string;
    productId: string;
    productName?: string;
    requestAmount: number;
    currency?: string;
    periodicity: string;
    interestRate: number;
    schedulesCount: number;
    gracePeriod?: number;
    reason?: string;
    financingPurpose?: string;
    businessInformation?: unknown;
    financialInformation?: unknown;
    creditScore?: unknown;
  }) => {
    try {
      setLoading(true);
      
      const newRequest = await creditRequestApi.syncFromCommercial(syncData);
      
      setRequests(prev => [...prev, newRequest]);
      return newRequest;
    } catch (err) {
      setError('Erreur lors de la synchronisation depuis la gestion commerciale');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteRequest = useCallback(async (id: string) => {
    try {
      setLoading(true);
      
      const success = await creditRequestApi.deleteRequest(id);
      
      if (success) {
        // Mettre à jour l'état local
        setRequests(prev => prev.filter(req => req.id !== id));
      }
      
      return success;
    } catch (err) {
      setError(`Erreur lors de la suppression de la demande de crédit ${id}`);
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const resetToMockData = useCallback(async () => {
    try {
      await creditRequestApi.getAllRequests(); // Force un reset vers les données mockées
      await fetchRequests(); // Recharger les données
    } catch (err) {
      console.error('Erreur lors de la réinitialisation des données:', err);
      throw err;
    }
  }, [fetchRequests]);

  // Utilitaires pour obtenir des informations liées
  /**
   * Retourne le nom du membre/entreprise
   * Priorité: 1. companyName depuis l'API (dans requests), 2. mock, 3. ID tronqué
   */
  const getMemberName = useCallback((memberId: string): string => {
    // 1. Chercher dans les demandes chargées (l'API fournit companyName directement)
    const fromRequests = requests.find(r => r.memberId === memberId);
    if (fromRequests?.companyName) return fromRequests.companyName;
    // 2. Fallback mock
    const member = mockMembers.find(m => m.id === memberId);
    if (member) return member.name;
    // 3. ID tronqué (évite d'afficher un UUID brut)
    return `Client #${memberId.slice(-6).toUpperCase()}`;
  }, [requests]);

  /**
   * Retourne le label du produit de crédit
   * Priorité: 1. table PRODUCT_LABELS, 2. mock, 3. productId tel quel
   */
  const getCreditProductName = useCallback((productId: string): string => {
    // 1. Labels connus (IDs courts retournés par le backend)
    if (PRODUCT_LABELS[productId]) return PRODUCT_LABELS[productId];
    // 2. Fallback mock
    const product = mockCreditProducts.find(p => p.id === productId);
    if (product) return product.name;
    // 3. productId tel quel (mieux que 'Produit inconnu' pour debug)
    return productId;
  }, []);

  const getCreditManagerName = useCallback((managerId: string): string => {
    const manager = mockCreditManagers.find(m => m.id === managerId);
    return manager ? manager.name : 'Gestionnaire inconnu';
  }, []);

  return {
    requests,
    loading,
    error,
    fetchRequests,
    addRequest,
    updateRequest,
    changeRequestStatus,
    // Nouvelles méthodes workflow
    submitRequest,
    approveRequest,
    rejectRequest,
    cancelRequest,
    analyzeRequest,
    syncFromCommercial,
    // Autres méthodes
    deleteRequest,
    getMemberName,
    getCreditProductName,
    getCreditManagerName
  };
}

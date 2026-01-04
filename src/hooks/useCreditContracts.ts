import { useState, useEffect, useCallback } from 'react';
import { CreditContract } from '../types/credit-contract';
import { creditContractApi } from '../services/api/traditional/credit-contract.api';
import { creditContractsStorageService } from '../services/storage/creditContractsStorage';

/**
 * Hook pour gérer les contrats de crédit
 * Conforme à l'API documentation: /portfolios/traditional/credit-contracts
 */
export function useCreditContracts(portfolioId: string) {
  const [contracts, setContracts] = useState<CreditContract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Récupérer les contrats avec filtres optionnels
   * GET /portfolios/traditional/credit-contracts
   */
  const fetchContracts = useCallback(async (filters?: {
    status?: 'active' | 'completed' | 'defaulted' | 'restructured';
    clientId?: string;
    productType?: string;
    dateFrom?: string;
    dateTo?: string;
  }) => {
    try {
      setLoading(true);
      setError(null);
      
      // Utiliser l'API avec fallback localStorage intégré
      const data = await creditContractApi.getAllContracts(portfolioId, filters);
      
      console.log(`[useCreditContracts] Loaded ${data.length} contracts for portfolioId: "${portfolioId}"`);
      setContracts(data);
    } catch (err) {
      setError('Erreur lors du chargement des contrats de crédit');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [portfolioId]);

  useEffect(() => {
    // Initialiser les données dans le localStorage lors du premier montage (fallback)
    creditContractsStorageService.init();
    fetchContracts();
  }, [fetchContracts]);

  /**
   * Récupérer un contrat par ID
   * GET /portfolios/traditional/credit-contracts/{id}
   */
  const getContractById = useCallback(async (id: string) => {
    try {
      setLoading(true);
      return await creditContractApi.getContractById(id);
    } catch (err) {
      setError('Erreur lors de la récupération du contrat');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Créer un nouveau contrat depuis une demande approuvée
   * POST /portfolios/traditional/credit-contracts/from-request
   */
  const addContract = useCallback(async (contract: Omit<CreditContract, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setLoading(true);
      setError(null);
      
      const newContract = await creditContractApi.createContract(contract);
      
      // Mettre à jour l'état local
      setContracts(prev => [...prev, newContract]);
      return newContract;
    } catch (err) {
      setError('Erreur lors de l\'ajout du contrat de crédit');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Mettre à jour un contrat
   * PUT /portfolios/traditional/credit-contracts/{id}
   */
  const updateContract = useCallback(async (id: string, updates: Partial<CreditContract>) => {
    try {
      setLoading(true);
      setError(null);
      
      const updatedContract = await creditContractApi.updateContract(id, updates);
      
      // Mettre à jour l'état local
      setContracts(prev => 
        prev.map(contract => 
          contract.id === id ? updatedContract : contract
        )
      );
      
      return updatedContract;
    } catch (err) {
      setError('Erreur lors de la mise à jour du contrat de crédit');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Activer un contrat (DRAFT → ACTIVE)
   * POST /portfolios/traditional/credit-contracts/{id}/activate
   */
  const activateContract = useCallback(async (id: string, activationDetails?: {
    activation_date?: string;
    notes?: string;
  }) => {
    try {
      setLoading(true);
      setError(null);
      
      const updatedContract = await creditContractApi.activateContract(id, activationDetails);
      
      // Mettre à jour l'état local
      setContracts(prev => 
        prev.map(contract => 
          contract.id === id ? updatedContract : contract
        )
      );
      
      return updatedContract;
    } catch (err) {
      setError('Erreur lors de l\'activation du contrat');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Suspendre un contrat (ACTIVE → SUSPENDED)
   * POST /portfolios/traditional/credit-contracts/{id}/suspend
   */
  const suspendContract = useCallback(async (id: string, suspensionDetails: {
    reason: string;
    suspension_date?: string;
    notes?: string;
  }) => {
    try {
      setLoading(true);
      setError(null);
      
      const updatedContract = await creditContractApi.suspendContract(id, suspensionDetails);
      
      // Mettre à jour l'état local
      setContracts(prev => 
        prev.map(contract => 
          contract.id === id ? updatedContract : contract
        )
      );
      
      return updatedContract;
    } catch (err) {
      setError('Erreur lors de la suspension du contrat');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Annuler un contrat (DRAFT/ACTIVE → CANCELLED)
   * POST /portfolios/traditional/credit-contracts/{id}/cancel
   */
  const cancelContract = useCallback(async (id: string, cancellationDetails: {
    reason: string;
    cancellation_date?: string;
    notes?: string;
  }) => {
    try {
      setLoading(true);
      setError(null);
      
      const updatedContract = await creditContractApi.cancelContract(id, cancellationDetails);
      
      // Mettre à jour l'état local
      setContracts(prev => 
        prev.map(contract => 
          contract.id === id ? updatedContract : contract
        )
      );
      
      return updatedContract;
    } catch (err) {
      setError('Erreur lors de l\'annulation du contrat');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Marquer un contrat comme défaillant
   * POST /portfolios/traditional/credit-contracts/{id}/default
   */
  const markAsDefaulted = useCallback(async (id: string, reason: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const updatedContract = await creditContractApi.markAsDefaulted(id, reason);
      
      // Mettre à jour l'état local
      setContracts(prev => 
        prev.map(contract => 
          contract.id === id ? updatedContract : contract
        )
      );
      
      return updatedContract;
    } catch (err) {
      setError('Erreur lors du marquage du contrat comme défaillant');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Restructurer un contrat
   * POST /portfolios/traditional/credit-contracts/{id}/restructure
   */
  const restructureContract = useCallback(async (id: string, restructuringDetails: {
    new_terms: string;
    new_rate?: number;
    new_end_date: string;
    reason: string;
  }) => {
    try {
      setLoading(true);
      setError(null);
      
      const updatedContract = await creditContractApi.restructureContract(id, restructuringDetails);
      
      // Mettre à jour l'état local
      setContracts(prev => 
        prev.map(contract => 
          contract.id === id ? updatedContract : contract
        )
      );
      
      return updatedContract;
    } catch (err) {
      setError('Erreur lors de la restructuration du contrat');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Clôturer un contrat (remboursement complet)
   * POST /portfolios/traditional/credit-contracts/{id}/complete
   */
  const completeContract = useCallback(async (id: string, completionDetails: {
    completion_date: string;
    notes?: string;
  }) => {
    try {
      setLoading(true);
      setError(null);
      
      const updatedContract = await creditContractApi.completeContract(id, completionDetails);
      
      // Mettre à jour l'état local
      setContracts(prev => 
        prev.map(contract => 
          contract.id === id ? updatedContract : contract
        )
      );
      
      return updatedContract;
    } catch (err) {
      setError('Erreur lors de la clôture du contrat');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Mettre un contrat en contentieux
   * POST /contracts/{id}/litigation
   */
  const putInLitigation = useCallback(async (id: string, litigationDetails: {
    reason: string;
    litigation_date?: string;
    notes?: string;
  }) => {
    try {
      setLoading(true);
      setError(null);
      
      const updatedContract = await creditContractApi.putInLitigation(id, litigationDetails);
      
      // Mettre à jour l'état local
      setContracts(prev => 
        prev.map(contract => 
          contract.id === id ? updatedContract : contract
        )
      );
      
      return updatedContract;
    } catch (err) {
      setError('Erreur lors de la mise en contentieux du contrat');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Récupérer l'échéancier de paiement d'un contrat
   * GET /contracts/{contractId}/schedule
   */
  const getPaymentSchedule = useCallback(async (contractId: string) => {
    try {
      setLoading(true);
      return await creditContractApi.getPaymentSchedule(contractId);
    } catch (err) {
      setError('Erreur lors de la récupération de l\'échéancier');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Générer le document du contrat
   * POST /portfolios/traditional/credit-contracts/{id}/generate-document
   */
  const generateDocument = useCallback(async (id: string) => {
    try {
      setLoading(true);
      return await creditContractApi.generateContractDocument(id);
    } catch (err) {
      setError('Erreur lors de la génération du document');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Réinitialiser les données mock (pour développement)
   */
  const resetToMockData = useCallback(async () => {
    try {
      console.log('Resetting credit contracts to mock data...');
      await creditContractsStorageService.resetToMockData();
      console.log('Reset completed, fetching contracts again...');
      await fetchContracts();
      return true;
    } catch (err) {
      console.error('Erreur lors de la réinitialisation des données', err);
      return false;
    }
  }, [fetchContracts]);

  return {
    contracts,
    loading,
    error,
    // CRUD Operations
    fetchContracts,
    getContractById,
    addContract,
    updateContract,
    // Workflow Operations
    activateContract,
    suspendContract,
    cancelContract,
    markAsDefaulted,
    restructureContract,
    completeContract,
    putInLitigation,
    // Schedule & Documents
    getPaymentSchedule,
    generateDocument,
    // Utilities
    resetToMockData,
    refresh: fetchContracts
  };
}

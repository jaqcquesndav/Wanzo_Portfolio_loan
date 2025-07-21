import { useState, useEffect, useCallback } from 'react';
import { CreditContract } from '../types/credit';
import { creditContractsStorageService } from '../services/storage/creditContractsStorage';

export function useCreditContracts(portfolioId: string) {
  const [contracts, setContracts] = useState<CreditContract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContracts = useCallback(async () => {
    try {
      setLoading(true);
      // Simuler un appel API avec un délai
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Récupérer les données depuis le localStorage
      const allContracts = await creditContractsStorageService.getAllContracts();
      console.log(`[useCreditContracts] Loaded ${allContracts.length} contracts from storage`);
      console.log(`[useCreditContracts] Using portfolioId: "${portfolioId}" for filtering`);
      
      // Vérifier si le portfolioId existe dans les contrats
      const portfolioIds = [...new Set(allContracts.map(c => c.portfolioId))];
      console.log(`[useCreditContracts] Available portfolioIds in contracts:`, portfolioIds);
      
      const hasContractsForPortfolio = allContracts.some(contract => contract.portfolioId === portfolioId);
      
      // Si le portfolioId spécifié n'existe pas dans les contrats, utiliser tous les contrats
      // sinon, filtrer par portfolioId
      let filtered: CreditContract[];
      if (!hasContractsForPortfolio && portfolioId !== 'default') {
        console.log(`[useCreditContracts] No contracts found for portfolioId: "${portfolioId}"`);
        if (portfolioIds.length > 0) {
          console.log(`[useCreditContracts] Consider using the 'Réinitialiser' button to generate data for this portfolio`);
        }
        filtered = [];
      } else {
        filtered = allContracts.filter(contract => contract.portfolioId === portfolioId);
        console.log(`[useCreditContracts] Found ${filtered.length} contracts for portfolioId: "${portfolioId}"`);
      }
      
      setContracts(filtered);
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement des contrats de crédit');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [portfolioId]);

  useEffect(() => {
    // Initialiser les données dans le localStorage lors du premier montage
    creditContractsStorageService.init();
    fetchContracts();
  }, [fetchContracts]);

  const addContract = useCallback(async (contract: Omit<CreditContract, 'id' | 'createdAt'>) => {
    try {
      setLoading(true);
      // Simuler un appel API avec un délai
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newContract: CreditContract = {
        ...contract,
        id: `contract-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      
      // Sauvegarder dans le localStorage
      await creditContractsStorageService.addContract(newContract);
      
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

  const updateContract = useCallback(async (id: string, updates: Partial<CreditContract>) => {
    try {
      setLoading(true);
      // Simuler un appel API avec un délai
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mettre à jour dans le localStorage
      const updatedContract = await creditContractsStorageService.updateContract(id, updates);
      
      // Mettre à jour l'état local
      setContracts(prev => 
        prev.map(contract => 
          contract.id === id ? { ...contract, ...updates, updatedAt: new Date().toISOString() } : contract
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

  const deleteContract = useCallback(async (id: string) => {
    try {
      setLoading(true);
      // Simuler un appel API avec un délai
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Supprimer du localStorage
      await creditContractsStorageService.deleteContract(id);
      
      // Mettre à jour l'état local
      setContracts(prev => prev.filter(contract => contract.id !== id));
      
      return true;
    } catch (err) {
      setError('Erreur lors de la suppression du contrat de crédit');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    contracts,
    loading,
    error,
    fetchContracts,
    addContract,
    updateContract,
    deleteContract,
    resetToMockData: async () => {
      try {
        console.log('Resetting credit contracts to mock data...');
        await creditContractsStorageService.resetToMockData();
        console.log('Reset completed, fetching contracts again...');
        fetchContracts();
        return true;
      } catch (err) {
        console.error('Erreur lors de la réinitialisation des données', err);
        return false;
      }
    }
  };
}

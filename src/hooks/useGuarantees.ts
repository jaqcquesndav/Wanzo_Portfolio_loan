import { useState, useEffect, useCallback } from 'react';
import { Guarantee } from '../components/portfolio/traditional/GuaranteesTable';
import { guaranteesStorageService } from '../services/storage/guaranteesStorage';

export function useGuarantees(portfolioId: string) {
  const [guarantees, setGuarantees] = useState<Guarantee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGuarantees = useCallback(async () => {
    try {
      setLoading(true);
      // Simuler un appel API avec un délai
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Récupérer les données depuis le localStorage
      const allGuarantees = await guaranteesStorageService.getAllGuarantees();
      console.log(`[useGuarantees] Loaded ${allGuarantees.length} guarantees from storage`);
      console.log(`[useGuarantees] Using portfolioId: "${portfolioId}" for filtering`);
      
      // Vérifier si le portfolioId existe dans les garanties
      const portfolioIds = [...new Set(allGuarantees.map(g => g.portfolioId))];
      console.log(`[useGuarantees] Available portfolioIds in guarantees:`, portfolioIds);
      
      const hasGuaranteesForPortfolio = allGuarantees.some(guarantee => guarantee.portfolioId === portfolioId);
      
      // Si le portfolioId spécifié n'existe pas dans les garanties, utiliser toutes les garanties
      // sinon, filtrer par portfolioId
      let filtered: Guarantee[];
      if (!hasGuaranteesForPortfolio && portfolioId !== 'default') {
        console.warn(`[useGuarantees] No guarantees found for portfolioId "${portfolioId}", using all guarantees`);
        filtered = allGuarantees;
      } else if (portfolioId === 'default') {
        console.log(`[useGuarantees] Using all guarantees (default portfolioId)`);
        filtered = allGuarantees;
      } else {
        console.log(`[useGuarantees] Filtering guarantees for portfolioId "${portfolioId}"`);
        filtered = allGuarantees.filter(guarantee => guarantee.portfolioId === portfolioId);
      }
      
      setGuarantees(filtered);
      setError(null);
    } catch (err) {
      console.error('Error fetching guarantees:', err);
      setError('Erreur lors de la récupération des garanties');
    } finally {
      setLoading(false);
    }
  }, [portfolioId]);

  useEffect(() => {
    fetchGuarantees();
  }, [fetchGuarantees]);

  const getGuaranteeById = useCallback(async (id: string): Promise<Guarantee | null> => {
    try {
      return await guaranteesStorageService.getGuaranteeById(id);
    } catch (err) {
      console.error(`Error getting guarantee ${id}:`, err);
      setError(`Erreur lors de la récupération de la garantie ${id}`);
      return null;
    }
  }, []);

  const updateGuarantee = useCallback(async (id: string, updatedData: Partial<Guarantee>): Promise<Guarantee | null> => {
    try {
      const updatedGuarantee = await guaranteesStorageService.updateGuarantee(id, updatedData);
      if (updatedGuarantee) {
        setGuarantees(prevGuarantees => 
          prevGuarantees.map(g => g.id === id ? { ...g, ...updatedData } : g)
        );
      }
      return updatedGuarantee;
    } catch (err) {
      console.error(`Error updating guarantee ${id}:`, err);
      setError(`Erreur lors de la mise à jour de la garantie ${id}`);
      return null;
    }
  }, []);

  const deleteGuarantee = useCallback(async (id: string): Promise<boolean> => {
    try {
      const success = await guaranteesStorageService.deleteGuarantee(id);
      if (success) {
        setGuarantees(prevGuarantees => prevGuarantees.filter(g => g.id !== id));
      }
      return success;
    } catch (err) {
      console.error(`Error deleting guarantee ${id}:`, err);
      setError(`Erreur lors de la suppression de la garantie ${id}`);
      return false;
    }
  }, []);

  const resetToMockData = useCallback(async (): Promise<boolean> => {
    try {
      const success = await guaranteesStorageService.resetToMockData();
      if (success) {
        fetchGuarantees();
      }
      return success;
    } catch (err) {
      console.error('Error resetting to mock data:', err);
      setError('Erreur lors de la réinitialisation des données');
      return false;
    }
  }, [fetchGuarantees]);

  return {
    guarantees,
    loading,
    error,
    getGuaranteeById,
    updateGuarantee,
    deleteGuarantee,
    resetToMockData,
    refreshGuarantees: fetchGuarantees
  };
}

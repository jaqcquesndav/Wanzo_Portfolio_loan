import { useState, useEffect, useCallback } from 'react';
import { Guarantee } from '../types/guarantee';
import { guaranteeService } from '../services/guaranteeService';

export function useGuarantees(portfolioId: string) {
  const [guarantees, setGuarantees] = useState<Guarantee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGuarantees = useCallback(async () => {
    try {
      setLoading(true);
      // Simuler un appel API avec un délai
      await new Promise(resolve => setTimeout(resolve, 500));
      
      let fetchedGuarantees: Guarantee[] = [];
      
      if (portfolioId === 'default') {
        // Pour le portefeuille par défaut, récupérer toutes les garanties
        fetchedGuarantees = await guaranteeService.getAllGuarantees();
        console.log(`[useGuarantees] Loaded all guarantees (default portfolioId)`);
      } else {
        // Sinon, récupérer les garanties pour ce portefeuille spécifique
        fetchedGuarantees = await guaranteeService.getGuaranteesByPortfolioId(portfolioId);
        console.log(`[useGuarantees] Loaded guarantees for portfolioId "${portfolioId}"`);
      }
      
      setGuarantees(fetchedGuarantees);
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
      return await guaranteeService.getGuaranteeById(id);
    } catch (err) {
      console.error(`Error getting guarantee ${id}:`, err);
      setError(`Erreur lors de la récupération de la garantie ${id}`);
      return null;
    }
  }, []);

  const updateGuarantee = useCallback(async (id: string, updatedData: Partial<Guarantee>): Promise<Guarantee | null> => {
    try {
      const updatedGuarantee = await guaranteeService.updateGuarantee(id, updatedData);
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
      const success = await guaranteeService.deleteGuarantee(id);
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
      const success = await guaranteeService.resetToMockData();
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

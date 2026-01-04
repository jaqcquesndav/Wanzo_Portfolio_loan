import { useState, useEffect, useCallback } from 'react';
import { Guarantee, GuaranteeStatus } from '../types/guarantee';
import { guaranteeService } from '../services/guaranteeService';
import { guaranteeApiV2 } from '../services/api/traditional/guarantee.api';

/**
 * Hook pour la gestion des garanties - Conforme à la documentation API
 */
export function useGuarantees(portfolioId: string) {
  const [guarantees, setGuarantees] = useState<Guarantee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGuarantees = useCallback(async (filters?: {
    contractId?: string;
    type?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) => {
    try {
      setLoading(true);
      
      let fetchedGuarantees: Guarantee[] = [];
      
      if (portfolioId === 'default') {
        // Pour le portefeuille par défaut, utiliser le service local
        fetchedGuarantees = await guaranteeService.getAllGuarantees();
        console.log(`[useGuarantees] Loaded all guarantees (default portfolioId)`);
      } else {
        // Essayer d'utiliser l'API conforme
        try {
          const response = await guaranteeApiV2.getAllGuarantees(portfolioId, filters);
          fetchedGuarantees = response.data;
          console.log(`[useGuarantees] Loaded guarantees from API for portfolioId "${portfolioId}"`);
        } catch (apiError) {
          // Fallback sur le service local
          console.warn('Fallback to local service for guarantees', apiError);
          fetchedGuarantees = await guaranteeService.getGuaranteesByPortfolioId(portfolioId);
          
          // Appliquer les filtres localement
          if (filters?.contractId) {
            fetchedGuarantees = fetchedGuarantees.filter(g => g.contractId === filters.contractId);
          }
          if (filters?.type) {
            fetchedGuarantees = fetchedGuarantees.filter(g => g.type === filters.type);
          }
          if (filters?.status) {
            fetchedGuarantees = fetchedGuarantees.filter(g => g.status === filters.status);
          }
        }
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
      // Essayer l'API conforme
      try {
        return await guaranteeApiV2.getGuaranteeById(id);
      } catch {
        // Fallback sur le service local
        return await guaranteeService.getGuaranteeById(id);
      }
    } catch (err) {
      console.error(`Error getting guarantee ${id}:`, err);
      setError(`Erreur lors de la récupération de la garantie ${id}`);
      return null;
    }
  }, []);

  /**
   * Créer une nouvelle garantie
   * POST /portfolios/traditional/guarantees
   */
  const createGuarantee = useCallback(async (guaranteeData: Omit<Guarantee, 'id' | 'created_at'>): Promise<Guarantee | null> => {
    try {
      setLoading(true);
      
      // Essayer l'API conforme
      try {
        const newGuarantee = await guaranteeApiV2.createGuarantee(guaranteeData);
        setGuarantees(prev => [...prev, newGuarantee]);
        return newGuarantee;
      } catch {
        // Fallback sur le service local
        const newGuarantee = await guaranteeService.addGuarantee(guaranteeData as Guarantee);
        if (newGuarantee) {
          setGuarantees(prev => [...prev, newGuarantee]);
        }
        return newGuarantee;
      }
    } catch (err) {
      console.error('Error creating guarantee:', err);
      setError('Erreur lors de la création de la garantie');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateGuarantee = useCallback(async (id: string, updatedData: Partial<Guarantee>): Promise<Guarantee | null> => {
    try {
      setLoading(true);
      
      // Essayer l'API conforme
      try {
        const updatedGuarantee = await guaranteeApiV2.updateGuarantee(id, updatedData);
        setGuarantees(prev => prev.map(g => g.id === id ? updatedGuarantee : g));
        return updatedGuarantee;
      } catch {
        // Fallback sur le service local
        const updatedGuarantee = await guaranteeService.updateGuarantee(id, updatedData);
        if (updatedGuarantee) {
          setGuarantees(prev => prev.map(g => g.id === id ? { ...g, ...updatedData } : g));
        }
        return updatedGuarantee;
      }
    } catch (err) {
      console.error(`Error updating guarantee ${id}:`, err);
      setError(`Erreur lors de la mise à jour de la garantie ${id}`);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Libérer une garantie (mainlevée)
   * POST /portfolios/traditional/guarantees/{id}/release
   */
  const releaseGuarantee = useCallback(async (id: string, releaseData: {
    release_date: string;
    reason: string;
  }): Promise<Guarantee | null> => {
    try {
      setLoading(true);
      
      const releasedGuarantee = await guaranteeApiV2.releaseGuarantee(id, releaseData);
      setGuarantees(prev => prev.map(g => g.id === id ? releasedGuarantee : g));
      return releasedGuarantee;
    } catch (err) {
      console.error(`Error releasing guarantee ${id}:`, err);
      setError(`Erreur lors de la libération de la garantie ${id}`);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Saisir une garantie
   * POST /portfolios/traditional/guarantees/{id}/seize
   */
  const seizeGuarantee = useCallback(async (id: string, seizureData: {
    seizure_date: string;
    reason: string;
    legal_reference?: string;
  }): Promise<Guarantee | null> => {
    try {
      setLoading(true);
      
      const seizedGuarantee = await guaranteeApiV2.seizeGuarantee(id, seizureData);
      setGuarantees(prev => prev.map(g => g.id === id ? seizedGuarantee : g));
      return seizedGuarantee;
    } catch (err) {
      console.error(`Error seizing guarantee ${id}:`, err);
      setError(`Erreur lors de la saisie de la garantie ${id}`);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteGuarantee = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      
      // Essayer l'API conforme
      try {
        await guaranteeApiV2.deleteGuarantee(id);
        setGuarantees(prev => prev.filter(g => g.id !== id));
        return true;
      } catch {
        // Fallback sur le service local
        const success = await guaranteeService.deleteGuarantee(id);
        if (success) {
          setGuarantees(prev => prev.filter(g => g.id !== id));
        }
        return success;
      }
    } catch (err) {
      console.error(`Error deleting guarantee ${id}:`, err);
      setError(`Erreur lors de la suppression de la garantie ${id}`);
      return false;
    } finally {
      setLoading(false);
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
    createGuarantee,
    updateGuarantee,
    releaseGuarantee,
    seizeGuarantee,
    deleteGuarantee,
    resetToMockData,
    refreshGuarantees: fetchGuarantees
  };
}

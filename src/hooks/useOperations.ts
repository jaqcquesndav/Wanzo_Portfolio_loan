import { useState, useEffect, useCallback } from 'react';
import type { PortfolioOperation } from '../components/dashboard/RecentOperationsTable';
import type { PortfolioType } from '../types/portfolio';
import { getOperationsFromStorage, loadAndStoreOperations } from '../services/localStorage/operationsStorage';
import { useConnectivity } from './useConnectivity';

interface UseOperationsResult {
  operations: PortfolioOperation[];
  loading: boolean;
  error: Error | null;
  refreshOperations: () => Promise<void>;
}

/**
 * Hook pour gérer les opérations de portefeuille
 * Récupère les données depuis localStorage et les recharge si nécessaire
 */
export const useOperations = (portfolioType?: PortfolioType): UseOperationsResult => {
  const [operations, setOperations] = useState<PortfolioOperation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const { isOnline } = useConnectivity();
  
  // Fonction pour charger les opérations
  const loadOperations = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // D'abord, essayer de récupérer depuis localStorage pour un affichage rapide
      const cachedOperations = getOperationsFromStorage(portfolioType);
      setOperations(cachedOperations);
      
      // Ensuite, recharger les données fraîches en arrière-plan
      if (isOnline) {
        const freshOperations = await loadAndStoreOperations(portfolioType);
        setOperations(freshOperations);
      }
    } catch (err) {
      console.error('Erreur lors du chargement des opérations:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, [portfolioType, isOnline]);
  
  // Charger les opérations au montage du composant
  useEffect(() => {
    loadOperations();
  }, [loadOperations]);
  
  // Fonction pour actualiser manuellement les opérations
  const refreshOperations = useCallback(async () => {
    await loadOperations();
  }, [loadOperations]);
  
  return {
    operations,
    loading,
    error,
    refreshOperations
  };
};

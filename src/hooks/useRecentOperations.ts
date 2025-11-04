import { useState, useEffect, useCallback } from 'react';
import type { PortfolioOperation } from '../components/dashboard/RecentOperationsTable';
import type { PortfolioType } from '../types/portfolio';
import { getRecentOperations } from '../services/dashboard/operationsService';
import { useNotification } from '../contexts/useNotification';

interface UseRecentOperationsResult {
  operations: PortfolioOperation[];
  loading: boolean;
  error: string | null;
  refreshOperations: () => Promise<void>;
}

/**
 * Hook pour récupérer et gérer les opérations récentes
 * Utilise le service operationsService qui combine les données API et les mocks
 */
export const useRecentOperations = (
  portfolioType?: PortfolioType,
  portfolioId?: string
): UseRecentOperationsResult => {
  const [operations, setOperations] = useState<PortfolioOperation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { showNotification } = useNotification();

  // Fonction pour charger les opérations
  const loadOperations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Loading recent operations for portfolio type:', portfolioType);
      
      // Récupérer les opérations via le service
      let allOperations = await getRecentOperations(portfolioType);
      console.log('All operations loaded:', allOperations);
      
      // Filtrer par portefeuille si spécifié
      if (portfolioId) {
        allOperations = allOperations.filter(op => op.portfolioId === portfolioId);
        console.log('Filtered operations for portfolio', portfolioId, ':', allOperations);
      }
      
      setOperations(allOperations);
    } catch (err) {
      console.error('Erreur lors du chargement des opérations récentes:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(errorMessage);
      showNotification('Erreur lors du chargement des opérations', 'error');
    } finally {
      setLoading(false);
    }
  }, [portfolioType, portfolioId, showNotification]);

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
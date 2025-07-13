// src/hooks/useInitMockData.ts
import { useState, useEffect, useCallback } from 'react';
import { mockTraditionalPortfolios } from '../data/mockTraditionalPortfolios';
import { mockInvestmentPortfolios } from '../data/mockInvestmentPortfolios';
import { mockLeasingPortfolios } from '../data/mockLeasingPortfolios';
import type { PortfolioWithType } from '../types/portfolio';

export function useInitMockData() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const initialize = async () => {
      // Vérifier si les données sont déjà initialisées
      const hasBeenInitialized = localStorage.getItem('mockDataInitialized') === 'true';
      
      if (!hasBeenInitialized) {
        setLoading(true);
        try {
          // Vider les anciennes données
          localStorage.removeItem('portfolios');
          
          // Validation des données mockées
          if (!Array.isArray(mockTraditionalPortfolios)) {
            throw new Error("Les données mockTraditionalPortfolios ne sont pas un tableau");
          }
          if (!Array.isArray(mockInvestmentPortfolios)) {
            throw new Error("Les données mockInvestmentPortfolios ne sont pas un tableau");
          }
          if (!Array.isArray(mockLeasingPortfolios)) {
            throw new Error("Les données mockLeasingPortfolios ne sont pas un tableau");
          }
          
          // Combiner toutes les données mockées
          const allPortfolios: PortfolioWithType[] = [
            ...mockTraditionalPortfolios,
            ...mockInvestmentPortfolios,
            ...mockLeasingPortfolios
          ];
          
          // Log pour debug
          console.info(`Initialisation des données mock: ${allPortfolios.length} portefeuilles au total`);
          console.info(`- ${mockTraditionalPortfolios.length} portefeuilles traditionnels`);
          console.info(`- ${mockInvestmentPortfolios.length} portefeuilles d'investissement`);
          console.info(`- ${mockLeasingPortfolios.length} portefeuilles de leasing`);
          
          // Sauvegarder dans localStorage
          localStorage.setItem('portfolios', JSON.stringify(allPortfolios));
          
          // Marquer comme initialisé
          localStorage.setItem('mockDataInitialized', 'true');
          
          setIsInitialized(true);
        } catch (error) {
          console.error('Erreur lors de l\'initialisation des données mock:', error);
          setError(error instanceof Error ? error : new Error(String(error)));
        } finally {
          setLoading(false);
        }
      } else {
        setIsInitialized(true);
        setLoading(false);
      }
    };

    initialize();
  }, []);

  // Fonction pour forcer la réinitialisation des données
  const resetMockData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Supprimer le marqueur d'initialisation
      localStorage.removeItem('mockDataInitialized');
      // Vider les données
      localStorage.removeItem('portfolios');
      
      // Recombiner toutes les données mockées
      const allPortfolios: PortfolioWithType[] = [
        ...mockTraditionalPortfolios,
        ...mockInvestmentPortfolios,
        ...mockLeasingPortfolios
      ];
      
      // Sauvegarder dans localStorage
      localStorage.setItem('portfolios', JSON.stringify(allPortfolios));
      
      // Marquer comme initialisé
      localStorage.setItem('mockDataInitialized', 'true');
      
      setIsInitialized(true);
      console.info('Données mock réinitialisées avec succès');
    } catch (error) {
      console.error('Erreur lors de la réinitialisation des données mock:', error);
      setError(error instanceof Error ? error : new Error(String(error)));
    } finally {
      setLoading(false);
    }
  }, []);

  return { isInitialized, loading, error, resetMockData };
}

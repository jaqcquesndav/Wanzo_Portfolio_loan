// src/services/storage/mockDataInitializer.ts
import { mockTraditionalPortfolios } from '../../data/mockTraditionalPortfolios';
import { mockInvestmentPortfolios } from '../../data/mockInvestmentPortfolios';
import { mockLeasingPortfolios } from '../../data/mockLeasingPortfolios';
import type { PortfolioWithType } from '../../types/portfolio';

export async function initializeMockData(): Promise<void> {
  try {
    // Vérifier si les données sont déjà initialisées
    const hasBeenInitialized = localStorage.getItem('mockDataInitialized') === 'true';

    if (!hasBeenInitialized) {
      console.info('Initialisation des données mock...');

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
      
      console.info('Initialisation des données mock terminée avec succès');
    } else {
      console.info('Les données mock sont déjà initialisées');
    }
  } catch (error) {
    console.error('Erreur lors de l\'initialisation des données mock:', error);
    throw error;
  }
}

export function resetMockData(): Promise<void> {
  return initializeMockData();
}

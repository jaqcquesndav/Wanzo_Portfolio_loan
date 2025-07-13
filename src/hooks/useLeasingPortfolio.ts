
import { useEffect } from 'react';
import { usePortfolio } from './usePortfolio';
import { useInitMockData } from './useInitMockData';
import { mockLeasingPortfolios } from '../data/mockLeasingPortfolios';
import { portfolioStorageService } from '../services/storage/localStorage';

/**
 * Hook leasing robuste :
 * - Si id absent ou vide, loading reste true et portfolio undefined
 * - Si id fourni, lit le portefeuille de type 'leasing' depuis localStorage
 * - Ne retourne que les portefeuilles de type 'leasing' (filtrage dans usePortfolioDetails)
 * - Vérifie l'initialisation des données mock
 */
export function useLeasingPortfolio(id: string | undefined) {
  const { isInitialized, loading: initLoading } = useInitMockData();
  const portfolioData = usePortfolio(id, 'leasing');
  
  // S'assurer que les données des portefeuilles leasing sont présentes et à jour
  useEffect(() => {
    async function checkAndAddLeasingPortfolios() {
      if (!isInitialized || !id) return;
      
      // Si le portefeuille n'est pas trouvé mais qu'il existe dans les mock data,
      // on essaie de le réinsérer
      if (!portfolioData.loading && !portfolioData.portfolio) {
        console.log(`Portefeuille leasing ${id} non trouvé, tentative de réinsertion`);
        
        const matchingMockPortfolio = mockLeasingPortfolios.find(p => p.id === id);
        if (matchingMockPortfolio) {
          try {
            console.log(`Portefeuille leasing ${id} trouvé dans les mocks, ajout au localStorage`);
            await portfolioStorageService.addOrUpdatePortfolio(matchingMockPortfolio);
            // Forcer le rechargement de la page après l'ajout
            window.location.reload();
          } catch (error) {
            console.error(`Erreur lors de l'ajout du portefeuille leasing ${id}:`, error);
          }
        }
      }
      // Si le portefeuille est trouvé, mais pourrait être obsolète, on met à jour
      else if (!portfolioData.loading && portfolioData.portfolio) {
        const matchingMockPortfolio = mockLeasingPortfolios.find(p => p.id === id);
        if (matchingMockPortfolio) {
          // Vérifier si la structure est à jour en comparant avec la dernière version des mocks
          try {
            // Mise à jour du portefeuille depuis les dernières données mock
            // Cela garantira que les nouvelles structures (comme maintenances) sont présentes
            await portfolioStorageService.addOrUpdatePortfolio(matchingMockPortfolio);
          } catch (error) {
            console.error(`Erreur lors de la mise à jour du portefeuille leasing ${id}:`, error);
          }
        }
      }
    }
    
    checkAndAddLeasingPortfolios();
  }, [id, isInitialized, portfolioData.loading, portfolioData.portfolio]);
  
  return {
    ...portfolioData,
    // Considérer loading comme true si l'initialisation est en cours
    loading: portfolioData.loading || initLoading
  };
}
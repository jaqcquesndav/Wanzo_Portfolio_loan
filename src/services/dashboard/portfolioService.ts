// src/services/dashboard/portfolioService.ts
import type { Portfolio, PortfolioType } from '../../types/portfolio';
import type { PortfolioWithType } from '../../types/portfolioWithType';
import { portfolioStorageService } from '../storage/localStorage';

/**
 * Récupère les portefeuilles par type depuis le localStorage
 */
export const getPortfoliosByType = (portfolioType: PortfolioType): Promise<Portfolio[]> => {
  if (!portfolioType) return Promise.resolve([]);
  
  try {
    return portfolioStorageService.getAllPortfolios()
      .then(portfolios => portfolios.filter((portfolio: PortfolioWithType) => portfolio.type === portfolioType));
  } catch (error: unknown) {
    console.error(`Erreur lors de la récupération des portefeuilles de type ${portfolioType}:`, error);
    return Promise.resolve([]);
  }
};

/**
 * Récupère le portefeuille courant basé sur le localStorage
 */
export const getCurrentPortfolio = async (portfolioType: PortfolioType): Promise<Portfolio | undefined> => {
  try {
    const currentPortfolioId = localStorage.getItem('currentPortfolioId');
    if (!currentPortfolioId) {
      // Si aucun portefeuille courant n'est défini, on prend le premier du type demandé
      const portfolios = await getPortfoliosByType(portfolioType);
      return portfolios.length > 0 ? portfolios[0] : undefined;
    }
    
    // Sinon, on récupère le portefeuille correspondant à l'ID
    const portfolios = await portfolioStorageService.getAllPortfolios();
    return portfolios.find((p: PortfolioWithType) => p.id === currentPortfolioId && p.type === portfolioType);
  } catch (error: unknown) {
    console.error(`Erreur lors de la récupération du portefeuille courant de type ${portfolioType}:`, error);
    return undefined;
  }
};

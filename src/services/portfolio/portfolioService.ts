// src/services/portfolio/portfolioService.ts
import { createOfflineClient } from '../api/offlineClient';
import { OFFLINE_STORAGE_CONFIG } from '../offlineService';
import { Portfolio, PortfolioStatus } from '../../types/portfolio';

/**
 * Service pour la gestion des portefeuilles avec support du mode hors ligne
 */
export const portfolioService = () => {
  // Dans un contexte réel, ces valeurs proviendraient du contexte ConnectivityContext
  const isOnline = navigator.onLine;
  const addPendingAction = (action: { type: string; resourceId: string; payload?: unknown }) => {
    console.log('Action en attente ajoutée:', action);
    return action;
  };
  
  const offlineClient = createOfflineClient(isOnline, addPendingAction);
  const storageKey = OFFLINE_STORAGE_CONFIG.PORTFOLIOS || 'wanzo_offline_portfolios';
  const endpoint = '/portfolios';

  /**
   * Récupère tous les portefeuilles
   */
  const getAllPortfolios = () => {
    return offlineClient.getWithOfflineSupport<Portfolio>(endpoint, storageKey);
  };

  /**
   * Récupère un portefeuille par son ID
   */
  const getPortfolioById = async (id: string) => {
    try {
      const portfolios = await getAllPortfolios();
      return portfolios.find(portfolio => portfolio.id === id) || null;
    } catch (error) {
      console.error(`Erreur lors de la récupération du portefeuille ${id}:`, error);
      return null;
    }
  };

  /**
   * Crée un nouveau portefeuille
   */
  const createPortfolio = (data: Omit<Portfolio, 'id'>) => {
    return offlineClient.createWithOfflineSupport<Portfolio>(
      endpoint,
      storageKey,
      data as Portfolio // Le serveur générera l'ID
    );
  };

  /**
   * Met à jour un portefeuille
   */
  const updatePortfolio = (id: string, data: Partial<Portfolio>) => {
    return offlineClient.updateWithOfflineSupport<Portfolio>(
      endpoint,
      storageKey,
      id,
      data
    );
  };

  /**
   * Supprime un portefeuille
   */
  const deletePortfolio = (id: string) => {
    return offlineClient.deleteWithOfflineSupport(
      endpoint,
      storageKey,
      id
    );
  };

  /**
   * Change le statut d'un portefeuille
   */
  const changePortfolioStatus = async (id: string, status: PortfolioStatus) => {
    const portfolios = await getAllPortfolios();
    const portfolioIndex = portfolios.findIndex(p => p.id === id);
    
    if (portfolioIndex === -1) {
      throw new Error(`Portefeuille avec l'ID ${id} non trouvé`);
    }
    
    return offlineClient.updateWithOfflineSupport<Portfolio>(
      endpoint,
      storageKey,
      id,
      { status }
    );
  };

  return {
    getAllPortfolios,
    getPortfolioById,
    createPortfolio,
    updatePortfolio,
    deletePortfolio,
    changePortfolioStatus
  };
};

// Export singleton pour utilisation dans l'application
export default portfolioService();

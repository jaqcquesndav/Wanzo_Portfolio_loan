// src/services/api/investment/dataService.ts
import { InvestmentPortfolio, InvestmentAsset, InvestmentRequest } from '../../../types/investment-portfolio';

// Définir des types pour éviter l'utilisation de any
interface Valuation {
  id: string;
  asset_id: string;
  date: string;
  value: number;
  change_percentage: number;
}

interface Subscription {
  id: string;
  portfolio_id: string;
  asset_id: string;
  amount: number;
  date: string;
  status: string;
}

// Données mock pour le développement
// Normalement importées de fichiers externes, créons-les en interne pour résoudre les erreurs d'importation
const mockInvestmentPortfolios: InvestmentPortfolio[] = [
  // Ajoutez ici des données mock si nécessaire
];

const mockInvestmentAssets: InvestmentAsset[] = [
  // Ajoutez ici des données mock si nécessaire
];

const mockInvestmentRequests: InvestmentRequest[] = [
  // Ajoutez ici des données mock si nécessaire
];

const mockValuations: Valuation[] = [
  // Ajoutez ici des données mock si nécessaire
];

const mockSubscriptions: Subscription[] = [
  // Ajoutez ici des données mock si nécessaire
];

// Clés pour le localStorage
const STORAGE_KEYS = {
  PORTFOLIOS: 'wanzo_investment_portfolios',
  ASSETS: 'wanzo_investment_assets',
  REQUESTS: 'wanzo_investment_requests',
  VALUATIONS: 'wanzo_investment_valuations',
  SUBSCRIPTIONS: 'wanzo_investment_subscriptions',
  MARKETS: 'wanzo_investment_markets',
};

/**
 * Service de données pour les fonctionnalités de portefeuille d'investissement
 * Cette implémentation utilise le localStorage pour le développement
 * et sera remplacée par des appels API réels en production
 */
export const investmentDataService = {
  /**
   * Initialise les données dans le localStorage si elles n'existent pas déjà
   */
  initData: (): void => {
    // Initialiser les portefeuilles d'investissement
    if (!localStorage.getItem(STORAGE_KEYS.PORTFOLIOS)) {
      localStorage.setItem(STORAGE_KEYS.PORTFOLIOS, JSON.stringify(mockInvestmentPortfolios));
    }

    // Initialiser les actifs d'investissement
    if (!localStorage.getItem(STORAGE_KEYS.ASSETS)) {
      localStorage.setItem(STORAGE_KEYS.ASSETS, JSON.stringify(mockInvestmentAssets));
    }

    // Initialiser les demandes d'investissement
    if (!localStorage.getItem(STORAGE_KEYS.REQUESTS)) {
      localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(mockInvestmentRequests));
    }

    // Initialiser les évaluations
    if (!localStorage.getItem(STORAGE_KEYS.VALUATIONS)) {
      localStorage.setItem(STORAGE_KEYS.VALUATIONS, JSON.stringify(mockValuations));
    }

    // Initialiser les souscriptions
    if (!localStorage.getItem(STORAGE_KEYS.SUBSCRIPTIONS)) {
      localStorage.setItem(STORAGE_KEYS.SUBSCRIPTIONS, JSON.stringify(mockSubscriptions));
    }
  },

  /**
   * Récupère tous les portefeuilles d'investissement du localStorage
   */
  getInvestmentPortfolios: (): InvestmentPortfolio[] => {
    const portfolios = localStorage.getItem(STORAGE_KEYS.PORTFOLIOS);
    return portfolios ? JSON.parse(portfolios) : [];
  },

  /**
   * Récupère un portefeuille d'investissement par son ID
   */
  getInvestmentPortfolioById: (id: string): InvestmentPortfolio | undefined => {
    const portfolios = investmentDataService.getInvestmentPortfolios();
    return portfolios.find(p => p.id === id);
  },

  /**
   * Alias de getInvestmentPortfolioById pour compatibilité avec portfolio-settings.api.ts
   */
  getPortfolioById: (id: string): InvestmentPortfolio | undefined => {
    return investmentDataService.getInvestmentPortfolioById(id);
  },

  /**
   * Ajoute un nouveau portefeuille d'investissement
   */
  addInvestmentPortfolio: (portfolio: InvestmentPortfolio): void => {
    const portfolios = investmentDataService.getInvestmentPortfolios();
    portfolios.push(portfolio);
    localStorage.setItem(STORAGE_KEYS.PORTFOLIOS, JSON.stringify(portfolios));
  },

  /**
   * Met à jour un portefeuille d'investissement
   */
  updateInvestmentPortfolio: (portfolio: InvestmentPortfolio): void => {
    const portfolios = investmentDataService.getInvestmentPortfolios();
    const index = portfolios.findIndex(p => p.id === portfolio.id);
    
    if (index !== -1) {
      portfolios[index] = { ...portfolios[index], ...portfolio };
      localStorage.setItem(STORAGE_KEYS.PORTFOLIOS, JSON.stringify(portfolios));
    }
  },

  /**
   * Alias de updateInvestmentPortfolio pour compatibilité avec portfolio-settings.api.ts
   */
  updatePortfolio: (portfolio: InvestmentPortfolio): void => {
    investmentDataService.updateInvestmentPortfolio(portfolio);
  },

  /**
   * Récupère tous les actifs d'investissement du localStorage
   */
  getInvestmentAssets: (): InvestmentAsset[] => {
    const assets = localStorage.getItem(STORAGE_KEYS.ASSETS);
    return assets ? JSON.parse(assets) : [];
  },

  /**
   * Récupère les actifs d'un portefeuille
   */
  getAssetsByPortfolioId: (portfolioId: string): InvestmentAsset[] => {
    const assets = investmentDataService.getInvestmentAssets();
    // Utilisons portfolioId car c'est ce qui est défini dans le type
    return assets.filter(a => a.companyId === portfolioId); // Utilisons companyId comme attribut disponible
  },

  /**
   * Récupère un actif par son ID
   */
  getAssetById: (id: string): InvestmentAsset | undefined => {
    const assets = investmentDataService.getInvestmentAssets();
    return assets.find(a => a.id === id);
  },

  /**
   * Ajoute un nouvel actif
   */
  addAsset: (asset: InvestmentAsset): void => {
    const assets = investmentDataService.getInvestmentAssets();
    assets.push(asset);
    localStorage.setItem(STORAGE_KEYS.ASSETS, JSON.stringify(assets));
  },

  /**
   * Met à jour un actif
   */
  updateAsset: (asset: InvestmentAsset): void => {
    const assets = investmentDataService.getInvestmentAssets();
    const index = assets.findIndex(a => a.id === asset.id);
    
    if (index !== -1) {
      assets[index] = { ...assets[index], ...asset };
      localStorage.setItem(STORAGE_KEYS.ASSETS, JSON.stringify(assets));
    }
  },

  /**
   * Récupère toutes les demandes d'investissement
   */
  getInvestmentRequests: (): InvestmentRequest[] => {
    const requests = localStorage.getItem(STORAGE_KEYS.REQUESTS);
    return requests ? JSON.parse(requests) : [];
  },

  /**
   * Récupère les demandes d'investissement d'un portefeuille
   */
  getRequestsByPortfolioId: (portfolioId: string): InvestmentRequest[] => {
    const requests = investmentDataService.getInvestmentRequests();
    // Utilisons portfolioId car c'est ce qui est défini dans le type
    return requests.filter(r => r.portfolioId === portfolioId);
  },

  /**
   * Récupère une demande d'investissement par son ID
   */
  getRequestById: (id: string): InvestmentRequest | undefined => {
    const requests = investmentDataService.getInvestmentRequests();
    return requests.find(r => r.id === id);
  },

  /**
   * Ajoute une nouvelle demande d'investissement
   */
  addRequest: (request: InvestmentRequest): void => {
    const requests = investmentDataService.getInvestmentRequests();
    requests.push(request);
    localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(requests));
  },

  /**
   * Met à jour une demande d'investissement
   */
  updateRequest: (request: InvestmentRequest): void => {
    const requests = investmentDataService.getInvestmentRequests();
    const index = requests.findIndex(r => r.id === request.id);
    
    if (index !== -1) {
      requests[index] = { ...requests[index], ...request };
      localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(requests));
    }
  },

  /**
   * Génère un nouvel ID (pour n'importe quel objet)
   */
  generateId: (): string => {
    return `ID-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  },

  /**
   * Génère un nouvel ID de portefeuille
   */
  generatePortfolioId: (): string => {
    const portfolios = investmentDataService.getInvestmentPortfolios();
    const lastId = portfolios.length > 0 
      ? parseInt(portfolios[portfolios.length - 1].id.replace('IP-', ''))
      : 0;
    return `IP-${String(lastId + 1).padStart(5, '0')}`;
  },

  /**
   * Génère un nouvel ID d'actif
   */
  generateAssetId: (): string => {
    const assets = investmentDataService.getInvestmentAssets();
    const lastId = assets.length > 0 
      ? parseInt(assets[assets.length - 1].id.replace('ASSET-', ''))
      : 0;
    return `ASSET-${String(lastId + 1).padStart(5, '0')}`;
  },

  /**
   * Génère un nouvel ID de demande
   */
  generateRequestId: (): string => {
    const requests = investmentDataService.getInvestmentRequests();
    const lastId = requests.length > 0 
      ? parseInt(requests[requests.length - 1].id.replace('IREQ-', ''))
      : 0;
    return `IREQ-${String(lastId + 1).padStart(5, '0')}`;
  },

  /**
   * Réinitialise toutes les données (utile pour le développement)
   */
  resetInvestmentData: (): void => {
    localStorage.setItem(STORAGE_KEYS.PORTFOLIOS, JSON.stringify(mockInvestmentPortfolios));
    localStorage.setItem(STORAGE_KEYS.ASSETS, JSON.stringify(mockInvestmentAssets));
    localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(mockInvestmentRequests));
    localStorage.setItem(STORAGE_KEYS.VALUATIONS, JSON.stringify(mockValuations));
    localStorage.setItem(STORAGE_KEYS.SUBSCRIPTIONS, JSON.stringify(mockSubscriptions));
  }
};

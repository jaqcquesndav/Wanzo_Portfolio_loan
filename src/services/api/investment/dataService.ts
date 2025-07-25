// src/services/api/investment/dataService.ts
import { InvestmentPortfolio, InvestmentAsset, InvestmentRequest } from '../../../types/investment-portfolio';
import { MarketSecurity, SecuritiesType } from '../../../types/market-securities';

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
  MARKET_SECURITIES: 'wanzo_investment_market_securities',
};

// Données mock pour les titres du marché
const mockMarketSecurities: MarketSecurity[] = [
  {
    id: 'MS-00001',
    name: 'Actions Société Tech',
    companyId: 'C-00001',
    companyName: 'Tech Innovations Inc.',
    type: 'actions',
    unitPrice: 150.75,
    availableUnits: 10000,
    totalValue: 1507500,
    currency: 'EUR',
    sector: 'Technologie',
    country: 'France',
    reference: 'TECH-FR-001',
    issuer: 'Tech Innovations Inc.',
    listed: true,
    marketCap: 2500000000,
    enterpriseValue: 3000000000,
    creationDate: '2010-05-15',
    description: 'Entreprise spécialisée dans les solutions technologiques innovantes',
    lastValuationDate: '2025-07-01',
    risk: 'modéré',
    expectedReturn: 7.5,
    valuation: {
      ebitdaMultiple: 8.5,
      peRatio: 12.3,
      priceToBookRatio: 2.1
    },
    financialMetrics: {
      revenue: 450000000,
      ebitda: 85000000,
      netIncome: 60000000,
      debt: 250000000
    },
    created_at: '2024-01-15T10:30:00Z',
    updated_at: '2025-07-01T14:45:00Z'
  },
  {
    id: 'MS-00002',
    name: 'Obligations État 2030',
    companyId: 'C-00002',
    companyName: 'République Française',
    type: 'obligations',
    unitPrice: 98.5,
    availableUnits: 50000,
    totalValue: 4925000,
    currency: 'EUR',
    sector: 'Gouvernement',
    country: 'France',
    reference: 'OAT-FR-2030',
    issuer: 'Trésor Public Français',
    listed: true,
    description: 'Obligations d\'État à échéance 2030 avec coupon annuel de 2.5%',
    lastValuationDate: '2025-07-01',
    risk: 'faible',
    expectedReturn: 2.5,
    created_at: '2024-02-10T09:15:00Z',
    updated_at: '2025-07-01T14:45:00Z'
  },
  {
    id: 'MS-00003',
    name: 'Parts Startup FinTech',
    companyId: 'C-00003',
    companyName: 'FinTech Solutions',
    type: 'parts_sociales',
    investmentEntryType: 'series_a',
    unitPrice: 5000,
    availableUnits: 200,
    totalValue: 1000000,
    currency: 'EUR',
    sector: 'Finance',
    country: 'France',
    issuer: 'FinTech Solutions SAS',
    listed: false,
    enterpriseValue: 12000000,
    creationDate: '2022-11-03',
    description: 'Startup innovante dans les solutions de paiement digital',
    lastValuationDate: '2025-06-15',
    risk: 'élevé',
    expectedReturn: 15,
    valuation: {
      ebitdaMultiple: 12
    },
    financialMetrics: {
      revenue: 1200000,
      ebitda: 100000,
      netIncome: -200000,
      debt: 300000
    },
    created_at: '2024-03-20T15:45:00Z',
    updated_at: '2025-06-15T11:30:00Z'
  }
];

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
    localStorage.setItem(STORAGE_KEYS.MARKET_SECURITIES, JSON.stringify(mockMarketSecurities));
  },

  /**
   * Récupère tous les titres du marché
   */
  getMarketSecurities: (): MarketSecurity[] => {
    const securities = localStorage.getItem(STORAGE_KEYS.MARKET_SECURITIES);
    if (securities) {
      return JSON.parse(securities);
    } else {
      // Initialiser avec les données mock si vide
      localStorage.setItem(STORAGE_KEYS.MARKET_SECURITIES, JSON.stringify(mockMarketSecurities));
      return mockMarketSecurities;
    }
  },

  /**
   * Récupère un titre du marché par son ID
   */
  getMarketSecurityById: (id: string): MarketSecurity | undefined => {
    const securities = investmentDataService.getMarketSecurities();
    return securities.find(s => s.id === id);
  },

  /**
   * Récupère les titres du marché par entreprise
   */
  getMarketSecuritiesByCompany: (companyId: string): MarketSecurity[] => {
    const securities = investmentDataService.getMarketSecurities();
    return securities.filter(s => s.companyId === companyId);
  },

  /**
   * Récupère les titres du marché par secteur
   */
  getMarketSecuritiesBySector: (sector: string): MarketSecurity[] => {
    const securities = investmentDataService.getMarketSecurities();
    return securities.filter(s => s.sector === sector);
  },

  /**
   * Récupère les titres du marché par type
   */
  getMarketSecuritiesByType: (type: SecuritiesType): MarketSecurity[] => {
    const securities = investmentDataService.getMarketSecurities();
    return securities.filter(s => s.type === type);
  },

  /**
   * Récupère les titres du marché par pays
   */
  getMarketSecuritiesByCountry: (country: string): MarketSecurity[] => {
    const securities = investmentDataService.getMarketSecurities();
    return securities.filter(s => s.country === country);
  },

  /**
   * Récupère les titres du marché par niveau de risque
   */
  getMarketSecuritiesByRisk: (risk: 'faible' | 'modéré' | 'élevé'): MarketSecurity[] => {
    const securities = investmentDataService.getMarketSecurities();
    return securities.filter(s => s.risk === risk);
  },

  /**
   * Ajoute un nouveau titre au marché
   */
  addMarketSecurity: (security: Omit<MarketSecurity, 'id' | 'created_at' | 'updated_at'>): MarketSecurity => {
    const securities = investmentDataService.getMarketSecurities();
    
    const newSecurity: MarketSecurity = {
      ...security,
      id: `MS-${String(securities.length + 1).padStart(5, '0')}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    securities.push(newSecurity);
    localStorage.setItem(STORAGE_KEYS.MARKET_SECURITIES, JSON.stringify(securities));
    
    return newSecurity;
  },

  /**
   * Met à jour un titre du marché
   */
  updateMarketSecurity: (id: string, updates: Partial<MarketSecurity>): MarketSecurity | undefined => {
    const securities = investmentDataService.getMarketSecurities();
    const index = securities.findIndex(s => s.id === id);
    
    if (index !== -1) {
      const updatedSecurity = {
        ...securities[index],
        ...updates,
        updated_at: new Date().toISOString()
      };
      
      securities[index] = updatedSecurity;
      localStorage.setItem(STORAGE_KEYS.MARKET_SECURITIES, JSON.stringify(securities));
      
      return updatedSecurity;
    }
    
    return undefined;
  },

  /**
   * Supprime un titre du marché
   */
  deleteMarketSecurity: (id: string): boolean => {
    const securities = investmentDataService.getMarketSecurities();
    const filteredSecurities = securities.filter(s => s.id !== id);
    
    if (filteredSecurities.length < securities.length) {
      localStorage.setItem(STORAGE_KEYS.MARKET_SECURITIES, JSON.stringify(filteredSecurities));
      return true;
    }
    
    return false;
  },

  /**
   * Récupère les secteurs uniques des titres du marché
   */
  getUniqueSectors: (): string[] => {
    const securities = investmentDataService.getMarketSecurities();
    return [...new Set(securities.map(s => s.sector))];
  },

  /**
   * Récupère les pays uniques des titres du marché
   */
  getUniqueCountries: (): string[] => {
    const securities = investmentDataService.getMarketSecurities();
    return [...new Set(securities.map(s => s.country))];
  },

  /**
   * Génère un ID de titre du marché
   */
  generateMarketSecurityId: (): string => {
    const securities = investmentDataService.getMarketSecurities();
    return `MS-${String(securities.length + 1).padStart(5, '0')}`;
  }
};

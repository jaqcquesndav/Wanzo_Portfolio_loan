// src/services/api/leasing/dataService.ts
import { LeasingRequest } from '../../../types/leasing-request';
import { LeasingContract, Equipment, LeasingPortfolio } from '../../../types/leasing';
import { mockLeasingRequests } from '../../../data/mockLeasingRequests';
import { mockLeasingContracts } from '../../../data/mockLeasingContracts';
import { mockEquipments } from '../../../data/mockEquipments';
import { mockLeasingPortfolios } from '../../../data/mockLeasingPortfolios';

// Clés pour le localStorage
const STORAGE_KEYS = {
  REQUESTS: 'wanzo_leasing_requests',
  CONTRACTS: 'wanzo_leasing_contracts',
  EQUIPMENTS: 'wanzo_leasing_equipments',
  PORTFOLIOS: 'wanzo_leasing_portfolios',
};

/**
 * Service de données pour les fonctionnalités de leasing
 * Cette implémentation utilise le localStorage pour le développement
 * et sera remplacée par des appels API réels en production
 */
export const leasingDataService = {
  /**
   * Vérifie si les données de leasing sont déjà initialisées
   * @returns Promise<boolean> - True si les données sont initialisées, false sinon
   */
  checkDataInitialized: async (): Promise<boolean> => {
    return Boolean(
      localStorage.getItem(STORAGE_KEYS.REQUESTS) &&
      localStorage.getItem(STORAGE_KEYS.CONTRACTS) &&
      localStorage.getItem(STORAGE_KEYS.EQUIPMENTS) &&
      localStorage.getItem(STORAGE_KEYS.PORTFOLIOS)
    );
  },

  /**
   * Initialise toutes les données de leasing
   * @returns Promise<void>
   */
  initializeData: async (): Promise<void> => {
    leasingDataService.initData();
    return Promise.resolve();
  },

  /**
   * Initialise les données dans le localStorage si elles n'existent pas déjà
   */
  initData: (): void => {
    // Initialiser les demandes de leasing
    if (!localStorage.getItem(STORAGE_KEYS.REQUESTS)) {
      localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(mockLeasingRequests));
    }

    // Initialiser les contrats de leasing
    if (!localStorage.getItem(STORAGE_KEYS.CONTRACTS)) {
      localStorage.setItem(STORAGE_KEYS.CONTRACTS, JSON.stringify(mockLeasingContracts));
    }

    // Initialiser les équipements
    if (!localStorage.getItem(STORAGE_KEYS.EQUIPMENTS)) {
      localStorage.setItem(STORAGE_KEYS.EQUIPMENTS, JSON.stringify(mockEquipments));
    }
    
    // Initialiser les portefeuilles de leasing
    if (!localStorage.getItem(STORAGE_KEYS.PORTFOLIOS)) {
      localStorage.setItem(STORAGE_KEYS.PORTFOLIOS, JSON.stringify(mockLeasingPortfolios));
    }
  },

  /**
   * Récupère toutes les demandes de leasing du localStorage
   */
  getLeasingRequests: (): LeasingRequest[] => {
    const requests = localStorage.getItem(STORAGE_KEYS.REQUESTS);
    return requests ? JSON.parse(requests) : [];
  },

  /**
   * Récupère une demande de leasing spécifique par son ID
   */
  getLeasingRequestById: (id: string): LeasingRequest | undefined => {
    const requests = leasingDataService.getLeasingRequests();
    return requests.find(req => req.id === id);
  },

  /**
   * Met à jour une demande de leasing
   */
  updateLeasingRequest: (request: LeasingRequest): void => {
    const requests = leasingDataService.getLeasingRequests();
    const index = requests.findIndex(req => req.id === request.id);
    
    if (index !== -1) {
      requests[index] = { ...requests[index], ...request };
      localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(requests));
    }
  },

  /**
   * Récupère tous les contrats de leasing du localStorage
   */
  getLeasingContracts: (): LeasingContract[] => {
    const contracts = localStorage.getItem(STORAGE_KEYS.CONTRACTS);
    return contracts ? JSON.parse(contracts) : [];
  },

  /**
   * Récupère un contrat de leasing spécifique par son ID
   */
  getLeasingContractById: (id: string): LeasingContract | undefined => {
    const contracts = leasingDataService.getLeasingContracts();
    return contracts.find(contract => contract.id === id);
  },

  /**
   * Met à jour un contrat de leasing
   */
  updateLeasingContract: (contract: LeasingContract): void => {
    const contracts = leasingDataService.getLeasingContracts();
    const index = contracts.findIndex(c => c.id === contract.id);
    
    if (index !== -1) {
      contracts[index] = { ...contracts[index], ...contract };
      localStorage.setItem(STORAGE_KEYS.CONTRACTS, JSON.stringify(contracts));
    }
  },

  /**
   * Ajoute un nouveau contrat de leasing
   */
  addLeasingContract: (contract: LeasingContract): void => {
    const contracts = leasingDataService.getLeasingContracts();
    contracts.push(contract);
    localStorage.setItem(STORAGE_KEYS.CONTRACTS, JSON.stringify(contracts));
  },

  /**
   * Récupère tous les équipements du localStorage
   */
  getEquipments: (): Equipment[] => {
    const equipments = localStorage.getItem(STORAGE_KEYS.EQUIPMENTS);
    return equipments ? JSON.parse(equipments) : [];
  },

  /**
   * Récupère un équipement spécifique par son ID
   */
  getEquipmentById: (id: string): Equipment | undefined => {
    const equipments = leasingDataService.getEquipments();
    return equipments.find(equipment => equipment.id === id);
  },

  /**
   * Récupère tous les portefeuilles de leasing
   */
  getLeasingPortfolios: (): LeasingPortfolio[] => {
    const portfolios = localStorage.getItem(STORAGE_KEYS.PORTFOLIOS);
    return portfolios ? JSON.parse(portfolios) : [];
  },

  /**
   * Récupère un portefeuille de leasing par son ID
   */
  getLeasingPortfolioById: (id: string): LeasingPortfolio | undefined => {
    const portfolios = leasingDataService.getLeasingPortfolios();
    return portfolios.find(portfolio => portfolio.id === id);
  },

  /**
   * Met à jour un portefeuille de leasing
   */
  updateLeasingPortfolio: (portfolio: LeasingPortfolio): void => {
    const portfolios = leasingDataService.getLeasingPortfolios();
    const index = portfolios.findIndex(p => p.id === portfolio.id);
    
    if (index !== -1) {
      portfolios[index] = { ...portfolios[index], ...portfolio };
      localStorage.setItem(STORAGE_KEYS.PORTFOLIOS, JSON.stringify(portfolios));
    }
  },

  /**
   * Ajoute un nouveau portefeuille de leasing
   */
  addLeasingPortfolio: (portfolio: LeasingPortfolio): void => {
    const portfolios = leasingDataService.getLeasingPortfolios();
    portfolios.push(portfolio);
    localStorage.setItem(STORAGE_KEYS.PORTFOLIOS, JSON.stringify(portfolios));
  },

  /**
   * Réinitialise toutes les données (utile pour le développement)
   */
  resetLeasingData: (): void => {
    localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(mockLeasingRequests));
    localStorage.setItem(STORAGE_KEYS.CONTRACTS, JSON.stringify(mockLeasingContracts));
    localStorage.setItem(STORAGE_KEYS.EQUIPMENTS, JSON.stringify(mockEquipments));
    localStorage.setItem(STORAGE_KEYS.PORTFOLIOS, JSON.stringify(mockLeasingPortfolios));
  },

  /**
   * Génère un nouvel ID de contrat
   */
  generateContractId: (): string => {
    const contracts = leasingDataService.getLeasingContracts();
    const lastId = contracts.length > 0 
      ? parseInt(contracts[contracts.length - 1].id.replace('LC-', ''))
      : 0;
    return `LC-${String(lastId + 1).padStart(5, '0')}`;
  },

  /**
   * Génère un nouvel ID de portefeuille
   */
  generatePortfolioId: (): string => {
    const portfolios = leasingDataService.getLeasingPortfolios();
    const lastId = portfolios.length > 0 
      ? parseInt(portfolios[portfolios.length - 1].id.replace('LP-', ''))
      : 0;
    return `LP-${String(lastId + 1).padStart(5, '0')}`;
  }
};

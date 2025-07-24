// src/services/api/traditional/dataService.ts
import { TraditionalPortfolio } from '../../../types/traditional-portfolio';
import { FundingRequest } from '../../../types/funding-request';
import { CreditContract } from '../../../types/credit-contract';
import { CreditPayment } from '../../../types/credit-payment';
import { mockTraditionalPortfolios } from '../../../data/mockTraditionalPortfolios';
import { mockFundingRequests } from '../../../data/mockFundingRequests';
import { mockCreditContracts } from '../../../data/mockCreditContracts';
import { mockDisbursements } from '../../../data/mockDisbursements';
import { mockRepayments } from '../../../data/mockRepayments';
import { mockGuarantees } from '../../../data/mockGuarantees';

// Clés pour le localStorage
const STORAGE_KEYS = {
  PORTFOLIOS: 'wanzo_traditional_portfolios',
  FUNDING_REQUESTS: 'wanzo_funding_requests',
  CREDIT_CONTRACTS: 'wanzo_credit_contracts',
  DISBURSEMENTS: 'wanzo_disbursements',
  PAYMENTS: 'wanzo_traditional_payments',
  GUARANTEES: 'wanzo_guarantees',
};

/**
 * Service de données pour les fonctionnalités de portefeuille traditionnel
 * Cette implémentation utilise le localStorage pour le développement
 * et sera remplacée par des appels API réels en production
 */
export const traditionalDataService = {
  /**
   * Initialise les données dans le localStorage si elles n'existent pas déjà
   */
  initData: (): void => {
    // Initialiser les portefeuilles traditionnels
    if (!localStorage.getItem(STORAGE_KEYS.PORTFOLIOS)) {
      localStorage.setItem(STORAGE_KEYS.PORTFOLIOS, JSON.stringify(mockTraditionalPortfolios));
    }

    // Initialiser les demandes de financement
    if (!localStorage.getItem(STORAGE_KEYS.FUNDING_REQUESTS)) {
      localStorage.setItem(STORAGE_KEYS.FUNDING_REQUESTS, JSON.stringify(mockFundingRequests));
    }

    // Initialiser les contrats de crédit
    if (!localStorage.getItem(STORAGE_KEYS.CREDIT_CONTRACTS)) {
      localStorage.setItem(STORAGE_KEYS.CREDIT_CONTRACTS, JSON.stringify(mockCreditContracts));
    }

    // Initialiser les virements
    if (!localStorage.getItem(STORAGE_KEYS.DISBURSEMENTS)) {
      localStorage.setItem(STORAGE_KEYS.DISBURSEMENTS, JSON.stringify(mockDisbursements));
    }

    // Initialiser les remboursements
    if (!localStorage.getItem(STORAGE_KEYS.PAYMENTS)) {
      localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(mockRepayments));
    }

    // Initialiser les garanties
    if (!localStorage.getItem(STORAGE_KEYS.GUARANTEES)) {
      localStorage.setItem(STORAGE_KEYS.GUARANTEES, JSON.stringify(mockGuarantees));
    }
  },

  /**
   * Récupère tous les portefeuilles traditionnels du localStorage
   */
  getTraditionalPortfolios: (): TraditionalPortfolio[] => {
    const portfolios = localStorage.getItem(STORAGE_KEYS.PORTFOLIOS);
    return portfolios ? JSON.parse(portfolios) : [];
  },

  /**
   * Récupère un portefeuille traditionnel par son ID
   */
  getTraditionalPortfolioById: (id: string): TraditionalPortfolio | undefined => {
    const portfolios = traditionalDataService.getTraditionalPortfolios();
    return portfolios.find(p => p.id === id);
  },

  /**
   * Ajoute un nouveau portefeuille traditionnel
   */
  addTraditionalPortfolio: (portfolio: TraditionalPortfolio): void => {
    const portfolios = traditionalDataService.getTraditionalPortfolios();
    portfolios.push(portfolio);
    localStorage.setItem(STORAGE_KEYS.PORTFOLIOS, JSON.stringify(portfolios));
  },

  /**
   * Met à jour un portefeuille traditionnel
   */
  updateTraditionalPortfolio: (portfolio: TraditionalPortfolio): void => {
    const portfolios = traditionalDataService.getTraditionalPortfolios();
    const index = portfolios.findIndex(p => p.id === portfolio.id);
    
    if (index !== -1) {
      portfolios[index] = { ...portfolios[index], ...portfolio };
      localStorage.setItem(STORAGE_KEYS.PORTFOLIOS, JSON.stringify(portfolios));
    }
  },

  /**
   * Récupère toutes les demandes de financement du localStorage
   */
  getFundingRequests: (): FundingRequest[] => {
    const requests = localStorage.getItem(STORAGE_KEYS.FUNDING_REQUESTS);
    return requests ? JSON.parse(requests) : [];
  },

  /**
   * Récupère une demande de financement par son ID
   */
  getFundingRequestById: (id: string): FundingRequest | undefined => {
    const requests = traditionalDataService.getFundingRequests();
    return requests.find(r => r.id === id);
  },

  /**
   * Ajoute une nouvelle demande de financement
   */
  addFundingRequest: (request: FundingRequest): void => {
    const requests = traditionalDataService.getFundingRequests();
    requests.push(request);
    localStorage.setItem(STORAGE_KEYS.FUNDING_REQUESTS, JSON.stringify(requests));
  },

  /**
   * Met à jour une demande de financement
   */
  updateFundingRequest: (request: FundingRequest): void => {
    const requests = traditionalDataService.getFundingRequests();
    const index = requests.findIndex(r => r.id === request.id);
    
    if (index !== -1) {
      requests[index] = { ...requests[index], ...request };
      localStorage.setItem(STORAGE_KEYS.FUNDING_REQUESTS, JSON.stringify(requests));
    }
  },

  /**
   * Récupère tous les contrats de crédit du localStorage
   */
  getCreditContracts: (): CreditContract[] => {
    const contracts = localStorage.getItem(STORAGE_KEYS.CREDIT_CONTRACTS);
    return contracts ? JSON.parse(contracts) : [];
  },

  /**
   * Récupère un contrat de crédit par son ID
   */
  getCreditContractById: (id: string): CreditContract | undefined => {
    const contracts = traditionalDataService.getCreditContracts();
    return contracts.find(c => c.id === id);
  },

  /**
   * Ajoute un nouveau contrat de crédit
   */
  addCreditContract: (contract: CreditContract): void => {
    const contracts = traditionalDataService.getCreditContracts();
    contracts.push(contract);
    localStorage.setItem(STORAGE_KEYS.CREDIT_CONTRACTS, JSON.stringify(contracts));
  },

  /**
   * Met à jour un contrat de crédit
   */
  updateCreditContract: (contract: CreditContract): void => {
    const contracts = traditionalDataService.getCreditContracts();
    const index = contracts.findIndex(c => c.id === contract.id);
    
    if (index !== -1) {
      contracts[index] = { ...contracts[index], ...contract };
      localStorage.setItem(STORAGE_KEYS.CREDIT_CONTRACTS, JSON.stringify(contracts));
    }
  },

  /**
   * Génère un nouvel ID de portefeuille
   */
  generatePortfolioId: (): string => {
    const portfolios = traditionalDataService.getTraditionalPortfolios();
    const lastId = portfolios.length > 0 
      ? parseInt(portfolios[portfolios.length - 1].id.replace('TP-', ''))
      : 0;
    return `TP-${String(lastId + 1).padStart(5, '0')}`;
  },

  /**
   * Génère un nouvel ID de demande de financement
   */
  generateFundingRequestId: (): string => {
    const requests = traditionalDataService.getFundingRequests();
    const lastId = requests.length > 0 
      ? parseInt(requests[requests.length - 1].id.replace('FR-', ''))
      : 0;
    return `FR-${String(lastId + 1).padStart(5, '0')}`;
  },

  /**
   * Génère un nouvel ID de contrat de crédit
   */
  generateCreditContractId: (): string => {
    const contracts = traditionalDataService.getCreditContracts();
    const lastId = contracts.length > 0 
      ? parseInt(contracts[contracts.length - 1].id.replace('CC-', ''))
      : 0;
    return `CC-${String(lastId + 1).padStart(5, '0')}`;
  },

  /**
   * Réinitialise toutes les données (utile pour le développement)
   */
  resetTraditionalData: (): void => {
    localStorage.setItem(STORAGE_KEYS.PORTFOLIOS, JSON.stringify(mockTraditionalPortfolios));
    localStorage.setItem(STORAGE_KEYS.FUNDING_REQUESTS, JSON.stringify(mockFundingRequests));
    localStorage.setItem(STORAGE_KEYS.CREDIT_CONTRACTS, JSON.stringify(mockCreditContracts));
    localStorage.setItem(STORAGE_KEYS.DISBURSEMENTS, JSON.stringify(mockDisbursements));
    localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(mockRepayments));
    localStorage.setItem(STORAGE_KEYS.GUARANTEES, JSON.stringify(mockGuarantees));
  },

  /**
   * Récupère tous les paiements
   */
  getAllPayments: (): CreditPayment[] => {
    const payments = localStorage.getItem(STORAGE_KEYS.PAYMENTS);
    return payments ? JSON.parse(payments) : [];
  },

  /**
   * Récupère les paiements par ID de contrat
   */
  getPaymentsByContractId: (contractId: string): CreditPayment[] => {
    const payments = traditionalDataService.getAllPayments();
    return payments.filter(p => p.contract_id === contractId);
  },

  /**
   * Récupère les paiements en retard pour un portefeuille
   */
  getLatePayments: (portfolioId: string): CreditPayment[] => {
    const payments = traditionalDataService.getAllPayments();
    const now = new Date();
    return payments.filter(p => 
      p.portfolio_id === portfolioId && 
      p.status === 'pending' && 
      new Date(p.payment_date) < now
    );
  },

  /**
   * Récupère un paiement par son ID
   */
  getPaymentById: (id: string): CreditPayment | undefined => {
    const payments = traditionalDataService.getAllPayments();
    return payments.find(p => p.id === id);
  },

  /**
   * Ajoute un nouveau paiement
   */
  addPayment: (payment: CreditPayment): void => {
    const payments = traditionalDataService.getAllPayments();
    payments.push(payment);
    localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(payments));
  },

  /**
   * Met à jour un paiement
   */
  updatePayment: (payment: CreditPayment): void => {
    const payments = traditionalDataService.getAllPayments();
    const index = payments.findIndex(p => p.id === payment.id);
    
    if (index !== -1) {
      payments[index] = { ...payments[index], ...payment };
      localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(payments));
    }
  },

  /**
   * Génère un nouvel ID de paiement
   */
  generatePaymentId: (): string => {
    const payments = traditionalDataService.getAllPayments();
    const lastId = payments.length > 0 
      ? parseInt(payments[payments.length - 1].id.replace('PAY-', ''))
      : 0;
    return `PAY-${String(lastId + 1).padStart(5, '0')}`;
  },

  /**
   * Récupère le calendrier de paiement pour un contrat
   */
  getPaymentSchedule: (contractId: string) => {
    const contract = traditionalDataService.getCreditContractById(contractId);
    if (!contract || !contract.payment_schedule) {
      return [];
    }
    return contract.payment_schedule;
  }
};

/**
 * Configuration des endpoints API pour le dashboard
 */

// URL de base de l'API
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.wanzo-portfolio.com';

// Timeout pour les requêtes API (en ms)
export const API_TIMEOUT = 15000;

// Endpoints spécifiques
export const API_ENDPOINTS = {
  // Dashboard
  OPERATIONS: '/operations',
  OPERATIONS_SUMMARY: '/operations/summary',
  
  // Portfolios
  PORTFOLIO: (id: string) => `/portfolios/${id}`,
  PORTFOLIO_OPERATIONS: (id: string) => `/portfolios/${id}/operations`,
  
  // Types de portfolios spécifiques
  TRADITIONAL_PORTFOLIOS: '/portfolios/traditional',
  LEASING_PORTFOLIOS: '/portfolios/leasing',
  INVESTMENT_PORTFOLIOS: '/portfolios/investment',
  
  // Entités liées
  DISBURSEMENTS: '/disbursements',
  REPAYMENTS: '/repayments',
  LEASING_TRANSACTIONS: '/leasing/transactions',
  INVESTMENT_TRANSACTIONS: '/investment/transactions',
  FUNDING_REQUESTS: '/funding/requests',
  GUARANTEES: '/guarantees',
  
  // Contrats
  CREDIT_CONTRACTS: '/contracts/credit',
  LEASING_CONTRACTS: '/contracts/leasing',
  
  // Équipements
  ASSETS: '/assets',
  LEASING_MOVEMENTS: '/leasing/movements',
  INCIDENTS: '/leasing/incidents',
  LEASING_PAYMENTS: '/leasing/payments',
  
  // Investissements
  SUBSCRIPTIONS: '/investment/subscriptions',
  VALUATIONS: '/investment/valuations'
};

// Headers par défaut pour les requêtes API
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json'
};

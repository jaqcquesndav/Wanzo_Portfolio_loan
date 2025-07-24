import { mockDisbursements } from '../../data/mockDisbursements';
import { mockRepayments } from '../../data/mockRepayments';
import { mockLeasingTransactions } from '../../data/mockLeasingTransactions';
import { mockInvestmentTransactions } from '../../data/mockInvestmentTransactions';
import { mockLeasingMovements } from '../../data/mockLeasing';
import { mockFundingRequests } from '../../data/mockFundingRequests';
import { mockCreditContracts } from '../../data/mockCreditContracts';
import { mockGuarantees } from '../../data/mockGuarantees';
import { mockLeasingContracts } from '../../data/mockLeasingContracts';
import { mockIncidents } from '../../data/mockIncidents';
import { mockLeasingPayments } from '../../data/mockLeasingPayments';
import { mockAssets } from '../../data/mockAssets';
import { mockSubscriptions } from '../../data/mockSubscriptions';
import { mockValuations } from '../../data/mockValuations';

// Clés pour le localStorage
const STORAGE_KEYS = {
  DISBURSEMENTS: 'wanzo_portfolio_disbursements',
  REPAYMENTS: 'wanzo_portfolio_repayments',
  LEASING_TRANSACTIONS: 'wanzo_portfolio_leasing_transactions',
  INVESTMENT_TRANSACTIONS: 'wanzo_portfolio_investment_transactions',
  LEASING_MOVEMENTS: 'wanzo_portfolio_leasing_movements',
  FUNDING_REQUESTS: 'wanzo_portfolio_funding_requests',
  CREDIT_CONTRACTS: 'wanzo_portfolio_credit_contracts',
  GUARANTEES: 'wanzo_portfolio_guarantees',
  LEASING_CONTRACTS: 'wanzo_portfolio_leasing_contracts',
  INCIDENTS: 'wanzo_portfolio_incidents',
  LEASING_PAYMENTS: 'wanzo_portfolio_leasing_payments',
  ASSETS: 'wanzo_portfolio_assets',
  SUBSCRIPTIONS: 'wanzo_portfolio_subscriptions',
  VALUATIONS: 'wanzo_portfolio_valuations'
};

// Fonction générique pour sauvegarder des données dans le localStorage
const saveToStorage = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Erreur lors de la sauvegarde des données (${key}):`, error);
  }
};

// Fonction générique pour récupérer des données depuis le localStorage
const getFromStorage = <T>(key: string, defaultData: T): T => {
  try {
    const storedData = localStorage.getItem(key);
    if (!storedData) return defaultData;
    
    return JSON.parse(storedData) as T;
  } catch (error) {
    console.error(`Erreur lors de la récupération des données (${key}):`, error);
    return defaultData;
  }
};

// Fonctions spécifiques pour chaque type de données
export const getDisbursements = () => getFromStorage(STORAGE_KEYS.DISBURSEMENTS, mockDisbursements);
export const getRepayments = () => getFromStorage(STORAGE_KEYS.REPAYMENTS, mockRepayments);
export const getLeasingTransactions = () => getFromStorage(STORAGE_KEYS.LEASING_TRANSACTIONS, mockLeasingTransactions);
export const getInvestmentTransactions = () => getFromStorage(STORAGE_KEYS.INVESTMENT_TRANSACTIONS, mockInvestmentTransactions);
export const getLeasingMovements = () => getFromStorage(STORAGE_KEYS.LEASING_MOVEMENTS, mockLeasingMovements);
export const getFundingRequests = () => getFromStorage(STORAGE_KEYS.FUNDING_REQUESTS, mockFundingRequests);
export const getCreditContracts = () => getFromStorage(STORAGE_KEYS.CREDIT_CONTRACTS, mockCreditContracts);
export const getGuarantees = () => getFromStorage(STORAGE_KEYS.GUARANTEES, mockGuarantees);
export const getLeasingContracts = () => getFromStorage(STORAGE_KEYS.LEASING_CONTRACTS, mockLeasingContracts);
export const getIncidents = () => getFromStorage(STORAGE_KEYS.INCIDENTS, mockIncidents);
export const getLeasingPayments = () => getFromStorage(STORAGE_KEYS.LEASING_PAYMENTS, mockLeasingPayments);
export const getAssets = () => getFromStorage(STORAGE_KEYS.ASSETS, mockAssets);
export const getSubscriptions = () => getFromStorage(STORAGE_KEYS.SUBSCRIPTIONS, mockSubscriptions);
export const getValuations = () => getFromStorage(STORAGE_KEYS.VALUATIONS, mockValuations);

// Initialisation: charge les données mockées dans le localStorage
export const initializeLocalStorageMocks = (): void => {
  saveToStorage(STORAGE_KEYS.DISBURSEMENTS, mockDisbursements);
  saveToStorage(STORAGE_KEYS.REPAYMENTS, mockRepayments);
  saveToStorage(STORAGE_KEYS.LEASING_TRANSACTIONS, mockLeasingTransactions);
  saveToStorage(STORAGE_KEYS.INVESTMENT_TRANSACTIONS, mockInvestmentTransactions);
  saveToStorage(STORAGE_KEYS.LEASING_MOVEMENTS, mockLeasingMovements);
  saveToStorage(STORAGE_KEYS.FUNDING_REQUESTS, mockFundingRequests);
  saveToStorage(STORAGE_KEYS.CREDIT_CONTRACTS, mockCreditContracts);
  saveToStorage(STORAGE_KEYS.GUARANTEES, mockGuarantees);
  saveToStorage(STORAGE_KEYS.LEASING_CONTRACTS, mockLeasingContracts);
  saveToStorage(STORAGE_KEYS.INCIDENTS, mockIncidents);
  saveToStorage(STORAGE_KEYS.LEASING_PAYMENTS, mockLeasingPayments);
  saveToStorage(STORAGE_KEYS.ASSETS, mockAssets);
  saveToStorage(STORAGE_KEYS.SUBSCRIPTIONS, mockSubscriptions);
  saveToStorage(STORAGE_KEYS.VALUATIONS, mockValuations);
  
  console.log('Données mockées initialisées dans localStorage');
};

// Réinitialiser toutes les données
export const resetMockData = (): void => {
  initializeLocalStorageMocks();
  console.log('Données mockées réinitialisées');
};

// Appeler l'initialisation au démarrage du service
try {
  if (typeof window !== 'undefined' && window.localStorage) {
    // Vérifier si les données existent déjà
    const hasData = localStorage.getItem(STORAGE_KEYS.DISBURSEMENTS) !== null;
    if (!hasData) {
      initializeLocalStorageMocks();
    }
  }
} catch (error) {
  console.error('Erreur lors de l\'initialisation des données mockées:', error);
}

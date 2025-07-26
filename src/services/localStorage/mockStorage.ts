import { mockDisbursements } from '../../data/mockDisbursements';
import { mockRepayments } from '../../data/mockRepayments';
import { mockFundingRequests } from '../../data/mockFundingRequests';
import { mockCreditContracts } from '../../data/mockCreditContracts';
import { mockGuarantees } from '../../data/mockGuarantees';

// Clés pour le localStorage
const STORAGE_KEYS = {
  DISBURSEMENTS: 'wanzo_portfolio_disbursements',
  REPAYMENTS: 'wanzo_portfolio_repayments',
  FUNDING_REQUESTS: 'wanzo_portfolio_funding_requests',
  CREDIT_CONTRACTS: 'wanzo_portfolio_credit_contracts',
  GUARANTEES: 'wanzo_portfolio_guarantees'
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
export const getFundingRequests = () => getFromStorage(STORAGE_KEYS.FUNDING_REQUESTS, mockFundingRequests);
export const getCreditContracts = () => getFromStorage(STORAGE_KEYS.CREDIT_CONTRACTS, mockCreditContracts);
export const getGuarantees = () => getFromStorage(STORAGE_KEYS.GUARANTEES, mockGuarantees);

// Initialisation: charge les données mockées dans le localStorage
export const initializeLocalStorageMocks = (): void => {
  saveToStorage(STORAGE_KEYS.DISBURSEMENTS, mockDisbursements);
  saveToStorage(STORAGE_KEYS.REPAYMENTS, mockRepayments);
  saveToStorage(STORAGE_KEYS.FUNDING_REQUESTS, mockFundingRequests);
  saveToStorage(STORAGE_KEYS.CREDIT_CONTRACTS, mockCreditContracts);
  saveToStorage(STORAGE_KEYS.GUARANTEES, mockGuarantees);
  
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

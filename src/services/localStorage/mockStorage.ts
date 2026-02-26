import { mockDisbursements } from '../../data/mockDisbursements';
import { mockRepayments } from '../../data/mockRepayments';
import { mockCreditRequests } from '../../data/mockCreditRequests';
import { mockCreditContracts } from '../../data/mockCreditContracts';
import { mockGuarantees } from '../../data/mockGuarantees';
import type { Disbursement } from '../../types/disbursement';
import type { Guarantee } from '../../types/guarantee';
import type { CreditRequest } from '../../types/credit';
import type { CreditContract } from '../../types/credit-contract';

// Clés localStorage UNIFIÉES avec dataService.ts pour que toutes les opérations
// créées dans l'app (via API fallback) soient visibles dans le dashboard.
// IMPORTANT: Ces clés doivent correspondre exactement à celles de
// src/services/api/traditional/dataService.ts → STORAGE_KEYS
export const MOCK_STORAGE_KEYS = {
  DISBURSEMENTS: 'wanzo_disbursements',          // même clé que dataService.ts
  REPAYMENTS: 'wanzo_portfolio_repayments',      // pas de service API dédié → clé propre
  CREDIT_REQUESTS: 'wanzo_credit_requests',       // même clé que dataService.ts
  CREDIT_CONTRACTS: 'wanzo_credit_contracts',     // même clé que dataService.ts
  GUARANTEES: 'wanzo_guarantees'                 // même clé que dataService.ts
};

// Clé de contrôle pour savoir si le seeding initial a déjà eu lieu
const SEED_FLAG_KEY = 'wanzo_mock_seeded_v2';

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

// ── Getters ──────────────────────────────────────────────────────────────────
export const getDisbursements = () =>
  getFromStorage<Disbursement[]>(MOCK_STORAGE_KEYS.DISBURSEMENTS, mockDisbursements);

// Repayment n'a pas de type centralisé propre – on utilise le type de mockRepayments
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getRepayments = (): any[] =>
  getFromStorage(MOCK_STORAGE_KEYS.REPAYMENTS, mockRepayments);

export const getCreditRequests = () =>
  getFromStorage<CreditRequest[]>(MOCK_STORAGE_KEYS.CREDIT_REQUESTS, mockCreditRequests);

export const getCreditContracts = () =>
  getFromStorage<CreditContract[]>(MOCK_STORAGE_KEYS.CREDIT_CONTRACTS, mockCreditContracts);

export const getGuarantees = () =>
  getFromStorage<Guarantee[]>(MOCK_STORAGE_KEYS.GUARANTEES, mockGuarantees);

// ── Setters / CRUD ────────────────────────────────────────────────────────────

/** Ajoute ou met à jour un virement dans le localStorage */
export const saveDisbursement = (disbursement: Disbursement): void => {
  const list = getDisbursements();
  const idx = list.findIndex(d => d.id === disbursement.id);
  if (idx !== -1) list[idx] = disbursement;
  else list.unshift(disbursement); // en tête = plus récent en premier
  saveToStorage(MOCK_STORAGE_KEYS.DISBURSEMENTS, list);
};

/** Met à jour le statut d'un virement */
export const updateDisbursementStatus = (id: string, status: string): void => {
  const list = getDisbursements();
  const idx = list.findIndex(d => d.id === id);
  if (idx !== -1) {
    (list[idx] as unknown as Record<string, unknown>).status = status;
    saveToStorage(MOCK_STORAGE_KEYS.DISBURSEMENTS, list);
  }
};

/** Ajoute ou met à jour un remboursement */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const saveRepayment = (repayment: any): void => {
  const list = getRepayments();
  const idx = list.findIndex((r: { id: string }) => r.id === repayment.id);
  if (idx !== -1) list[idx] = repayment;
  else list.unshift(repayment);
  saveToStorage(MOCK_STORAGE_KEYS.REPAYMENTS, list);
};

/** Ajoute ou met à jour une demande de crédit */
export const saveCreditRequest = (request: CreditRequest): void => {
  const list = getCreditRequests();
  const idx = list.findIndex(r => r.id === request.id);
  if (idx !== -1) list[idx] = request;
  else list.unshift(request);
  saveToStorage(MOCK_STORAGE_KEYS.CREDIT_REQUESTS, list);
};

/** Ajoute ou met à jour un contrat de crédit */
export const saveCreditContract = (contract: CreditContract): void => {
  const list = getCreditContracts();
  const idx = list.findIndex(c => c.id === contract.id);
  if (idx !== -1) list[idx] = contract;
  else list.unshift(contract);
  saveToStorage(MOCK_STORAGE_KEYS.CREDIT_CONTRACTS, list);
};

/** Ajoute ou met à jour une garantie */
export const saveGuarantee = (guarantee: Guarantee): void => {
  const list = getGuarantees();
  const idx = list.findIndex(g => g.id === guarantee.id);
  if (idx !== -1) list[idx] = guarantee;
  else list.unshift(guarantee);
  saveToStorage(MOCK_STORAGE_KEYS.GUARANTEES, list);
};

// ── Initialisation ────────────────────────────────────────────────────────────

/**
 * Charge les données mockées dans le localStorage SEULEMENT si la clé
 * correspondante est vide (ne pas écraser les données réelles).
 */
export const initializeLocalStorageMocks = (): void => {
  if (!getFromStorage(MOCK_STORAGE_KEYS.DISBURSEMENTS, null)) {
    saveToStorage(MOCK_STORAGE_KEYS.DISBURSEMENTS, mockDisbursements);
  }
  if (!getFromStorage(MOCK_STORAGE_KEYS.REPAYMENTS, null)) {
    saveToStorage(MOCK_STORAGE_KEYS.REPAYMENTS, mockRepayments);
  }
  if (!getFromStorage(MOCK_STORAGE_KEYS.CREDIT_REQUESTS, null)) {
    saveToStorage(MOCK_STORAGE_KEYS.CREDIT_REQUESTS, mockCreditRequests);
  }
  if (!getFromStorage(MOCK_STORAGE_KEYS.CREDIT_CONTRACTS, null)) {
    saveToStorage(MOCK_STORAGE_KEYS.CREDIT_CONTRACTS, mockCreditContracts);
  }
  if (!getFromStorage(MOCK_STORAGE_KEYS.GUARANTEES, null)) {
    saveToStorage(MOCK_STORAGE_KEYS.GUARANTEES, mockGuarantees);
  }
  localStorage.setItem(SEED_FLAG_KEY, 'true');
  console.log('Données mockées initialisées dans localStorage (clés unifiées)');
};

/** Force la réinitialisation de toutes les données (efface les données en cours) */
export const resetMockData = (): void => {
  saveToStorage(MOCK_STORAGE_KEYS.DISBURSEMENTS, mockDisbursements);
  saveToStorage(MOCK_STORAGE_KEYS.REPAYMENTS, mockRepayments);
  saveToStorage(MOCK_STORAGE_KEYS.CREDIT_REQUESTS, mockCreditRequests);
  saveToStorage(MOCK_STORAGE_KEYS.CREDIT_CONTRACTS, mockCreditContracts);
  saveToStorage(MOCK_STORAGE_KEYS.GUARANTEES, mockGuarantees);
  localStorage.setItem(SEED_FLAG_KEY, 'true');
  console.log('Données mockées réinitialisées');
};

// Seeding au démarrage – n'écrase pas les données existantes
try {
  if (typeof window !== 'undefined' && window.localStorage) {
    const alreadySeeded = localStorage.getItem(SEED_FLAG_KEY);
    if (!alreadySeeded) {
      initializeLocalStorageMocks();
    }
  }
} catch (error) {
  console.error("Erreur lors de l'initialisation des données mockées:", error);
}

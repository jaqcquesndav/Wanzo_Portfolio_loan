// src/services/storage/indexedDB/database.ts
/**
 * Service IndexedDB centralisé pour Wanzo Portfolio
 * 
 * IndexedDB offre plusieurs avantages par rapport à localStorage:
 * - Stockage de données structurées (pas seulement des strings)
 * - Capacité de stockage bien plus importante (>50MB vs 5MB)
 * - Transactions ACID pour la cohérence des données
 * - Support des index pour des requêtes performantes
 * - API asynchrone qui ne bloque pas le thread principal
 * 
 * Architecture:
 * - Base de données: 'WanzoPortfolioDB'
 * - Stores (tables): portfolios, companies, creditRequests, contracts, guarantees, etc.
 * - Chaque store a des index pour faciliter les recherches
 */

const DB_NAME = 'WanzoPortfolioDB';
const DB_VERSION = 1;

// Exports pour les constantes
export { DB_NAME, DB_VERSION };

// Configuration des object stores et leurs index
export const STORES = {
  PORTFOLIOS: 'portfolios',
  COMPANIES: 'companies',
  CREDIT_REQUESTS: 'creditRequests',
  CREDIT_CONTRACTS: 'creditContracts',
  GUARANTEES: 'guarantees',
  CENTRALE_RISQUE: 'centraleRisque',
  CONTRACT_DOCUMENTS: 'contractDocuments',
  SYNC_QUEUE: 'syncQueue',
  CACHE: 'cache',
  USER_PREFERENCES: 'userPreferences',
} as const;

export type StoreName = typeof STORES[keyof typeof STORES];

// Interface pour les éléments en attente de synchronisation
export interface SyncQueueItem {
  id: string;
  storeName: StoreName;
  operation: 'create' | 'update' | 'delete';
  data: unknown;
  timestamp: string;
  retryCount: number;
  lastError?: string;
}

// Interface pour le cache avec TTL
export interface CacheItem<T = unknown> {
  key: string;
  data: T;
  expiresAt: string;
  createdAt: string;
}

let dbInstance: IDBDatabase | null = null;
let dbInitPromise: Promise<IDBDatabase> | null = null;

/**
 * Initialise et ouvre la base de données IndexedDB
 */
export function openDatabase(): Promise<IDBDatabase> {
  if (dbInstance) {
    return Promise.resolve(dbInstance);
  }

  if (dbInitPromise) {
    return dbInitPromise;
  }

  dbInitPromise = new Promise((resolve, reject) => {
    console.log('🗄️ [IndexedDB] Ouverture de la base de données...');
    
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('❌ [IndexedDB] Erreur d\'ouverture:', request.error);
      dbInitPromise = null;
      reject(new Error(`Erreur IndexedDB: ${request.error?.message || 'Inconnu'}`));
    };

    request.onsuccess = () => {
      dbInstance = request.result;
      console.log('✅ [IndexedDB] Base de données ouverte avec succès');
      
      // Gérer les erreurs de version
      dbInstance.onversionchange = () => {
        dbInstance?.close();
        dbInstance = null;
        dbInitPromise = null;
        console.warn('⚠️ [IndexedDB] Version de la base changée, rechargement nécessaire');
      };
      
      resolve(dbInstance);
    };

    request.onupgradeneeded = (event) => {
      console.log('📦 [IndexedDB] Mise à jour du schéma...');
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Créer les object stores si nécessaire
      createStores(db);
    };
  });

  return dbInitPromise;
}

/**
 * Crée les object stores avec leurs index
 */
function createStores(db: IDBDatabase): void {
  // Store: Portfolios
  if (!db.objectStoreNames.contains(STORES.PORTFOLIOS)) {
    const portfolioStore = db.createObjectStore(STORES.PORTFOLIOS, { keyPath: 'id' });
    portfolioStore.createIndex('type', 'type', { unique: false });
    portfolioStore.createIndex('status', 'status', { unique: false });
    portfolioStore.createIndex('institution_id', 'institution_id', { unique: false });
    portfolioStore.createIndex('manager_id', 'manager_id', { unique: false });
    portfolioStore.createIndex('created_at', 'created_at', { unique: false });
    portfolioStore.createIndex('_pendingSync', '_pendingSync', { unique: false });
    console.log('✅ [IndexedDB] Store "portfolios" créé');
  }

  // Store: Companies
  if (!db.objectStoreNames.contains(STORES.COMPANIES)) {
    const companyStore = db.createObjectStore(STORES.COMPANIES, { keyPath: 'id' });
    companyStore.createIndex('name', 'name', { unique: false });
    companyStore.createIndex('sector', 'sector', { unique: false });
    companyStore.createIndex('status', 'status', { unique: false });
    companyStore.createIndex('rccm', 'rccm', { unique: false });
    console.log('✅ [IndexedDB] Store "companies" créé');
  }

  // Store: Credit Requests
  if (!db.objectStoreNames.contains(STORES.CREDIT_REQUESTS)) {
    const requestStore = db.createObjectStore(STORES.CREDIT_REQUESTS, { keyPath: 'id' });
    requestStore.createIndex('status', 'status', { unique: false });
    requestStore.createIndex('portfolioId', 'portfolioId', { unique: false });
    requestStore.createIndex('companyId', 'companyId', { unique: false });
    requestStore.createIndex('createdAt', 'createdAt', { unique: false });
    console.log('✅ [IndexedDB] Store "creditRequests" créé');
  }

  // Store: Credit Contracts
  if (!db.objectStoreNames.contains(STORES.CREDIT_CONTRACTS)) {
    const contractStore = db.createObjectStore(STORES.CREDIT_CONTRACTS, { keyPath: 'id' });
    contractStore.createIndex('status', 'status', { unique: false });
    contractStore.createIndex('portfolioId', 'portfolioId', { unique: false });
    contractStore.createIndex('requestId', 'requestId', { unique: false });
    contractStore.createIndex('companyId', 'companyId', { unique: false });
    console.log('✅ [IndexedDB] Store "creditContracts" créé');
  }

  // Store: Guarantees
  if (!db.objectStoreNames.contains(STORES.GUARANTEES)) {
    const guaranteeStore = db.createObjectStore(STORES.GUARANTEES, { keyPath: 'id' });
    guaranteeStore.createIndex('type', 'type', { unique: false });
    guaranteeStore.createIndex('status', 'status', { unique: false });
    guaranteeStore.createIndex('contractId', 'contractId', { unique: false });
    guaranteeStore.createIndex('company', 'company', { unique: false });
    console.log('✅ [IndexedDB] Store "guarantees" créé');
  }

  // Store: Centrale de Risque
  if (!db.objectStoreNames.contains(STORES.CENTRALE_RISQUE)) {
    const riskStore = db.createObjectStore(STORES.CENTRALE_RISQUE, { keyPath: 'id' });
    riskStore.createIndex('companyId', 'companyId', { unique: false });
    riskStore.createIndex('type', 'type', { unique: false }); // credit, leasing, investment
    riskStore.createIndex('riskLevel', 'riskLevel', { unique: false });
    console.log('✅ [IndexedDB] Store "centraleRisque" créé');
  }

  // Store: Contract Documents
  if (!db.objectStoreNames.contains(STORES.CONTRACT_DOCUMENTS)) {
    const docStore = db.createObjectStore(STORES.CONTRACT_DOCUMENTS, { keyPath: 'id' });
    docStore.createIndex('contractId', 'contractId', { unique: false });
    docStore.createIndex('type', 'type', { unique: false });
    console.log('✅ [IndexedDB] Store "contractDocuments" créé');
  }

  // Store: Sync Queue (pour les opérations en attente de synchronisation)
  if (!db.objectStoreNames.contains(STORES.SYNC_QUEUE)) {
    const syncStore = db.createObjectStore(STORES.SYNC_QUEUE, { keyPath: 'id' });
    syncStore.createIndex('storeName', 'storeName', { unique: false });
    syncStore.createIndex('operation', 'operation', { unique: false });
    syncStore.createIndex('timestamp', 'timestamp', { unique: false });
    console.log('✅ [IndexedDB] Store "syncQueue" créé');
  }

  // Store: Cache (pour les données temporaires avec TTL)
  if (!db.objectStoreNames.contains(STORES.CACHE)) {
    const cacheStore = db.createObjectStore(STORES.CACHE, { keyPath: 'key' });
    cacheStore.createIndex('expiresAt', 'expiresAt', { unique: false });
    console.log('✅ [IndexedDB] Store "cache" créé');
  }

  // Store: User Preferences
  if (!db.objectStoreNames.contains(STORES.USER_PREFERENCES)) {
    db.createObjectStore(STORES.USER_PREFERENCES, { keyPath: 'key' });
    console.log('✅ [IndexedDB] Store "userPreferences" créé');
  }
}

/**
 * Ferme la connexion à la base de données
 */
export function closeDatabase(): void {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
    dbInitPromise = null;
    console.log('🔒 [IndexedDB] Base de données fermée');
  }
}

/**
 * Supprime la base de données (pour le reset complet)
 */
export function deleteDatabase(): Promise<void> {
  return new Promise((resolve, reject) => {
    closeDatabase();
    
    const request = indexedDB.deleteDatabase(DB_NAME);
    
    request.onsuccess = () => {
      console.log('🗑️ [IndexedDB] Base de données supprimée');
      resolve();
    };
    
    request.onerror = () => {
      console.error('❌ [IndexedDB] Erreur de suppression:', request.error);
      reject(request.error);
    };
  });
}

/**
 * Vérifie si IndexedDB est supporté
 */
export function isIndexedDBSupported(): boolean {
  return typeof indexedDB !== 'undefined';
}

/**
 * Obtient l'instance de la base de données
 */
export function getDatabase(): IDBDatabase | null {
  return dbInstance;
}

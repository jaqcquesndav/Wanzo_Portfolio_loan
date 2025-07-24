// src/services/offlineService.ts
import { PendingAction } from '../contexts/ConnectivityContext';

// Types d'actions pris en charge par le service hors ligne
export enum OfflineActionType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  UPLOAD = 'upload',
  STATUS_CHANGE = 'status_change',
  PAYMENT = 'payment',
}

// Configuration du stockage local pour les données temporaires
export const OFFLINE_STORAGE_CONFIG = {
  CONTRACTS: 'wanzo_offline_contracts',
  PAYMENTS: 'wanzo_offline_payments',
  DOCUMENTS: 'wanzo_offline_documents',
  CLIENTS: 'wanzo_offline_clients',
  GUARANTEES: 'wanzo_offline_guarantees',
  PORTFOLIOS: 'wanzo_offline_portfolios',
};

/**
 * Récupère des données du stockage local
 * @param key Clé de stockage
 * @returns Données récupérées ou tableau vide
 */
export function getStoredData<T>(key: string): T[] {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error(`Erreur lors de la récupération des données stockées (${key}):`, error);
    return [];
  }
}

/**
 * Stocke des données dans le stockage local
 * @param key Clé de stockage
 * @param data Données à stocker
 */
export function storeData<T>(key: string, data: T[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Erreur lors du stockage des données (${key}):`, error);
  }
}

/**
 * Ajoute un élément au stockage local
 * @param key Clé de stockage
 * @param item Élément à ajouter
 */
export function addItem<T extends { id: string }>(key: string, item: T): void {
  const items = getStoredData<T>(key);
  // Remplacer si existe déjà, sinon ajouter
  const existingIndex = items.findIndex(i => i.id === item.id);
  
  if (existingIndex >= 0) {
    items[existingIndex] = item;
  } else {
    items.push(item);
  }
  
  storeData(key, items);
}

/**
 * Supprime un élément du stockage local
 * @param key Clé de stockage
 * @param id ID de l'élément à supprimer
 */
export function removeItem(key: string, id: string): void {
  const items = getStoredData<{ id: string }>(key);
  storeData(key, items.filter(item => item.id !== id));
}

/**
 * Transforme une action en attente en requête API
 * @param action Action en attente
 * @returns Fonction qui exécute la requête correspondante
 */
export function createRequestFromAction(action: PendingAction): () => Promise<unknown> {
  // Cette fonction sera étendue pour traiter différents types d'actions
  // Ici, nous fournissons juste une implémentation de base
  return async () => {
    console.log(`Exécution de l'action ${action.type} pour la ressource ${action.resourceId}`);
    return true;
  };
}

/**
 * Vérifie si une requête peut être exécutée en mode hors ligne
 * @param actionType Type d'action
 * @returns true si l'action peut être exécutée hors ligne
 */
export function canExecuteOffline(actionType: OfflineActionType): boolean {
  // Certaines actions peuvent être exécutées hors ligne, d'autres non
  const offlineCompatibleActions = [
    OfflineActionType.CREATE,
    OfflineActionType.UPDATE,
    OfflineActionType.DELETE,
    OfflineActionType.STATUS_CHANGE
  ];
  
  return offlineCompatibleActions.includes(actionType);
}

/**
 * Génère un ID temporaire pour les nouveaux éléments créés hors ligne
 * @returns ID temporaire
 */
export function generateTempId(): string {
  return `temp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Indique si un ID est temporaire (créé hors ligne)
 * @param id ID à vérifier
 * @returns true si l'ID est temporaire
 */
export function isTempId(id: string): boolean {
  return id.startsWith('temp_');
}

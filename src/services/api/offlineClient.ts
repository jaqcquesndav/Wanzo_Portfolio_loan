// src/services/api/offlineClient.ts
import { apiClient } from './base.api';
import { 
  OfflineActionType, 
  generateTempId, 
  getStoredData, 
  storeData 
} from '../offlineService';

/**
 * Version du client API avec support du mode hors ligne
 */
export function createOfflineClient(isOnline: boolean, addPendingAction: (action: { type: string; resourceId: string; payload?: unknown }) => void) {

  /**
   * Exécute une requête GET avec fallback vers le stockage local
   * @param endpoint Point de terminaison de l'API
   * @param storageKey Clé du stockage local
   * @param params Paramètres de requête
   * @returns Données récupérées
   */
  async function getWithOfflineSupport<T>(
    endpoint: string,
    storageKey: string,
    params?: Record<string, string | number | boolean | undefined>
  ): Promise<T[]> {
    try {
      if (!isOnline) {
        return getStoredData<T>(storageKey);
      }
      
      const response = await apiClient.get<T[]>(endpoint, params);
      
      // Mettre en cache les données pour utilisation hors ligne
      storeData(storageKey, response);
      
      return response;
    } catch (error) {
      console.error(`Erreur lors de la récupération des données depuis ${endpoint}:`, error);
      
      // Fallback vers les données stockées localement
      return getStoredData<T>(storageKey);
    }
  }

  /**
   * Exécute une requête POST avec support du mode hors ligne
   * @param endpoint Point de terminaison de l'API
   * @param storageKey Clé du stockage local
   * @param data Données à envoyer
   * @returns Données créées
   */
  async function createWithOfflineSupport<T extends { id?: string }>(
    endpoint: string,
    storageKey: string,
    data: T
  ): Promise<T> {
    try {
      if (!isOnline) {
        // Création hors ligne avec ID temporaire
        const tempData = {
          ...data,
          id: generateTempId(),
          _offlineCreated: true,
          _createdAt: new Date().toISOString()
        };
        
        // Stocker localement
        const storedData = getStoredData<T>(storageKey);
        storedData.push(tempData as T);
        storeData(storageKey, storedData);
        
        // Ajouter à la file d'attente des actions
        addPendingAction({
          type: OfflineActionType.CREATE,
          resourceId: endpoint,
          payload: tempData
        });
        
        return tempData as T;
      }
      
      // Création en ligne
      const response = await apiClient.post<T>(endpoint, data);
      
      // Mettre à jour le stockage local
      const storedData = getStoredData<T>(storageKey);
      storedData.push(response);
      storeData(storageKey, storedData);
      
      return response;
    } catch (error) {
      console.error(`Erreur lors de la création via ${endpoint}:`, error);
      
      // Fallback vers création hors ligne
      const tempData = {
        ...data,
        id: generateTempId(),
        _offlineCreated: true,
        _createdAt: new Date().toISOString()
      };
      
      // Stocker localement
      const storedData = getStoredData<T>(storageKey);
      storedData.push(tempData as T);
      storeData(storageKey, storedData);
      
      // Ajouter à la file d'attente des actions
      addPendingAction({
        type: OfflineActionType.CREATE,
        resourceId: endpoint,
        payload: tempData
      });
      
      return tempData as T;
    }
  }

  /**
   * Exécute une requête PUT avec support du mode hors ligne
   * @param endpoint Point de terminaison de l'API
   * @param storageKey Clé du stockage local
   * @param id ID de la ressource
   * @param data Données à mettre à jour
   * @returns Données mises à jour
   */
  async function updateWithOfflineSupport<T extends { id: string }>(
    endpoint: string,
    storageKey: string,
    id: string,
    data: Partial<T>
  ): Promise<T> {
    const fullEndpoint = `${endpoint}/${id}`;
    
    try {
      if (!isOnline) {
        // Mise à jour hors ligne
        const storedData = getStoredData<T>(storageKey);
        const index = storedData.findIndex(item => item.id === id);
        
        if (index === -1) {
          throw new Error(`Ressource non trouvée: ${id}`);
        }
        
        const updatedData = {
          ...storedData[index],
          ...data,
          _offlineUpdated: true,
          _updatedAt: new Date().toISOString()
        };
        
        storedData[index] = updatedData as T;
        storeData(storageKey, storedData);
        
        // Ajouter à la file d'attente des actions
        addPendingAction({
          type: OfflineActionType.UPDATE,
          resourceId: fullEndpoint,
          payload: data
        });
        
        return updatedData as T;
      }
      
      // Mise à jour en ligne
      const response = await apiClient.put<T>(fullEndpoint, data);
      
      // Mettre à jour le stockage local
      const storedData = getStoredData<T>(storageKey);
      const index = storedData.findIndex(item => item.id === id);
      
      if (index !== -1) {
        storedData[index] = response;
        storeData(storageKey, storedData);
      }
      
      return response;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour via ${fullEndpoint}:`, error);
      
      // Fallback vers mise à jour hors ligne
      const storedData = getStoredData<T>(storageKey);
      const index = storedData.findIndex(item => item.id === id);
      
      if (index === -1) {
        throw new Error(`Ressource non trouvée: ${id}`);
      }
      
      const updatedData = {
        ...storedData[index],
        ...data,
        _offlineUpdated: true,
        _updatedAt: new Date().toISOString()
      };
      
      storedData[index] = updatedData as T;
      storeData(storageKey, storedData);
      
      // Ajouter à la file d'attente des actions
      addPendingAction({
        type: OfflineActionType.UPDATE,
        resourceId: fullEndpoint,
        payload: data
      });
      
      return updatedData as T;
    }
  }

  /**
   * Exécute une requête DELETE avec support du mode hors ligne
   * @param endpoint Point de terminaison de l'API
   * @param storageKey Clé du stockage local
   * @param id ID de la ressource
   * @returns true si la suppression a réussi
   */
  async function deleteWithOfflineSupport(
    endpoint: string,
    storageKey: string,
    id: string
  ): Promise<boolean> {
    const fullEndpoint = `${endpoint}/${id}`;
    
    try {
      if (!isOnline) {
        // Suppression hors ligne
        const storedData = getStoredData<{ id: string }>(storageKey);
        const newData = storedData.filter(item => item.id !== id);
        storeData(storageKey, newData);
        
        // Ajouter à la file d'attente des actions
        addPendingAction({
          type: OfflineActionType.DELETE,
          resourceId: fullEndpoint
        });
        
        return true;
      }
      
      // Suppression en ligne
      await apiClient.delete(fullEndpoint);
      
      // Mettre à jour le stockage local
      const storedData = getStoredData<{ id: string }>(storageKey);
      const newData = storedData.filter(item => item.id !== id);
      storeData(storageKey, newData);
      
      return true;
    } catch (error) {
      console.error(`Erreur lors de la suppression via ${fullEndpoint}:`, error);
      
      // Fallback vers suppression hors ligne
      const storedData = getStoredData<{ id: string }>(storageKey);
      const newData = storedData.filter(item => item.id !== id);
      storeData(storageKey, newData);
      
      // Ajouter à la file d'attente des actions
      addPendingAction({
        type: OfflineActionType.DELETE,
        resourceId: fullEndpoint
      });
      
      return true;
    }
  }

  return {
    getWithOfflineSupport,
    createWithOfflineSupport,
    updateWithOfflineSupport,
    deleteWithOfflineSupport
  };
}

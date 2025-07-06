import { Operation, OperationRequest } from '../../types/operations';
import { apiClient } from './base.api';
import { API_ENDPOINTS } from './endpoints';
import { db } from '../db/indexedDB';
import { networkService } from '../sync/networkService';

export const operationsApi = {
  getAll: async () => {
    try {
      // Essayer d'abord de récupérer depuis IndexedDB
      const cachedOperations = await db.getAll<Operation>('operations');
      
      // Si en ligne, synchroniser avec le serveur
      if (networkService.isOnline()) {
        const response = await apiClient.get<Operation[]>(API_ENDPOINTS.operations.getAll);
        
        // Mettre à jour le cache
        await Promise.all(response.map(operation => 
          db.update('operations', operation.id, operation)
        ));
        
        return response;
      }
      
      return cachedOperations;
    } catch (error) {
      console.error('Error fetching operations:', error);
      // Retourner les données en cache en cas d'erreur
      return db.getAll<Operation>('operations');
    }
  },

  getById: async (id: string) => {
    try {
      // Vérifier d'abord le cache
      const cachedOperation = await db.get<Operation>('operations', id);
      
      if (networkService.isOnline()) {
        const response = await apiClient.get<Operation>(
          API_ENDPOINTS.operations.getById(id)
        );
        
        // Mettre à jour le cache
        await db.update('operations', id, response);
        return response;
      }
      
      return cachedOperation;
    } catch (error) {
      console.error(`Error fetching operation ${id}:`, error);
      return db.get<Operation>('operations', id);
    }
  },

  createRequest: async (request: Partial<OperationRequest>) => {
    try {
      const response = await apiClient.post<OperationRequest>(
        API_ENDPOINTS.operations.create,
        request
      );
      
      // Sauvegarder dans IndexedDB
      await db.add('operations', response);
      
      return response;
    } catch (error) {
      console.error('Error creating operation request:', error);
      
      // Si hors ligne, sauvegarder dans la file de synchronisation
      if (!networkService.isOnline()) {
        await db.add('sync_queue', {
          id: crypto.randomUUID(),
          action: 'create',
          entity: 'operations',
          data: request,
          timestamp: Date.now(),
          retries: 0,
          priority: 1
        });
      }
      
      throw error;
    }
  },

  updateRequest: async (id: string, updates: Partial<OperationRequest>) => {
    try {
      const response = await apiClient.put<OperationRequest>(
        API_ENDPOINTS.operations.update(id),
        updates
      );
      
      // Mettre à jour IndexedDB
      await db.update('operations', id, response);
      
      return response;
    } catch (error) {
      console.error(`Error updating operation request ${id}:`, error);
      
      // Si hors ligne, sauvegarder dans la file de synchronisation
      if (!networkService.isOnline()) {
        await db.add('sync_queue', {
          id: crypto.randomUUID(),
          action: 'update',
          entity: 'operations',
          data: { id, ...updates },
          timestamp: Date.now(),
          retries: 0,
          priority: 1
        });
      }
      
      throw error;
    }
  },

  validateRequest: async (id: string, validationData: any) => {
    try {
      const response = await apiClient.post<OperationRequest>(
        API_ENDPOINTS.operations.validate(id),
        validationData
      );
      
      // Mettre à jour IndexedDB
      await db.update('operations', id, response);
      
      return response;
    } catch (error) {
      console.error(`Error validating operation request ${id}:`, error);
      throw error;
    }
  },

  startWorkflow: async (id: string, workflowId: string) => {
    try {
      const response = await apiClient.post(
        API_ENDPOINTS.operations.workflow.start(id),
        { workflowId }
      );
      
      // Mettre à jour IndexedDB
      await db.update('operations', id, response);
      
      return response;
    } catch (error) {
      console.error(`Error starting workflow for operation ${id}:`, error);
      throw error;
    }
  },

  validateWorkflowStep: async (id: string, stepId: string, validationData: any) => {
    try {
      const response = await apiClient.post(
        API_ENDPOINTS.operations.workflow.validateStep(id, stepId),
        validationData
      );
      
      // Mettre à jour IndexedDB
      await db.update('operations', id, response);
      
      return response;
    } catch (error) {
      console.error(`Error validating workflow step ${stepId} for operation ${id}:`, error);
      throw error;
    }
  }
};
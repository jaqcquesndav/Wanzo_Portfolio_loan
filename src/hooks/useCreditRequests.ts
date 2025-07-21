import { useState, useEffect, useCallback } from 'react';
import { CreditRequest, CreditRequestStatus } from '../types/credit';
import { 
  mockMembers,
  mockCreditProducts,
  mockCreditManagers
} from '../data';
import { creditRequestsStorageService } from '../services/storage/creditRequestsStorage';

export function useCreditRequests() {
  const [requests, setRequests] = useState<CreditRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      // Simuler un appel API avec un délai
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Récupérer les données depuis le localStorage
      const data = await creditRequestsStorageService.getAllRequests();
      setRequests(data);
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement des demandes de crédit');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initialiser les données dans le localStorage lors du premier montage
    creditRequestsStorageService.init();
    fetchRequests();
  }, [fetchRequests]);

  const addRequest = useCallback(async (request: Omit<CreditRequest, 'id' | 'createdAt' | 'status'>) => {
    try {
      setLoading(true);
      // Simuler un appel API avec un délai
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newRequest: CreditRequest = {
        ...request,
        id: `req-${Date.now()}`,
        createdAt: new Date().toISOString(),
        status: 'pending',
      };
      
      // Sauvegarder dans le localStorage
      await creditRequestsStorageService.addRequest(newRequest);
      
      // Mettre à jour l'état local
      setRequests(prev => [...prev, newRequest]);
      return newRequest;
    } catch (err) {
      setError('Erreur lors de l\'ajout de la demande de crédit');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateRequest = useCallback(async (id: string, updates: Partial<CreditRequest>) => {
    try {
      setLoading(true);
      // Simuler un appel API avec un délai
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mettre à jour dans le localStorage
      const updatedRequest = await creditRequestsStorageService.updateRequest(id, updates);
      
      // Mettre à jour l'état local
      setRequests(prev => 
        prev.map(request => 
          request.id === id ? { ...request, ...updates, updatedAt: new Date().toISOString() } : request
        )
      );
      
      return updatedRequest;
    } catch (err) {
      setError('Erreur lors de la mise à jour de la demande de crédit');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteRequest = useCallback(async (id: string) => {
    try {
      setLoading(true);
      // Simuler un appel API avec un délai
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Supprimer du localStorage
      await creditRequestsStorageService.deleteRequest(id);
      
      // Mettre à jour l'état local
      setRequests(prev => prev.filter(request => request.id !== id));
      
      return true;
    } catch (err) {
      setError('Erreur lors de la suppression de la demande de crédit');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fonctions utilitaires pour récupérer des informations supplémentaires
  const getMemberName = useCallback((memberId: string) => {
    const member = mockMembers.find(m => m.id === memberId);
    return member ? member.name : 'Client inconnu';
  }, []);

  const getCreditProductName = useCallback((productId: string) => {
    const product = mockCreditProducts.find(p => p.id === productId);
    return product ? product.name : 'Produit inconnu';
  }, []);

  const getCreditManagerName = useCallback((managerId: string) => {
    const manager = mockCreditManagers.find(m => m.id === managerId);
    return manager ? manager.name : 'Gestionnaire inconnu';
  }, []);

  // Fonction pour changer le statut d'une demande
  const changeRequestStatus = useCallback(async (requestId: string, newStatus: CreditRequestStatus, additionalData?: Partial<CreditRequest>) => {
    try {
      setLoading(true);
      // Simuler un appel API avec un délai
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const updates = { 
        ...additionalData, 
        status: newStatus, 
        updatedAt: new Date().toISOString() 
      };
      
      // Mettre à jour dans le localStorage
      const updatedRequest = await creditRequestsStorageService.updateRequest(requestId, updates);
      
      // Mettre à jour l'état local
      setRequests(prev => 
        prev.map(req => 
          req.id === requestId 
            ? { ...req, ...updates } 
            : req
        )
      );
      
      return updatedRequest;
    } catch (err) {
      setError(`Erreur lors du changement de statut de la demande de crédit`);
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fonctions filtrantes pour les demandes
  const getRequestsByStatus = useCallback((status: CreditRequestStatus) => {
    return requests.filter(req => req.status === status);
  }, [requests]);

  return {
    requests,
    loading,
    error,
    fetchRequests,
    addRequest,
    updateRequest,
    deleteRequest,
    getMemberName,
    getCreditProductName,
    getCreditManagerName,
    changeRequestStatus,
    getRequestsByStatus,
    resetToMockData: async () => {
      try {
        await creditRequestsStorageService.resetToMockData();
        fetchRequests();
        return true;
      } catch (err) {
        console.error('Erreur lors de la réinitialisation des données', err);
        return false;
      }
    }
  };
}

// src/hooks/useDisbursements.ts
import { useState, useEffect, useCallback } from 'react';
import { Disbursement } from '../types/disbursement';
import { disbursementApi } from '../services/api/traditional/disbursement.api';
import { useNotification } from '../contexts/useNotification';

interface UseDisbursementsResult {
  disbursements: Disbursement[];
  isLoading: boolean;
  error: string | null;
  getDisbursementById: (id: string) => Promise<Disbursement | null>;
  getDisbursementsByContract: (contractId: string) => Promise<Disbursement[]>;
  createDisbursement: (disbursement: Omit<Disbursement, 'id'>) => Promise<Disbursement | null>;
  updateDisbursement: (id: string, updates: Partial<Disbursement>) => Promise<Disbursement | null>;
  confirmDisbursement: (id: string, transactionDetails: {
    transactionReference: string;
    executionDate: string;
    valueDate?: string;
  }) => Promise<Disbursement | null>;
  cancelDisbursement: (id: string, reason: string) => Promise<boolean>;
  refreshDisbursements: () => Promise<void>;
}

/**
 * Hook pour la gestion des virements d'un portefeuille
 * @param portfolioId Identifiant du portefeuille
 */
export function useDisbursements(portfolioId: string): UseDisbursementsResult {
  const [disbursements, setDisbursements] = useState<Disbursement[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { showNotification } = useNotification();

  // Fonction pour récupérer tous les virements d'un portefeuille
  const fetchDisbursements = useCallback(async () => {
    if (!portfolioId) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const data = await disbursementApi.getDisbursementsByPortfolio(portfolioId);
      setDisbursements(data);
    } catch (err) {
      console.error('Erreur lors de la récupération des virements:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(errorMessage);
      showNotification('Erreur lors de la récupération des virements', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [portfolioId, showNotification]);

  // Charger les virements au chargement du composant
  useEffect(() => {
    fetchDisbursements();
  }, [fetchDisbursements]);

  // Fonction pour récupérer un virement par son ID
  const getDisbursementById = useCallback(async (id: string): Promise<Disbursement | null> => {
    try {
      return await disbursementApi.getDisbursementById(id);
    } catch (err) {
      console.error(`Erreur lors de la récupération du virement ${id}:`, err);
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      showNotification(`Erreur: ${errorMessage}`, 'error');
      return null;
    }
  }, [showNotification]);

  // Fonction pour récupérer les virements d'un contrat
  const getDisbursementsByContract = useCallback(async (contractId: string): Promise<Disbursement[]> => {
    try {
      return await disbursementApi.getDisbursementsByContract(contractId);
    } catch (err) {
      console.error(`Erreur lors de la récupération des virements du contrat ${contractId}:`, err);
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      showNotification(`Erreur: ${errorMessage}`, 'error');
      return [];
    }
  }, [showNotification]);

  // Fonction pour créer un nouveau virement
  const createDisbursement = useCallback(async (disbursement: Omit<Disbursement, 'id'>): Promise<Disbursement | null> => {
    try {
      const newDisbursement = await disbursementApi.createDisbursement(disbursement);
      setDisbursements(prev => [...prev, newDisbursement]);
      showNotification('Virement créé avec succès', 'success');
      return newDisbursement;
    } catch (err) {
      console.error('Erreur lors de la création du virement:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      showNotification(`Erreur: ${errorMessage}`, 'error');
      return null;
    }
  }, [showNotification]);

  // Fonction pour mettre à jour un virement
  const updateDisbursement = useCallback(async (id: string, updates: Partial<Disbursement>): Promise<Disbursement | null> => {
    try {
      const updatedDisbursement = await disbursementApi.updateDisbursement(id, updates);
      if (updatedDisbursement) {
        setDisbursements(prev => prev.map(d => d.id === id ? updatedDisbursement : d));
        showNotification('Virement mis à jour avec succès', 'success');
      }
      return updatedDisbursement;
    } catch (err) {
      console.error(`Erreur lors de la mise à jour du virement ${id}:`, err);
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      showNotification(`Erreur: ${errorMessage}`, 'error');
      return null;
    }
  }, [showNotification]);

  // Fonction pour confirmer un virement
  const confirmDisbursement = useCallback(async (id: string, transactionDetails: {
    transactionReference: string;
    executionDate: string;
    valueDate?: string;
  }): Promise<Disbursement | null> => {
    try {
      const confirmedDisbursement = await disbursementApi.confirmDisbursement(id, transactionDetails);
      if (confirmedDisbursement) {
        setDisbursements(prev => prev.map(d => d.id === id ? confirmedDisbursement : d));
        showNotification('Virement confirmé avec succès', 'success');
      }
      return confirmedDisbursement;
    } catch (err) {
      console.error(`Erreur lors de la confirmation du virement ${id}:`, err);
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      showNotification(`Erreur: ${errorMessage}`, 'error');
      return null;
    }
  }, [showNotification]);

  // Fonction pour annuler un virement
  const cancelDisbursement = useCallback(async (id: string, reason: string): Promise<boolean> => {
    try {
      const success = await disbursementApi.cancelDisbursement(id, reason);
      if (success) {
        setDisbursements(prev => prev.filter(d => d.id !== id));
        showNotification('Virement annulé avec succès', 'success');
      }
      return success;
    } catch (err) {
      console.error(`Erreur lors de l'annulation du virement ${id}:`, err);
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      showNotification(`Erreur: ${errorMessage}`, 'error');
      return false;
    }
  }, [showNotification]);

  return {
    disbursements,
    isLoading,
    error,
    getDisbursementById,
    getDisbursementsByContract,
    createDisbursement,
    updateDisbursement,
    confirmDisbursement,
    cancelDisbursement,
    refreshDisbursements: fetchDisbursements
  };
}

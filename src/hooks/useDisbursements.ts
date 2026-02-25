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
  approveDisbursement: (id: string, payload?: { approvalNotes?: string; prerequisitesVerified?: boolean }) => Promise<Disbursement | null>;
  rejectDisbursement: (id: string, payload: { reason: string; notes?: string }) => Promise<Disbursement | null>;
  processDisbursement: (id: string, payload?: { transactionId?: string; transactionDate?: string; executionNotes?: string; documents?: string[] }) => Promise<Disbursement | null>;
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
      const raw = await disbursementApi.getDisbursementsByPortfolio(portfolioId);
      // Normaliser : l'API peut retourner { data: [], meta: {} } ou [] directement
      const data: Disbursement[] = Array.isArray(raw)
        ? raw
        : Array.isArray((raw as { data?: unknown }).data)
          ? (raw as { data: Disbursement[] }).data
          : [];
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
        // Met à jour le statut local au lieu de supprimer l'élément
        setDisbursements(prev => prev.map(d => d.id === id ? { ...d, status: 'canceled' as const } : d));
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

  // Approuve un décaissement
  const approveDisbursement = useCallback(async (
    id: string,
    payload?: { approvalNotes?: string; prerequisitesVerified?: boolean },
  ): Promise<Disbursement | null> => {
    try {
      const updated = await disbursementApi.approveDisbursement(id, payload);
      if (updated) {
        setDisbursements(prev => prev.map(d => d.id === id ? updated : d));
        showNotification('Décaissement approuvé', 'success');
      }
      return updated;
    } catch (err) {
      console.error(`Erreur lors de l'approbation du décaissement ${id}:`, err);
      showNotification('Erreur lors de l\'approbation', 'error');
      return null;
    }
  }, [showNotification]);

  // Rejette un décaissement
  const rejectDisbursement = useCallback(async (
    id: string,
    payload: { reason: string; notes?: string },
  ): Promise<Disbursement | null> => {
    try {
      const updated = await disbursementApi.rejectDisbursement(id, payload);
      if (updated) {
        setDisbursements(prev => prev.map(d => d.id === id ? updated : d));
        showNotification('Décaissement rejeté', 'success');
      }
      return updated;
    } catch (err) {
      console.error(`Erreur lors du rejet du décaissement ${id}:`, err);
      showNotification('Erreur lors du rejet', 'error');
      return null;
    }
  }, [showNotification]);

  // Traite (exécute) un décaissement
  const processDisbursement = useCallback(async (
    id: string,
    payload?: { transactionId?: string; transactionDate?: string; executionNotes?: string; documents?: string[] },
  ): Promise<Disbursement | null> => {
    try {
      const updated = await disbursementApi.processDisbursement(id, payload);
      if (updated) {
        setDisbursements(prev => prev.map(d => d.id === id ? updated : d));
        showNotification('Décaissement en cours de traitement', 'success');
      }
      return updated;
    } catch (err) {
      console.error(`Erreur lors du traitement du décaissement ${id}:`, err);
      showNotification('Erreur lors du traitement', 'error');
      return null;
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
    approveDisbursement,
    rejectDisbursement,
    processDisbursement,
    refreshDisbursements: fetchDisbursements
  };
}

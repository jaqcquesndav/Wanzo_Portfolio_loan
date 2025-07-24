// src/hooks/useAmortizationSchedules.ts
import { useState, useEffect, useCallback } from 'react';
import {
  getAmortizationSchedulesFromLocalStorage,
  saveAmortizationSchedulesToLocalStorage,
  generateAmortizationSchedule
} from '../data/mockAmortizationSchedules';
import {
  AmortizationScheduleItem,
  UseAmortizationSchedulesOptions
} from '../types/amortization';

// Complétez l'interface avec les propriétés supplémentaires
interface AmortizationSchedulesState {
  items: AmortizationScheduleItem[];
  isLoading: boolean;
  error: Error | null;
  totalItems: number;
  currentPage: number;
  totalPages: number;
  paidItems: number;
  dueItems: number;
  overdueItems: number;
  pendingItems: number;
  rescheduledItems: number;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  overdueAmount: number;
}

const useAmortizationSchedules = ({
  contractId,
  amount,
  interestRate,
  startDate,
  endDate,
  page = 1,
  pageSize = 10,
  filter = 'all'
}: UseAmortizationSchedulesOptions) => {
  const [state, setState] = useState<AmortizationSchedulesState>({
    items: [],
    isLoading: true,
    error: null,
    totalItems: 0,
    currentPage: page,
    totalPages: 1,
    paidItems: 0,
    dueItems: 0,
    overdueItems: 0,
    pendingItems: 0,
    rescheduledItems: 0,
    totalAmount: 0,
    paidAmount: 0,
    remainingAmount: 0,
    overdueAmount: 0
  });

  // Fonction pour charger les données
  const loadSchedules = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      // Récupérer les données du localStorage (ne devrait jamais être vide grâce à l'initialisation)
      const allSchedules = getAmortizationSchedulesFromLocalStorage();
      
      // Vérifier si le contrat existe déjà dans les données
      let contractSchedules = allSchedules[contractId];
      
      // Si non, générer les données pour ce contrat et les sauvegarder dans localStorage
      if (!contractSchedules) {
        console.info(`Création d'un nouvel échéancier pour le contrat ${contractId}`);
        contractSchedules = generateAmortizationSchedule(
          contractId,
          amount,
          interestRate,
          startDate,
          endDate
        );
        
        // Mettre à jour le localStorage avec le nouvel échéancier
        allSchedules[contractId] = contractSchedules;
        saveAmortizationSchedulesToLocalStorage(allSchedules);
      }
      
      // Filtrer les éléments selon le filtre actif
      let filteredSchedules = [...contractSchedules];
      if (filter !== 'all') {
        filteredSchedules = contractSchedules.filter(item => item.status === filter);
      }
      
      // Calculer les statistiques
      const paidItems = contractSchedules.filter(item => item.status === 'paid').length;
      const dueItems = contractSchedules.filter(item => item.status === 'due').length;
      const overdueItems = contractSchedules.filter(item => item.status === 'overdue').length;
      const pendingItems = contractSchedules.filter(item => item.status === 'pending').length;
      const rescheduledItems = contractSchedules.filter(item => item.status === 'rescheduled').length;
      
      const totalAmount = contractSchedules.reduce((sum, item) => sum + item.totalPayment, 0);
      const paidAmount = contractSchedules
        .filter(item => item.status === 'paid')
        .reduce((sum, item) => sum + (item.paymentAmount || 0), 0);
      const remainingAmount = totalAmount - paidAmount;
      const overdueAmount = contractSchedules
        .filter(item => item.status === 'overdue')
        .reduce((sum, item) => sum + item.totalPayment, 0);
      
      // Calculer la pagination
      const totalItems = filteredSchedules.length;
      const totalPages = Math.ceil(totalItems / pageSize);
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedItems = filteredSchedules.slice(startIndex, endIndex);
      
      // Mettre à jour l'état
      setState({
        items: paginatedItems,
        isLoading: false,
        error: null,
        totalItems,
        currentPage: page,
        totalPages,
        paidItems,
        dueItems,
        overdueItems,
        pendingItems,
        rescheduledItems,
        totalAmount,
        paidAmount,
        remainingAmount,
        overdueAmount
      });
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error : new Error('Une erreur est survenue lors du chargement des échéanciers')
      }));
    }
  }, [contractId, amount, interestRate, startDate, endDate, page, pageSize, filter]);

  // Fonction pour mettre à jour une échéance
  const updateScheduleItem = useCallback(async (updatedItem: AmortizationScheduleItem) => {
    try {
      // Récupérer les données du localStorage
      const allSchedules = getAmortizationSchedulesFromLocalStorage();
      
      // Mettre à jour l'item dans le tableau
      if (allSchedules[contractId]) {
        // Créer une copie pour éviter les références
        allSchedules[contractId] = allSchedules[contractId].map(item => 
          item.id === updatedItem.id ? { ...updatedItem } : item
        );
        
        // Sauvegarder les changements dans localStorage
        saveAmortizationSchedulesToLocalStorage(allSchedules);
        
        // Recharger les données
        await loadSchedules();
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'échéance:', error);
      return false;
    }
  }, [contractId, loadSchedules]);

  // Fonction pour mettre à jour plusieurs échéances
  const updateScheduleItems = useCallback(async (updatedItems: AmortizationScheduleItem[]) => {
    try {
      // Récupérer les données du localStorage
      const allSchedules = getAmortizationSchedulesFromLocalStorage();
      
      // Créer un map pour un accès rapide aux items mis à jour
      const updatedItemsMap = new Map(updatedItems.map(item => [item.id, { ...item }]));
      
      // Mettre à jour les items dans le tableau
      if (allSchedules[contractId]) {
        // Créer une copie pour éviter les références
        allSchedules[contractId] = allSchedules[contractId].map(item => 
          updatedItemsMap.has(item.id) ? updatedItemsMap.get(item.id)! : item
        );
        
        // Sauvegarder les changements dans localStorage
        saveAmortizationSchedulesToLocalStorage(allSchedules);
        
        // Recharger les données
        await loadSchedules();
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Erreur lors de la mise à jour des échéances:', error);
      return false;
    }
  }, [contractId, loadSchedules]);

  // Fonction pour marquer une échéance comme payée
  const markAsPaid = useCallback(async (itemId: string) => {
    try {
      // Récupérer les données du localStorage
      const allSchedules = getAmortizationSchedulesFromLocalStorage();
      
      // Trouver l'item à marquer comme payé
      if (allSchedules[contractId]) {
        const itemToUpdate = allSchedules[contractId].find(item => item.id === itemId);
        
        if (itemToUpdate) {
          const updatedItem = {
            ...itemToUpdate,
            status: 'paid' as const,
            paymentDate: new Date().toISOString(),
            paymentAmount: itemToUpdate.totalPayment
          };
          
          return await updateScheduleItem(updatedItem);
        }
      }
      
      return false;
    } catch (error) {
      console.error('Erreur lors du marquage de l\'échéance comme payée:', error);
      return false;
    }
  }, [contractId, updateScheduleItem]);

  // Charger les données au montage et quand les dépendances changent
  useEffect(() => {
    loadSchedules();
  }, [loadSchedules]);

  return {
    ...state,
    updateScheduleItem,
    updateScheduleItems,
    markAsPaid,
    refresh: loadSchedules,
    setPage: (newPage: number) => setState(prev => ({ ...prev, currentPage: newPage })),
    setFilter: (newFilter: string) => setState(prev => ({ ...prev, filter: newFilter }))
  };
};

export default useAmortizationSchedules;

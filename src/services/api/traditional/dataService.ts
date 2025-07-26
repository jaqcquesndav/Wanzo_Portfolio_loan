// src/services/api/traditional/dataService.ts
import { TraditionalPortfolio } from '../../../types/traditional-portfolio';
import { CreditRequest } from '../../../types/credit';
import { CreditContract } from '../../../types/credit-contract';
import { CreditPayment } from '../../../types/credit-payment';
import { mockTraditionalPortfolios } from '../../../data/mockTraditionalPortfolios';
import { mockCreditRequests } from '../../../data/mockCreditRequests';
import { mockCreditContracts } from '../../../data/mockCreditContracts';
import { mockDisbursements } from '../../../data/mockDisbursements';
import { mockRepayments } from '../../../data/mockRepayments';
import { mockGuarantees } from '../../../data/mockGuarantees';
import { Disbursement } from '../../../types/disbursement';
import { Guarantee } from '../../../types/guarantee';

// Clés pour le localStorage
const STORAGE_KEYS = {
  PORTFOLIOS: 'wanzo_traditional_portfolios',
  CREDIT_REQUESTS: 'wanzo_credit_requests',
  CREDIT_CONTRACTS: 'wanzo_credit_contracts',
  DISBURSEMENTS: 'wanzo_disbursements',
  PAYMENTS: 'wanzo_traditional_payments',
  GUARANTEES: 'wanzo_guarantees',
};

/**
 * Service de données pour les fonctionnalités de portefeuille traditionnel
 * Cette implémentation utilise le localStorage pour le développement
 * et sera remplacée par des appels API réels en production
 */
export const traditionalDataService = {
  // Exposing storage keys for external use
  STORAGE_KEYS,
  /**
   * Récupère les données du localStorage ou utilise les mock data comme fallback
   * Les contrats sont l'élément central reliant toutes les entités (virements, remboursements, garanties)
   */
  getLocalData: <T>(key: string): T => {
    // Utiliser la clé correspondante depuis STORAGE_KEYS si possible
    const storageKey = STORAGE_KEYS[key as keyof typeof STORAGE_KEYS] || key;
    
    try {
      const data = localStorage.getItem(storageKey);
      if (data) {
        return JSON.parse(data) as T;
      }
      
      // Fallback vers les données mockées
      switch (key) {
        case 'PORTFOLIOS':
          return mockTraditionalPortfolios as unknown as T;
        case 'CREDIT_REQUESTS':
          return mockCreditRequests as unknown as T;
        case 'CREDIT_CONTRACTS':
          return mockCreditContracts as unknown as T;
        case 'DISBURSEMENTS':
          return mockDisbursements as unknown as T;
        case 'PAYMENTS':
          return mockRepayments as unknown as T;
        case 'GUARANTEES':
          return mockGuarantees as unknown as T;
        default:
          return [] as unknown as T;
      }
    } catch (error) {
      console.error(`Error getting data for key ${key}:`, error);
      return [] as unknown as T;
    }
  },
  
  /**
   * Récupère toutes les données liées à un contrat spécifique (virements, remboursements, garanties)
   * Cette méthode centralise l'accès aux données liées au contrat pour maintenir la cohérence
   */
  getContractRelatedData: <T>(
    contractId: string, 
    dataType: 'DISBURSEMENTS' | 'PAYMENTS' | 'GUARANTEES'
  ): T[] => {
    try {
      // Récupérer toutes les données du type demandé
      const allData = traditionalDataService.getLocalData<T[]>(dataType);
      
      if (!allData || !Array.isArray(allData)) {
        return [] as T[];
      }
      
      // Filtrer les données par contractId ou contractReference
      return allData.filter((item) => {
        // Utiliser une interface Record pour éviter l'utilisation de any
        const itemRecord = item as Record<string, unknown>;
        return (
          (itemRecord.contractId && itemRecord.contractId === contractId) || 
          (itemRecord.contractReference && itemRecord.contractReference === contractId)
        );
      });
    } catch (error) {
      console.error(`Error getting ${dataType} for contract ${contractId}:`, error);
      return [] as T[];
    }
  },
  
  /**
   * Sauvegarde les données liées à un contrat spécifique (virements, remboursements, garanties)
   * Cette méthode permet de mettre à jour des données liées à un contrat dans le localStorage
   */
  saveContractRelatedData: <T>(
    contractId: string,
    dataType: 'DISBURSEMENTS' | 'PAYMENTS' | 'GUARANTEES',
    data: T[]
  ): boolean => {
    try {
      // Récupérer toutes les données existantes du type demandé
      const storageKey = (() => {
        switch (dataType) {
          case 'DISBURSEMENTS': return STORAGE_KEYS.DISBURSEMENTS;
          case 'PAYMENTS': return STORAGE_KEYS.PAYMENTS;
          case 'GUARANTEES': return STORAGE_KEYS.GUARANTEES;
          default: throw new Error(`Unsupported data type: ${dataType}`);
        }
      })();
      
      const storageData = localStorage.getItem(storageKey);
      const allItems = storageData ? JSON.parse(storageData) : [];
      
      if (!Array.isArray(allItems)) {
        throw new Error(`Storage data for ${dataType} is not an array`);
      }
      
      // Supprimer les anciennes données liées à ce contrat
      const filteredItems = allItems.filter((item) => {
        const itemRecord = item as Record<string, unknown>;
        return !(
          (itemRecord.contractId && itemRecord.contractId === contractId) || 
          (itemRecord.contractReference && itemRecord.contractReference === contractId)
        );
      });
      
      // Ajouter les nouvelles données
      const updatedItems = [...filteredItems, ...data];
      
      // Sauvegarder dans le localStorage
      localStorage.setItem(storageKey, JSON.stringify(updatedItems));
      
      return true;
    } catch (error) {
      console.error(`Error saving ${dataType} for contract ${contractId}:`, error);
      return false;
    }
  },
  
  /**
   * Initialise les données dans le localStorage si elles n'existent pas déjà
   */
  initData: (): void => {
    // Initialiser les portefeuilles traditionnels
    if (!localStorage.getItem(STORAGE_KEYS.PORTFOLIOS)) {
      localStorage.setItem(STORAGE_KEYS.PORTFOLIOS, JSON.stringify(mockTraditionalPortfolios));
    }

    // Initialiser les demandes de crédit
    if (!localStorage.getItem(STORAGE_KEYS.CREDIT_REQUESTS)) {
      localStorage.setItem(STORAGE_KEYS.CREDIT_REQUESTS, JSON.stringify(mockCreditRequests));
    }

    // Initialiser les contrats de crédit
    if (!localStorage.getItem(STORAGE_KEYS.CREDIT_CONTRACTS)) {
      localStorage.setItem(STORAGE_KEYS.CREDIT_CONTRACTS, JSON.stringify(mockCreditContracts));
    }

    // Initialiser les virements
    if (!localStorage.getItem(STORAGE_KEYS.DISBURSEMENTS)) {
      localStorage.setItem(STORAGE_KEYS.DISBURSEMENTS, JSON.stringify(mockDisbursements));
    }

    // Initialiser les remboursements
    if (!localStorage.getItem(STORAGE_KEYS.PAYMENTS)) {
      localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(mockRepayments));
    }

    // Initialiser les garanties
    if (!localStorage.getItem(STORAGE_KEYS.GUARANTEES)) {
      localStorage.setItem(STORAGE_KEYS.GUARANTEES, JSON.stringify(mockGuarantees));
    }
  },

  /**
   * Récupère tous les portefeuilles traditionnels du localStorage
   */
  getTraditionalPortfolios: (): TraditionalPortfolio[] => {
    const portfolios = localStorage.getItem(STORAGE_KEYS.PORTFOLIOS);
    return portfolios ? JSON.parse(portfolios) : [];
  },

  /**
   * Récupère un portefeuille traditionnel par son ID
   */
  getTraditionalPortfolioById: (id: string): TraditionalPortfolio | undefined => {
    const portfolios = traditionalDataService.getTraditionalPortfolios();
    return portfolios.find(p => p.id === id);
  },

  /**
   * Ajoute un nouveau portefeuille traditionnel
   */
  addTraditionalPortfolio: (portfolio: TraditionalPortfolio): void => {
    const portfolios = traditionalDataService.getTraditionalPortfolios();
    portfolios.push(portfolio);
    localStorage.setItem(STORAGE_KEYS.PORTFOLIOS, JSON.stringify(portfolios));
  },

  /**
   * Met à jour un portefeuille traditionnel
   */
  updateTraditionalPortfolio: (portfolio: TraditionalPortfolio): void => {
    const portfolios = traditionalDataService.getTraditionalPortfolios();
    const index = portfolios.findIndex(p => p.id === portfolio.id);
    
    if (index !== -1) {
      portfolios[index] = { ...portfolios[index], ...portfolio };
      localStorage.setItem(STORAGE_KEYS.PORTFOLIOS, JSON.stringify(portfolios));
    }
  },

  /**
   * Récupère toutes les demandes de crédit du localStorage
   */
  getCreditRequests: (): CreditRequest[] => {
    const requests = localStorage.getItem(STORAGE_KEYS.CREDIT_REQUESTS);
    return requests ? JSON.parse(requests) : [];
  },

  /**
   * Récupère une demande de crédit par son ID
   */
  getCreditRequestById: (id: string): CreditRequest | undefined => {
    const requests = traditionalDataService.getCreditRequests();
    return requests.find(r => r.id === id);
  },

  /**
   * Ajoute une nouvelle demande de crédit
   */
  addCreditRequest: (request: CreditRequest): void => {
    const requests = traditionalDataService.getCreditRequests();
    requests.push(request);
    localStorage.setItem(STORAGE_KEYS.CREDIT_REQUESTS, JSON.stringify(requests));
  },

  /**
   * Met à jour une demande de crédit
   */
  updateCreditRequest: (request: CreditRequest): void => {
    const requests = traditionalDataService.getCreditRequests();
    const index = requests.findIndex(r => r.id === request.id);
    
    if (index !== -1) {
      requests[index] = { ...requests[index], ...request };
      localStorage.setItem(STORAGE_KEYS.CREDIT_REQUESTS, JSON.stringify(requests));
    }
  },

  /**
   * Récupère tous les contrats de crédit du localStorage
   */
  getCreditContracts: (): CreditContract[] => {
    const contracts = localStorage.getItem(STORAGE_KEYS.CREDIT_CONTRACTS);
    return contracts ? JSON.parse(contracts) : [];
  },

  /**
   * Récupère un contrat de crédit par son ID
   */
  getCreditContractById: (id: string): CreditContract | undefined => {
    const contracts = traditionalDataService.getCreditContracts();
    return contracts.find(c => c.id === id);
  },

  /**
   * Ajoute un nouveau contrat de crédit
   */
  addCreditContract: (contract: CreditContract): void => {
    const contracts = traditionalDataService.getCreditContracts();
    contracts.push(contract);
    localStorage.setItem(STORAGE_KEYS.CREDIT_CONTRACTS, JSON.stringify(contracts));
  },

  /**
   * Met à jour un contrat de crédit
   */
  updateCreditContract: (contract: CreditContract): void => {
    const contracts = traditionalDataService.getCreditContracts();
    const index = contracts.findIndex(c => c.id === contract.id);
    
    if (index !== -1) {
      contracts[index] = { ...contracts[index], ...contract };
      localStorage.setItem(STORAGE_KEYS.CREDIT_CONTRACTS, JSON.stringify(contracts));
    }
  },

  /**
   * Génère un nouvel ID de portefeuille
   */
  generatePortfolioId: (): string => {
    const portfolios = traditionalDataService.getTraditionalPortfolios();
    const lastId = portfolios.length > 0 
      ? parseInt(portfolios[portfolios.length - 1].id.replace('TP-', ''))
      : 0;
    return `TP-${String(lastId + 1).padStart(5, '0')}`;
  },

  /**
   * Génère un nouvel ID de demande de crédit
   */
  generateCreditRequestId: (): string => {
    const requests = traditionalDataService.getCreditRequests();
    const lastId = requests.length > 0 
      ? parseInt(requests[requests.length - 1].id.replace('CR-', ''))
      : 0;
    return `CR-${String(lastId + 1).padStart(5, '0')}`;
  },

  /**
   * Génère un nouvel ID de contrat de crédit
   */
  generateCreditContractId: (): string => {
    const contracts = traditionalDataService.getCreditContracts();
    const lastId = contracts.length > 0 
      ? parseInt(contracts[contracts.length - 1].id.replace('CC-', ''))
      : 0;
    return `CC-${String(lastId + 1).padStart(5, '0')}`;
  },

  /**
   * Réinitialise toutes les données (utile pour le développement)
   */
  resetTraditionalData: (): void => {
    localStorage.setItem(STORAGE_KEYS.PORTFOLIOS, JSON.stringify(mockTraditionalPortfolios));
    localStorage.setItem(STORAGE_KEYS.CREDIT_REQUESTS, JSON.stringify(mockCreditRequests));
    localStorage.setItem(STORAGE_KEYS.CREDIT_CONTRACTS, JSON.stringify(mockCreditContracts));
    localStorage.setItem(STORAGE_KEYS.DISBURSEMENTS, JSON.stringify(mockDisbursements));
    localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(mockRepayments));
    localStorage.setItem(STORAGE_KEYS.GUARANTEES, JSON.stringify(mockGuarantees));
  },

  /**
   * Récupère tous les paiements
   */
  getAllPayments: (): CreditPayment[] => {
    const payments = localStorage.getItem(STORAGE_KEYS.PAYMENTS);
    return payments ? JSON.parse(payments) : [];
  },

  /**
   * Récupère les paiements par ID de contrat
   */
  getPaymentsByContractId: (contractId: string): CreditPayment[] => {
    const payments = traditionalDataService.getAllPayments();
    return payments.filter(p => p.contract_id === contractId);
  },

  /**
   * Récupère les paiements par ID de portfolio
   */
  getPaymentsByPortfolioId: (portfolioId: string): CreditPayment[] => {
    const payments = traditionalDataService.getAllPayments();
    return payments.filter(p => p.portfolio_id === portfolioId);
  },

  /**
   * Récupère les paiements en retard pour un portefeuille
   */
  getLatePayments: (portfolioId: string): CreditPayment[] => {
    const payments = traditionalDataService.getAllPayments();
    const now = new Date();
    return payments.filter(p => 
      p.portfolio_id === portfolioId && 
      p.status === 'pending' && 
      p.due_date && new Date(p.due_date) < now
    );
  },

  /**
   * Récupère un paiement par son ID
   */
  getPaymentById: (id: string): CreditPayment | undefined => {
    const payments = traditionalDataService.getAllPayments();
    return payments.find(p => p.id === id);
  },

  /**
   * Ajoute un nouveau paiement
   */
  addPayment: (payment: CreditPayment): void => {
    const payments = traditionalDataService.getAllPayments();
    payments.push(payment);
    localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(payments));
  },

  /**
   * Met à jour un paiement
   */
  updatePayment: (payment: CreditPayment): void => {
    const payments = traditionalDataService.getAllPayments();
    const index = payments.findIndex(p => p.id === payment.id);
    
    if (index !== -1) {
      payments[index] = { ...payments[index], ...payment };
      localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(payments));
    }
  },

  /**
   * Supprime un paiement
   */
  deletePayment: (id: string): boolean => {
    const payments = traditionalDataService.getAllPayments();
    const initialLength = payments.length;
    const filteredPayments = payments.filter(p => p.id !== id);
    
    if (filteredPayments.length < initialLength) {
      localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(filteredPayments));
      return true;
    }
    
    return false;
  },

  /**
   * Génère un nouvel ID de paiement
   */
  generatePaymentId: (): string => {
    const payments = traditionalDataService.getAllPayments();
    const lastId = payments.length > 0 
      ? parseInt(payments[payments.length - 1].id.replace('PAY-', ''))
      : 0;
    return `PAY-${String(lastId + 1).padStart(5, '0')}`;
  },

  /**
   * Récupère le calendrier de paiement pour un contrat
   */
  getPaymentSchedule: (contractId: string) => {
    const contract = traditionalDataService.getCreditContractById(contractId);
    if (!contract || !contract.payment_schedule) {
      return [];
    }
    return contract.payment_schedule;
  },

  /**
   * Récupère toutes les données liées à un contrat spécifique (synthèse complète)
   * Le contrat est l'élément central autour duquel s'articulent les virements, remboursements et garanties
   */
  getContractSummary: (contractId: string) => {
    // Récupérer le contrat de base
    const contract = traditionalDataService.getCreditContractById(contractId);
    if (!contract) {
      return null;
    }

    // Récupérer les virements associés au contrat en utilisant getContractRelatedData
    const disbursements = traditionalDataService.getContractRelatedData<Disbursement>(
      contractId,
      'DISBURSEMENTS'
    );
    
    // Récupérer les remboursements associés au contrat
    const payments = traditionalDataService.getPaymentsByContractId(contractId);
    
    // Récupérer les garanties associées au contrat en utilisant getContractRelatedData
    const guarantees = traditionalDataService.getContractRelatedData<Guarantee>(
      contractId,
      'GUARANTEES'
    );
    
    // Pour chaque échéance du contrat, calculer le progrès des paiements
    const enrichedSchedule = contract.payment_schedule?.map(schedule => {
      // Rechercher les paiements qui pourraient correspondre à cette échéance
      // (par date ou référence)
      const relevantPayments = payments.filter(payment => {
        // Si le paiement a une référence explicite à l'échéance
        if (payment.scheduled_payment_id === schedule.id) {
          return true;
        }
        
        // Vérifier si la date de paiement est proche de la date d'échéance
        // (dans une fenêtre de +/- 5 jours par exemple)
        if (payment.payment_date && schedule.due_date) {
          const paymentDate = new Date(payment.payment_date);
          const dueDate = new Date(schedule.due_date);
          const diffTime = Math.abs(paymentDate.getTime() - dueDate.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          // Considérer les paiements effectués à +/- 5 jours de l'échéance
          if (diffDays <= 5) {
            return true;
          }
        }
        
        return false;
      });
      
      // Calculer le montant total payé pour cette échéance
      const totalPaid = relevantPayments.reduce((sum, payment) => sum + payment.amount, 0);
      
      // Calculer le montant restant et le pourcentage
      const remainingAmount = Math.max(0, schedule.total_amount - totalPaid);
      const remainingPercentage = schedule.total_amount > 0 
        ? Math.round((remainingAmount / schedule.total_amount) * 100)
        : 0;
        
      // Déterminer le statut réel basé sur les paiements
      let derivedStatus = schedule.status;
      if (remainingAmount === 0) {
        derivedStatus = 'paid';
      } else if (remainingAmount < schedule.total_amount && remainingAmount > 0) {
        derivedStatus = 'partial';
      } else if (new Date(schedule.due_date) < new Date() && remainingAmount > 0) {
        derivedStatus = 'late';
      }
      
      return {
        ...schedule,
        remaining_amount: remainingAmount,
        remaining_percentage: remainingPercentage,
        derived_status: derivedStatus,
        relevant_payments: relevantPayments.map(p => p.id)
      };
    });
    
    return {
      contract: {
        ...contract,
        payment_schedule: enrichedSchedule
      },
      disbursements,
      payments,
      guarantees,
      // Informations synthétiques
      totalDisbursed: disbursements.reduce((sum, d) => sum + d.amount, 0),
      totalRepaid: payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0),
      guaranteesValue: guarantees.reduce((sum, g) => sum + g.value, 0),
      paymentSchedule: enrichedSchedule || []
    };
  },
  
  /**
   * Compare les paiements avec les échéances d'un contrat pour analyses
   * Cette méthode est utile pour générer des rapports et des analyses
   * sans modifier les données originales
   */
  comparePaymentsWithSchedule: (contractId: string) => {
    // Récupérer le contrat
    const contract = traditionalDataService.getCreditContractById(contractId);
    if (!contract || !contract.payment_schedule) {
      return [];
    }
    
    // Récupérer les paiements du contrat
    const payments = traditionalDataService.getPaymentsByContractId(contractId);
    
    // Analyser chaque échéance
    return contract.payment_schedule.map(schedule => {
      // Rechercher les paiements potentiellement liés à cette échéance
      const relatedPayments = payments.filter(payment => {
        // Vérifier par ID d'échéance explicite
        if (payment.scheduled_payment_id === schedule.id) {
          return true;
        }
        
        // Vérifier par proximité de date
        if (payment.payment_date && schedule.due_date) {
          const paymentDate = new Date(payment.payment_date);
          const dueDate = new Date(schedule.due_date);
          const diffTime = Math.abs(paymentDate.getTime() - dueDate.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return diffDays <= 7; // Considérer une semaine de marge
        }
        
        return false;
      });
      
      // Calculer les statistiques
      const totalPaid = relatedPayments.reduce((sum, payment) => sum + payment.amount, 0);
      const remainingAmount = Math.max(0, schedule.total_amount - totalPaid);
      const paymentPercentage = schedule.total_amount > 0 
        ? Math.round((totalPaid / schedule.total_amount) * 100)
        : 0;
      
      // Déterminer le statut basé sur les paiements
      let computedStatus;
      if (totalPaid >= schedule.total_amount) {
        computedStatus = 'paid';
      } else if (totalPaid > 0) {
        computedStatus = 'partial';
      } else if (new Date(schedule.due_date) < new Date()) {
        computedStatus = 'late';
      } else {
        computedStatus = 'pending';
      }
      
      // Calculer le glissement moyen des paiements (si applicables)
      let slippage = 0;
      
      if (relatedPayments.length > 0 && schedule.due_date) {
        const dueDate = new Date(schedule.due_date).getTime();
        
        const delays = relatedPayments
          .filter(p => p.payment_date)
          .map(p => {
            const paymentDate = new Date(p.payment_date!).getTime();
            return Math.round((paymentDate - dueDate) / (1000 * 60 * 60 * 24));
          });
        
        if (delays.length > 0) {
          slippage = delays.reduce((sum, delay) => sum + delay, 0) / delays.length;
        }
      }
      
      return {
        schedule_id: schedule.id,
        due_date: schedule.due_date,
        expected_amount: schedule.total_amount,
        principal_amount: schedule.principal_amount,
        interest_amount: schedule.interest_amount,
        actual_payments: relatedPayments.map(p => ({
          payment_id: p.id,
          payment_date: p.payment_date,
          amount: p.amount,
          status: p.status,
          reference: p.payment_reference,
          transaction_reference: p.transaction_reference
        })),
        total_paid: totalPaid,
        remaining_amount: remainingAmount,
        payment_percentage: paymentPercentage,
        computed_status: computedStatus,
        slippage: slippage,
        installment_number: schedule.installment_number
      };
    });
  },

  /**
   * Associe un paiement à une échéance spécifique
   * @param paymentId Identifiant du paiement
   * @param installmentNumber Numéro de l'échéance
   * @returns true si l'opération a réussi, false sinon
   */
  associatePaymentWithSchedule: (paymentId: string, installmentNumber: number): boolean => {
    try {
      // Récupérer tous les paiements
      const paymentsStr = localStorage.getItem(STORAGE_KEYS.PAYMENTS);
      if (!paymentsStr) return false;
      
      const payments = JSON.parse(paymentsStr);
      
      // Trouver le paiement à mettre à jour
      const paymentIndex = payments.findIndex((p: { id: string }) => p.id === paymentId);
      if (paymentIndex === -1) return false;
      
      // Mettre à jour le paiement avec le numéro d'échéance
      payments[paymentIndex].installment_number = installmentNumber;
      
      // Sauvegarder les modifications
      localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(payments));
      
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'association du paiement à l\'échéance:', error);
      return false;
    }
  }
};

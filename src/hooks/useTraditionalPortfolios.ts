// src/hooks/useTraditionalPortfolios.ts
// Hook pour gérer les portefeuilles traditionnels avec API backend (mode production)

import { useState, useMemo, useCallback } from 'react';
import { usePortfolios } from './usePortfolios';
import { traditionalPortfolioApi } from '../services/api/traditional/portfolio.api';
import { portfolioAccountsApi } from '../services/api/shared';
import type { TraditionalPortfolio } from '../types/traditional-portfolio';
import type { BankAccount } from '../types/bankAccount';
import type { MobileMoneyAccount } from '../types/mobileMoneyAccount';
import { validateTraditionalPortfolio } from '../utils/validation';

interface Filters {
  status: string;
  riskProfile: string;
  sector: string;
  minAmount: string;
}

/**
 * Hook pour gérer les portefeuilles traditionnels
 * Utilise l'API backend pour toutes les opérations CRUD avec fallback localStorage
 * 
 * @returns {Object} Méthodes et données pour les portefeuilles traditionnels
 * @property {TraditionalPortfolio[]} portfolios - Liste de tous les portefeuilles traditionnels
 * @property {TraditionalPortfolio[]} filteredPortfolios - Liste filtrée des portefeuilles
 * @property {Filters} filters - Filtres actuellement appliqués
 * @property {Function} setFilters - Fonction pour mettre à jour les filtres
 * @property {Function} createPortfolio - Fonction pour créer un nouveau portefeuille
 * @property {Function} updatePortfolio - Fonction pour mettre à jour un portefeuille
 * @property {Function} deletePortfolio - Fonction pour supprimer un portefeuille
 * @property {boolean} loading - Indique si les données sont en cours de chargement
 * @property {Error|null} error - Erreur survenue lors du chargement des données
 * @property {boolean} backendFailed - Indique si la connexion au backend a échoué
 */
export function useTraditionalPortfolios() {
  const { portfolios: allPortfolios, loading, error, backendFailed, refresh } = usePortfolios('traditional');
  const portfolios = allPortfolios.filter((p): p is TraditionalPortfolio => p.type === 'traditional');
  const [filters, setFilters] = useState<Filters>({
    status: '',
    riskProfile: '',
    sector: '',
    minAmount: ''
  });

  /**
   * Crée un nouveau portefeuille traditionnel via l'API backend
   * En cas d'échec du backend, crée localement avec un flag de synchronisation
   * Gère également la création des comptes bancaires/Mobile Money associés
   * 
   * @param {Omit<TraditionalPortfolio, 'id' | 'type' | 'status' | 'products' | 'metrics' | 'created_at' | 'updated_at'> & { bank_account?: BankAccount; mobile_money_account?: MobileMoneyAccount }} data
   *        Données du portefeuille à créer (sans les champs générés automatiquement)
   * @returns {Promise<TraditionalPortfolio>} Le portefeuille créé avec tous les champs
   * @throws {Error} Si les données sont invalides ou si la création échoue
   */
  const createPortfolio = useCallback(async (
    data: Omit<TraditionalPortfolio, 'id' | 'type' | 'status' | 'products' | 'metrics' | 'created_at' | 'updated_at'> & {
      bank_account?: Partial<BankAccount>;
      mobile_money_account?: Partial<MobileMoneyAccount>;
      bank_accounts?: Partial<BankAccount>[];
      mobile_money_accounts?: Partial<MobileMoneyAccount>[];
    }
  ): Promise<TraditionalPortfolio> => {
    // Extraire les comptes des données
    const { bank_account, mobile_money_account, bank_accounts, mobile_money_accounts, ...portfolioBaseData } = data;
    
    // Valider les données avant de créer le portefeuille
    const validation = validateTraditionalPortfolio(portfolioBaseData);
    if (!validation.isValid) {
      throw new Error(`Données de portefeuille invalides: ${JSON.stringify(validation.errors)}`);
    }

    // Préparer les données pour l'API backend - format conforme au CreatePortfolioDto
    // Champs obligatoires: name, manager_id (UUID), institution_id (UUID), target_amount, risk_profile
    // Champs optionnels: description, type, reference, target_return, target_sectors, currency, clientId, settings
    const portfolioDataForApi: Record<string, unknown> = {
      // Champs obligatoires
      name: portfolioBaseData.name,
      manager_id: portfolioBaseData.manager_id,
      institution_id: portfolioBaseData.institution_id,
      target_amount: Number(portfolioBaseData.initial_capital || portfolioBaseData.target_amount || 0),
      risk_profile: portfolioBaseData.risk_profile || 'moderate',
      
      // Champs optionnels
      description: portfolioBaseData.description || `Portefeuille ${portfolioBaseData.name}`,
      currency: portfolioBaseData.currency || 'USD',
    };

    // Ajouter les champs optionnels seulement s'ils sont définis
    if (portfolioBaseData.target_return) {
      portfolioDataForApi.target_return = Number(portfolioBaseData.target_return);
    }
    if (portfolioBaseData.target_sectors && portfolioBaseData.target_sectors.length > 0) {
      portfolioDataForApi.target_sectors = portfolioBaseData.target_sectors;
    }

    // Log pour debug
    console.log('📋 Données préparées pour l\'API (CreatePortfolioDto):', JSON.stringify(portfolioDataForApi, null, 2));

    let newPortfolio: TraditionalPortfolio;

    // Créer via l'API backend - pas de fallback en mode production
    console.log('📡 Création du portefeuille via le backend...');
    const response = await traditionalPortfolioApi.createPortfolio(portfolioDataForApi);
    
    // La réponse peut être le portfolio directement ou avoir une structure { data: portfolio }
    newPortfolio = (response && typeof response === 'object' && 'id' in response) 
      ? response as TraditionalPortfolio
      : (response as unknown as { data: TraditionalPortfolio }).data;
    
    console.log('✅ Portefeuille créé avec succès:', newPortfolio.id);

    // Créer les comptes associés
    const portfolioId = newPortfolio.id;
    const createdBankAccounts: BankAccount[] = [];
    const createdMobileMoneyAccounts: MobileMoneyAccount[] = [];

    // Créer le compte bancaire si fourni
    const bankAccountToCreate = bank_account || (bank_accounts && bank_accounts[0]);
    if (bankAccountToCreate && bankAccountToCreate.bank_name) {
      try {
        console.log('📡 Création du compte bancaire associé...');
        // Nettoyer les données - le backend génère id, balance, created_at, updated_at, portfolio_id
        const bankAccountData = {
          bank_name: bankAccountToCreate.bank_name,
          account_number: bankAccountToCreate.account_number || '',
          account_name: bankAccountToCreate.account_name || '',
          swift_code: bankAccountToCreate.swift_code,
          iban: bankAccountToCreate.iban,
          is_primary: true,
          is_active: true,
          currency: bankAccountToCreate.currency,
          purpose: bankAccountToCreate.purpose || 'general',
        };
        
        console.log('📋 Données compte bancaire pour API:', bankAccountData);
        const createdBankAccount = await portfolioAccountsApi.addBankAccount(portfolioId, bankAccountData);
        createdBankAccounts.push(createdBankAccount);
        
        // Mettre à jour le portfolio avec l'ID du compte primaire
        newPortfolio.primary_bank_account_id = createdBankAccount.id;
        console.log('✅ Compte bancaire créé:', createdBankAccount.id);
      } catch (err) {
        console.error('❌ Erreur lors de la création du compte bancaire:', err);
        // Continuer même si le compte échoue - le portfolio est créé
      }
    }

    // Créer le compte Mobile Money si fourni
    const mobileAccountToCreate = mobile_money_account || (mobile_money_accounts && mobile_money_accounts[0]);
    if (mobileAccountToCreate && mobileAccountToCreate.provider) {
      try {
        console.log('📡 Création du compte Mobile Money associé...');
        // Nettoyer les données - le backend génère id, balance, account_status, created_at, updated_at, portfolio_id
        const mobileAccountData = {
          provider: mobileAccountToCreate.provider,
          phone_number: mobileAccountToCreate.phone_number || '',
          account_name: mobileAccountToCreate.account_name || '',
          is_primary: true,
          is_active: true,
          currency: mobileAccountToCreate.currency,
          purpose: mobileAccountToCreate.purpose || 'general',
        };
        
        console.log('📋 Données compte Mobile Money pour API:', mobileAccountData);
        const createdMobileAccount = await portfolioAccountsApi.addMobileMoneyAccount(portfolioId, mobileAccountData);
        createdMobileMoneyAccounts.push(createdMobileAccount);
        
        // Mettre à jour le portfolio avec l'ID du compte primaire
        newPortfolio.primary_mobile_money_account_id = createdMobileAccount.id;
        console.log('✅ Compte Mobile Money créé:', createdMobileAccount.id);
      } catch (err) {
        console.error('❌ Erreur lors de la création du compte Mobile Money:', err);
        // Continuer même si le compte échoue - le portfolio est créé
      }
    }

    // Ajouter les comptes au portfolio pour le stockage
    newPortfolio.bank_accounts = createdBankAccounts;
    newPortfolio.mobile_money_accounts = createdMobileMoneyAccounts;
    
    // Rafraîchir la liste
    refresh();
    
    return newPortfolio;
  }, [refresh]);

  /**
   * Met à jour un portefeuille traditionnel via l'API backend
   * En cas d'échec du backend, met à jour localement
   * 
   * @param {string} id Identifiant du portefeuille à mettre à jour
   * @param {Partial<TraditionalPortfolio>} updates Les modifications à appliquer
   * @returns {Promise<TraditionalPortfolio>} Le portefeuille mis à jour
   */
  const updatePortfolio = useCallback(async (
    id: string, 
    updates: Partial<TraditionalPortfolio>
  ): Promise<TraditionalPortfolio> => {
    try {
      // Essayer de mettre à jour via l'API backend
      console.log('📡 Mise à jour du portefeuille via le backend...');
      const response = await traditionalPortfolioApi.updatePortfolio(id, updates);
      
      const updatedPortfolio = (response && typeof response === 'object' && 'id' in response) 
        ? response as TraditionalPortfolio
        : (response as unknown as { data: TraditionalPortfolio }).data;
      
      console.log('✅ Portefeuille mis à jour avec succès:', updatedPortfolio.id);
      
      // Synchroniser avec le localStorage
      await portfolioStorageService.addOrUpdatePortfolio(updatedPortfolio as unknown as PortfolioWithType);
      
      // Rafraîchir la liste
      refresh();
      
      return updatedPortfolio;
      
    } catch (err) {
      console.error('❌ Erreur lors de la mise à jour via le backend:', err);
      // En mode production, propager l'erreur au lieu de fallback
      throw err;
    }
  }, [refresh]);

  /**
   * Supprime un portefeuille traditionnel via l'API backend
   * 
   * @param {string} id Identifiant du portefeuille à supprimer
   * @returns {Promise<void>}
   */
  const deletePortfolio = useCallback(async (id: string): Promise<void> => {
    // Supprimer via l'API backend
    console.log('📡 Suppression du portefeuille via le backend...');
    await traditionalPortfolioApi.deletePortfolio(id);
    console.log('✅ Portefeuille supprimé avec succès:', id);
    
    // Supprimer aussi du localStorage (cache local)
    await portfolioStorageService.deletePortfolio(id);
    
    // Rafraîchir la liste
    refresh();
  }, [refresh]);

  /**
   * Change le statut d'un portefeuille traditionnel
   * 
   * @param {string} id Identifiant du portefeuille
   * @param {'active' | 'inactive' | 'pending' | 'archived'} status Nouveau statut
   * @returns {Promise<TraditionalPortfolio>}
   */
  const changeStatus = useCallback(async (
    id: string, 
    status: 'active' | 'inactive' | 'pending' | 'archived'
  ): Promise<TraditionalPortfolio> => {
    try {
      console.log(`📡 Changement de statut du portefeuille ${id} vers ${status}...`);
      const response = await traditionalPortfolioApi.changeStatus(id, status);
      
      const updatedPortfolio = (response && typeof response === 'object' && 'id' in response) 
        ? response as TraditionalPortfolio
        : (response as unknown as { data: TraditionalPortfolio }).data;
      
      console.log('✅ Statut mis à jour avec succès');
      
      // Synchroniser avec le localStorage
      await portfolioStorageService.addOrUpdatePortfolio(updatedPortfolio as unknown as PortfolioWithType);
      
      refresh();
      return updatedPortfolio;
      
    } catch (err) {
      console.error('❌ Erreur lors du changement de statut:', err);
      // Fallback via updatePortfolio
      return updatePortfolio(id, { status });
    }
  }, [updatePortfolio, refresh]);

  const filteredPortfolios = useMemo(() => {
    return portfolios.filter(portfolio => {
      if (filters.status && portfolio.status !== filters.status) return false;
      if (filters.riskProfile && portfolio.risk_profile !== filters.riskProfile) return false;
      if (filters.sector && !portfolio.target_sectors.includes(filters.sector)) return false;
      if (filters.minAmount && portfolio.target_amount < parseInt(filters.minAmount)) return false;
      return true;
    });
  }, [portfolios, filters]);

  return {
    portfolios,
    loading,
    error,
    backendFailed,
    filters,
    setFilters,
    filteredPortfolios,
    createPortfolio,
    updatePortfolio,
    deletePortfolio,
    changeStatus,
    refresh,
  };
}

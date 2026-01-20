// src/hooks/queries/usePortfolioQueries.ts
// Hooks React Query pour les portefeuilles - Approche professionnelle

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys, listDataOptions } from '../../services/api/reactQueryConfig';
import { traditionalPortfolioApi } from '../../services/api/traditional/portfolio.api';
import { portfolioAccountsApi } from '../../services/api/shared';
import type { TraditionalPortfolio } from '../../types/traditional-portfolio';
import type { Portfolio } from '../../types/portfolio';
import type { BankAccount } from '../../types/bankAccount';
import type { MobileMoneyAccount } from '../../types/mobileMoneyAccount';

// ============================================================================
// TYPES
// ============================================================================

interface PortfolioFilters {
  status?: 'active' | 'inactive' | 'pending' | 'archived';
  riskProfile?: 'conservative' | 'moderate' | 'aggressive';
  minAmount?: number;
  sector?: string;
}

interface CreatePortfolioData {
  name: string;
  description?: string;
  manager_id: string;
  institution_id: string;
  target_amount?: number;
  initial_capital?: number;
  risk_profile?: 'conservative' | 'moderate' | 'aggressive';
  currency?: string;
  target_return?: number;
  target_sectors?: string[];
  bank_account?: Partial<BankAccount>;
  mobile_money_account?: Partial<MobileMoneyAccount>;
}

// ============================================================================
// QUERIES (Lecture)
// ============================================================================

/**
 * Hook pour récupérer la liste des portefeuilles traditionnels
 * 
 * ✅ Avantages React Query:
 * - Cache automatique (pas de requêtes dupliquées)
 * - staleTime de 30s (évite les appels répétés)
 * - Déduplication des requêtes identiques
 * - Gestion automatique des erreurs et retry
 * 
 * @example
 * const { data, isLoading, error } = useTraditionalPortfoliosQuery();
 * // data = { data: Portfolio[], meta?: { total, page, ... } }
 */
export function useTraditionalPortfoliosQuery(filters?: PortfolioFilters) {
  return useQuery({
    queryKey: queryKeys.portfolios.list({ type: 'traditional', ...filters }),
    queryFn: async () => {
      console.log('🔄 [ReactQuery] Chargement des portefeuilles traditionnels...');
      const response = await traditionalPortfolioApi.getAllPortfolios(filters);
      
      // Normaliser la réponse (peut être un tableau ou { data: [...] })
      const data = Array.isArray(response) 
        ? response 
        : (response as { data?: Portfolio[] }).data || [];
      
      console.log(`✅ [ReactQuery] ${data.length} portefeuilles chargés`);
      return { data: data as TraditionalPortfolio[], meta: (response as { meta?: unknown }).meta };
    },
    // Options optimisées pour éviter les requêtes en boucle
    ...listDataOptions,
    staleTime: 30 * 1000, // 30 secondes - données fraiches
    gcTime: 5 * 60 * 1000, // 5 minutes en cache
    refetchOnMount: false, // Ne pas refetch si déjà en cache
    refetchOnWindowFocus: false, // Éviter les refetch intempestifs
  });
}

/**
 * Hook pour récupérer un portefeuille spécifique par ID
 * 
 * @example
 * const { data: portfolio } = usePortfolioQuery('portfolio-123');
 */
export function usePortfolioQuery(portfolioId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.portfolios.detail(portfolioId || ''),
    queryFn: async () => {
      if (!portfolioId) throw new Error('Portfolio ID required');
      return traditionalPortfolioApi.getPortfolioById(portfolioId);
    },
    enabled: !!portfolioId, // Ne pas exécuter si pas d'ID
    staleTime: 60 * 1000, // 1 minute pour les détails
  });
}

// ============================================================================
// MUTATIONS (Écriture)
// ============================================================================

/**
 * Hook pour créer un nouveau portefeuille
 * Invalide automatiquement la liste après création
 * 
 * @example
 * const createMutation = useCreatePortfolioMutation();
 * await createMutation.mutateAsync({ name: 'Mon portefeuille', ... });
 */
export function useCreatePortfolioMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreatePortfolioData) => {
      // Préparer les données pour l'API
      const { bank_account, mobile_money_account, ...portfolioData } = data;
      
      const apiData = {
        name: portfolioData.name,
        manager_id: portfolioData.manager_id,
        institution_id: portfolioData.institution_id,
        target_amount: Number(portfolioData.initial_capital || portfolioData.target_amount || 0),
        risk_profile: portfolioData.risk_profile || 'moderate',
        description: portfolioData.description || `Portefeuille ${portfolioData.name}`,
        currency: portfolioData.currency || 'USD',
        ...(portfolioData.target_return && { target_return: Number(portfolioData.target_return) }),
        ...(portfolioData.target_sectors?.length && { target_sectors: portfolioData.target_sectors }),
      };

      console.log('📡 Création du portefeuille via le backend...');
      const response = await traditionalPortfolioApi.createPortfolio(apiData);
      
      const newPortfolio = (response && typeof response === 'object' && 'id' in response)
        ? response as TraditionalPortfolio
        : (response as { data: TraditionalPortfolio }).data;

      // Créer les comptes associés si fournis
      if (bank_account?.bank_name) {
        try {
          const bankData = {
            bank_name: bank_account.bank_name,
            account_number: bank_account.account_number || '',
            account_name: bank_account.account_name || '',
            swift_code: bank_account.swift_code,
            iban: bank_account.iban,
            is_primary: true,
            is_active: true,
            currency: bank_account.currency,
            purpose: bank_account.purpose || 'general',
          };
          const createdAccount = await portfolioAccountsApi.addBankAccount(newPortfolio.id, bankData);
          newPortfolio.bank_accounts = [createdAccount];
          console.log('✅ Compte bancaire créé:', createdAccount.id);
        } catch (err) {
          console.error('⚠️ Erreur création compte bancaire:', err);
        }
      }

      if (mobile_money_account?.provider) {
        try {
          const mobileData = {
            provider: mobile_money_account.provider,
            phone_number: mobile_money_account.phone_number || '',
            account_name: mobile_money_account.account_name || '',
            is_primary: true,
            is_active: true,
            currency: mobile_money_account.currency,
            purpose: mobile_money_account.purpose || 'general',
          };
          const createdAccount = await portfolioAccountsApi.addMobileMoneyAccount(newPortfolio.id, mobileData);
          newPortfolio.mobile_money_accounts = [createdAccount];
          console.log('✅ Compte Mobile Money créé:', createdAccount.id);
        } catch (err) {
          console.error('⚠️ Erreur création compte Mobile Money:', err);
        }
      }

      console.log('✅ Portefeuille créé:', newPortfolio.id);
      return newPortfolio;
    },
    onSuccess: () => {
      // Invalider la liste pour forcer un refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.portfolios.lists() });
    },
    onError: (error) => {
      console.error('❌ Erreur création portefeuille:', error);
    },
  });
}

/**
 * Hook pour mettre à jour un portefeuille
 */
export function useUpdatePortfolioMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<TraditionalPortfolio> }) => {
      console.log('📡 Mise à jour du portefeuille:', id);
      const response = await traditionalPortfolioApi.updatePortfolio(id, updates);
      
      return (response && typeof response === 'object' && 'id' in response)
        ? response as TraditionalPortfolio
        : (response as { data: TraditionalPortfolio }).data;
    },
    onSuccess: (updatedPortfolio) => {
      // Mettre à jour le cache immédiatement (optimistic update)
      queryClient.setQueryData(
        queryKeys.portfolios.detail(updatedPortfolio.id),
        updatedPortfolio
      );
      // Invalider la liste
      queryClient.invalidateQueries({ queryKey: queryKeys.portfolios.lists() });
    },
  });
}

/**
 * Hook pour supprimer un portefeuille
 */
export function useDeletePortfolioMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      console.log('📡 Suppression du portefeuille:', id);
      await traditionalPortfolioApi.deletePortfolio(id);
      return id;
    },
    onSuccess: (deletedId) => {
      // Retirer du cache
      queryClient.removeQueries({ queryKey: queryKeys.portfolios.detail(deletedId) });
      // Invalider la liste
      queryClient.invalidateQueries({ queryKey: queryKeys.portfolios.lists() });
    },
  });
}

/**
 * Hook pour changer le statut d'un portefeuille
 */
export function useChangePortfolioStatusMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'active' | 'inactive' | 'pending' | 'archived' }) => {
      console.log('📡 Changement de statut:', id, '->', status);
      return traditionalPortfolioApi.changeStatus(id, status);
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.portfolios.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.portfolios.lists() });
    },
  });
}

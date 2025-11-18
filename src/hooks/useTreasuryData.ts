// src/hooks/useTreasuryData.ts
import { useState, useEffect, useCallback, useMemo } from 'react';
import type { TreasuryData, TreasuryAccount, TreasuryPeriod, TimeseriesScale, TreasuryAccountType, Currency } from '../types/company';

export interface TreasuryFilters {
  accountType?: TreasuryAccountType;
  currency?: Currency;
  searchTerm?: string;
}

export interface TreasuryDataState {
  treasuryData: TreasuryData | null;
  loading: boolean;
  error: string | null;
  selectedScale: TimeseriesScale;
  filters: TreasuryFilters;
  filteredAccounts: TreasuryAccount[];
  selectedPeriod: TreasuryPeriod | null;
  periodStats: {
    currentBalance: number;
    previousBalance: number;
    changeAmount: number;
    changePercent: number;
  } | null;
}

export interface UseTreasuryDataReturn extends TreasuryDataState {
  setSelectedScale: (scale: TimeseriesScale) => void;
  setFilters: (filters: TreasuryFilters) => void;
  setSelectedPeriod: (period: TreasuryPeriod | null) => void;
  refreshData: () => void;
  resetFilters: () => void;
  getAccountsByType: (type: TreasuryAccountType) => TreasuryAccount[];
  getAccountsByCurrency: (currency: Currency) => TreasuryAccount[];
  getTotalByCurrency: (currency: Currency) => number;
  getPeriods: () => TreasuryPeriod[];
}

/**
 * Hook personnalisé pour gérer les données de trésorerie
 * Gère l'état, les filtres, les échelles temporelles et les calculs
 */
export function useTreasuryData(initialData: TreasuryData | null | undefined): UseTreasuryDataReturn {
  const [treasuryData, setTreasuryData] = useState<TreasuryData | null>(initialData || null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedScale, setSelectedScale] = useState<TimeseriesScale>('monthly');
  const [filters, setFilters] = useState<TreasuryFilters>({});
  const [selectedPeriod, setSelectedPeriod] = useState<TreasuryPeriod | null>(null);

  // Mettre à jour les données si initialData change
  useEffect(() => {
    if (initialData) {
      setTreasuryData(initialData);
      setError(null);
    }
  }, [initialData]);

  // Fonction pour rafraîchir les données
  const refreshData = useCallback(() => {
    if (initialData) {
      setLoading(true);
      setTimeout(() => {
        setTreasuryData(initialData);
        setLoading(false);
      }, 300);
    }
  }, [initialData]);

  // Fonction pour réinitialiser les filtres
  const resetFilters = useCallback(() => {
    setFilters({});
  }, []);

  // Filtrer les comptes selon les critères
  const filteredAccounts = useMemo(() => {
    if (!treasuryData) return [];

    let accounts = [...treasuryData.accounts];

    // Filtre par type de compte
    if (filters.accountType) {
      accounts = accounts.filter(acc => acc.type === filters.accountType);
    }

    // Filtre par devise
    if (filters.currency) {
      accounts = accounts.filter(acc => acc.currency === filters.currency);
    }

    // Filtre par terme de recherche
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      accounts = accounts.filter(
        acc =>
          acc.name.toLowerCase().includes(term) ||
          acc.code.toLowerCase().includes(term) ||
          acc.bankName?.toLowerCase().includes(term) ||
          acc.accountNumber?.toLowerCase().includes(term)
      );
    }

    return accounts;
  }, [treasuryData, filters]);

  // Obtenir les comptes par type
  const getAccountsByType = useCallback(
    (type: TreasuryAccountType): TreasuryAccount[] => {
      if (!treasuryData) return [];
      return treasuryData.accounts.filter(acc => acc.type === type);
    },
    [treasuryData]
  );

  // Obtenir les comptes par devise
  const getAccountsByCurrency = useCallback(
    (currency: Currency): TreasuryAccount[] => {
      if (!treasuryData) return [];
      return treasuryData.accounts.filter(acc => acc.currency === currency);
    },
    [treasuryData]
  );

  // Calculer le total par devise
  const getTotalByCurrency = useCallback(
    (currency: Currency): number => {
      if (!treasuryData) return 0;
      return treasuryData.accounts
        .filter(acc => acc.currency === currency)
        .reduce((sum, acc) => sum + acc.balance, 0);
    },
    [treasuryData]
  );

  // Obtenir les périodes selon l'échelle sélectionnée
  const getPeriods = useCallback((): TreasuryPeriod[] => {
    if (!treasuryData?.timeseries) return [];
    return treasuryData.timeseries[selectedScale] || [];
  }, [treasuryData, selectedScale]);

  // Calculer les statistiques de la période sélectionnée
  const periodStats = useMemo(() => {
    if (!selectedPeriod) return null;

    const periods = getPeriods();
    const currentIndex = periods.findIndex(p => p.periodId === selectedPeriod.periodId);
    
    if (currentIndex === -1) return null;

    const currentBalance = selectedPeriod.totalBalance;
    const previousBalance = currentIndex < periods.length - 1 
      ? periods[currentIndex + 1].totalBalance 
      : currentBalance;

    const changeAmount = currentBalance - previousBalance;
    const changePercent = previousBalance !== 0 
      ? (changeAmount / previousBalance) * 100 
      : 0;

    return {
      currentBalance,
      previousBalance,
      changeAmount,
      changePercent
    };
  }, [selectedPeriod, getPeriods]);

  return {
    treasuryData,
    loading,
    error,
    selectedScale,
    filters,
    filteredAccounts,
    selectedPeriod,
    periodStats,
    setSelectedScale,
    setFilters,
    setSelectedPeriod,
    refreshData,
    resetFilters,
    getAccountsByType,
    getAccountsByCurrency,
    getTotalByCurrency,
    getPeriods
  };
}

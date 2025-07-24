// src/services/api/hooks/useDashboardQueries.ts
import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../shared/dashboard.api';
import { realtimeDataOptions } from '../reactQueryConfig';
import { errorHandlingService } from '../errorHandling';

// Simple error handling options
type ErrorOptions = {
  showNotification?: boolean;
  customMessage?: string;
  onError?: (error: Error) => void;
};

// Handle query errors consistently
const handleError = (error: Error, options?: ErrorOptions) => {
  errorHandlingService.handleError(error, {
    showNotification: options?.showNotification ?? true,
    customMessage: options?.customMessage
  });
  
  if (options?.onError) {
    options.onError(error);
  }
};

/**
 * Hook to fetch global dashboard data
 */
export function useDashboardData(options?: ErrorOptions) {
  const query = useQuery({
    queryKey: ['dashboard'],
    queryFn: dashboardApi.getDashboardData,
    ...realtimeDataOptions,
    ...options
  });

  // Handle error if present
  if (query.error) {
    handleError(query.error, {
      customMessage: 'Erreur lors du chargement des données du dashboard',
      onError: options?.onError
    });
  }

  return query;
}

/**
 * Hook to fetch metrics for a specific portfolio type
 */
export function useDashboardMetricsV2(
  portfolioType?: 'traditional' | 'investment' | 'leasing',
  options?: ErrorOptions
) {
  const query = useQuery({
    queryKey: ['dashboard', 'metrics', portfolioType],
    queryFn: async () => {
      if (!portfolioType) {
        throw new Error('Type de portefeuille non spécifié');
      }
      return dashboardApi.getPortfolioTypeKPIs(portfolioType);
    },
    enabled: !!portfolioType,
    ...realtimeDataOptions,
    ...options
  });
  
  // Handle error if present
  if (query.error) {
    handleError(query.error, {
      customMessage: `Erreur lors du chargement des métriques pour le portefeuille ${portfolioType}`,
      onError: options?.onError
    });
  }
  
  return query;
}

/**
 * Hook to fetch performance data for a portfolio
 */
export function usePortfolioPerformance(
  portfolioId: string,
  portfolioType: 'traditional' | 'investment' | 'leasing',
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' = 'monthly',
  options?: ErrorOptions
) {
  const query = useQuery({
    queryKey: ['dashboard', 'performance', portfolioId, portfolioType, period],
    queryFn: () => dashboardApi.getPortfolioPerformance(portfolioId, portfolioType, period),
    enabled: !!portfolioId && !!portfolioType,
    ...realtimeDataOptions,
    ...options
  });
  
  // Handle error if present
  if (query.error) {
    handleError(query.error, {
      customMessage: `Erreur lors du chargement des données de performance`,
      onError: options?.onError
    });
  }
  
  return query;
}

/**
 * Hook to fetch portfolio trends
 */
export function usePortfolioTrends(
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' = 'monthly',
  options?: ErrorOptions
) {
  const query = useQuery({
    queryKey: ['dashboard', 'trends', period],
    queryFn: () => dashboardApi.getPortfolioTrends(period),
    ...realtimeDataOptions,
    ...options
  });
  
  // Handle error if present
  if (query.error) {
    handleError(query.error, {
      customMessage: `Erreur lors du chargement des tendances des portefeuilles`,
      onError: options?.onError
    });
  }
  
  return query;
}

/**
 * Hook to fetch risk alerts
 */
export function useRiskAlerts(
  priority?: 'high' | 'medium' | 'low',
  options?: ErrorOptions
) {
  const query = useQuery({
    queryKey: ['dashboard', 'risk-alerts', priority],
    queryFn: () => dashboardApi.getRiskAlerts(priority),
    ...realtimeDataOptions,
    refetchInterval: 30 * 1000, // 30 seconds
    ...options
  });
  
  // Handle error if present
  if (query.error) {
    handleError(query.error, {
      customMessage: `Erreur lors du chargement des alertes de risque`,
      onError: options?.onError
    });
  }
  
  return query;
}

/**
 * Hook to fetch business opportunities
 */
export function useBusinessOpportunities(options?: ErrorOptions) {
  const query = useQuery({
    queryKey: ['dashboard', 'opportunities'],
    queryFn: dashboardApi.getBusinessOpportunities,
    ...realtimeDataOptions,
    ...options
  });
  
  // Handle error if present
  if (query.error) {
    handleError(query.error, {
      customMessage: `Erreur lors du chargement des opportunités commerciales`,
      onError: options?.onError
    });
  }
  
  return query;
}

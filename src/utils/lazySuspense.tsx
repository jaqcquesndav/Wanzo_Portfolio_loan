// src/utils/lazySuspense.tsx
import React from 'react';
import { LoadingScreen } from '../components/ui/LoadingScreen';
import * as lazyComponents from '../routes/lazyRoutes';

/**
 * HOC pour envelopper les composants lazy dans un Suspense
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const withSuspense = <P extends Record<string, any>>(Component: React.ComponentType<P>) => (props: P) => (
  <React.Suspense fallback={<LoadingScreen message="Chargement du module..." />}>
    <Component {...props} />
  </React.Suspense>
);

// Application du Suspense à tous les composants lazy
export const LazySuspendedComponents = {
  // Composants essentiels (non lazy, exportés directement)
  Layout: lazyComponents.Layout,
  PortfolioTypeSelector: lazyComponents.PortfolioTypeSelector,
  AuthCallback: lazyComponents.AuthCallback,
  Dashboard: lazyComponents.Dashboard,

  // Portfolios traditionnels
  TraditionalPortfolio: withSuspense(lazyComponents.TraditionalPortfolio),
  TraditionalPortfolioDetails: withSuspense(lazyComponents.TraditionalPortfolioDetails),
  TraditionalPortfolioView: withSuspense(lazyComponents.TraditionalPortfolioView),

  // Détails des opérations
  CreditRequestDetails: withSuspense(lazyComponents.CreditRequestDetails),
  CreditContractDetail: withSuspense(lazyComponents.CreditContractDetail),
  CreditContractSchedulePage: withSuspense(lazyComponents.CreditContractSchedulePage),
  DisbursementDetails: withSuspense(lazyComponents.DisbursementDetails),
  RepaymentDetails: withSuspense(lazyComponents.RepaymentDetails),
  GuaranteeDetails: withSuspense(lazyComponents.GuaranteeDetails),

  // Pages administratives et d'assistance
  Documentation: withSuspense(lazyComponents.Documentation),
  Help: withSuspense(lazyComponents.Help),
  Settings: withSuspense(lazyComponents.Settings),
  CurrencySettings: withSuspense(lazyComponents.CurrencySettings),
  Users: withSuspense(lazyComponents.Users),
  Organization: withSuspense(lazyComponents.Organization),
  InstitutionValidation: withSuspense(lazyComponents.InstitutionValidation),
  CentralRisque: withSuspense(lazyComponents.CentralRisque),
  PortfolioNotFound: withSuspense(lazyComponents.PortfolioNotFound),
  PortfolioErrorBoundary: withSuspense(lazyComponents.PortfolioErrorBoundary),
  ChatPage: withSuspense(lazyComponents.ChatPage),
  Prospection: withSuspense(lazyComponents.Prospection)
};

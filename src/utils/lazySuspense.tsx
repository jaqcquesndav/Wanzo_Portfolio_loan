// src/utils/lazySuspense.tsx
import React from 'react';
import { AppLoading } from '../components/ui/AppLoading';
import * as lazyComponents from '../routes/lazyRoutes';

/**
 * HOC pour envelopper les composants lazy dans un Suspense
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const withSuspense = <P extends Record<string, any>>(Component: React.ComponentType<P>) => (props: P) => (
  <React.Suspense fallback={<AppLoading message="Chargement du module..." />}>
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

  // Portfolios d'investissement
  InvestmentPortfolio: withSuspense(lazyComponents.InvestmentPortfolio),
  InvestmentPortfolioDetails: withSuspense(lazyComponents.InvestmentPortfolioDetails),
  InvestmentAssetDetail: withSuspense(lazyComponents.InvestmentAssetDetail),
  InvestmentSubscriptionDetail: withSuspense(lazyComponents.InvestmentSubscriptionDetail),
  InvestmentValuationDetail: withSuspense(lazyComponents.InvestmentValuationDetail),
  InvestmentReportingDetail: withSuspense(lazyComponents.InvestmentReportingDetail),

  // Portfolios de leasing
  LeasingPortfolio: withSuspense(lazyComponents.LeasingPortfolio),
  LeasingPortfolioDetails: withSuspense(lazyComponents.LeasingPortfolioDetails),
  LeasingEquipmentDetail: withSuspense(lazyComponents.LeasingEquipmentDetail),
  LeasingContractDetail: withSuspense(lazyComponents.LeasingContractDetail),
  LeasingIncidentDetail: withSuspense(lazyComponents.LeasingIncidentDetail),
  LeasingMaintenanceDetail: withSuspense(lazyComponents.LeasingMaintenanceDetail),
  LeasingPaymentDetail: withSuspense(lazyComponents.LeasingPaymentDetail),
  LeasingReportingDetail: withSuspense(lazyComponents.LeasingReportingDetail),
  LeasingReservationsPage: withSuspense(lazyComponents.LeasingReservationsPage),
  LeasingMaintenancePage: withSuspense(lazyComponents.LeasingMaintenancePage),
  LeasingIncidentsPage: withSuspense(lazyComponents.LeasingIncidentsPage),
  LeasingMovementsPage: withSuspense(lazyComponents.LeasingMovementsPage),

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
  Users: withSuspense(lazyComponents.Users),
  InstitutionManagement: withSuspense(lazyComponents.InstitutionManagement),
  InstitutionValidation: withSuspense(lazyComponents.InstitutionValidation),
  CentralRisque: withSuspense(lazyComponents.CentralRisque),
  PortfolioNotFound: withSuspense(lazyComponents.PortfolioNotFound),
  PortfolioErrorBoundary: withSuspense(lazyComponents.PortfolioErrorBoundary),
  ChatPage: withSuspense(lazyComponents.ChatPage),
  Prospection: withSuspense(lazyComponents.Prospection)
};

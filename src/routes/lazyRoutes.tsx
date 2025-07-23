import { lazy } from 'react';

// Composants essentiels au chargement initial (non lazy loaded)
export { default as Layout } from '../components/layout/Layout';
export { default as PortfolioTypeSelector } from '../pages/PortfolioTypeSelector';
export { default as AuthCallback } from '../pages/AuthCallback';
export { default as Dashboard } from '../pages/Dashboard';

// Portfolios traditionnels
export const TraditionalPortfolio = lazy(() => import('../pages/TraditionalPortfolio'));
export const TraditionalPortfolioDetails = lazy(() => import('../pages/TraditionalPortfolioDetails'));
export const TraditionalPortfolioView = lazy(() => 
  import('../pages/TraditionalPortfolioView').then(module => ({ default: module.TraditionalPortfolioView }))
);

// Portfolios d'investissement
export const InvestmentPortfolio = lazy(() => import('../pages/InvestmentPortfolio'));
export const InvestmentPortfolioDetails = lazy(() => import('../pages/InvestmentPortfolioDetails'));
export const InvestmentAssetDetail = lazy(() => import('../pages/InvestmentAssetDetail'));
export const InvestmentSubscriptionDetail = lazy(() => import('../pages/InvestmentSubscriptionDetail'));
export const InvestmentValuationDetail = lazy(() => import('../pages/InvestmentValuationDetail'));
export const InvestmentReportingDetail = lazy(() => import('../pages/InvestmentReportingDetail'));

// Portfolios de leasing
export const LeasingPortfolio = lazy(() => import('../pages/LeasingPortfolio'));
export const LeasingPortfolioDetails = lazy(() => import('../pages/LeasingPortfolioDetails'));
export const LeasingEquipmentDetail = lazy(() => import('../pages/leasing/LeasingEquipmentDetail'));
export const LeasingContractDetail = lazy(() => import('../pages/LeasingContractDetail'));
export const LeasingIncidentDetail = lazy(() => import('../pages/leasing/LeasingIncidentDetail'));
export const LeasingMaintenanceDetail = lazy(() => import('../pages/leasing/LeasingMaintenanceDetail'));
export const LeasingPaymentDetail = lazy(() => import('../pages/leasing/LeasingPaymentDetail'));
export const LeasingReportingDetail = lazy(() => import('../pages/leasing/LeasingReportingDetail'));
export const LeasingReservationsPage = lazy(() => import('../pages/leasing/LeasingReservationsPage'));
export const LeasingMaintenancePage = lazy(() => import('../pages/leasing/LeasingMaintenancePage'));
export const LeasingIncidentsPage = lazy(() => import('../pages/leasing/LeasingIncidentsPage'));
export const LeasingMovementsPage = lazy(() => import('../pages/leasing/LeasingMovementsPage'));

// Détails des opérations
export const CreditRequestDetails = lazy(() => import('../pages/CreditRequestDetails'));
export const CreditContractDetail = lazy(() => import('../pages/CreditContractDetail'));
export const CreditContractSchedulePage = lazy(() => import('../pages/CreditContractSchedulePage'));
export const DisbursementDetails = lazy(() => import('../pages/DisbursementDetails'));
export const RepaymentDetails = lazy(() => import('../pages/RepaymentDetails'));
export const GuaranteeDetails = lazy(() => import('../pages/GuaranteeDetails'));

// Pages administratives et d'assistance
export const Documentation = lazy(() => import('../pages/Documentation'));
export const Help = lazy(() => import('../pages/Help'));
export const Settings = lazy(() => import('../pages/Settings'));
export const Users = lazy(() => import('../pages/Users'));
export const Organization = lazy(() => import('../pages/Organization'));
export const InstitutionValidation = lazy(() => import('../pages/InstitutionValidation'));
export const CentralRisque = lazy(() => import('../pages/CentralRisque'));
export const PortfolioNotFound = lazy(() => import('../pages/PortfolioNotFound'));
export const PortfolioErrorBoundary = lazy(() => import('../pages/PortfolioErrorBoundary'));
export const ChatPage = lazy(() => 
  import('../pages/chat/ChatPage').then(module => ({ default: module.ChatPage }))
);
export const Prospection = lazy(() => import('../pages/Prospection'));

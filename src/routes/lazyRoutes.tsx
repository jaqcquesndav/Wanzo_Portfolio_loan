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
export const CurrencySettings = lazy(() => import('../pages/CurrencySettings'));
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

// src/routes/suspenseComponents.tsx
import { withSuspense } from '../utils/withSuspense';
import * as lazyComponents from './lazyRoutes';

// Création de composants avec Suspense intégré
// Composants essentiels (non lazy)
export const Layout = lazyComponents.Layout;
export const PortfolioTypeSelector = lazyComponents.PortfolioTypeSelector;
export const AuthCallback = lazyComponents.AuthCallback;
export const Dashboard = lazyComponents.Dashboard;

// Composants lazy avec Suspense
// Portfolios traditionnels
export const TraditionalPortfolio = withSuspense(lazyComponents.TraditionalPortfolio);
export const TraditionalPortfolioDetails = withSuspense(lazyComponents.TraditionalPortfolioDetails);
export const TraditionalPortfolioView = withSuspense(lazyComponents.TraditionalPortfolioView);

// Détails des opérations
export const CreditRequestDetails = withSuspense(lazyComponents.CreditRequestDetails);
export const CreditContractDetail = withSuspense(lazyComponents.CreditContractDetail);
export const CreditContractSchedulePage = withSuspense(lazyComponents.CreditContractSchedulePage);
export const DisbursementDetails = withSuspense(lazyComponents.DisbursementDetails);
export const RepaymentDetails = withSuspense(lazyComponents.RepaymentDetails);
export const GuaranteeDetails = withSuspense(lazyComponents.GuaranteeDetails);

// Pages administratives et d'assistance
export const Documentation = withSuspense(lazyComponents.Documentation);
export const Help = withSuspense(lazyComponents.Help);
export const Settings = withSuspense(lazyComponents.Settings);
export const Users = withSuspense(lazyComponents.Users);
export const Organization = withSuspense(lazyComponents.Organization);
export const InstitutionValidation = withSuspense(lazyComponents.InstitutionValidation);
export const CentralRisque = withSuspense(lazyComponents.CentralRisque);
export const PortfolioNotFound = withSuspense(lazyComponents.PortfolioNotFound);
export const PortfolioErrorBoundary = withSuspense(lazyComponents.PortfolioErrorBoundary);
export const ChatPage = withSuspense(lazyComponents.ChatPage);
export const Prospection = withSuspense(lazyComponents.Prospection);

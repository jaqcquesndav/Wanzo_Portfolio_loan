// src/routes/optimizedRouter.tsx
import { createBrowserRouter, Navigate } from 'react-router-dom';
import * as components from './suspenseComponents';
import Organization from '../pages/Organization';

// Création du routeur avec les composants optimisés (lazy loading avec Suspense)
export function createOptimizedRouter() {
  return createBrowserRouter([
    // Redirections pour accès direct aux menus globaux
    {
      path: '/settings',
      element: <Navigate to={(() => {
        const portfolioType = localStorage.getItem('portfolioType') || 'leasing';
        return `/app/${portfolioType}/settings`;
      })()} replace />
    },
    {
      path: '/users',
      element: <Navigate to={(() => {
        const portfolioType = localStorage.getItem('portfolioType') || 'leasing';
        return `/app/${portfolioType}/users`;
      })()} replace />
    },
    {
      path: '/institution',
      element: <Navigate to={(() => {
        const portfolioType = localStorage.getItem('portfolioType') || 'leasing';
        return `/app/${portfolioType}/institution`;
      })()} replace />
    },
    {
      path: '/docs',
      element: <Navigate to={(() => {
        const portfolioType = localStorage.getItem('portfolioType') || 'leasing';
        return `/app/${portfolioType}/docs`;
      })()} replace />
    },
    {
      path: '/help',
      element: <Navigate to={(() => {
        const portfolioType = localStorage.getItem('portfolioType') || 'leasing';
        return `/app/${portfolioType}/help`;
      })()} replace />
    },
    {
      path: '/',
      element: <components.PortfolioTypeSelector />
    },
    {
      path: '/auth/callback',
      element: <components.AuthCallback />
    },
    {
      path: '/institution/validation',
      element: <components.InstitutionValidation />
    },
    // Redirection dynamique pour /dashboard
    {
      path: '/dashboard',
      element: <Navigate to={(() => {
        const portfolioType = localStorage.getItem('portfolioType') || 'leasing';
        return `/app/${portfolioType}`;
      })()} replace />
    },
    // Route partagée pour la prospection
    {
      path: '/prospection',
      element: <Navigate to={(() => {
        const portfolioType = localStorage.getItem('portfolioType') || 'leasing';
        return `/app/${portfolioType}/prospection`;
      })()} replace />
    },
    // Route partagée pour la centrale de risque
    {
      path: '/central-risque',
      element: <Navigate to={(() => {
        const portfolioType = localStorage.getItem('portfolioType') || 'leasing';
        return `/app/${portfolioType}/central-risque`;
      })()} replace />
    },
    // Routes principales de l'application
    {
      path: '/app/:portfolioType',
      element: <components.Layout />,
      children: [
        { path: '', element: <components.Dashboard /> },
        // Traditional Portfolio
        { path: 'traditional/traditional/*', element: <Navigate to="/app/traditional" replace /> },
        { path: 'traditional', element: <components.TraditionalPortfolio /> },
        { path: 'traditional/:id', element: <components.TraditionalPortfolioDetails />, errorElement: <components.PortfolioErrorBoundary /> },
        { path: 'traditional/trad-1/guarantees/G001', element: <components.GuaranteeDetails />, errorElement: <components.PortfolioErrorBoundary /> },
        { path: 'traditional/:id/guarantees/:guaranteeId', element: <components.GuaranteeDetails />, errorElement: <components.PortfolioErrorBoundary /> },
        { path: 'traditional/guarantees/:guaranteeId', element: <components.GuaranteeDetails />, errorElement: <components.PortfolioErrorBoundary /> },
        { path: 'traditional/:portfolioId/guarantees/:guaranteeId', element: <components.GuaranteeDetails />, errorElement: <components.PortfolioErrorBoundary /> },
        { path: 'traditional/:id/view', element: <components.TraditionalPortfolioView /> },
        { path: 'traditional/view/:id', element: <components.TraditionalPortfolioView /> },
        // Métier detail routes
        { path: 'portfolio/:portfolioId/requests/:requestId', element: <components.CreditRequestDetails /> },
        { path: 'portfolio/:portfolioId/contracts/:contractId', element: <components.CreditContractDetail /> },
        { path: 'traditional/portfolio/:portfolioId/contracts/:contractId', element: <components.CreditContractDetail /> },
        { path: 'portfolio/:portfolioId/contracts/:contractId/schedule', element: <components.CreditContractSchedulePage /> },
        { path: 'traditional/portfolio/:portfolioId/contracts/:contractId/schedule', element: <components.CreditContractSchedulePage /> },
        { path: 'portfolio/:portfolioId/disbursements/:disbursementId', element: <components.DisbursementDetails /> },
        { path: 'portfolio/:portfolioId/repayments/:repaymentId', element: <components.RepaymentDetails /> },
        { path: 'portfolio/:portfolioId/guarantees/:guaranteeId', element: <components.GuaranteeDetails />, errorElement: <components.PortfolioErrorBoundary /> },
        { path: 'traditional/portfolio/:portfolioId/guarantees/:guaranteeId', element: <components.GuaranteeDetails />, errorElement: <components.PortfolioErrorBoundary /> },
        // Investment
        { path: 'investment', element: <components.InvestmentPortfolio /> },
        { path: 'investment/:id', element: <components.InvestmentPortfolioDetails />, errorElement: <components.PortfolioErrorBoundary /> },
        { path: 'assets/:assetId', element: <components.InvestmentAssetDetail />, errorElement: <components.PortfolioErrorBoundary /> },
        { path: 'subscriptions/:subscriptionId', element: <components.InvestmentSubscriptionDetail /> },
        { path: 'valuations/:valuationId', element: <components.InvestmentValuationDetail /> },
        { path: 'reporting/:reportId', element: <components.InvestmentReportingDetail /> },
        // Leasing
        { path: 'leasing', element: <components.LeasingPortfolio /> },
        { path: 'leasing/:id', element: <components.LeasingPortfolioDetails />, errorElement: <components.PortfolioErrorBoundary /> },
        { path: 'leasing/:id/equipments/:equipmentId', element: <components.LeasingEquipmentDetail />, errorElement: <components.PortfolioErrorBoundary /> },
        { path: 'leasing/:id/contracts/:contractId', element: <components.LeasingContractDetail />, errorElement: <components.PortfolioErrorBoundary /> },
        { path: 'leasing/:id/incidents/:incidentId', element: <components.LeasingIncidentDetail />, errorElement: <components.PortfolioErrorBoundary /> },
        { path: 'leasing/:id/maintenance/:maintenanceId', element: <components.LeasingMaintenanceDetail />, errorElement: <components.PortfolioErrorBoundary /> },
        { path: 'payments/:paymentId', element: <components.LeasingPaymentDetail />, errorElement: <components.PortfolioErrorBoundary /> },
        { path: 'reporting/:reportId', element: <components.LeasingReportingDetail />, errorElement: <components.PortfolioErrorBoundary /> },
        { path: 'reservations', element: <components.LeasingReservationsPage /> },
        { path: 'maintenance', element: <components.LeasingMaintenancePage /> },
        { path: 'incidents', element: <components.LeasingIncidentsPage /> },
        { path: 'movements', element: <components.LeasingMovementsPage /> },
        // Settings
        { path: 'settings', element: <components.Settings /> },
        // Administration
        { path: 'users', element: <components.Users /> },
        { path: 'institution', element: <Organization /> },
        { path: 'central-risque', element: <components.CentralRisque /> },
        // Prospection partagé
        { path: 'prospection', element: <components.Prospection /> },
        // Chat page
        { path: 'chat', element: <components.ChatPage /> },
        // Help & Documentation
        { path: 'docs', element: <components.Documentation /> },
        { path: 'help', element: <components.Help /> },
        // 404 Not Found pour les détails de portefeuille
        { path: 'traditional/*', element: <components.PortfolioNotFound /> },
        { path: 'investment/*', element: <components.PortfolioNotFound /> },
        { path: 'leasing/*', element: <components.PortfolioNotFound /> }
      ]
    }
  ]);
}

// Export du routeur
export const optimizedRouter = createOptimizedRouter();

// src/routes/createLazyRouter.tsx
import React from 'react';
import { createBrowserRouter, Navigate, RouteObject } from 'react-router-dom';
import { withSuspense } from '../utils/withSuspense';

// Import des composants avec lazy loading
import * as components from './lazyRoutes';

// Création des routes avec React.Suspense pour le lazy loading
export function createLazyRouter() {
  // Routes de haut niveau
  const routes: RouteObject[] = [
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
      element: React.createElement(withSuspense(components.InstitutionValidation))
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
        { path: 'traditional', element: React.createElement(withSuspense(components.TraditionalPortfolio)) },
        { path: 'traditional/:id', element: React.createElement(withSuspense(components.TraditionalPortfolioDetails)), errorElement: React.createElement(withSuspense(components.PortfolioErrorBoundary)) },
        { path: 'traditional/trad-1/guarantees/G001', element: React.createElement(withSuspense(components.GuaranteeDetails)), errorElement: React.createElement(withSuspense(components.PortfolioErrorBoundary)) },
        { path: 'traditional/:id/guarantees/:guaranteeId', element: React.createElement(withSuspense(components.GuaranteeDetails)), errorElement: React.createElement(withSuspense(components.PortfolioErrorBoundary)) },
        { path: 'traditional/guarantees/:guaranteeId', element: React.createElement(withSuspense(components.GuaranteeDetails)), errorElement: React.createElement(withSuspense(components.PortfolioErrorBoundary)) },
        { path: 'traditional/:portfolioId/guarantees/:guaranteeId', element: React.createElement(withSuspense(components.GuaranteeDetails)), errorElement: React.createElement(withSuspense(components.PortfolioErrorBoundary)) },
        { path: 'traditional/:id/view', element: React.createElement(withSuspense(components.TraditionalPortfolioView)) },
        { path: 'traditional/view/:id', element: React.createElement(withSuspense(components.TraditionalPortfolioView)) },
        // Métier detail routes
        { path: 'portfolio/:portfolioId/requests/:requestId', element: React.createElement(withSuspense(components.CreditRequestDetails)) },
        { path: 'portfolio/:portfolioId/contracts/:contractId', element: React.createElement(withSuspense(components.CreditContractDetail)) },
        { path: 'traditional/portfolio/:portfolioId/contracts/:contractId', element: React.createElement(withSuspense(components.CreditContractDetail)) },
        { path: 'portfolio/:portfolioId/contracts/:contractId/schedule', element: React.createElement(withSuspense(components.CreditContractSchedulePage)) },
        { path: 'traditional/portfolio/:portfolioId/contracts/:contractId/schedule', element: React.createElement(withSuspense(components.CreditContractSchedulePage)) },
        { path: 'portfolio/:portfolioId/disbursements/:disbursementId', element: React.createElement(withSuspense(components.DisbursementDetails)) },
        { path: 'portfolio/:portfolioId/repayments/:repaymentId', element: React.createElement(withSuspense(components.RepaymentDetails)) },
        { path: 'portfolio/:portfolioId/guarantees/:guaranteeId', element: React.createElement(withSuspense(components.GuaranteeDetails)), errorElement: React.createElement(withSuspense(components.PortfolioErrorBoundary)) },
        { path: 'traditional/portfolio/:portfolioId/guarantees/:guaranteeId', element: React.createElement(withSuspense(components.GuaranteeDetails)), errorElement: React.createElement(withSuspense(components.PortfolioErrorBoundary)) },
        // Investment
        { path: 'investment', element: React.createElement(withSuspense(components.InvestmentPortfolio)) },
        { path: 'investment/:id', element: React.createElement(withSuspense(components.InvestmentPortfolioDetails)), errorElement: React.createElement(withSuspense(components.PortfolioErrorBoundary)) },
        { path: 'assets/:assetId', element: React.createElement(withSuspense(components.InvestmentAssetDetail)), errorElement: React.createElement(withSuspense(components.PortfolioErrorBoundary)) },
        { path: 'subscriptions/:subscriptionId', element: React.createElement(withSuspense(components.InvestmentSubscriptionDetail)) },
        { path: 'valuations/:valuationId', element: React.createElement(withSuspense(components.InvestmentValuationDetail)) },
        { path: 'reporting/:reportId', element: React.createElement(withSuspense(components.InvestmentReportingDetail)) },
        // Leasing
        { path: 'leasing', element: React.createElement(withSuspense(components.LeasingPortfolio)) },
        { path: 'leasing/:id', element: React.createElement(withSuspense(components.LeasingPortfolioDetails)), errorElement: React.createElement(withSuspense(components.PortfolioErrorBoundary)) },
        { path: 'equipments/:equipmentId', element: React.createElement(withSuspense(components.LeasingEquipmentDetail)), errorElement: React.createElement(withSuspense(components.PortfolioErrorBoundary)) },
        { path: 'contracts/:contractId', element: React.createElement(withSuspense(components.LeasingContractDetail)), errorElement: React.createElement(withSuspense(components.PortfolioErrorBoundary)) },
        { path: 'incidents/:incidentId', element: React.createElement(withSuspense(components.LeasingIncidentDetail)), errorElement: React.createElement(withSuspense(components.PortfolioErrorBoundary)) },
        { path: 'maintenance/:maintenanceId', element: React.createElement(withSuspense(components.LeasingMaintenanceDetail)), errorElement: React.createElement(withSuspense(components.PortfolioErrorBoundary)) },
        { path: 'payments/:paymentId', element: React.createElement(withSuspense(components.LeasingPaymentDetail)), errorElement: React.createElement(withSuspense(components.PortfolioErrorBoundary)) },
        { path: 'reporting/:reportId', element: React.createElement(withSuspense(components.LeasingReportingDetail)), errorElement: React.createElement(withSuspense(components.PortfolioErrorBoundary)) },
        { path: 'reservations', element: React.createElement(withSuspense(components.LeasingReservationsPage)) },
        { path: 'maintenance', element: React.createElement(withSuspense(components.LeasingMaintenancePage)) },
        { path: 'incidents', element: React.createElement(withSuspense(components.LeasingIncidentsPage)) },
        { path: 'movements', element: React.createElement(withSuspense(components.LeasingMovementsPage)) },
        // Settings
        { path: 'settings', element: React.createElement(withSuspense(components.Settings)) },
        // Administration
        { path: 'users', element: React.createElement(withSuspense(components.Users)) },
        { path: 'institution', element: React.createElement(withSuspense(components.InstitutionManagement)) },
        { path: 'central-risque', element: React.createElement(withSuspense(components.CentralRisque)) },
        // Prospection partagé
        { path: 'prospection', element: React.createElement(withSuspense(components.Prospection)) },
        // Chat page
        { path: 'chat', element: React.createElement(withSuspense(components.ChatPage)) },
        // Help & Documentation
        { path: 'docs', element: React.createElement(withSuspense(components.Documentation)) },
        { path: 'help', element: React.createElement(withSuspense(components.Help)) },
        // 404 Not Found pour les détails de portefeuille
        { path: 'traditional/*', element: React.createElement(withSuspense(components.PortfolioNotFound)) },
        { path: 'investment/*', element: React.createElement(withSuspense(components.PortfolioNotFound)) },
        { path: 'leasing/*', element: React.createElement(withSuspense(components.PortfolioNotFound)) }
      ]
    }
  ];

  return createBrowserRouter(routes);
}

// Export du router
export const lazyRouter = createLazyRouter();

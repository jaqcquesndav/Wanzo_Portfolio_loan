import { createBrowserRouter, Navigate } from 'react-router-dom';
import { LazySuspendedComponents } from '../utils/lazySuspense';
import { Layout, PortfolioTypeSelector, AuthCallback, Dashboard } from './lazyRoutes';
import Organization from '../pages/Organization';

export const lazyRouter = createBrowserRouter([
  // Redirections pour accès direct aux menus globaux (settings, users, institution, docs, help)
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
    element: <PortfolioTypeSelector />
  },
  {
    path: '/auth/callback',
    element: <AuthCallback />
  },
  {
    path: '/institution/validation',
    element: <LazySuspendedComponents.InstitutionValidation />
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
  {
    path: '/app/:portfolioType',
    element: <Layout />, 
    children: [
      { path: '', element: <Dashboard /> },
      // Direct portfolio details route - handles /app/traditional/{portfolioId}
      { path: ':id', element: <LazySuspendedComponents.TraditionalPortfolioDetails />, errorElement: <LazySuspendedComponents.PortfolioErrorBoundary /> },
      // Traditional
      { path: 'traditional', element: <LazySuspendedComponents.TraditionalPortfolio /> },
      { path: 'traditional/:id', element: <LazySuspendedComponents.TraditionalPortfolioDetails />, errorElement: <LazySuspendedComponents.PortfolioErrorBoundary /> },
      { path: 'traditional/trad-1/guarantees/G001', element: <LazySuspendedComponents.GuaranteeDetails />, errorElement: <LazySuspendedComponents.PortfolioErrorBoundary /> },
      { path: 'traditional/:id/guarantees/:guaranteeId', element: <LazySuspendedComponents.GuaranteeDetails />, errorElement: <LazySuspendedComponents.PortfolioErrorBoundary /> },
      { path: 'traditional/guarantees/:guaranteeId', element: <LazySuspendedComponents.GuaranteeDetails />, errorElement: <LazySuspendedComponents.PortfolioErrorBoundary /> },
      { path: 'traditional/:portfolioId/guarantees/:guaranteeId', element: <LazySuspendedComponents.GuaranteeDetails />, errorElement: <LazySuspendedComponents.PortfolioErrorBoundary /> },
      { path: 'traditional/:id/view', element: <LazySuspendedComponents.TraditionalPortfolioView /> },
      { path: 'traditional/view/:id', element: <LazySuspendedComponents.TraditionalPortfolioView /> },
      // Métier detail routes (must be before :id and *)
      { path: 'portfolio/:portfolioId/requests/:requestId', element: <LazySuspendedComponents.CreditRequestDetails /> },
      { path: 'portfolio/:portfolioId/contracts/:contractId', element: <LazySuspendedComponents.CreditContractDetail /> },
      { path: 'traditional/portfolio/:portfolioId/contracts/:contractId', element: <LazySuspendedComponents.CreditContractDetail /> },
      { path: 'portfolio/:portfolioId/contracts/:contractId/schedule', element: <LazySuspendedComponents.CreditContractSchedulePage /> },
      { path: 'traditional/portfolio/:portfolioId/contracts/:contractId/schedule', element: <LazySuspendedComponents.CreditContractSchedulePage /> },
      { path: 'portfolio/:portfolioId/disbursements/:disbursementId', element: <LazySuspendedComponents.DisbursementDetails /> },
      { path: 'portfolio/:portfolioId/repayments/:repaymentId', element: <LazySuspendedComponents.RepaymentDetails /> },
      { path: 'portfolio/:portfolioId/guarantees/:guaranteeId', element: <LazySuspendedComponents.GuaranteeDetails />, errorElement: <LazySuspendedComponents.PortfolioErrorBoundary /> },
      { path: 'traditional/portfolio/:portfolioId/guarantees/:guaranteeId', element: <LazySuspendedComponents.GuaranteeDetails />, errorElement: <LazySuspendedComponents.PortfolioErrorBoundary /> },
      
      // Note: Les routes d'investment et leasing sont commentées car les composants ne sont pas disponibles
      // Décommenter après avoir créé les composants correspondants
      
      /*
      // Investment
      { path: 'investment', element: <LazySuspendedComponents.InvestmentPortfolio /> },
      { path: 'investment/:id', element: <LazySuspendedComponents.InvestmentPortfolioDetails />, errorElement: <LazySuspendedComponents.PortfolioErrorBoundary /> },
      { path: 'assets/:assetId', element: <LazySuspendedComponents.InvestmentAssetDetail />, errorElement: <LazySuspendedComponents.PortfolioErrorBoundary /> },
      { path: 'subscriptions/:subscriptionId', element: <LazySuspendedComponents.InvestmentSubscriptionDetail /> },
      { path: 'valuations/:valuationId', element: <LazySuspendedComponents.InvestmentValuationDetail /> },
      { path: 'reporting/:reportId', element: <LazySuspendedComponents.InvestmentReportingDetail /> },
      
      // Leasing
      { path: 'leasing', element: <LazySuspendedComponents.LeasingPortfolio /> },
      { path: 'leasing/:id', element: <LazySuspendedComponents.LeasingPortfolioDetails />, errorElement: <LazySuspendedComponents.PortfolioErrorBoundary /> },
      { path: 'equipments/:equipmentId', element: <LazySuspendedComponents.LeasingEquipmentDetail />, errorElement: <LazySuspendedComponents.PortfolioErrorBoundary /> },
      { path: 'contracts/:contractId', element: <LazySuspendedComponents.LeasingContractDetail />, errorElement: <LazySuspendedComponents.PortfolioErrorBoundary /> },
      { path: 'incidents/:incidentId', element: <LazySuspendedComponents.LeasingIncidentDetail />, errorElement: <LazySuspendedComponents.PortfolioErrorBoundary /> },
      { path: 'maintenance/:maintenanceId', element: <LazySuspendedComponents.LeasingMaintenanceDetail />, errorElement: <LazySuspendedComponents.PortfolioErrorBoundary /> },
      { path: 'payments/:paymentId', element: <LazySuspendedComponents.LeasingPaymentDetail />, errorElement: <LazySuspendedComponents.PortfolioErrorBoundary /> },
      { path: 'reporting/:reportId', element: <LazySuspendedComponents.LeasingReportingDetail />, errorElement: <LazySuspendedComponents.PortfolioErrorBoundary /> },
      */
      
      /*
      // Pages supplémentaires de leasing qui n'existent pas encore
      { path: 'reservations', element: <LazySuspendedComponents.LeasingReservationsPage /> },
      { path: 'maintenance', element: <LazySuspendedComponents.LeasingMaintenancePage /> },
      { path: 'incidents', element: <LazySuspendedComponents.LeasingIncidentsPage /> },
      { path: 'movements', element: <LazySuspendedComponents.LeasingMovementsPage /> },
      */
      
      // Settings
      { path: 'settings', element: <LazySuspendedComponents.Settings /> },
      // Administration
      { path: 'users', element: <LazySuspendedComponents.Users /> },
      { path: 'institution', element: <Organization /> },
      { path: 'central-risque', element: <LazySuspendedComponents.CentralRisque /> },
      // Prospection partagé
      { path: 'prospection', element: <LazySuspendedComponents.Prospection /> },
      // Chat page
      { path: 'chat', element: <LazySuspendedComponents.ChatPage /> },
      // Help & Documentation
      { path: 'docs', element: <LazySuspendedComponents.Documentation /> },
      { path: 'help', element: <LazySuspendedComponents.Help /> },
      // 404 Not Found pour les détails de portefeuille
      // Les routes catch-all doivent être à la toute fin pour ne pas intercepter les routes métier
      { path: 'traditional/*', element: <LazySuspendedComponents.PortfolioNotFound /> }
      // Note: Les routes de fallback pour investment et leasing sont commentées
      // { path: 'investment/*', element: <LazySuspendedComponents.PortfolioNotFound /> },
      // { path: 'leasing/*', element: <LazySuspendedComponents.PortfolioNotFound /> }
    ]
  }
]);

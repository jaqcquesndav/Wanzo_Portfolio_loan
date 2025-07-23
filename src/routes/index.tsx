import LeasingEquipmentDetail from '../pages/leasing/LeasingEquipmentDetail';
import LeasingContractDetail from '../pages/LeasingContractDetail';
import LeasingIncidentDetail from '../pages/leasing/LeasingIncidentDetail';
import LeasingMaintenanceDetail from '../pages/leasing/LeasingMaintenanceDetail';
import LeasingPaymentDetail from '../pages/leasing/LeasingPaymentDetail';
import LeasingReportingDetail from '../pages/leasing/LeasingReportingDetail';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import PortfolioTypeSelector from '../pages/PortfolioTypeSelector';
import AuthCallback from '../pages/AuthCallback';
// import LoginForm from '../components/auth/LoginForm';
import InstitutionValidation from '../pages/InstitutionValidation';
import Dashboard from '../pages/Dashboard';
import Prospection from '../pages/Prospection';
import TraditionalPortfolio from '../pages/TraditionalPortfolio';
import TraditionalPortfolioDetails from '../pages/TraditionalPortfolioDetails';
import { TraditionalPortfolioView } from '../pages/TraditionalPortfolioView';
import InvestmentPortfolio from '../pages/InvestmentPortfolio';
import InvestmentPortfolioDetails from '../pages/InvestmentPortfolioDetails';
import InvestmentAssetDetail from '../pages/InvestmentAssetDetail';
import InvestmentSubscriptionDetail from '../pages/InvestmentSubscriptionDetail';
import InvestmentValuationDetail from '../pages/InvestmentValuationDetail';
import InvestmentReportingDetail from '../pages/InvestmentReportingDetail';
import LeasingPortfolio from '../pages/LeasingPortfolio';
import LeasingPortfolioDetails from '../pages/LeasingPortfolioDetails';
import LeasingReservationsPage from '../pages/leasing/LeasingReservationsPage';
import LeasingMaintenancePage from '../pages/leasing/LeasingMaintenancePage';
import LeasingIncidentsPage from '../pages/leasing/LeasingIncidentsPage';
import LeasingMovementsPage from '../pages/leasing/LeasingMovementsPage';
// Imports d'opérations supprimés
import CreditRequestDetails from '../pages/CreditRequestDetails';
import CreditContractDetail from '../pages/CreditContractDetail';
import CreditContractSchedulePage from '../pages/CreditContractSchedulePage';
import DisbursementDetails from '../pages/DisbursementDetails';
import RepaymentDetails from '../pages/RepaymentDetails';
import GuaranteeDetails from '../pages/GuaranteeDetails';

import Documentation from '../pages/Documentation';
import Help from '../pages/Help';
import Settings from '../pages/Settings';
import Users from '../pages/Users';
import Organization from '../pages/Organization';
import CentralRisque from '../pages/CentralRisque';
import PortfolioNotFound from '../pages/PortfolioNotFound';
import PortfolioErrorBoundary from '../pages/PortfolioErrorBoundary';
import { ChatPage } from '../pages/chat/ChatPage';


export const router = createBrowserRouter([
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
    element: <InstitutionValidation />
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
      // Traditional
      // Gérer le cas où "traditional" est répété dans l'URL (doit être avant les autres routes)
      { path: 'traditional/traditional/*', element: <Navigate to="/app/traditional" replace /> },
      { path: 'traditional', element: <TraditionalPortfolio /> },
      { path: 'traditional/:id', element: <TraditionalPortfolioDetails />, errorElement: <PortfolioErrorBoundary /> },
      // Route spécifique pour le cas particulier de trad-1/guarantees/G001
      { path: 'traditional/trad-1/guarantees/G001', element: <GuaranteeDetails />, errorElement: <PortfolioErrorBoundary /> },
      // Routes génériques pour les garanties
      { path: 'traditional/:id/guarantees/:guaranteeId', element: <GuaranteeDetails />, errorElement: <PortfolioErrorBoundary /> },
      { path: 'traditional/guarantees/:guaranteeId', element: <GuaranteeDetails />, errorElement: <PortfolioErrorBoundary /> },
      // Route additionnelle pour correspondre au format exact utilisé dans useGuaranteeActions
      { path: 'traditional/:portfolioId/guarantees/:guaranteeId', element: <GuaranteeDetails />, errorElement: <PortfolioErrorBoundary /> },
      { path: 'traditional/:id/view', element: <TraditionalPortfolioView /> },
      { path: 'traditional/view/:id', element: <TraditionalPortfolioView /> },
      // Métier detail routes (must be before :id and *)
      { path: 'portfolio/:portfolioId/requests/:requestId', element: <CreditRequestDetails /> },
      { path: 'portfolio/:portfolioId/contracts/:contractId', element: <CreditContractDetail /> },
      { path: 'traditional/portfolio/:portfolioId/contracts/:contractId', element: <CreditContractDetail /> },
      { path: 'portfolio/:portfolioId/contracts/:contractId/schedule', element: <CreditContractSchedulePage /> },
      { path: 'traditional/portfolio/:portfolioId/contracts/:contractId/schedule', element: <CreditContractSchedulePage /> },
      { path: 'portfolio/:portfolioId/disbursements/:disbursementId', element: <DisbursementDetails /> },
      { path: 'portfolio/:portfolioId/repayments/:repaymentId', element: <RepaymentDetails /> },
      { path: 'portfolio/:portfolioId/guarantees/:guaranteeId', element: <GuaranteeDetails />, errorElement: <PortfolioErrorBoundary /> },
      // Route de fallback garantie pour compatibilité
      { path: 'traditional/portfolio/:portfolioId/guarantees/:guaranteeId', element: <GuaranteeDetails />, errorElement: <PortfolioErrorBoundary /> },
      // Investment
      { path: 'investment', element: <InvestmentPortfolio /> },
      { path: 'investment/:id', element: <InvestmentPortfolioDetails />, errorElement: <PortfolioErrorBoundary /> },
      { path: 'assets/:assetId', element: <InvestmentAssetDetail />, errorElement: <PortfolioErrorBoundary /> },
      { path: 'subscriptions/:subscriptionId', element: <InvestmentSubscriptionDetail /> },
      { path: 'valuations/:valuationId', element: <InvestmentValuationDetail /> },
      { path: 'reporting/:reportId', element: <InvestmentReportingDetail /> },
      // Leasing
      { path: 'leasing', element: <LeasingPortfolio /> },
      { path: 'leasing/:id', element: <LeasingPortfolioDetails />, errorElement: <PortfolioErrorBoundary /> },
      { path: 'leasing/:id/equipments/:equipmentId', element: <LeasingEquipmentDetail />, errorElement: <PortfolioErrorBoundary /> },
      { path: 'leasing/:id/contracts/:contractId', element: <LeasingContractDetail />, errorElement: <PortfolioErrorBoundary /> },
      { path: 'leasing/:id/incidents/:incidentId', element: <LeasingIncidentDetail />, errorElement: <PortfolioErrorBoundary /> },
      { path: 'leasing/:id/maintenance/:maintenanceId', element: <LeasingMaintenanceDetail />, errorElement: <PortfolioErrorBoundary /> },
      { path: 'leasing/:id/payments/:paymentId', element: <LeasingPaymentDetail />, errorElement: <PortfolioErrorBoundary /> },
      { path: 'leasing/:id/reporting/:reportId', element: <LeasingReportingDetail />, errorElement: <PortfolioErrorBoundary /> },
      { path: 'reservations', element: <LeasingReservationsPage /> },
      { path: 'maintenance', element: <LeasingMaintenancePage /> },
      { path: 'incidents', element: <LeasingIncidentsPage /> },
      { path: 'movements', element: <LeasingMovementsPage /> },
      // Operations - Supprimées
      // Settings
      { path: 'settings', element: <Settings /> },
      // Administration
      { path: 'users', element: <Users /> },
      { path: 'institution', element: <Organization /> },
      { path: 'central-risque', element: <CentralRisque /> },
      // Prospection partagé
      { path: 'prospection', element: <Prospection /> },
      // Chat page
      { path: 'chat', element: <ChatPage /> },
      // Help & Documentation
      { path: 'docs', element: <Documentation /> },
      { path: 'help', element: <Help /> },
      // 404 Not Found pour les détails de portefeuille
      // Les routes catch-all doivent être à la toute fin pour ne pas intercepter les routes métier
      { path: 'traditional/*', element: <PortfolioNotFound /> },
      { path: 'investment/*', element: <PortfolioNotFound /> },
      { path: 'leasing/*', element: <PortfolioNotFound /> }
    ]
  }
]);
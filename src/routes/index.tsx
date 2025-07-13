import LeasingEquipmentDetail from '../pages/leasing/LeasingEquipmentDetail';
import LeasingContractDetail from '../pages/leasing/LeasingContractDetail';
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
import DisbursementDetails from '../pages/DisbursementDetails';
import RepaymentDetails from '../pages/RepaymentDetails';
import GuaranteeDetails from '../pages/GuaranteeDetails';

import Documentation from '../pages/Documentation';
import Help from '../pages/Help';
import Settings from '../pages/Settings';
import Users from '../pages/Users';
import InstitutionManagement from '../pages/InstitutionManagement';
import CentralRisque from '../pages/CentralRisque';
import ReportTypeRouter from '../pages/ReportTypeRouter';
import FinancialReports from '../pages/reports/Financial';
import InvestmentReports from '../pages/reports/Investment';
import RiskReports from '../pages/reports/Risk';
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
    path: '/reports',
    element: <Navigate to={(() => {
      const portfolioType = localStorage.getItem('portfolioType') || 'leasing';
      return `/app/${portfolioType}/reports`;
    })()} replace />
  },
  {
    path: '/reports/financial',
    element: <Navigate to={(() => {
      const portfolioType = localStorage.getItem('portfolioType') || 'leasing';
      return `/app/${portfolioType}/reports/financial`;
    })()} replace />
  },
  {
    path: '/reports/investment',
    element: <Navigate to={(() => {
      const portfolioType = localStorage.getItem('portfolioType') || 'leasing';
      return `/app/${portfolioType}/reports/investment`;
    })()} replace />
  },
  {
    path: '/reports/risk',
    element: <Navigate to={(() => {
      const portfolioType = localStorage.getItem('portfolioType') || 'leasing';
      return `/app/${portfolioType}/reports/risk`;
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
      { path: 'traditional', element: <TraditionalPortfolio /> },
      { path: 'traditional/:id', element: <TraditionalPortfolioDetails />, errorElement: <PortfolioErrorBoundary /> },
      // Métier detail routes (must be before :id and *)
      { path: 'portfolio/:portfolioId/requests/:requestId', element: <CreditRequestDetails /> },
      { path: 'portfolio/:portfolioId/disbursements/:disbursementId', element: <DisbursementDetails /> },
      { path: 'portfolio/:portfolioId/repayments/:repaymentId', element: <RepaymentDetails /> },
      { path: 'portfolio/:portfolioId/guarantees/:guaranteeId', element: <GuaranteeDetails /> },
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
      { path: 'equipments/:equipmentId', element: <LeasingEquipmentDetail />, errorElement: <PortfolioErrorBoundary /> },
      { path: 'contracts/:contractId', element: <LeasingContractDetail />, errorElement: <PortfolioErrorBoundary /> },
      { path: 'incidents/:incidentId', element: <LeasingIncidentDetail />, errorElement: <PortfolioErrorBoundary /> },
      { path: 'maintenance/:maintenanceId', element: <LeasingMaintenanceDetail />, errorElement: <PortfolioErrorBoundary /> },
      { path: 'payments/:paymentId', element: <LeasingPaymentDetail />, errorElement: <PortfolioErrorBoundary /> },
      { path: 'reporting/:reportId', element: <LeasingReportingDetail />, errorElement: <PortfolioErrorBoundary /> },
      { path: 'reservations', element: <LeasingReservationsPage /> },
      { path: 'maintenance', element: <LeasingMaintenancePage /> },
      { path: 'incidents', element: <LeasingIncidentsPage /> },
      { path: 'movements', element: <LeasingMovementsPage /> },
      // Operations - Supprimées
      // Settings
      { path: 'settings', element: <Settings /> },
      // Administration
      { path: 'users', element: <Users /> },
      { path: 'institution', element: <InstitutionManagement /> },
      { path: 'central-risque', element: <CentralRisque /> },
      // Prospection partagé
      { path: 'prospection', element: <Prospection /> },
      // Chat page
      { path: 'chat', element: <ChatPage /> },
      // Help & Documentation
      { path: 'docs', element: <Documentation /> },
      { path: 'help', element: <Help /> },
      // Rapports - Utilise le routeur de rapports qui sélectionne le bon composant selon le type de portefeuille
      { path: 'reports', element: <ReportTypeRouter /> },
      { path: 'reports/financial', element: <FinancialReports /> },
      { path: 'reports/investment', element: <InvestmentReports /> },
      { path: 'reports/risk', element: <RiskReports /> },
      // 404 Not Found pour les détails de portefeuille
      // Les routes catch-all doivent être à la toute fin pour ne pas intercepter les routes métier
      { path: 'traditional/*', element: <PortfolioNotFound /> },
      { path: 'investment/*', element: <PortfolioNotFound /> },
      { path: 'leasing/*', element: <PortfolioNotFound /> }
    ]
  }
]);
import { createBrowserRouter } from 'react-router-dom';
import PortfolioTypeSelector from '../pages/PortfolioTypeSelector';
import Layout from '../components/layout/Layout';
import Dashboard from '../pages/Dashboard';
import TraditionalPortfolio from '../pages/TraditionalPortfolio';
import TraditionalPortfolioDetails from '../pages/TraditionalPortfolioDetails';
import { TraditionalPortfolioView } from '../pages/TraditionalPortfolioView';
import InvestmentPortfolio from '../pages/InvestmentPortfolio';
import InvestmentPortfolioDetails from '../pages/InvestmentPortfolioDetails';
import LeasingPortfolio from '../pages/LeasingPortfolio';
import LeasingPortfolioDetails from '../pages/LeasingPortfolioDetails';
import GuaranteeDetails from '../pages/GuaranteeDetails';
import PortfolioErrorBoundary from '../pages/PortfolioErrorBoundary';
import CreditRequestDetails from '../pages/CreditRequestDetails';
import CreditContractDetail from '../pages/CreditContractDetail';
import CreditContractSchedulePage from '../pages/CreditContractSchedulePage';
import DisbursementDetails from '../pages/DisbursementDetails';
import RepaymentDetails from '../pages/RepaymentDetails';
import Documentation from '../pages/Documentation';
import Help from '../pages/Help';
import Settings from '../pages/Settings';
import Users from '../pages/Users';
import InstitutionManagement from '../pages/InstitutionManagement';
import CentralRisque from '../pages/CentralRisque';
import PortfolioNotFound from '../pages/PortfolioNotFound';
import { ChatPage } from '../pages/chat/ChatPage';
import Prospection from '../pages/Prospection';
import { Navigate } from 'react-router-dom';

// Importations spécifiques au leasing
import LeasingEquipmentDetail from '../pages/leasing/LeasingEquipmentDetail';
import LeasingContractDetail from '../pages/leasing/LeasingContractDetail';
import LeasingIncidentDetail from '../pages/leasing/LeasingIncidentDetail';
import LeasingMaintenanceDetail from '../pages/leasing/LeasingMaintenanceDetail';
import LeasingPaymentDetail from '../pages/leasing/LeasingPaymentDetail';
import LeasingReportingDetail from '../pages/leasing/LeasingReportingDetail';
import LeasingReservationsPage from '../pages/leasing/LeasingReservationsPage';
import LeasingMaintenancePage from '../pages/leasing/LeasingMaintenancePage';
import LeasingIncidentsPage from '../pages/leasing/LeasingIncidentsPage';
import LeasingMovementsPage from '../pages/leasing/LeasingMovementsPage';

// Importations spécifiques à l'investissement
import InvestmentAssetDetail from '../pages/InvestmentAssetDetail';
import InvestmentSubscriptionDetail from '../pages/InvestmentSubscriptionDetail';
import InvestmentValuationDetail from '../pages/InvestmentValuationDetail';
import InvestmentReportingDetail from '../pages/InvestmentReportingDetail';

// Autres importations
import AuthCallback from '../pages/AuthCallback';
import InstitutionValidation from '../pages/InstitutionValidation';

// Définition du routeur avec les routes
export const router = createBrowserRouter([
  // Route de base et page d'accueil
  {
    path: '/',
    element: <PortfolioTypeSelector />
  },
  
  // Route spécifique pour tester et résoudre le problème 404
  {
    path: '/guarantee-test',
    element: <GuaranteeDetails />
  },
  
  // Routes d'authentification et validation
  {
    path: '/auth/callback',
    element: <AuthCallback />
  },
  {
    path: '/institution-validation',
    element: <InstitutionValidation />
  },
  
  // Redirections vers les sections de l'application
  {
    path: '/settings',
    element: <Navigate to="/app/traditional/settings" replace />
  },
  {
    path: '/users',
    element: <Navigate to="/app/traditional/users" replace />
  },
  {
    path: '/institution',
    element: <Navigate to="/app/traditional/institution" replace />
  },
  {
    path: '/docs',
    element: <Navigate to="/app/traditional/docs" replace />
  },
  {
    path: '/help',
    element: <Navigate to="/app/traditional/help" replace />
  },
  {
    path: '/dashboard',
    element: <Navigate to="/app/traditional" replace />
  },
  {
    path: '/prospection',
    element: <Navigate to="/app/traditional/prospection" replace />
  },
  {
    path: '/central-risque',
    element: <Navigate to="/app/traditional/central-risque" replace />
  },
  
  // Principales routes de l'application avec Layout
  {
    path: '/app/:portfolioType',
    element: <Layout />,
    errorElement: <div>Une erreur est survenue dans l'application</div>,
    children: [
      // Dashboard
      { path: '', element: <Dashboard /> },
      
      // Routes pour le portefeuille traditionnel
      { path: 'traditional/traditional/*', element: <Navigate to="/app/traditional" replace /> },
      { path: 'traditional', element: <TraditionalPortfolio /> },
      { path: 'traditional/:id', element: <TraditionalPortfolioDetails />, errorElement: <PortfolioErrorBoundary /> },
      
      // Routes pour les garanties - avec routes explicites pour le débogage
      { path: 'traditional/:id/guarantees/:guaranteeId', element: <GuaranteeDetails />, errorElement: <PortfolioErrorBoundary /> },
      { path: 'traditional/guarantees/:guaranteeId', element: <GuaranteeDetails />, errorElement: <PortfolioErrorBoundary /> },
      { path: 'traditional/trad-1/guarantees/G001', element: <GuaranteeDetails />, errorElement: <PortfolioErrorBoundary /> },
      { path: 'traditional/trad-1/guarantees/G002', element: <GuaranteeDetails />, errorElement: <PortfolioErrorBoundary /> },
      { path: 'traditional/trad-1/guarantees/G003', element: <GuaranteeDetails />, errorElement: <PortfolioErrorBoundary /> },
      { path: 'traditional/:portfolioId/guarantees/:guaranteeId', element: <GuaranteeDetails />, errorElement: <PortfolioErrorBoundary /> },
      
      // Routes pour les vues des portefeuilles traditionnels
      { path: 'traditional/:id/view', element: <TraditionalPortfolioView /> },
      { path: 'traditional/view/:id', element: <TraditionalPortfolioView /> },
      
      // Routes pour les détails métier
      { path: 'portfolio/:portfolioId/requests/:requestId', element: <CreditRequestDetails /> },
      { path: 'portfolio/:portfolioId/contracts/:contractId', element: <CreditContractDetail /> },
      { path: 'traditional/portfolio/:portfolioId/contracts/:contractId', element: <CreditContractDetail /> },
      { path: 'portfolio/:portfolioId/contracts/:contractId/schedule', element: <CreditContractSchedulePage /> },
      { path: 'traditional/portfolio/:portfolioId/contracts/:contractId/schedule', element: <CreditContractSchedulePage /> },
      { path: 'portfolio/:portfolioId/disbursements/:disbursementId', element: <DisbursementDetails /> },
      { path: 'portfolio/:portfolioId/repayments/:repaymentId', element: <RepaymentDetails /> },
      { path: 'portfolio/:portfolioId/guarantees/:guaranteeId', element: <GuaranteeDetails /> },
      
      // Routes pour l'investissement
      { path: 'investment', element: <InvestmentPortfolio /> },
      { path: 'investment/:id', element: <InvestmentPortfolioDetails />, errorElement: <PortfolioErrorBoundary /> },
      { path: 'assets/:assetId', element: <InvestmentAssetDetail />, errorElement: <PortfolioErrorBoundary /> },
      { path: 'subscriptions/:subscriptionId', element: <InvestmentSubscriptionDetail /> },
      { path: 'valuations/:valuationId', element: <InvestmentValuationDetail /> },
      { path: 'reporting/:reportId', element: <InvestmentReportingDetail /> },
      
      // Routes pour le leasing
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
      
      // Pages de paramètres et administration
      { path: 'settings', element: <Settings /> },
      { path: 'users', element: <Users /> },
      { path: 'institution', element: <InstitutionManagement /> },
      { path: 'central-risque', element: <CentralRisque /> },
      
      // Autres pages
      { path: 'prospection', element: <Prospection /> },
      { path: 'chat', element: <ChatPage /> },
      { path: 'docs', element: <Documentation /> },
      { path: 'help', element: <Help /> },
      
      // Pages d'erreur 404
      { path: 'traditional/*', element: <PortfolioNotFound /> },
      { path: 'investment/*', element: <PortfolioNotFound /> },
      { path: 'leasing/*', element: <PortfolioNotFound /> }
    ]
  }
]);

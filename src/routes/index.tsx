import { createBrowserRouter, Navigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import PortfolioTypeSelector from '../pages/PortfolioTypeSelector';
import AuthCallback from '../pages/AuthCallback';
import InstitutionValidation from '../pages/InstitutionValidation';
import Dashboard from '../pages/Dashboard';
import Prospection from '../pages/Prospection';
import TraditionalPortfolio from '../pages/TraditionalPortfolio';
import TraditionalPortfolioDetails from '../pages/TraditionalPortfolioDetails';
import { TraditionalPortfolioView } from '../pages/TraditionalPortfolioView';
import CreditRequestDetails from '../pages/CreditRequestDetails';
import CreditContractDetail from '../pages/CreditContractDetail';
import CreditContractSchedulePage from '../pages/CreditContractSchedulePage';
import DisbursementDetails from '../pages/DisbursementDetails';
import RepaymentDetails from '../pages/RepaymentDetails';
import GuaranteeDetails from '../pages/GuaranteeDetails';
import OperationNotFound from '../pages/OperationNotFound';

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
    element: <Navigate to="/app/traditional" replace />
  },
  // Route partagée pour la prospection
  {
    path: '/prospection',
    element: <Navigate to="/app/traditional/prospection" replace />
  },
  // Route partagée pour la centrale de risque
  {
    path: '/central-risque',
    element: <Navigate to="/app/traditional/central-risque" replace />
  },
  {
    path: '/app/:portfolioType',
    element: <Layout />, 
    children: [
      { path: '', element: <Dashboard /> },
      // Traditional
      // Gérer le cas où "traditional" est répété dans l'URL (doit être avant les autres routes)
      { path: 'traditional/traditional/:id', element: <TraditionalPortfolioView /> },
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
      { path: 'portfolio/:portfolioId/requests/:requestId', element: <CreditRequestDetails />, errorElement: <OperationNotFound /> },
      { path: 'portfolio/:portfolioId/contracts/:contractId', element: <CreditContractDetail />, errorElement: <OperationNotFound /> },
      { path: 'traditional/portfolio/:portfolioId/contracts/:contractId', element: <CreditContractDetail />, errorElement: <OperationNotFound /> },
      { path: 'portfolio/:portfolioId/contracts/:contractId/schedule', element: <CreditContractSchedulePage />, errorElement: <OperationNotFound /> },
      { path: 'traditional/portfolio/:portfolioId/contracts/:contractId/schedule', element: <CreditContractSchedulePage />, errorElement: <OperationNotFound /> },
      { path: 'portfolio/:portfolioId/disbursements/:disbursementId', element: <DisbursementDetails />, errorElement: <OperationNotFound /> },
      { path: 'portfolio/:portfolioId/repayments/:repaymentId', element: <RepaymentDetails />, errorElement: <OperationNotFound /> },
      { path: 'portfolio/:portfolioId/guarantees/:guaranteeId', element: <GuaranteeDetails />, errorElement: <OperationNotFound /> },
      // Route de fallback garantie pour compatibilité
      { path: 'traditional/portfolio/:portfolioId/guarantees/:guaranteeId', element: <GuaranteeDetails />, errorElement: <OperationNotFound /> },
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
      { path: 'traditional/*', element: <PortfolioNotFound /> }
    ]
  }
]);
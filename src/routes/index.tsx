import { createBrowserRouter, Navigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import PortfolioTypeSelector from '../pages/PortfolioTypeSelector';
import AuthCallback from '../pages/AuthCallback';
import AuthDebug from '../pages/AuthDebug';
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
import CompanyViewPage from '../pages/CompanyViewPage';


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
    path: '/auth/debug',
    element: <AuthDebug />
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
      
      // ==========================================
      // COMPANY ROUTES - Must be FIRST to prevent capture by traditional/:id
      // ==========================================
      { path: 'company/:id/view', element: <CompanyViewPage /> },
      
      // ==========================================
      // DIRECT PORTFOLIO DETAILS ROUTE
      // Handles /app/traditional/{portfolioId} navigation from sidebar
      // ==========================================
      { path: ':id', element: <TraditionalPortfolioDetails />, errorElement: <PortfolioErrorBoundary /> },
      
      // ==========================================
      // TRADITIONAL PORTFOLIO ROUTES
      // Order matters: specific routes BEFORE generic catch-all routes
      // ==========================================
      // Specific routes with exact paths (highest priority)
      { path: 'traditional', element: <TraditionalPortfolio /> },
      { path: 'traditional/trad-1/guarantees/G001', element: <GuaranteeDetails />, errorElement: <PortfolioErrorBoundary /> },
      
      // Routes with multiple segments (medium priority)
      { path: 'traditional/view/:id', element: <TraditionalPortfolioView /> },
      { path: 'traditional/:id/view', element: <TraditionalPortfolioView /> },
      { path: 'traditional/:id/guarantees/:guaranteeId', element: <GuaranteeDetails />, errorElement: <PortfolioErrorBoundary /> },
      { path: 'traditional/guarantees/:guaranteeId', element: <GuaranteeDetails />, errorElement: <PortfolioErrorBoundary /> },
      { path: 'traditional/:portfolioId/guarantees/:guaranteeId', element: <GuaranteeDetails />, errorElement: <PortfolioErrorBoundary /> },
      
      // Generic catch-all route (LOWEST priority - must be LAST)
      { path: 'traditional/:id', element: <TraditionalPortfolioDetails />, errorElement: <PortfolioErrorBoundary /> },
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
      // ✅ FIX: Removed traditional/* catch-all route that was blocking company/:id/view
      // The specific routes above handle all traditional portfolio paths
    ]
  }
]);
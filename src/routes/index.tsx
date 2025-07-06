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
import LeasingPortfolio from '../pages/LeasingPortfolio';
import LeasingPortfolioDetails from '../pages/LeasingPortfolioDetails';
import LeasingReservationsPage from '../pages/leasing/LeasingReservationsPage';
import LeasingMaintenancePage from '../pages/leasing/LeasingMaintenancePage';
import LeasingIncidentsPage from '../pages/leasing/LeasingIncidentsPage';
import LeasingMovementsPage from '../pages/leasing/LeasingMovementsPage';
import Operations from '../pages/Operations';
import { Requests } from '../pages/operations/Requests';
import OperationValidation from '../pages/operations/Validation';
import OperationHistory from '../pages/operations/History';
import RequestDetails from '../pages/operations/RequestDetails';
import RequestValidation from '../pages/operations/RequestValidation';
import WorkflowCreation from '../pages/operations/WorkflowCreation';
import Workflows from '../pages/operations/Workflows';
import Documentation from '../pages/Documentation';
import Help from '../pages/Help';
import Settings from '../pages/Settings';
import Users from '../pages/Users';
import InstitutionManagement from '../pages/InstitutionManagement';
import CentralRisque from '../pages/CentralRisque';
import ReportKPIDetail from '../pages/ReportKPIDetail';
import Reports from '../pages/Reports';
import FinancialReports from '../pages/reports/Financial';
import InvestmentReports from '../pages/reports/Investment';
import RiskReports from '../pages/reports/Risk';
import PortfolioNotFound from '../pages/PortfolioNotFound';
import PortfolioErrorBoundary from '../pages/PortfolioErrorBoundary';


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
      { path: 'traditional', element: <TraditionalPortfolio /> },
      { path: ':id', element: <TraditionalPortfolioDetails />, errorElement: <PortfolioErrorBoundary /> },
      // Investment
      { path: 'investment', element: <InvestmentPortfolio /> },
      { path: ':id', element: <InvestmentPortfolioDetails />, errorElement: <PortfolioErrorBoundary /> },
      // Leasing
      { path: 'leasing', element: <LeasingPortfolio /> },
      { path: ':id', element: <LeasingPortfolioDetails />, errorElement: <PortfolioErrorBoundary /> },
      { path: 'leasing/reservations', element: <LeasingReservationsPage /> },
      { path: 'leasing/maintenance', element: <LeasingMaintenancePage /> },
      { path: 'leasing/incidents', element: <LeasingIncidentsPage /> },
      { path: 'leasing/movements', element: <LeasingMovementsPage /> },
      // Operations
      { path: 'operations', element: <Operations /> },
      { path: 'operations/requests', element: <Requests /> },
      { path: 'operations/requests/:id', element: <RequestDetails /> },
      { path: 'operations/validation', element: <OperationValidation /> },
      { path: 'operations/validation/:id', element: <RequestValidation /> },
      { path: 'operations/workflows', element: <Workflows /> },
      { path: 'operations/workflows/new', element: <WorkflowCreation /> },
      { path: 'operations/history', element: <OperationHistory /> },
      // Settings
      { path: 'settings', element: <Settings /> },
      // Administration
      { path: 'users', element: <Users /> },
      { path: 'institution', element: <InstitutionManagement /> },
      { path: 'central-risque', element: <CentralRisque /> },
      // Prospection partagé
      { path: 'prospection', element: <Prospection /> },
      // Help & Documentation
      { path: 'docs', element: <Documentation /> },
      { path: 'help', element: <Help /> },
      // Rapports
      { path: 'reports', element: <Reports /> },
      { path: 'reports/financial', element: <FinancialReports /> },
      { path: 'reports/investment', element: <InvestmentReports /> },
      { path: 'reports/risk', element: <RiskReports /> },
      // KPI Detail (Rapports)
      { path: 'reports/kpi/:portfolioId/:indicator', element: <ReportKPIDetail /> },
      // 404 Not Found pour les détails de portefeuille
      { path: 'traditional/*', element: <PortfolioNotFound /> },
      { path: 'investment/*', element: <PortfolioNotFound /> },
      { path: 'leasing/*', element: <PortfolioNotFound /> }
    ]
  }
]);
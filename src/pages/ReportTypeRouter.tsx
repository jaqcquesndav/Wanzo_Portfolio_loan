// src/pages/ReportTypeRouter.tsx
import React from 'react';
import { usePortfolioContext } from '../contexts/usePortfolioContext';
import Reports from './Reports';
import TraditionalReports from './TraditionalReports';
import LeasingReports from './LeasingReports';

const ReportTypeRouter: React.FC = () => {
  const { portfolioType } = usePortfolioContext();

  // Rendre le composant de rapport approprié en fonction du type de portefeuille
  switch (portfolioType) {
    case 'investment':
      return <Reports />;
    case 'traditional':
      return <TraditionalReports />;
    case 'leasing':
      return <LeasingReports />;
    default:
      // Si aucun type n'est défini, utiliser Reports par défaut
      return <Reports />;
  }
};

export default ReportTypeRouter;

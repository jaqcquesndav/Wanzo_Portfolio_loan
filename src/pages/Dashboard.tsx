import { useEffect } from 'react';
import { EnhancedDashboard } from '../components/dashboard/EnhancedDashboard';
import { useDashboardMetrics } from '../hooks/useDashboardMetrics';
import { useParams, useNavigate } from 'react-router-dom';
import { usePortfolioContext } from '../contexts/usePortfolioContext';
import { isValidPortfolioType, getDefaultPortfolioType } from '../config/portfolioTypes';

export default function Dashboard() {
  const { portfolioType } = useParams<{ portfolioType: 'traditional' | 'investment' | 'leasing' }>();
  const { metrics, loading, error } = useDashboardMetrics(portfolioType);
  const { setPortfolioType } = usePortfolioContext();
  const navigate = useNavigate();

  // S'assurer que le type de portefeuille dans l'URL est valide et synchronisé avec le contexte
  useEffect(() => {
    if (!isValidPortfolioType(portfolioType)) {
      // Rediriger vers un type valide si le type dans l'URL n'est pas valide
      const defaultType = getDefaultPortfolioType(portfolioType);
      console.warn(`Type de portefeuille invalide dans l'URL: ${portfolioType}, redirection vers: ${defaultType}`);
      navigate(`/app/${defaultType}/dashboard`);
      return;
    }
    
    // Synchroniser le contexte avec le type d'URL
    setPortfolioType(portfolioType as 'traditional' | 'investment' | 'leasing');
    console.log(`Dashboard synchronisé pour le type: ${portfolioType}`);
  }, [portfolioType, setPortfolioType, navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900 p-4 rounded-lg">
        <p className="text-red-800 dark:text-red-200">
          Une erreur est survenue lors du chargement des données
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gray-50 dark:bg-gray-950 flex flex-col py-6 space-y-6">
      <EnhancedDashboard
        portfolioType={portfolioType}
        metrics={metrics}
        loading={loading}
        error={error}
      />
    </div>
  );
}
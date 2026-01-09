import { useEffect } from 'react';
import { ProfessionalCreditDashboard } from '../components/dashboard/ProfessionalCreditDashboard';
import { useParams, useNavigate } from 'react-router-dom';
import { usePortfolioContext } from '../contexts/usePortfolioContext';

export default function Dashboard() {
  const { portfolioType } = useParams<{ portfolioType: 'traditional' | 'investment' | 'leasing' }>();
  const { setPortfolioType } = usePortfolioContext();
  const navigate = useNavigate();

  // S'assurer que le type de portefeuille dans l'URL est valide et synchronisé avec le contexte
  useEffect(() => {
    // Forcer le type 'traditional' car c'est le seul type valide maintenant
    if (portfolioType !== 'traditional') {
      console.warn(`Redirection vers traditional`);
      navigate(`/app/traditional`);
      return;
    }
    
    // Synchroniser le contexte avec le type d'URL
    setPortfolioType('traditional');
    console.log(`Dashboard synchronisé pour le type: traditional`);
  }, [portfolioType, setPortfolioType, navigate]);

  return (
    <div className="min-h-screen w-full bg-gray-50 dark:bg-gray-950 flex flex-col py-6">
      <div className="container mx-auto px-4">
        <ProfessionalCreditDashboard />
      </div>
    </div>
  );
}
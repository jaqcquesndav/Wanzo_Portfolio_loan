import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Breadcrumb } from '../components/common/Breadcrumb';
import { CreditPortfolio } from '../components/portfolio/traditional/CreditPortfolio';
import { PortfolioDetailsSkeleton } from '../components/ui/PortfolioDetailsSkeleton';

interface Portfolio {
  id: string;
  name: string;
  totalOutstanding?: number;
  pendingRequests?: number;
  activeContracts?: number;
}

export function TraditionalPortfolioView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Simulation de récupération de données
    if (id) {
      console.log('TraditionalPortfolioView - Loading portfolio with ID:', id);
      // Dans un cas réel, vous utiliseriez une fonction pour récupérer les données
      setTimeout(() => {
        setPortfolio({
          id: id,
          name: `Portefeuille ${id.slice(0, 5)}`,
          totalOutstanding: 15000000,
          pendingRequests: 12,
          activeContracts: 45
        });
        setLoading(false);
      }, 500);
    }
  }, [id]);
  
  if (loading) {
    return <PortfolioDetailsSkeleton />;
  }
  
  if (!portfolio) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold mb-2">Portefeuille non trouvé</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-4">Le portefeuille demandé n'existe pas ou a été supprimé.</p>
        <Button variant="outline" onClick={() => navigate('/app/traditional')}>
          Retour
        </Button>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
      <Breadcrumb
        items={[
          { label: 'Portefeuilles', href: '/app/traditional' },
          { label: portfolio.name, href: `/app/traditional/${portfolio.id}` },
        ]}
        portfolioType="traditional"
      />
      
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Portefeuille: {portfolio.name}</h1>
        <Button variant="outline" onClick={() => navigate(`/app/traditional/${id}`)}>
          Paramètres
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-white rounded-lg shadow dark:bg-gray-800">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Encours total</h3>
          <p className="text-3xl font-bold">
            {new Intl.NumberFormat('fr-FR', {
              style: 'currency',
              currency: 'XOF',
            }).format(portfolio.totalOutstanding || 0)}
          </p>
        </div>
        
        <div className="p-6 bg-white rounded-lg shadow dark:bg-gray-800">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Demandes en cours</h3>
          <p className="text-3xl font-bold">{portfolio.pendingRequests || 0}</p>
        </div>
        
        <div className="p-6 bg-white rounded-lg shadow dark:bg-gray-800">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Contrats actifs</h3>
          <p className="text-3xl font-bold">{portfolio.activeContracts || 0}</p>
        </div>
      </div>
      
      <CreditPortfolio portfolioId={id || ''} />
    </div>
  );
}

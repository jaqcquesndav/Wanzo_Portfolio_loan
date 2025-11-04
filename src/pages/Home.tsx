import { useState } from 'react';
import { PortfolioKPIs } from '../components/home/PortfolioKPIs';
import { PerformanceChart } from '../components/home/PerformanceChart';
import { AssetDistribution } from '../components/home/AssetDistribution';
import { PortfolioDetailsModal } from '../components/home/PortfolioDetailsModal';
import { CreatePortfolioModal } from '../components/portfolio/CreatePortfolioModal';
import { usePortfolioMetrics } from '../hooks/usePortfolioMetrics';
import type { Portfolio } from '../types/portfolio';
import { DashboardSkeleton } from '../components/ui/DashboardSkeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { Briefcase } from 'lucide-react';

export default function Home() {
  const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { metrics, loading, error } = usePortfolioMetrics();

  const handleViewDetails = (type: string) => {
    // Pour l'instant, on peut créer un portfolio mock basé sur le type
    const mockPortfolio: Portfolio = {
      id: `portfolio-${type}`,
      name: `Portefeuille ${type}`,
      type: 'traditional',
      status: 'active',
      target_amount: 1000000,
      target_return: 0.08,
      target_sectors: ['Finance', 'Commerce'],
      risk_profile: 'moderate',
      products: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      metrics: {
        net_value: metrics?.totalValue || 0,
        average_return: 0.06,
        risk_portfolio: 0.15,
        sharpe_ratio: 1.2,
        volatility: 0.12,
        alpha: 0.02,
        beta: 1.1,
        asset_allocation: [
          { type: 'Credits', percentage: 60 },
          { type: 'Epargne', percentage: 40 }
        ]
      }
    };
    setSelectedPortfolio(mockPortfolio);
  };

  if (loading) {
    return <DashboardSkeleton />;
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

  // Vérifier si l'utilisateur a des données de portefeuille
  const hasPortfolioData = metrics && (
    metrics.totalValue > 0 || 
    metrics.assets?.distribution?.length > 0 ||
    metrics.performance?.length > 0
  );

  // Nouvel utilisateur ou absence de données
  if (!hasPortfolioData) {
    return (
      <div className="space-y-6">
        <EmptyState
          icon={Briefcase}
          title="Bienvenue dans votre dashboard"
          description="Commencez par créer votre premier portefeuille pour suivre vos investissements et analyser leurs performances."
          action={{
            label: "Créer un portefeuille",
            onClick: () => setShowCreateModal(true)
          }}
          size="lg"
        />

        {showCreateModal && (
          <CreatePortfolioModal
            onClose={() => setShowCreateModal(false)}
            onSubmit={async () => {
              // Implémentation de la création
              setShowCreateModal(false);
            }}
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      <PortfolioKPIs 
        metrics={metrics} 
        onViewDetails={handleViewDetails}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PerformanceChart data={metrics.performance} />
        <AssetDistribution distribution={metrics.assets.distribution} />
      </div>

      {selectedPortfolio && (
        <PortfolioDetailsModal
          portfolio={selectedPortfolio}
          onClose={() => setSelectedPortfolio(null)}
        />
      )}

      {showCreateModal && (
        <CreatePortfolioModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={async () => {
            // Implémentation de la création
            setShowCreateModal(false);
          }}
        />
      )}
    </div>
  );
}
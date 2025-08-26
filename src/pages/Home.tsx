import { useState } from 'react';
import { PortfolioKPIs } from '../components/home/PortfolioKPIs';
import { PerformanceChart } from '../components/home/PerformanceChart';
import { AssetDistribution } from '../components/home/AssetDistribution';
import { RecentActivities } from '../components/home/RecentActivities';
import { PortfolioDetailsModal } from '../components/home/PortfolioDetailsModal';
import { CreatePortfolioModal } from '../components/portfolio/CreatePortfolioModal';
import { usePortfolioMetrics } from '../hooks/usePortfolioMetrics';
import type { Portfolio } from '../types/portfolio';
import { MultiSegmentSpinner } from '../components/ui/MultiSegmentSpinner';

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
    return (
      <div className="flex justify-center items-center h-64">
        <MultiSegmentSpinner size="medium" />
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
    <div className="space-y-6">
      
      <PortfolioKPIs 
        metrics={metrics} 
        onViewDetails={handleViewDetails}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PerformanceChart data={metrics.performance} />
        <AssetDistribution distribution={metrics.assets.distribution} />
      </div>

      <RecentActivities />

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
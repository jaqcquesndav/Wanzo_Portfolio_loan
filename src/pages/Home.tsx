import React, { useState } from 'react';
import { PortfolioKPIs } from '../components/home/PortfolioKPIs';
import { PerformanceChart } from '../components/home/PerformanceChart';
import { AssetDistribution } from '../components/home/AssetDistribution';
import { RecentActivities } from '../components/home/RecentActivities';
import { PortfolioDetailsModal } from '../components/home/PortfolioDetailsModal';
import { CreatePortfolioModal } from '../components/portfolio/CreatePortfolioModal';
import { usePortfolioMetrics } from '../hooks/usePortfolioMetrics';
import type { Portfolio } from '../types/portfolio';

export default function Home() {
  const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { metrics, loading, error } = usePortfolioMetrics();

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
    <div className="space-y-6">
      
      <PortfolioKPIs 
        metrics={metrics} 
        onViewDetails={setSelectedPortfolio}
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
          onSubmit={async (data) => {
            // Implémentation de la création
            setShowCreateModal(false);
          }}
        />
      )}
    </div>
  );
}
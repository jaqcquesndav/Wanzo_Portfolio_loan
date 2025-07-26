import { Wallet } from 'lucide-react';
import { PortfolioSummary } from '../components/portfolio/PortfolioSummary';
import { PortfolioDistribution } from '../components/portfolio/PortfolioDistribution';
import { PortfolioMetrics } from '../components/portfolio/PerformanceMetrics';
import { mockPortfolios } from '../data/mockPortfolios';

export default function Portfolio() {
  const mockPortfolio = mockPortfolios[0];
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Wallet className="h-6 w-6 text-primary mr-2" />
          <h1 className="text-2xl font-semibold text-gray-900">
            Mon Portefeuille
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <PortfolioSummary />
        </div>
        <div>
          <PortfolioMetrics portfolio={mockPortfolio} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div>
          <PortfolioDistribution />
        </div>
      </div>
    </div>
  );
}
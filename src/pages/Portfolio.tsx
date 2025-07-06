import React from 'react';
import { Wallet } from 'lucide-react';
import { PortfolioSummary } from '../components/portfolio/PortfolioSummary';
import { PortfolioDistribution } from '../components/portfolio/PortfolioDistribution';
import { InvestmentsList } from '../components/portfolio/InvestmentsList';
import { PerformanceMetrics } from '../components/portfolio/PerformanceMetrics';

export default function Portfolio() {
  return (
    <div className="space-y-6">
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
          <PerformanceMetrics />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <InvestmentsList />
        </div>
        <div>
          <PortfolioDistribution />
        </div>
      </div>
    </div>
  );
}
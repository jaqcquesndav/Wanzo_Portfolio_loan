// src/components/portfolio/PortfolioMetrics.tsx
import React from 'react';
import { TrendingUp, AlertTriangle, DollarSign } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import type { Portfolio } from '../../types/portfolio';

interface PortfolioMetricsProps {
  portfolio: Portfolio;
}

export function PortfolioMetrics({ portfolio }: PortfolioMetricsProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 space-y-6">
      <h2 className="text-lg font-medium text-gray-900 dark:text-white">
        Métriques du portefeuille
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <p className="text-sm text-gray-500">Valeur nette</p>
          <p className="text-xl font-semibold text-gray-900">
            {formatCurrency(portfolio.metrics.net_value)}
          </p>
        </div>

        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <p className="text-sm text-gray-500">Rendement moyen</p>
          <p className="text-xl font-semibold text-green-600">
            {portfolio.metrics.average_return}%
          </p>
        </div>

        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <p className="text-sm text-gray-500">Ratio de Sharpe</p>
          <p className="text-xl font-semibold text-gray-900">
            {portfolio.metrics.sharpe_ratio}
          </p>
        </div>

        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <p className="text-sm text-gray-500">Volatilité</p>
          <p className="text-xl font-semibold text-gray-900">
            {portfolio.metrics.volatility}%
          </p>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-sm font-medium text-gray-900 mb-4">Allocation des actifs</h3>
        <div className="space-y-2">
          {portfolio.metrics.asset_allocation.map((asset) => (
            <div key={asset.type} className="flex justify-between items-center">
              <span className="text-sm text-gray-600">{asset.type}</span>
              <span className="text-sm font-medium text-gray-900">{asset.percentage}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

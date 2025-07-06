import React from 'react';
import { DollarSign, TrendingUp, AlertTriangle, Activity } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import type { PortfolioMetrics } from '../../types/portfolio';

interface KPICardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  onClick: () => void;
}

function KPICard({ title, value, change, icon, onClick }: KPICardProps) {
  return (
    <button
      onClick={onClick}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 text-left hover:shadow-md transition-shadow w-full"
    >
      <div className="flex items-center">
        <div className="p-2 bg-primary-light dark:bg-primary-dark rounded-lg">
          {icon}
        </div>
        <div className="ml-4">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
          <p className="text-2xl font-semibold text-gray-900 dark:text-white">
            {typeof value === 'number' ? formatCurrency(value) : value}
          </p>
          {change !== undefined && (
            <p className={`text-sm font-medium ${
              change >= 0 ? 'text-green-500' : 'text-red-500'
            }`}>
              {change >= 0 ? '+' : ''}{change}%
            </p>
          )}
        </div>
      </div>
    </button>
  );
}

interface PortfolioKPIsProps {
  metrics: PortfolioMetrics;
  onViewDetails: (type: string) => void;
}

export function PortfolioKPIs({ metrics, onViewDetails }: PortfolioKPIsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <KPICard
        title="Valeur nette totale"
        value={metrics.assets.total}
        change={metrics.assets.change}
        icon={<DollarSign className="h-6 w-6 text-primary" />}
        onClick={() => onViewDetails('value')}
      />
      <KPICard
        title="Rendement moyen"
        value={`${metrics.performance.global}%`}
        change={metrics.performance.change}
        icon={<TrendingUp className="h-6 w-6 text-primary" />}
        onClick={() => onViewDetails('performance')}
      />
      <KPICard
        title="Ratio de Sharpe"
        value={metrics.risk.sharpeRatio}
        icon={<Activity className="h-6 w-6 text-primary" />}
        onClick={() => onViewDetails('sharpe')}
      />
      <KPICard
        title="Volatilité"
        value={`${metrics.risk.volatility}%`}
        icon={<AlertTriangle className="h-6 w-6 text-primary" />}
        onClick={() => onViewDetails('risk')}
      />
    </div>
  );
}
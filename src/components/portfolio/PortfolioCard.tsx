import React from 'react';
import { TrendingUp, Users, Target, AlertTriangle } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { formatCurrency } from '../../utils/formatters';
import type { Portfolio } from '../../types/portfolio';

interface PortfolioCardProps {
  portfolio: Portfolio;
  onView: (portfolio: Portfolio) => void;
}

export function PortfolioCard({ portfolio, onView }: PortfolioCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'draft':
        return 'warning';
      case 'closed':
        return 'error';
      default:
        return 'primary';
    }
  };

  const getRiskColor = (profile: string) => {
    switch (profile) {
      case 'conservative':
        return 'text-green-500';
      case 'moderate':
        return 'text-yellow-500';
      case 'aggressive':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <Badge variant={getStatusColor(portfolio.status)}>
              {portfolio.status}
            </Badge>
            <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">
              {portfolio.name}
            </h3>
          </div>
          <AlertTriangle 
            className={`h-6 w-6 ${getRiskColor(portfolio.risk_profile)}`} 
          />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Montant cible</p>
            <p className="text-lg font-medium text-gray-900 dark:text-white">
              {formatCurrency(portfolio.target_amount)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Rendement cible</p>
            <p className="text-lg font-medium text-gray-900 dark:text-white">
              {portfolio.target_return}%
            </p>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <Target className="h-4 w-4 mr-2" />
            {portfolio.target_sectors.join(', ')}
          </div>
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <TrendingUp className="h-4 w-4 mr-2" />
            Performance: {portfolio.metrics.average_return}%
          </div>
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <Users className="h-4 w-4 mr-2" />
            {portfolio.metrics.asset_allocation.length} investissements
          </div>
        </div>
      </div>

      <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-t dark:border-gray-600">
        <Button
          onClick={() => onView(portfolio)}
          className="w-full"
        >
          Voir les détails
        </Button>
      </div>
    </div>
  );
}
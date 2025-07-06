import React from 'react';
import { X } from 'lucide-react';
import { Button } from '../ui/Button';
import type { Portfolio } from '../../types/portfolio';
import { formatCurrency } from '../../utils/formatters';

interface PortfolioDetailsModalProps {
  portfolio: Portfolio;
  onClose: () => void;
}

export function PortfolioDetailsModal({ portfolio, onClose }: PortfolioDetailsModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full mx-4">
        <div className="flex justify-between items-center p-6 border-b dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {portfolio.name}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            icon={<X className="h-5 w-5" />}
          />
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Valeur cible
              </h3>
              <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
                {formatCurrency(portfolio.target_amount)}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Rendement cible
              </h3>
              <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
                {portfolio.target_return}%
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
              Secteurs cibles
            </h3>
            <div className="flex flex-wrap gap-2">
              {portfolio.target_sectors.map((sector) => (
                <span
                  key={sector}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-light text-primary"
                >
                  {sector}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
              Métriques de performance
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Rendement moyen
                </p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {portfolio.metrics.average_return}%
                </p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Ratio de Sharpe
                </p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {portfolio.metrics.sharpe_ratio}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-t dark:border-gray-600">
          <Button onClick={onClose} className="w-full">
            Fermer
          </Button>
        </div>
      </div>
    </div>
  );
}
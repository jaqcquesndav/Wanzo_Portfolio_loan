import type { Portfolio } from '../../../types/portfolio';

interface PortfolioManagementDisplayProps {
  portfolio: Portfolio;
}

export function PortfolioManagementDisplay({ portfolio }: PortfolioManagementDisplayProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 flex flex-col gap-4">
        <h3 className="text-lg font-bold text-primary mb-2">Gestionnaire du portefeuille</h3>
        {portfolio.manager ? (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-lg font-medium text-primary">
                  {portfolio.manager.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <div>
                <div className="font-medium">{portfolio.manager.name}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{portfolio.manager.email}</div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-2 mt-2">
              {portfolio.manager.phone && (
                <div className="flex gap-2">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Téléphone:</span>
                  <span>{portfolio.manager.phone}</span>
                </div>
              )}
              {portfolio.manager.role && (
                <div className="flex gap-2">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Rôle:</span>
                  <span>{portfolio.manager.role}</span>
                </div>
              )}
              {portfolio.manager.department && (
                <div className="flex gap-2">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Département:</span>
                  <span>{portfolio.manager.department}</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">Aucun gestionnaire assigné à ce portefeuille.</p>
        )}
      </div>

      <div className="rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 flex flex-col gap-4">
        <h3 className="text-lg font-bold text-primary mb-2">Frais de gestion</h3>
        {portfolio.management_fees ? (
          <div className="flex flex-col gap-3">
            {portfolio.management_fees.setup_fee !== undefined && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Frais d'ouverture:</span>
                <span className="font-medium">{portfolio.management_fees.setup_fee.toLocaleString()}%</span>
              </div>
            )}
            {portfolio.management_fees.annual_fee !== undefined && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Frais annuels:</span>
                <span className="font-medium">{portfolio.management_fees.annual_fee.toLocaleString()}%</span>
              </div>
            )}
            {portfolio.management_fees.performance_fee !== undefined && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Frais de performance:</span>
                <span className="font-medium">{portfolio.management_fees.performance_fee.toLocaleString()}%</span>
              </div>
            )}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">Aucun frais de gestion défini pour ce portefeuille.</p>
        )}
      </div>
    </div>
  );
}

import React from 'react';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

const mockData = {
  totalValue: 250000000,
  invested: 200000000,
  available: 50000000,
  returns: {
    total: 25000000,
    percentage: 12.5
  }
};

export function PortfolioSummary() {
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Résumé du portefeuille
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Valeur totale</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {formatCurrency(mockData.totalValue)}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Capital investi</p>
                <p className="text-xl font-medium text-gray-900">
                  {formatCurrency(mockData.invested)}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Disponible</p>
                <p className="text-xl font-medium text-gray-900">
                  {formatCurrency(mockData.available)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-center">
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-2">Rendement total</p>
              <div className="flex items-center justify-center space-x-2">
                <DollarSign className="h-6 w-6 text-green-500" />
                <p className="text-2xl font-semibold text-gray-900">
                  {formatCurrency(mockData.returns.total)}
                </p>
              </div>
              <div className="mt-2 flex items-center justify-center">
                {mockData.returns.percentage >= 0 ? (
                  <TrendingUp className="h-5 w-5 text-green-500 mr-1" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-red-500 mr-1" />
                )}
                <span className={`text-lg font-medium ${
                  mockData.returns.percentage >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {mockData.returns.percentage}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
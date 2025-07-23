// src/components/portfolio/traditional/FinancialProductsList.tsx
import React from 'react';
import { Eye, TrendingUp, Users, Tag } from 'lucide-react';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import { useFormatCurrency } from '../../../hooks/useFormatCurrency';
import type { FinancialProduct } from '../../../types/traditional-portfolio';

interface FinancialProductsListProps {
  products: FinancialProduct[];
  onViewDetails: (product: FinancialProduct) => void;
}

export function FinancialProductsList({ products, onViewDetails }: FinancialProductsListProps) {
  const { formatCurrency } = useFormatCurrency();
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {products.map((product) => (
        <div key={product.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <Badge variant={product.isPublic ? 'success' : 'primary'}>
                {product.isPublic ? 'Public' : 'Privé'}
              </Badge>
              <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">
                {product.name}
              </h3>
            </div>
            <Badge variant="primary">{product.type}</Badge>
          </div>

          <div className="space-y-3">
            <div className="flex items-center text-sm text-gray-500">
              <Tag className="h-4 w-4 mr-2" />
              <span>
                                {formatCurrency(product.minAmount, undefined, 'USD')} - {formatCurrency(product.maxAmount, undefined, 'USD')}
              </span>
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <TrendingUp className="h-4 w-4 mr-2" />
              <span>
                Taux: {product.interestRate.type === 'fixed' 
                  ? `${product.interestRate.value}%`
                  : `${product.interestRate.min}% - ${product.interestRate.max}%`}
              </span>
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <Users className="h-4 w-4 mr-2" />
              <span>Taux de remboursement: 95%</span>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <h4 className="text-sm font-medium text-gray-900">Secteurs cibles</h4>
            <div className="flex flex-wrap gap-2">
              {product.requirements.map((req, index) => (
                <span 
                  key={index}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {req}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => onViewDetails(product)}
              icon={<Eye className="h-4 w-4" />}
            >
              Voir détails
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}

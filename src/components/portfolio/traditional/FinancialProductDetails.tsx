import React, { useState } from 'react';
import { X, Edit2, Tag, Calendar, TrendingUp, Users } from 'lucide-react';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import { FinancialProductForm } from './FinancialProductForm';
import { formatCurrency } from '../../../utils/formatters';
import type { FinancialProduct } from '../../../types/traditional-portfolio';
import type { Portfolio } from '../../../types/portfolio';

interface FinancialProductDetailsProps {
  product: FinancialProduct;
  portfolio: Portfolio;
  onClose: () => void;
  onUpdate: (product: FinancialProduct) => Promise<void>;
}

export function FinancialProductDetails({ 
  product, 
  portfolio,
  onClose,
  onUpdate 
}: FinancialProductDetailsProps) {
  const [isEditing, setIsEditing] = useState(false);

  const handleUpdate = async (data: any) => {
    try {
      await onUpdate({
        ...product,
        ...data,
        updated_at: new Date().toISOString()
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };

  if (isEditing) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b dark:border-gray-700">
            <h2 className="text-xl font-semibold">Modifier le produit</h2>
          </div>
          <div className="p-6">
            <FinancialProductForm
              portfolio={portfolio}
              onSubmit={handleUpdate}
              onCancel={() => setIsEditing(false)}
              initialData={product}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full mx-4">
        <div className="flex justify-between items-center p-6 border-b dark:border-gray-700">
          <div>
            <Badge variant={product.isPublic ? 'success' : 'primary'}>
              {product.isPublic ? 'Public' : 'Privé'}
            </Badge>
            <h2 className="mt-2 text-xl font-semibold text-gray-900 dark:text-white">
              {product.name}
            </h2>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(true)}
              icon={<Edit2 className="h-4 w-4" />}
            >
              Modifier
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              icon={<X className="h-5 w-5" />}
            />
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-4">Détails du produit</h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-500">
                  <Tag className="h-4 w-4 mr-2" />
                  <span>
                    {formatCurrency(product.minAmount)} - {formatCurrency(product.maxAmount)}
                  </span>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>
                    Durée: {product.duration.min} - {product.duration.max} mois
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
                  <span>Type: {product.type}</span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-4">Description</h3>
            <p className="text-gray-600 dark:text-gray-300">{product.description}</p>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-4">Secteurs cibles</h3>
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
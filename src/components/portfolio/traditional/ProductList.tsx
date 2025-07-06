import React from 'react';
import { Edit2, Trash2, Eye } from 'lucide-react';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import type { FinancialProduct } from '../../../types/traditional-portfolio';

interface ProductListProps {
  products: FinancialProduct[];
  onEdit: (product: FinancialProduct) => void;
  onDelete: (productId: string) => void;
  onView: (product: FinancialProduct) => void;
}

export function ProductList({ products, onEdit, onDelete, onView }: ProductListProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Produit
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Type
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Taux
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Montant
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Statut
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {products.map((product) => (
            <tr key={product.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{product.name}</div>
                <div className="text-sm text-gray-500">
                  {product.isPublic ? 'Public' : 'Privé'}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <Badge variant="primary">
                  {product.type}
                </Badge>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {product.interestRate.type === 'fixed' ? (
                  <span>{product.interestRate.value}%</span>
                ) : (
                  <span>{product.interestRate.min}% - {product.interestRate.max}%</span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  Min: {product.minAmount.toLocaleString()} FCFA
                </div>
                <div className="text-sm text-gray-500">
                  Max: {product.maxAmount.toLocaleString()} FCFA
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <Badge variant={product.status === 'active' ? 'success' : 'warning'}>
                  {product.status}
                </Badge>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onView(product)}
                    icon={<Eye className="h-4 w-4" />}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(product)}
                    icon={<Edit2 className="h-4 w-4" />}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
                        onDelete(product.id);
                      }
                    }}
                    icon={<Trash2 className="h-4 w-4 text-red-500" />}
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
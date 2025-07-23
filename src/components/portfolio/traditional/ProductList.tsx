import React from 'react';
import { Edit2, Trash2, Eye } from 'lucide-react';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import type { FinancialProduct } from '../../../types/traditional-portfolio';
import { PaginatedTable } from '../../ui/PaginatedTable';
import { useTablePagination } from '../../../hooks/useTablePagination';

interface ProductListProps {
  products: FinancialProduct[];
  onEdit: (product: FinancialProduct) => void;
  onDelete: (productId: string) => void;
  onView: (product: FinancialProduct) => void;
}

export function ProductList({ products, onEdit, onDelete, onView }: ProductListProps) {
  const { paginatedData, currentPage, totalPages, nextPage, prevPage } = useTablePagination(products, 10);

  const columns = [
    {
      header: 'Produit',
      accessor: (product: FinancialProduct) => (
        <>
          <div className="text-sm font-medium text-gray-900">{product.name}</div>
          <div className="text-sm text-gray-500">
            {product.isPublic ? 'Public' : 'Privé'}
          </div>
        </>
      )
    },
    {
      header: 'Type',
      accessor: (product: FinancialProduct) => (
        <Badge variant="primary">
          {product.type}
        </Badge>
      )
    },
    {
      header: 'Taux',
      accessor: (product: FinancialProduct) => (
        <>
          {product.interestRate.type === 'fixed' ? (
            <span>{product.interestRate.value}%</span>
          ) : (
            <span>{product.interestRate.min}% - {product.interestRate.max}%</span>
          )}
        </>
      )
    },
    {
      header: 'Montant',
      accessor: (product: FinancialProduct) => (
        <>
          <div className="text-sm text-gray-900">
            Min: {product.minAmount.toLocaleString()} FCFA
          </div>
          <div className="text-sm text-gray-500">
            Max: {product.maxAmount.toLocaleString()} FCFA
          </div>
        </>
      )
    },
    {
      header: 'Statut',
      accessor: (product: FinancialProduct) => (
        <Badge variant={product.status === 'active' ? 'success' : 'warning'}>
          {product.status}
        </Badge>
      )
    },
    {
      header: 'Actions',
      accessor: (product: FinancialProduct) => (
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
      )
    }
  ];
  
  return (
    <div className="overflow-x-auto">
      <PaginatedTable
        data={paginatedData}
        columns={columns}
        keyField="id"
        itemsPerPage={10}
      />
      {totalPages > 1 && (
        <div className="flex justify-center mt-4">
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={prevPage}
              disabled={currentPage === 1}
            >
              Précédent
            </Button>
            <span className="flex items-center px-3 py-1 text-sm">
              Page {currentPage} sur {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={nextPage}
              disabled={currentPage === totalPages}
            >
              Suivant
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
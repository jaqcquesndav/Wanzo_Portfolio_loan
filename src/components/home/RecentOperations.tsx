import React from 'react';
import { FileText, ArrowRight } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { formatCurrency, formatDate } from '../../utils/formatters';
import type { Operation } from '../../types/operations';

const mockOperations: Operation[] = [
  {
    id: '1',
    type: 'credit',
    amount: 50000000,
    status: 'pending',
    startDate: '2024-03-15',
    description: 'Financement équipement industriel',
    created_at: '2024-03-15T10:00:00Z',
    updated_at: '2024-03-15T10:00:00Z'
  },
  {
    id: '2',
    type: 'leasing',
    amount: 25000000,
    status: 'active',
    startDate: '2024-03-14',
    description: 'Leasing véhicule utilitaire',
    created_at: '2024-03-14T15:30:00Z',
    updated_at: '2024-03-14T15:30:00Z'
  }
];

export function RecentOperations() {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-medium text-gray-900">Opérations récentes</h2>
        <Button 
          variant="outline" 
          size="sm" 
          icon={<FileText className="h-4 w-4" />}
        >
          Voir tout
        </Button>
      </div>

      <div className="space-y-4">
        {mockOperations.map((operation) => (
          <div 
            key={operation.id}
            className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:bg-gray-50"
          >
            <div className="flex-1">
              <div className="flex items-center">
                <Badge variant={operation.status === 'active' ? 'success' : 'warning'}>
                  {operation.status}
                </Badge>
                <span className="ml-2 text-sm font-medium text-gray-900">
                  {operation.type}
                </span>
              </div>
              <p className="mt-1 text-sm text-gray-500">{operation.description}</p>
              <p className="mt-1 text-sm text-gray-500">
                {formatDate(operation.startDate)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">
                {formatCurrency(operation.amount)}
              </p>
              <Button 
                variant="ghost" 
                size="sm"
                className="mt-2"
                icon={<ArrowRight className="h-4 w-4" />}
              >
                Détails
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
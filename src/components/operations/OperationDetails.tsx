import React from 'react';
import { Calendar, DollarSign, Clock, FileText, Tag } from 'lucide-react';
import { Badge } from '../ui/Badge';
import type { Operation } from '../../types/operations';
import { formatCurrency, formatDate } from '../../utils/formatters';

interface OperationDetailsProps {
  operation: Operation;
}

export function OperationDetails({ operation }: OperationDetailsProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <Badge variant={operation.status === 'active' ? 'success' : 'primary'}>
            {operation.status}
          </Badge>
          <h2 className="mt-2 text-xl font-semibold text-gray-900">
            {operation.type}
          </h2>
        </div>
        <div className="text-2xl font-bold text-gray-900">
          {formatCurrency(operation.amount)}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex items-center">
            <Calendar className="h-5 w-5 text-gray-400 mr-2" />
            <div>
              <p className="text-sm text-gray-500">Date de début</p>
              <p className="font-medium">{formatDate(operation.startDate)}</p>
            </div>
          </div>

          <div className="flex items-center">
            <Clock className="h-5 w-5 text-gray-400 mr-2" />
            <div>
              <p className="text-sm text-gray-500">Durée</p>
              <p className="font-medium">{operation.duration} mois</p>
            </div>
          </div>

          {operation.interestRate && (
            <div className="flex items-center">
              <DollarSign className="h-5 w-5 text-gray-400 mr-2" />
              <div>
                <p className="text-sm text-gray-500">Taux d'intérêt</p>
                <p className="font-medium">{operation.interestRate}%</p>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center">
            <Tag className="h-5 w-5 text-gray-400 mr-2" />
            <div>
              <p className="text-sm text-gray-500">Type</p>
              <p className="font-medium">{operation.type}</p>
            </div>
          </div>

          <div className="flex items-center">
            <FileText className="h-5 w-5 text-gray-400 mr-2" />
            <div>
              <p className="text-sm text-gray-500">Description</p>
              <p className="font-medium">{operation.description}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
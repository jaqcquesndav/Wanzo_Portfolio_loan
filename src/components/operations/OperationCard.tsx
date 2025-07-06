import React from 'react';
import { Calendar, DollarSign, Clock, Tag, Play } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { formatOperationAmount, formatOperationDate } from './utils/formatters';
import { getStatusColor, getOperationTypeLabel, isSecurityOperation } from './utils/statusHelpers';
import type { Operation } from '../../types/operations';

interface OperationCardProps {
  operation: Operation;
  onView: (operation: Operation) => void;
  onStartWorkflow?: (operation: Operation) => void;
}

export function OperationCard({ operation, onView, onStartWorkflow }: OperationCardProps) {
  const isSecurityType = isSecurityOperation(operation.type);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-start">
        <div>
          <Badge variant={getStatusColor(operation.status)}>
            {operation.status}
          </Badge>
          <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-gray-100">
            {getOperationTypeLabel(operation.type)}
          </h3>
        </div>
        <div className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          {formatOperationAmount(operation.amount)}
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
          <Calendar className="h-4 w-4 mr-2" />
          {formatOperationDate(operation.startDate)}
        </div>
        
        {isSecurityType && operation.securityDetails && (
          <>
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <Tag className="h-4 w-4 mr-2" />
              {operation.securityDetails.quantity} titres à {formatOperationAmount(operation.securityDetails.unitPrice || 0)}
            </div>
            {operation.type === 'bond' && operation.interestRate && (
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <DollarSign className="h-4 w-4 mr-2" />
                Taux: {operation.interestRate}%
              </div>
            )}
          </>
        )}
        
        {!isSecurityType && (
          <>
            {operation.interestRate && (
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <DollarSign className="h-4 w-4 mr-2" />
                Taux: {operation.interestRate}%
              </div>
            )}
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <Clock className="h-4 w-4 mr-2" />
              {operation.duration} mois
            </div>
          </>
        )}
      </div>

      <div className="mt-4">
        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
          {operation.description}
        </p>
      </div>

      <div className="mt-4 flex justify-between">
        <Button
          variant="outline"
          onClick={() => onView(operation)}
        >
          Voir les détails
        </Button>
        
        {operation.status === 'pending' && onStartWorkflow && (
          <Button
            onClick={() => onStartWorkflow(operation)}
            icon={<Play className="h-4 w-4" />}
          >
            Démarrer le workflow
          </Button>
        )}
      </div>
    </div>
  );
}
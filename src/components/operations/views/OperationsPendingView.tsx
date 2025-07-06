import React from 'react';
import { OperationCard } from '../OperationCard';
import { OperationFilters } from '../OperationFilters';
import type { Operation } from '../../../types/operations';
import { isPending } from '../utils/statusHelpers';

interface OperationsPendingViewProps {
  operations: Operation[];
  onOperationClick: (operation: Operation) => void;
}

export function OperationsPendingView({ operations, onOperationClick }: OperationsPendingViewProps) {
  const pendingOperations = operations.filter(isPending);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pendingOperations.map(operation => (
          <OperationCard
            key={operation.id}
            operation={operation}
            onView={onOperationClick}
          />
        ))}
      </div>
    </div>
  );
}
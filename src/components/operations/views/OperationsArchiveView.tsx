import React from 'react';
import { OperationCard } from '../OperationCard';
import { OperationFilters } from '../OperationFilters';
import type { Operation } from '../../../types/operations';
import { isArchived } from '../utils/statusHelpers';

interface OperationsArchiveViewProps {
  operations: Operation[];
  onOperationClick: (operation: Operation) => void;
}

export function OperationsArchiveView({ operations, onOperationClick }: OperationsArchiveViewProps) {
  const archivedOperations = operations.filter(isArchived);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {archivedOperations.map(operation => (
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
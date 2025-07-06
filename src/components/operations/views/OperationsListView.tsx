import React from 'react';
import { OperationCard } from '../OperationCard';
import { OperationFilters } from '../OperationFilters';
import type { Operation, OperationType, OperationStatus } from '../../../types/operations';

interface OperationsListViewProps {
  operations: Operation[];
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedType: OperationType | 'all';
  onTypeChange: (type: OperationType | 'all') => void;
  selectedStatus: OperationStatus | 'all';
  onStatusChange: (status: OperationStatus | 'all') => void;
  onOperationClick: (operation: Operation) => void;
}

export function OperationsListView({
  operations,
  searchTerm,
  onSearchChange,
  selectedType,
  onTypeChange,
  selectedStatus,
  onStatusChange,
  onOperationClick
}: OperationsListViewProps) {
  return (
    <>
      <OperationFilters
        searchTerm={searchTerm}
        onSearchChange={onSearchChange}
        selectedType={selectedType}
        onTypeChange={onTypeChange}
        selectedStatus={selectedStatus}
        onStatusChange={onStatusChange}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {operations.map(operation => (
          <OperationCard
            key={operation.id}
            operation={operation}
            onView={onOperationClick}
          />
        ))}
      </div>
    </>
  );
}
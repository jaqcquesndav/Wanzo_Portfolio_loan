import { useState } from 'react';
import type { Operation, OperationType, OperationStatus, OperationView } from '../../../types/operations';

export function useOperations(initialOperations: Operation[]) {
  const [operations] = useState<Operation[]>(initialOperations);
  const [selectedOperation, setSelectedOperation] = useState<Operation | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<OperationType | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<OperationStatus | 'all'>('all');
  const [view, setView] = useState<OperationView>('list');

  const filteredOperations = operations.filter(operation => {
    const matchesSearch = operation.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || operation.type === selectedType;
    const matchesStatus = selectedStatus === 'all' || operation.status === selectedStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  return {
    operations,
    selectedOperation,
    setSelectedOperation,
    searchTerm,
    setSearchTerm,
    selectedType,
    setSelectedType,
    selectedStatus,
    setSelectedStatus,
    view,
    setView,
    filteredOperations
  };
}
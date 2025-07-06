import React from 'react';
import { Search } from 'lucide-react';
import { FormField, Input, Select } from '../ui/Form';
import type { OperationType, OperationStatus } from '../../types/operations';

interface OperationFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedType: OperationType | 'all';
  onTypeChange: (type: OperationType | 'all') => void;
  selectedStatus: OperationStatus | 'all';
  onStatusChange: (status: OperationStatus | 'all') => void;
}

export function OperationFilters({
  searchTerm,
  onSearchChange,
  selectedType,
  onTypeChange,
  selectedStatus,
  onStatusChange
}: OperationFiltersProps) {
  return (
    <div className="bg-white p-4 rounded-lg shadow space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FormField label="Rechercher">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </FormField>

        <FormField label="Type">
          <Select
            value={selectedType}
            onChange={(e) => onTypeChange(e.target.value as OperationType | 'all')}
          >
            <option value="all">Tous les types</option>
            <option value="credit">Crédit</option>
            <option value="leasing">Leasing</option>
            <option value="equity">Capital</option>
            <option value="grant">Subvention</option>
          </Select>
        </FormField>

        <FormField label="Statut">
          <Select
            value={selectedStatus}
            onChange={(e) => onStatusChange(e.target.value as OperationStatus | 'all')}
          >
            <option value="all">Tous les statuts</option>
            <option value="pending">En attente</option>
            <option value="active">Actif</option>
            <option value="completed">Terminé</option>
            <option value="rejected">Rejeté</option>
          </Select>
        </FormField>
      </div>
    </div>
  );
}
import React from 'react';
import { Search, Filter } from 'lucide-react';
import { FormField, Input, Select } from '../../ui/form';
import { Button } from '../../ui/Button';

interface HistoryFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  dateRange: { start: string; end: string };
  onDateRangeChange: (range: { start: string; end: string }) => void;
  selectedType: string;
  onTypeChange: (type: string) => void;
  selectedStatus: string;
  onStatusChange: (status: string) => void;
  showFilters: boolean;
  onToggleFilters: () => void;
}

export function HistoryFilters({
  searchTerm,
  onSearchChange,
  dateRange,
  onDateRangeChange,
  selectedType,
  onTypeChange,
  selectedStatus,
  onStatusChange,
  showFilters,
  onToggleFilters
}: HistoryFiltersProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Rechercher une opération..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Button
          variant="outline"
          onClick={onToggleFilters}
          icon={<Filter className="h-4 w-4" />}
        >
          {showFilters ? 'Masquer les filtres' : 'Afficher les filtres'}
        </Button>
      </div>

      {showFilters && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <FormField label="Date de début">
              <Input
                type="date"
                value={dateRange.start}
                onChange={(e) => onDateRangeChange({ ...dateRange, start: e.target.value })}
              />
            </FormField>

            <FormField label="Date de fin">
              <Input
                type="date"
                value={dateRange.end}
                onChange={(e) => onDateRangeChange({ ...dateRange, end: e.target.value })}
              />
            </FormField>

            <FormField label="Type d'opération">
              <Select
                value={selectedType}
                onChange={(e) => onTypeChange(e.target.value)}
              >
                <option value="all">Tous les types</option>
                <option value="credit">Crédit</option>
                <option value="leasing">Leasing</option>
                <option value="investment">Capital Investissement</option>
              </Select>
            </FormField>

            <FormField label="Statut">
              <Select
                value={selectedStatus}
                onChange={(e) => onStatusChange(e.target.value)}
              >
                <option value="all">Tous les statuts</option>
                <option value="completed">Terminé</option>
                <option value="cancelled">Annulé</option>
              </Select>
            </FormField>
          </div>
        </div>
      )}
    </div>
  );
}
import React from 'react';
import { Filter } from 'lucide-react';
import { FormField, Select } from '../ui/Form';
import type { ReportType } from '../../types/reports';

interface ReportFiltersProps {
  selectedType: ReportType | 'all';
  onTypeChange: (type: ReportType | 'all') => void;
  dateRange: { start: string; end: string };
  onDateRangeChange: (range: { start: string; end: string }) => void;
}

export default function ReportFilters({
  selectedType,
  onTypeChange,
  dateRange,
  onDateRangeChange
}: ReportFiltersProps) {
  return (
    <div className="bg-white p-4 rounded-lg shadow space-y-4">
      <div className="flex items-center mb-4">
        <Filter className="h-5 w-5 text-gray-400 mr-2" />
        <h2 className="text-sm font-medium text-gray-700">Filtres</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FormField label="Type de rapport">
          <Select
            value={selectedType}
            onChange={(e) => onTypeChange(e.target.value as ReportType | 'all')}
          >
            <option value="all">Tous les types</option>
            <option value="financial">Financier</option>
            <option value="investment">Investissement</option>
            <option value="risk">Risque</option>
          </Select>
        </FormField>

        <FormField label="Date de début">
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) => onDateRangeChange({ ...dateRange, start: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </FormField>

        <FormField label="Date de fin">
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) => onDateRangeChange({ ...dateRange, end: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </FormField>
      </div>
    </div>
  );
}
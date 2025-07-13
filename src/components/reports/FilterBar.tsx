// src/components/reports/FilterBar.tsx
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { ListFilter } from 'lucide-react';

interface ReportingFilterBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onFilterToggle: () => void;
  isFilterExpanded?: boolean;
}

export function ReportingFilterBar({
  searchTerm,
  onSearchChange,
  onFilterToggle,
  isFilterExpanded = false
}: ReportingFilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      <div className="relative flex-grow max-w-md">
        <Input
          type="text"
          placeholder="Rechercher..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-3 pr-10"
        />
      </div>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onFilterToggle}
        className={isFilterExpanded ? "bg-gray-100" : ""}
      >
        <ListFilter className="w-4 h-4 mr-2" />
        Filtres
      </Button>
    </div>
  );
}

import { useState, useCallback } from 'react';

interface UseFiltersProps<T> {
  initialFilters: T;
  onFilterChange?: (filters: T) => void;
}

export function useFilters<T extends object>({ 
  initialFilters,
  onFilterChange 
}: UseFiltersProps<T>) {
  const [filters, setFilters] = useState<T>(initialFilters);
  const [showFilters, setShowFilters] = useState(false);

  const updateFilter = useCallback((key: keyof T, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  }, [filters, onFilterChange]);

  const resetFilters = useCallback(() => {
    setFilters(initialFilters);
    onFilterChange?.(initialFilters);
  }, [initialFilters, onFilterChange]);

  const toggleFilters = useCallback(() => {
    setShowFilters(prev => !prev);
  }, []);

  return {
    filters,
    showFilters,
    updateFilter,
    resetFilters,
    toggleFilters
  };
}

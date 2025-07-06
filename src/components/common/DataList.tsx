// src/components/common/DataList.tsx
import React from 'react';
import { BaseList } from './BaseList';
import { useFilters } from '../../hooks/useFilters';
import { usePagination } from '../../hooks/usePagination';

interface DataListProps<T> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  renderFilters?: () => React.ReactNode;
  searchPlaceholder?: string;
  filterKey?: keyof T;
}

export function DataList<T extends { id: string }>({
  items,
  renderItem,
  renderFilters,
  searchPlaceholder,
  filterKey
}: DataListProps<T>) {
  const { filters, showFilters, updateFilter, toggleFilters } = useFilters({
    initialFilters: {}
  });

  const { currentPage, paginatedItems, setCurrentPage, totalPages } = usePagination({
    items: items
  });

  return (
    <BaseList
      items={paginatedItems}
      renderItem={renderItem}
      searchTerm={filters.search}
      onSearchChange={(value) => updateFilter('search', value)}
      searchPlaceholder={searchPlaceholder}
      showFilters={showFilters}
      onToggleFilters={toggleFilters}
      renderFilters={renderFilters}
    />
  );
}

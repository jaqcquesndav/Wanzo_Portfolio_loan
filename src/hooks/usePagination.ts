import { useState, useMemo } from 'react';

interface UsePaginationProps<T> {
  items: T[];
  itemsPerPage?: number;
}

export function usePagination<T>({ 
  items, 
  itemsPerPage = 9 
}: UsePaginationProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = useMemo(() => 
    Math.ceil(items.length / itemsPerPage), 
    [items.length, itemsPerPage]
  );

  const paginatedItems = useMemo(() => 
    items.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    ),
    [items, currentPage, itemsPerPage]
  );

  return {
    currentPage,
    setCurrentPage,
    totalPages,
    paginatedItems
  };
}
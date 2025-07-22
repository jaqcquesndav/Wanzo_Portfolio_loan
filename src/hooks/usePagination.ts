import { useState, useMemo } from 'react';

export function usePagination<T>(items: T[], itemsPerPage = 9) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = useMemo(() => 
    Math.ceil(items.length / itemsPerPage), 
    [items.length, itemsPerPage]
  );

  const pageItems = useMemo(() => 
    items.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    ),
    [items, currentPage, itemsPerPage]
  );

  const setPage = (page: number) => {
    setCurrentPage(page);
  };

  return {
    currentPage,
    totalPages,
    pageItems,
    setPage
  };
}
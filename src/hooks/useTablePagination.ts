import { useState, useMemo } from 'react';

/**
 * Hook pour ajouter la pagination à n'importe quel tableau
 * @param data Les données à paginer
 * @param itemsPerPage Nombre d'éléments par page (défaut: 10)
 * @returns Objet contenant les données paginées et les fonctions de pagination
 */
export function useTablePagination<T>(data: T[], itemsPerPage: number = 10) {
  // État pour la page courante
  const [currentPage, setCurrentPage] = useState(1);
  
  // Calcul du nombre total de pages
  const totalPages = useMemo(() => 
    Math.max(1, Math.ceil(data.length / itemsPerPage)), 
    [data.length, itemsPerPage]
  );
  
  // S'assurer que la page courante est valide si les données changent
  useMemo(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);
  
  // Extraire les données pour la page courante
  const paginatedData = useMemo(() => 
    data.slice(
      (currentPage - 1) * itemsPerPage, 
      currentPage * itemsPerPage
    ), 
    [data, currentPage, itemsPerPage]
  );
  
  // Fonctions pour changer de page
  const goToPage = (page: number) => {
    const validPage = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(validPage);
  };
  
  const nextPage = () => goToPage(currentPage + 1);
  const prevPage = () => goToPage(currentPage - 1);
  const firstPage = () => goToPage(1);
  const lastPage = () => goToPage(totalPages);
  
  return {
    paginatedData,
    currentPage,
    totalPages,
    goToPage,
    nextPage,
    prevPage,
    firstPage,
    lastPage,
    totalItems: data.length,
    startItem: Math.min(data.length, (currentPage - 1) * itemsPerPage + 1),
    endItem: Math.min(data.length, currentPage * itemsPerPage)
  };
}

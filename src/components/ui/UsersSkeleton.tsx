import { CardSkeleton } from './CardSkeleton';
import { TableSkeleton } from './TableSkeleton';

export function UsersSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header avec titre et bouton */}
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <div className="h-6 w-6 bg-gray-300 dark:bg-gray-600 rounded mr-2"></div>
          <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-64"></div>
        </div>
        <div className="h-10 bg-gray-300 dark:bg-gray-600 rounded w-40"></div>
      </div>

      {/* Cards de statistiques */}
      <div className="flex flex-wrap gap-4 mb-6">
        <CardSkeleton className="flex-1" />
        <CardSkeleton className="flex-1" />
        <CardSkeleton className="flex-1" />
      </div>

      {/* Filtres */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 space-y-4">
        <div className="flex flex-wrap gap-4">
          <div className="h-10 bg-gray-300 dark:bg-gray-600 rounded w-64"></div>
          <div className="h-10 bg-gray-300 dark:bg-gray-600 rounded w-48"></div>
        </div>
      </div>

      {/* Liste des utilisateurs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <TableSkeleton rows={9} />
      </div>

      {/* Pagination */}
      <div className="flex justify-center">
        <div className="flex space-x-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-8 w-8 bg-gray-300 dark:bg-gray-600 rounded"></div>
          ))}
        </div>
      </div>
    </div>
  );
}

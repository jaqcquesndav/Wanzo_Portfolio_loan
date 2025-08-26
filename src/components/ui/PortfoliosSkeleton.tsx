import { CardSkeleton } from './CardSkeleton';

export function PortfoliosSkeleton() {
  return (
    <div className="container mx-auto p-6 space-y-6 animate-pulse">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-48"></div>
        <div className="h-10 bg-gray-300 dark:bg-gray-600 rounded w-40"></div>
      </div>

      {/* Filtres et recherche */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="relative flex-1 max-w-md">
          <div className="h-10 bg-gray-300 dark:bg-gray-600 rounded w-full"></div>
        </div>
        <div className="flex gap-2">
          <div className="h-10 bg-gray-300 dark:bg-gray-600 rounded w-24"></div>
        </div>
      </div>

      {/* Panneau de filtres (optionnel) */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 space-y-4">
        <div className="flex flex-wrap gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-10 bg-gray-300 dark:bg-gray-600 rounded w-32"></div>
          ))}
        </div>
      </div>

      {/* Grille des portefeuilles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(9)].map((_, i) => (
          <CardSkeleton key={i} className="h-48" />
        ))}
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

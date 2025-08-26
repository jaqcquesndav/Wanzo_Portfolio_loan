import { cn } from '../../utils/cn';

interface RiskSkeletonProps {
  activeTab?: 'credit' | 'leasing' | 'investment';
  className?: string;
}

export function RiskSkeleton({ 
  activeTab = 'credit',
  className = ''
}: RiskSkeletonProps) {
  return (
    <div className={cn("space-y-6", className)}>
      {/* Header avec titre et actions */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 animate-pulse">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-96"></div>
          </div>
          <div className="flex space-x-3">
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-28"></div>
          </div>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 animate-pulse">
            <div className="flex items-center justify-between">
              <div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-2"></div>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
              </div>
              <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="border-b border-gray-200 dark:border-gray-700 animate-pulse">
          <div className="flex space-x-8 px-6 py-4">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
          </div>
        </div>

        {/* Filtres */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 animate-pulse">
          <div className="flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-4">
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded flex-1"></div>
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-40"></div>
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-36"></div>
          </div>
        </div>

        {/* Tableau */}
        <div className="p-6">
          <div className="space-y-4 animate-pulse">
            {/* Header du tableau */}
            <div className="grid grid-cols-6 gap-4 pb-4 border-b border-gray-200 dark:border-gray-700">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              ))}
            </div>
            
            {/* Lignes du tableau */}
            {Array.from({ length: 8 }).map((_, rowIndex) => (
              <div key={rowIndex} className="grid grid-cols-6 gap-4 py-4 border-b border-gray-100 dark:border-gray-700">
                {Array.from({ length: 6 }).map((_, colIndex) => (
                  <div key={colIndex} className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                ))}
              </div>
            ))}
          </div>
          
          {/* Loading indicator */}
          <div className="flex justify-center items-center py-8 mt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mr-3"></div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Chargement des données de risque {activeTab}...
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RiskSkeleton;

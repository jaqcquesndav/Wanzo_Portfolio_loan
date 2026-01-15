import { cn } from '../../utils/cn';

interface DetailsSkeletonProps {
  /** Show breadcrumb skeleton */
  showBreadcrumb?: boolean;
  /** Number of info sections (key-value pairs) */
  infoSections?: number;
  /** Number of rows in each info section */
  rowsPerSection?: number;
  /** Show action buttons in header */
  showActions?: boolean;
  /** Show status badge */
  showStatus?: boolean;
  /** Additional className */
  className?: string;
  /** Variant type */
  variant?: 'default' | 'compact' | 'full';
}

/**
 * Skeleton réutilisable pour les pages de détails (Garanties, Décaissements, Remboursements, etc.)
 * Structure: Breadcrumb > Titre + Actions > Card principale avec sections d'infos
 */
export function DetailsSkeleton({
  showBreadcrumb = true,
  infoSections = 2,
  rowsPerSection = 4,
  showActions = true,
  showStatus = true,
  className = '',
  variant = 'default'
}: DetailsSkeletonProps) {
  return (
    <div className={cn("max-w-3xl mx-auto p-6 space-y-6 animate-pulse", className)}>
      {/* Breadcrumb */}
      {showBreadcrumb && (
        <div className="flex items-center space-x-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
          <span className="text-gray-400">/</span>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
          <span className="text-gray-400">/</span>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
        </div>
      )}

      {/* Titre */}
      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64"></div>

      {/* Card principale */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Header avec titre et status */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <div className="space-y-2">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
            </div>
            <div className="text-right space-y-2">
              <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
              {showStatus && (
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-20 ml-auto"></div>
              )}
            </div>
          </div>
        </div>

        {/* Sections d'informations */}
        {variant === 'full' && (
          <div className="p-6 space-y-6">
            {Array.from({ length: infoSections }).map((_, sectionIndex) => (
              <div key={sectionIndex} className="space-y-4">
                {/* Titre de section */}
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-40"></div>
                
                {/* Grille d'informations */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Array.from({ length: rowsPerSection }).map((_, rowIndex) => (
                    <div key={rowIndex} className="space-y-1">
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                      <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-full max-w-[200px]"></div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {variant === 'default' && (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Array.from({ length: infoSections }).map((_, sectionIndex) => (
                <div key={sectionIndex} className="space-y-4">
                  {Array.from({ length: rowsPerSection }).map((_, rowIndex) => (
                    <div key={rowIndex} className="space-y-1">
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                      <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-full max-w-[180px]"></div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {variant === 'compact' && (
          <div className="p-6 space-y-3">
            {Array.from({ length: rowsPerSection }).map((_, rowIndex) => (
              <div key={rowIndex} className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-28"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-36"></div>
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        {showActions && (
          <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
            <div className="flex justify-end space-x-3">
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-28"></div>
            </div>
          </div>
        )}
      </div>

      {/* Section supplémentaire (historique, timeline, etc.) */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-4"></div>
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="flex items-start space-x-3">
              <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full flex-shrink-0"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default DetailsSkeleton;

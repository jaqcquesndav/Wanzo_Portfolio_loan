// src/components/ui/DataTable.tsx
import React from 'react';
import { LucideIcon } from 'lucide-react';
import { EmptyState } from './EmptyState';
import { ErrorState } from './ErrorState';

interface Column<T> {
  key: string;
  header: string;
  render?: (value: unknown, item: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  error?: Error | string | null;
  onRetry?: () => void;
  emptyState?: {
    icon: LucideIcon;
    title: string;
    description: string;
    action?: {
      label: string;
      onClick: () => void;
    };
  };
  loadingSkeleton?: React.ReactNode;
  className?: string;
  headerClassName?: string;
  rowClassName?: string;
  showRowNumbers?: boolean;
}

export function DataTable<T = Record<string, unknown>>({
  data,
  columns,
  loading = false,
  error = null,
  onRetry,
  emptyState,
  loadingSkeleton,
  className = '',
  headerClassName = '',
  rowClassName = '',
  showRowNumbers = false
}: DataTableProps<T>) {
  // Skeleton par défaut si aucun n'est fourni
  const defaultSkeleton = (
    <div className="animate-pulse">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="border-b border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 flex space-x-4">
            {columns.map((_, colIndex) => (
              <div key={colIndex} className="flex-1">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className={`bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden ${className}`}>
      {/* En-tête de table toujours visible */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className={`bg-gray-50 dark:bg-gray-900 ${headerClassName}`}>
            <tr>
              {showRowNumbers && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  #
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider ${column.className || ''}`}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {/* État de chargement */}
            {loading && (
              <tr>
                <td colSpan={columns.length + (showRowNumbers ? 1 : 0)} className="p-0">
                  {loadingSkeleton || defaultSkeleton}
                </td>
              </tr>
            )}

            {/* État d'erreur */}
            {!loading && error && (
              <tr>
                <td colSpan={columns.length + (showRowNumbers ? 1 : 0)} className="p-0">
                  <ErrorState
                    error={error}
                    onRetry={onRetry}
                    size="sm"
                    className="py-8"
                  />
                </td>
              </tr>
            )}

            {/* État vide */}
            {!loading && !error && data.length === 0 && emptyState && (
              <tr>
                <td colSpan={columns.length + (showRowNumbers ? 1 : 0)} className="p-0">
                  <EmptyState
                    icon={emptyState.icon}
                    title={emptyState.title}
                    description={emptyState.description}
                    action={emptyState.action}
                    size="sm"
                    className="py-8"
                  />
                </td>
              </tr>
            )}

            {/* Données */}
            {!loading && !error && data.length > 0 && data.map((item, index) => (
              <tr key={(item as { id?: string }).id || `row-${index}`} className={rowClassName}>
                {showRowNumbers && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {index + 1}
                  </td>
                )}
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white ${column.className || ''}`}
                  >
                    {column.render ? column.render((item as Record<string, unknown>)[column.key], item) : String((item as Record<string, unknown>)[column.key] || '')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
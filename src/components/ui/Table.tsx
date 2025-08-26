
import React from 'react';

interface TableProps {
  children: React.ReactNode;
  className?: string;
  loading?: boolean;
  loadingRows?: number;
  columns?: number;
}

export function Table({ 
  children, 
  className = '', 
  loading = false,
  loadingRows = 5,
  columns = 3
}: TableProps) {
  if (loading) {
    return (
      <div className="w-full">
        <table className={`min-w-full divide-y divide-gray-200 dark:divide-gray-700 ${className}`}>
          <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
            {Array.from({ length: loadingRows }).map((_, index) => (
              <tr key={index}>
                {Array.from({ length: columns }).map((_, colIndex) => (
                  <td key={colIndex} className="px-6 py-4 whitespace-nowrap">
                    <div className="animate-pulse">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        
        {/* Spinner central pour table */}
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">Chargement des données...</span>
        </div>
      </div>
    );
  }

  return (
    <table className={`min-w-full divide-y divide-gray-200 dark:divide-gray-700 ${className}`}>
      {children}
    </table>
  );
}

export function TableHead({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return (
    <thead className={`bg-gray-50 dark:bg-gray-800 ${className}`}>
      {children}
    </thead>
  );
}

export function TableBody({ children }: { children: React.ReactNode }) {
  return (
    <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
      {children}
    </tbody>
  );
}




type TableRowProps = {
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLTableRowElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLTableRowElement>) => void;
  tabIndex?: number;
  ariaLabel?: string;
  style?: React.CSSProperties;
  className?: string;
};

export function TableRow({ children, onClick, onKeyDown, tabIndex, ariaLabel, style, className = '' }: TableRowProps) {
  return (
    <tr
      className={`${onClick ? 'hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer' : ''} ${className}`}
      onClick={onClick}
      onKeyDown={onKeyDown}
      tabIndex={tabIndex}
      aria-label={ariaLabel}
      style={style}
    >
      {children}
    </tr>
  );
}

export function TableHeader({ 
  children, 
  align = 'left', 
  className = '',
  onClick
}: { 
  children: React.ReactNode; 
  align?: 'left' | 'right' | 'center';
  className?: string;
  onClick?: () => void;
}) {
  return (
    <th 
      className={`px-6 py-3 text-${align} text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider ${className} ${onClick ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700' : ''}`}
      onClick={onClick}
    >
      {children}
    </th>
  );
}

export function TableCell({ 
  children, 
  align = 'left', 
  className = '', 
  colSpan,
  onClick
}: { 
  children: React.ReactNode; 
  align?: 'left' | 'right' | 'center', 
  className?: string, 
  colSpan?: number,
  onClick?: () => void 
}) {
  return (
    <td 
      className={`px-6 py-4 whitespace-nowrap text-${align} text-gray-900 dark:text-gray-100 ${className} ${onClick ? 'cursor-pointer' : ''}`} 
      colSpan={colSpan}
      onClick={onClick}
    >
      {children}
    </td>
  );
}
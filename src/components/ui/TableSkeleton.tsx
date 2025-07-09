import React from 'react';

export function TableSkeleton({ columns = 3, rows = 5 }: { columns?: number; rows?: number }) {
  return (
    <tbody>
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <tr key={rowIdx}>
          {Array.from({ length: columns }).map((_, colIdx) => (
            <td key={colIdx} className="px-6 py-4">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4" />
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  );
}

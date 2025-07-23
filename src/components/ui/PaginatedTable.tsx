import { ReactNode } from 'react';
import { Pagination } from './Pagination';
import { useTablePagination } from '../../hooks/useTablePagination';
import { Column } from './TableTypes';

interface PaginatedTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyField: keyof T;
  itemsPerPage?: number;
  className?: string;
  tableClassName?: string;
  theadClassName?: string;
  tbodyClassName?: string;
  thClassName?: string;
  tdClassName?: string;
  trClassName?: string;
  emptyMessage?: string;
}

export function PaginatedTable<T>({
  data,
  columns,
  keyField,
  itemsPerPage = 10,
  className = '',
  tableClassName = 'min-w-full bg-white border border-gray-200 rounded-lg',
  theadClassName = '',
  tbodyClassName = '',
  thClassName = 'px-4 py-2',
  tdClassName = 'px-4 py-2',
  trClassName = 'border-t',
  emptyMessage = 'Aucune donnée disponible'
}: PaginatedTableProps<T>) {
  const {
    paginatedData,
    currentPage,
    totalPages,
    goToPage
  } = useTablePagination(data, itemsPerPage);

  const renderCell = (item: T, column: Column<T>): ReactNode => {
    if (typeof column.accessor === 'function') {
      return column.accessor(item);
    }
    
    return String(item[column.accessor as keyof T]);
  };

  return (
    <div className={className}>
      <div className="overflow-x-auto rounded-lg">
        <table className={tableClassName}>
          <thead className={theadClassName}>
            <tr>
              {columns.map((column, index) => (
                <th 
                  key={index} 
                  className={`${thClassName} ${column.className || ''}`}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className={tbodyClassName}>
            {paginatedData.length === 0 ? (
              <tr>
                <td 
                  colSpan={columns.length} 
                  className="text-center py-4"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginatedData.map(item => (
                <tr key={String(item[keyField as keyof T])} className={trClassName}>
                  {columns.map((column, index) => (
                    <td 
                      key={index} 
                      className={`${tdClassName} ${column.className || ''}`}
                    >
                      {renderCell(item, column)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {totalPages > 1 && (
        <div className="mt-4">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={goToPage}
          />
        </div>
      )}
    </div>
  );
}

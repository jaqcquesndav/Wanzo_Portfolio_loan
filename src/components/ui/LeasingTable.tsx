import React, { useState } from 'react';
import { Filter } from 'lucide-react';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from './Table';
import { TableSkeleton } from './TableSkeleton';
import { Input } from './form/Input';
import { Select } from './form/Select';
import { Button } from './Button';

export interface Column<T> {
  header: string;
  accessorKey: keyof T | ((item: T) => React.ReactNode);
  cell?: (item: T) => React.ReactNode;
  align?: 'left' | 'right' | 'center';
}

export interface FilterOption {
  id: string;
  label: string;
  options: { value: string; label: string }[];
}

interface LeasingTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  onRowClick?: (item: T) => void;
  keyExtractor: (item: T) => string;
  filterOptions?: FilterOption[];
  searchPlaceholder?: string;
  noDataMessage?: string;
  showFilters?: boolean;
  rowClassName?: (item: T) => string;
  summaryData?: { label: string; value: React.ReactNode }[];
}

export function LeasingTable<T>({
  data,
  columns,
  loading = false,
  onRowClick,
  keyExtractor,
  filterOptions = [],
  searchPlaceholder = "Rechercher...",
  noDataMessage = "Aucun élément à afficher",
  showFilters: initialShowFilters = false,
  rowClassName,
  summaryData
}: LeasingTableProps<T>) {
  const [showFilters, setShowFilters] = useState(initialShowFilters);
  const [filters, setFilters] = useState<Record<string, string>>({
    search: ''
  });

  // Initialize filter state for all provided filter options
  React.useEffect(() => {
    const initialFilters: Record<string, string> = { search: '' };
    filterOptions.forEach(option => {
      initialFilters[option.id] = '';
    });
    setFilters(initialFilters);
  }, [filterOptions]);

  const handleFilterChange = (filterId: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterId]: value
    }));
  };

  const resetFilters = () => {
    const resetFilters: Record<string, string> = { search: '' };
    filterOptions.forEach(option => {
      resetFilters[option.id] = '';
    });
    setFilters(resetFilters);
  };

  // Apply filters to data
  const filteredData = React.useMemo(() => {
    return data.filter(item => {
      // Apply search filter across all string properties
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        // Vérifie si un des champs de l'objet contient le terme recherché
        const matchesSearch = Object.entries(item as Record<string, unknown>).some(([, value]) => {
          if (typeof value === 'string') {
            return value.toLowerCase().includes(searchTerm);
          }
          if (typeof value === 'number') {
            return value.toString().includes(searchTerm);
          }
          return false;
        });
        if (!matchesSearch) return false;
      }

      // Apply specific filters
      for (const filter of filterOptions) {
        const filterValue = filters[filter.id];
        if (filterValue) {
          // @ts-expect-error: Dynamic access to properties
          const itemValue = item[filter.id];
          if (itemValue !== filterValue) {
            return false;
          }
        }
      }

      return true;
    });
  }, [data, filters, filterOptions]);

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm mb-5">
        <div className="p-4 flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Input
                type="search"
                placeholder={searchPlaceholder}
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="pl-9 w-[250px]"
              />
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                width="15"
                height="15"
                viewBox="0 0 15 15"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M10 6.5C10 8.433 8.433 10 6.5 10C4.567 10 3 8.433 3 6.5C3 4.567 4.567 3 6.5 3C8.433 3 10 4.567 10 6.5ZM9.30884 10.0159C8.53901 10.6318 7.56251 11 6.5 11C4.01472 11 2 8.98528 2 6.5C2 4.01472 4.01472 2 6.5 2C8.98528 2 11 4.01472 11 6.5C11 7.56251 10.6318 8.53901 10.0159 9.30884L12.8536 12.1464C13.0488 12.3417 13.0488 12.6583 12.8536 12.8536C12.6583 13.0488 12.3417 13.0488 12.1464 12.8536L9.30884 10.0159Z"
                  fill="currentColor"
                  fillRule="evenodd"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            
            {filterOptions.length > 0 && (
              <Button 
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filtres {showFilters ? 'actifs' : ''}
              </Button>
            )}
          </div>
        </div>

        {showFilters && filterOptions.length > 0 && (
          <div className="p-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
            <div className="flex flex-wrap gap-4">
              {filterOptions.map((filter) => (
                <div key={filter.id} className="w-full max-w-xs">
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    {filter.label}
                  </label>
                  <Select
                    value={filters[filter.id] || ''}
                    onChange={(e) => handleFilterChange(filter.id, e.target.value)}
                  >
                    <option value="">Tous</option>
                    {filter.options.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                </div>
              ))}
              
              <div className="flex items-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetFilters}
                >
                  Réinitialiser
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHead>
              <tr>
                {columns.map((column, index) => (
                  <TableHeader
                    key={index}
                    align={column.align || 'left'}
                    className="whitespace-nowrap"
                  >
                    {column.header}
                  </TableHeader>
                ))}
              </tr>
            </TableHead>
            
            {loading ? (
              <TableSkeleton columns={columns.length} rows={5} />
            ) : (
              <TableBody>
                {filteredData.length > 0 ? (
                  filteredData.map((item) => (
                    <TableRow
                      key={keyExtractor(item)}
                      onClick={(e) => {
                        // Ne pas ouvrir le détail si clic sur le menu actions
                        if ((e.target as HTMLElement).closest('.actions-dropdown')) return;
                        if (onRowClick) onRowClick(item);
                      }}
                      tabIndex={onRowClick ? 0 : undefined}
                      className={rowClassName?.(item)}
                      style={{ outline: 'none' }}
                    >
                      {columns.map((column, columnIndex) => (
                        <TableCell
                          key={columnIndex}
                          align={column.align || 'left'}
                          className="whitespace-nowrap"
                        >
                          {column.cell
                            ? column.cell(item)
                            : typeof column.accessorKey === 'function'
                            ? column.accessorKey(item)
                            : String((item as Record<string, unknown>)[column.accessorKey as string] || '')}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={columns.length}
                      className="text-center py-8 text-gray-400"
                    >
                      {noDataMessage}
                    </td>
                  </tr>
                )}
              </TableBody>
            )}
          </Table>
        </div>
        
        {/* Summary footer for totals and statistics */}
        {summaryData && summaryData.length > 0 && (
          <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <div className="flex flex-wrap gap-4 justify-end">
              {summaryData.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {item.label}:
                  </span>
                  <span className="font-medium">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// Les formateurs ont été déplacés vers src/utils/tableFormatters.tsx

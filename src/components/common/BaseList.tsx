import React from 'react';
import { Search, Filter } from 'lucide-react';
import { Input } from '../ui/Form';
import { Button } from '../ui/Button';
import { Pagination } from '../ui/Pagination';

interface BaseListProps<T> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  showFilters?: boolean;
  onToggleFilters?: () => void;
  renderFilters?: () => React.ReactNode;
  itemsPerPage?: number;
}

export function BaseList<T>({
  items,
  renderItem,
  searchTerm,
  onSearchChange,
  searchPlaceholder = "Rechercher...",
  showFilters = false,
  onToggleFilters,
  renderFilters,
  itemsPerPage = 9
}: BaseListProps<T>) {
  const [currentPage, setCurrentPage] = React.useState(1);

  const totalPages = Math.ceil(items.length / itemsPerPage);
  const paginatedItems = items.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        {onToggleFilters && (
          <Button
            variant="outline"
            onClick={onToggleFilters}
            icon={<Filter className="h-4 w-4" />}
          >
            {showFilters ? 'Masquer les filtres' : 'Afficher les filtres'}
          </Button>
        )}
      </div>

      {showFilters && renderFilters && renderFilters()}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginatedItems.map((item, index) => (
          <React.Fragment key={index}>
            {renderItem(item)}
          </React.Fragment>
        ))}
      </div>

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
}
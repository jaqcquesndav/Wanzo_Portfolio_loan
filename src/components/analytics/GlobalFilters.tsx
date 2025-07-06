import React from 'react';
import { Filter } from 'lucide-react';
import { Button } from '../ui/Button';
import { FormField, Select, Input } from '../ui/Form';

interface GlobalFiltersProps {
  filters: Record<string, any>;
  onFilterChange: (filters: Record<string, any>) => void;
}

export function GlobalFilters({ filters, onFilterChange }: GlobalFiltersProps) {
  const [showFilters, setShowFilters] = React.useState(false);

  return (
    <div className="mb-6">
      <Button
        variant="outline"
        onClick={() => setShowFilters(!showFilters)}
        icon={<Filter className="h-4 w-4" />}
      >
        {showFilters ? 'Hide Filters' : 'Show Filters'}
      </Button>

      {showFilters && (
        <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField label="Date Range">
              <Select
                value={filters.dateRange}
                onChange={(e) => onFilterChange({ ...filters, dateRange: e.target.value })}
              >
                <option value="1M">Last Month</option>
                <option value="3M">Last 3 Months</option>
                <option value="6M">Last 6 Months</option>
                <option value="1Y">Last Year</option>
                <option value="YTD">Year to Date</option>
                <option value="custom">Custom</option>
              </Select>
            </FormField>

            {filters.dateRange === 'custom' && (
              <>
                <FormField label="Start Date">
                  <Input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => onFilterChange({ ...filters, startDate: e.target.value })}
                  />
                </FormField>

                <FormField label="End Date">
                  <Input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => onFilterChange({ ...filters, endDate: e.target.value })}
                  />
                </FormField>
              </>
            )}

            <FormField label="Portfolio Type">
              <Select
                value={filters.portfolioType}
                onChange={(e) => onFilterChange({ ...filters, portfolioType: e.target.value })}
              >
                <option value="all">All Types</option>
                <option value="traditional">Traditional</option>
                <option value="investment">Investment</option>
                <option value="leasing">Leasing</option>
              </Select>
            </FormField>

            <FormField label="Asset Class">
              <Select
                value={filters.assetClass}
                onChange={(e) => onFilterChange({ ...filters, assetClass: e.target.value })}
              >
                <option value="all">All Classes</option>
                <option value="equity">Equity</option>
                <option value="fixed_income">Fixed Income</option>
                <option value="real_estate">Real Estate</option>
                <option value="cash">Cash</option>
              </Select>
            </FormField>
          </div>
        </div>
      )}
    </div>
  );
}
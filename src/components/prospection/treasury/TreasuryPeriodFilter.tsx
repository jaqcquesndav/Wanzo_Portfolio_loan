// src/components/prospection/treasury/TreasuryPeriodFilter.tsx
import { Calendar, TrendingUp } from 'lucide-react';
import { Button } from '../../ui/Button';
import type { TimeseriesScale, TreasuryPeriod } from '../../../types/company';

interface TreasuryPeriodFilterProps {
  selectedScale: TimeseriesScale;
  onScaleChange: (scale: TimeseriesScale) => void;
  periods: TreasuryPeriod[];
  selectedPeriod: TreasuryPeriod | null;
  onPeriodSelect: (period: TreasuryPeriod | null) => void;
}

const scaleLabels: Record<TimeseriesScale, string> = {
  weekly: 'Hebdomadaire',
  monthly: 'Mensuel',
  quarterly: 'Trimestriel',
  annual: 'Annuel'
};

export function TreasuryPeriodFilter({
  selectedScale,
  onScaleChange,
  periods,
  selectedPeriod,
  onPeriodSelect
}: TreasuryPeriodFilterProps) {
  const scales: TimeseriesScale[] = ['weekly', 'monthly', 'quarterly', 'annual'];

  const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-4">
      {/* Scale Selector */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <span className="font-medium text-gray-900 dark:text-white">
            Échelle temporelle
          </span>
        </div>
        
        <div className="flex gap-2">
          {scales.map(scale => (
            <Button
              key={scale}
              size="sm"
              variant={selectedScale === scale ? 'primary' : 'outline'}
              onClick={() => {
                onScaleChange(scale);
                onPeriodSelect(null); // Reset period selection when scale changes
              }}
            >
              {scaleLabels[scale]}
            </Button>
          ))}
        </div>
      </div>

      {/* Period List */}
      {periods.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Sélectionner une période pour voir les détails :
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 max-h-48 overflow-y-auto">
            {periods.map(period => {
              const isSelected = selectedPeriod?.periodId === period.periodId;
              
              return (
                <button
                  key={period.periodId}
                  onClick={() => onPeriodSelect(isSelected ? null : period)}
                  className={`
                    p-3 rounded-lg border-2 transition-all text-left
                    ${isSelected
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700'
                    }
                  `}
                >
                  <div className="font-semibold text-sm text-gray-900 dark:text-white mb-1">
                    {period.periodId}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    {formatDate(period.startDate)} - {formatDate(period.endDate)}
                  </div>
                  <div className="flex items-center gap-1 mt-2">
                    <TrendingUp className="w-3 h-3 text-green-600" />
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      {period.accountsCount} compte{period.accountsCount > 1 ? 's' : ''}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {periods.length === 0 && (
        <div className="text-center py-4 text-gray-500 dark:text-gray-400 text-sm">
          Aucune donnée disponible pour cette échelle temporelle
        </div>
      )}
    </div>
  );
}

import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface PerformanceComparisonCardProps {
  portfolioName: string;
  value: number;
  trend: 'up' | 'down' | 'neutral';
  unit?: string;
  highlight?: boolean;
}

export const PerformanceComparisonCard: React.FC<PerformanceComparisonCardProps> = ({
  portfolioName,
  value,
  trend,
  unit = '%',
  highlight = false,
}) => {
  const trendIcon =
    trend === 'up' ? <ArrowUpRight className="h-5 w-5 text-green-500" /> :
    trend === 'down' ? <ArrowDownRight className="h-5 w-5 text-red-500" /> :
    null;

  return (
    <div className={`flex flex-col items-center justify-center rounded-lg shadow p-4 min-w-[160px] bg-white dark:bg-gray-900 border transition-all duration-200 ${highlight ? 'border-primary scale-105' : 'border-gray-200 dark:border-gray-700'}`}>
      <span className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 text-center truncate max-w-[120px]">{portfolioName}</span>
      <div className="flex items-center gap-2">
        <span className={`text-xl font-bold ${highlight ? 'text-primary' : 'text-gray-900 dark:text-white'}`}>{value}{unit}</span>
        {trendIcon}
      </div>
    </div>
  );
};

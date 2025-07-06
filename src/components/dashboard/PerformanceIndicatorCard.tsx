import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

interface PerformanceIndicatorCardProps {
  label: string;
  value: string | number;
  trend?: 'up' | 'down' | 'neutral';
  tag?: string;
  color?: string;
}

export const PerformanceIndicatorCard: React.FC<PerformanceIndicatorCardProps> = ({ label, value, trend = 'neutral', tag, color = '#2563eb' }) => {
  const trendIcon =
    trend === 'up' ? <ArrowUpRight className="h-5 w-5 text-green-500" /> :
    trend === 'down' ? <ArrowDownRight className="h-5 w-5 text-red-500" /> :
    <Minus className="h-5 w-5 text-gray-400" />;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-2 flex flex-col items-start min-w-[120px] min-h-[64px] max-h-[72px]">
      <div className="flex items-center gap-2 mb-0.5">
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{label}</span>
        {tag && <span className="ml-2 px-2 py-0.5 rounded text-xs font-semibold" style={{ background: color + '22', color }}>{tag}</span>}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-lg font-bold text-gray-900 dark:text-white">{value}</span>
        {trendIcon}
      </div>
    </div>
  );
};

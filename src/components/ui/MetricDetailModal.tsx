import React from 'react';
import type { Indicator } from '../../types/dashboard';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MetricDetailModalProps {
  open: boolean;
  onClose: () => void;
  indicator: Indicator | null;
}

const getTrendIcon = (trend?: 'up' | 'down' | 'neutral') => {
  if (trend === 'up') return <TrendingUp className="inline h-5 w-5 text-green-500 ml-1" />;
  if (trend === 'down') return <TrendingDown className="inline h-5 w-5 text-red-500 ml-1" />;
  return <Minus className="inline h-5 w-5 text-gray-400 ml-1" />;
};

export const MetricDetailModal: React.FC<MetricDetailModalProps> = ({ open, onClose, indicator }) => {
  if (!open || !indicator) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-lg relative">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          onClick={onClose}
          aria-label="Fermer le détail"
        >
          &times;
        </button>
        <h2 className="text-xl font-semibold mb-2 flex items-center">
          {indicator.label}
          {getTrendIcon(indicator.trend)}
        </h2>
        <div className="mb-4 text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          {indicator.value}
          {indicator.tag && (
            <span
              className="px-2 py-1 rounded text-xs font-semibold"
              style={{ background: indicator.color ?? '#eee', color: '#fff' }}
            >
              {indicator.tag}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

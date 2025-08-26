import React from 'react';
import { MultiSegmentSpinner } from './MultiSegmentSpinner';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  message?: string;
}

/**
 * @deprecated Utilisez MultiSegmentSpinner à la place pour un design plus moderne
 */
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'medium', 
  message = 'Chargement en cours...' 
}) => {
  return (
    <div className="flex flex-col items-center justify-center">
      <MultiSegmentSpinner size={size} />
      {message && <p className="mt-4 text-gray-600 animate-pulse">{message}</p>}
    </div>
  );
};

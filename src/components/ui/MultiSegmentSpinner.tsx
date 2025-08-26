import React from 'react';

interface MultiSegmentSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export const MultiSegmentSpinner: React.FC<MultiSegmentSpinnerProps> = ({ 
  size = 'medium',
  className = ''
}) => {
  const sizeConfig = {
    small: {
      outer: 'w-12 h-12 border-3',
      middle: 'w-8 h-8 border-2',
      inner: 'w-4 h-4 border-2',
      center: 'w-1 h-1'
    },
    medium: {
      outer: 'w-16 h-16 border-3',
      middle: 'w-11 h-11 border-3',
      inner: 'w-6 h-6 border-2',
      center: 'w-1.5 h-1.5'
    },
    large: {
      outer: 'w-20 h-20 border-4',
      middle: 'w-14 h-14 border-3',
      inner: 'w-8 h-8 border-2',
      center: 'w-2 h-2'
    }
  };

  const config = sizeConfig[size];

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* Anneau extérieur - rotation lente */}
      <div className={`absolute ${config.outer} border-primary/30 border-t-primary rounded-full animate-spin`}></div>
      
      {/* Anneau moyen - rotation normale */}
      <div 
        className={`absolute ${config.middle} border-primary/50 border-r-primary rounded-full animate-spin`}
        style={{ animationDuration: '0.8s' }}
      ></div>
      
      {/* Anneau intérieur - rotation rapide */}
      <div 
        className={`absolute ${config.inner} border-primary/70 border-b-primary rounded-full animate-spin`}
        style={{ animationDuration: '0.5s' }}
      ></div>
      
      {/* Point central */}
      <div className={`${config.center} bg-primary rounded-full animate-pulse`}></div>
    </div>
  );
};

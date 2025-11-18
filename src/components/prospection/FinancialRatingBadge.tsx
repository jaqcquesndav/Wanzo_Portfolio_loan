// src/components/prospection/FinancialRatingBadge.tsx
import type { FinancialRating } from '../../types/company';

interface FinancialRatingBadgeProps {
  rating: FinancialRating;
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
}

/**
 * Badge de rating financier (AAA à E) avec code couleur pour évaluation visuelle rapide
 * 
 * Échelle de couleurs:
 * - AAA/AA: Vert foncé (excellence financière)
 * - A/BBB: Vert (bonne santé financière)
 * - BB/B: Jaune (santé financière acceptable)
 * - C/D: Orange (fragilité financière)
 * - E: Rouge (risque élevé)
 */
export function FinancialRatingBadge({ rating, size = 'medium', showLabel = true }: FinancialRatingBadgeProps) {
  // Configuration des couleurs et labels
  const ratingConfig: Record<FinancialRating, { color: string; bg: string; label: string; description: string }> = {
    'AAA': { 
      color: 'text-emerald-900', 
      bg: 'bg-emerald-100 border-emerald-300', 
      label: 'AAA',
      description: 'Excellence financière' 
    },
    'AA': { 
      color: 'text-emerald-800', 
      bg: 'bg-emerald-100 border-emerald-300', 
      label: 'AA',
      description: 'Très bonne santé' 
    },
    'A': { 
      color: 'text-green-800', 
      bg: 'bg-green-100 border-green-300', 
      label: 'A',
      description: 'Bonne santé financière' 
    },
    'BBB': { 
      color: 'text-green-700', 
      bg: 'bg-green-100 border-green-300', 
      label: 'BBB',
      description: 'Santé financière correcte' 
    },
    'BB': { 
      color: 'text-yellow-800', 
      bg: 'bg-yellow-100 border-yellow-300', 
      label: 'BB',
      description: 'Santé acceptable' 
    },
    'B': { 
      color: 'text-yellow-700', 
      bg: 'bg-yellow-100 border-yellow-300', 
      label: 'B',
      description: 'Acceptable' 
    },
    'C': { 
      color: 'text-orange-800', 
      bg: 'bg-orange-100 border-orange-300', 
      label: 'C',
      description: 'Fragilité financière' 
    },
    'D': { 
      color: 'text-orange-700', 
      bg: 'bg-orange-100 border-orange-300', 
      label: 'D',
      description: 'Situation préoccupante' 
    },
    'E': { 
      color: 'text-red-800', 
      bg: 'bg-red-100 border-red-300', 
      label: 'E',
      description: 'Risque élevé' 
    }
  };

  const config = ratingConfig[rating];

  // Classes de taille
  const sizeClasses = {
    small: 'px-2 py-0.5 text-xs',
    medium: 'px-3 py-1 text-sm',
    large: 'px-4 py-1.5 text-base'
  };

  return (
    <div className="inline-flex flex-col items-center gap-1">
      <span 
        className={`
          ${sizeClasses[size]}
          ${config.color}
          ${config.bg}
          font-bold
          rounded-md
          border-2
          inline-flex items-center justify-center
          min-w-[3rem]
          dark:opacity-90
        `}
        title={config.description}
      >
        {config.label}
      </span>
      
      {showLabel && (
        <span className={`text-xs ${config.color} font-medium`}>
          {config.description}
        </span>
      )}
    </div>
  );
}

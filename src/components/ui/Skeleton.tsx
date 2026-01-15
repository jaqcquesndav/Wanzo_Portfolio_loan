/**
 * Composants Skeleton pour le chargement progressif
 * Style YouTube/moderne avec animations shimmer
 */

import React from 'react';

interface SkeletonProps {
  className?: string;
  animate?: boolean;
  style?: React.CSSProperties;
}

/**
 * Skeleton de base avec animation shimmer
 */
export function Skeleton({ className = '', animate = true, style }: SkeletonProps) {
  return (
    <div
      className={`
        bg-skeleton-base dark:bg-[var(--skeleton-base)]
        ${animate ? 'animate-shimmer bg-gradient-to-r from-transparent via-skeleton-highlight dark:via-[var(--skeleton-highlight)] to-transparent bg-[length:200%_100%]' : ''}
        rounded
        ${className}
      `}
      style={{
        backgroundColor: 'var(--skeleton-base)',
        ...style,
      }}
    />
  );
}

/**
 * Skeleton pour le texte (lignes)
 */
export function SkeletonText({ 
  lines = 3, 
  className = '',
  animate = true 
}: { 
  lines?: number; 
  className?: string;
  animate?: boolean;
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          animate={animate}
          className={`h-4 ${i === lines - 1 ? 'w-3/4' : 'w-full'}`}
        />
      ))}
    </div>
  );
}

/**
 * Skeleton pour avatar/image circulaire
 */
export function SkeletonAvatar({ 
  size = 'md',
  animate = true 
}: { 
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animate?: boolean;
}) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  return (
    <Skeleton 
      animate={animate}
      className={`${sizeClasses[size]} rounded-full`} 
    />
  );
}

/**
 * Skeleton pour une carte
 */
export function SkeletonCard({ 
  className = '',
  animate = true 
}: { 
  className?: string;
  animate?: boolean;
}) {
  return (
    <div className={`
      bg-white dark:bg-[var(--color-surface)]
      rounded-lg border border-gray-200 dark:border-[var(--color-border)]
      p-4 space-y-4
      ${className}
    `}>
      <div className="flex items-center space-x-3">
        <SkeletonAvatar size="md" animate={animate} />
        <div className="flex-1 space-y-2">
          <Skeleton animate={animate} className="h-4 w-1/3" />
          <Skeleton animate={animate} className="h-3 w-1/4" />
        </div>
      </div>
      <SkeletonText lines={2} animate={animate} />
      <div className="flex justify-between items-center pt-2">
        <Skeleton animate={animate} className="h-8 w-24" />
        <Skeleton animate={animate} className="h-8 w-20" />
      </div>
    </div>
  );
}

/**
 * Skeleton pour le tableau
 */
export function SkeletonTable({ 
  rows = 5,
  columns = 4,
  animate = true 
}: { 
  rows?: number;
  columns?: number;
  animate?: boolean;
}) {
  return (
    <div className="
      bg-white dark:bg-[var(--color-surface)]
      rounded-lg border border-gray-200 dark:border-[var(--color-border)]
      overflow-hidden
    ">
      {/* Header */}
      <div className="
        flex items-center gap-4 p-4
        bg-gray-50 dark:bg-[var(--color-background-tertiary)]
        border-b border-gray-200 dark:border-[var(--color-border)]
      ">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton 
            key={`header-${i}`}
            animate={animate}
            className={`h-4 ${i === 0 ? 'w-32' : 'flex-1'}`}
          />
        ))}
      </div>
      
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div
          key={`row-${rowIndex}`}
          className="
            flex items-center gap-4 p-4
            border-b border-gray-100 dark:border-[var(--color-border)]
            last:border-b-0
          "
          style={{ animationDelay: `${rowIndex * 50}ms` }}
        >
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton
              key={`cell-${rowIndex}-${colIndex}`}
              animate={animate}
              className={`h-4 ${colIndex === 0 ? 'w-32' : 'flex-1'}`}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

/**
 * Skeleton pour le header/navigation
 */
export function SkeletonHeader({ animate = true }: { animate?: boolean }) {
  return (
    <div className="
      flex items-center justify-between p-4
      bg-white dark:bg-[var(--color-surface)]
      border-b border-gray-200 dark:border-[var(--color-border)]
    ">
      {/* Logo */}
      <div className="flex items-center space-x-3">
        <Skeleton animate={animate} className="w-8 h-8 rounded-lg" />
        <Skeleton animate={animate} className="h-5 w-24" />
      </div>
      
      {/* Nav items */}
      <div className="hidden md:flex items-center space-x-6">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} animate={animate} className="h-4 w-16" />
        ))}
      </div>
      
      {/* User section */}
      <div className="flex items-center space-x-3">
        <Skeleton animate={animate} className="h-8 w-8 rounded-full" />
        <Skeleton animate={animate} className="hidden sm:block h-4 w-20" />
      </div>
    </div>
  );
}

/**
 * Skeleton pour le sidebar
 */
export function SkeletonSidebar({ animate = true }: { animate?: boolean }) {
  return (
    <div className="
      w-64 h-full p-4 space-y-6
      bg-white dark:bg-[var(--color-surface)]
      border-r border-gray-200 dark:border-[var(--color-border)]
    ">
      {/* Logo */}
      <div className="flex items-center space-x-3 pb-4 border-b border-gray-100 dark:border-[var(--color-border)]">
        <Skeleton animate={animate} className="w-10 h-10 rounded-lg" />
        <Skeleton animate={animate} className="h-5 w-28" />
      </div>
      
      {/* Nav sections */}
      {[1, 2, 3].map((section) => (
        <div key={section} className="space-y-2">
          <Skeleton animate={animate} className="h-3 w-20 mb-3" />
          {[1, 2, 3].map((item) => (
            <div key={item} className="flex items-center space-x-3 py-2">
              <Skeleton animate={animate} className="w-5 h-5 rounded" />
              <Skeleton animate={animate} className="h-4 flex-1" />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

/**
 * Skeleton pour le dashboard stats
 */
export function SkeletonStats({ 
  count = 4,
  animate = true 
}: { 
  count?: number;
  animate?: boolean;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="
            bg-white dark:bg-[var(--color-surface)]
            rounded-lg border border-gray-200 dark:border-[var(--color-border)]
            p-4 space-y-3
          "
          style={{ animationDelay: `${i * 100}ms` }}
        >
          <div className="flex items-center justify-between">
            <Skeleton animate={animate} className="h-4 w-20" />
            <Skeleton animate={animate} className="w-8 h-8 rounded-lg" />
          </div>
          <Skeleton animate={animate} className="h-8 w-24" />
          <Skeleton animate={animate} className="h-3 w-16" />
        </div>
      ))}
    </div>
  );
}

/**
 * Skeleton pour le graphique
 */
export function SkeletonChart({ 
  className = '',
  animate = true 
}: { 
  className?: string;
  animate?: boolean;
}) {
  return (
    <div className={`
      bg-white dark:bg-[var(--color-surface)]
      rounded-lg border border-gray-200 dark:border-[var(--color-border)]
      p-4
      ${className}
    `}>
      <div className="flex items-center justify-between mb-4">
        <Skeleton animate={animate} className="h-5 w-32" />
        <div className="flex space-x-2">
          <Skeleton animate={animate} className="h-8 w-16 rounded" />
          <Skeleton animate={animate} className="h-8 w-16 rounded" />
        </div>
      </div>
      
      {/* Chart area */}
      <div className="h-64 flex items-end justify-between space-x-2 pt-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <Skeleton
            key={i}
            animate={animate}
            className="flex-1 rounded-t"
            style={{ height: `${Math.random() * 60 + 20}%` }}
          />
        ))}
      </div>
      
      {/* Legend */}
      <div className="flex justify-center space-x-6 mt-4 pt-4 border-t border-gray-100 dark:border-[var(--color-border)]">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center space-x-2">
            <Skeleton animate={animate} className="w-3 h-3 rounded-full" />
            <Skeleton animate={animate} className="h-3 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Skeleton pour la page dashboard complète
 */
export function SkeletonDashboard({ animate = true }: { animate?: boolean }) {
  return (
    <div className="space-y-6 p-6 animate-fadeIn">
      {/* Header de page */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton animate={animate} className="h-8 w-48" />
          <Skeleton animate={animate} className="h-4 w-64" />
        </div>
        <div className="flex space-x-3">
          <Skeleton animate={animate} className="h-10 w-32 rounded-lg" />
          <Skeleton animate={animate} className="h-10 w-10 rounded-lg" />
        </div>
      </div>
      
      {/* Stats */}
      <SkeletonStats count={4} animate={animate} />
      
      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SkeletonChart animate={animate} />
        <SkeletonChart animate={animate} />
      </div>
      
      {/* Table */}
      <SkeletonTable rows={5} columns={5} animate={animate} />
    </div>
  );
}

/**
 * Wrapper conditionnel pour afficher skeleton ou contenu
 */
export function SkeletonWrapper({
  isLoading,
  skeleton,
  children,
  delay = 0,
}: {
  isLoading: boolean;
  skeleton: React.ReactNode;
  children: React.ReactNode;
  delay?: number;
}) {
  const [showSkeleton, setShowSkeleton] = React.useState(true);

  React.useEffect(() => {
    if (!isLoading) {
      // Petit délai pour éviter le flash si le chargement est très rapide
      const timer = setTimeout(() => setShowSkeleton(false), delay);
      return () => clearTimeout(timer);
    } else {
      setShowSkeleton(true);
    }
  }, [isLoading, delay]);

  if (isLoading || showSkeleton) {
    return <>{skeleton}</>;
  }

  return (
    <div className="animate-fadeIn">
      {children}
    </div>
  );
}

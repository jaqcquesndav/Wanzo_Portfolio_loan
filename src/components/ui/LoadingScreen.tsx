import { cn } from '../../utils/cn';

interface LoadingScreenProps {
  message?: string;
  className?: string;
  overlay?: boolean;
  variant?: 'default' | 'skeleton' | 'minimal';
}

export function LoadingScreen({ 
  message, 
  className = '',
  overlay = true,
  variant = 'skeleton',
}: LoadingScreenProps) {
  
  // Variante minimale - simple spinner
  if (variant === 'minimal') {
    return (
      <div className={cn("flex items-center justify-center p-8", className)}>
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Variante par défaut - logo + spinner discret
  if (variant === 'default') {
    return (
      <div className={cn(
        "flex flex-col items-center justify-center",
        overlay ? "fixed inset-0 bg-[var(--color-background)] z-50" : "min-h-[200px]",
        className
      )}>
        <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center mb-4">
          <span className="text-white font-bold text-lg">W</span>
        </div>
        <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        {message && (
          <p className="mt-4 text-sm text-[var(--color-text-tertiary)]">{message}</p>
        )}
      </div>
    );
  }

  // Variante skeleton - chargement initial de l'app
  return (
    <div className={cn(
      overlay ? "fixed inset-0 z-50" : "",
      "bg-[var(--color-background)]",
      className
    )}>
      <AppSkeletonView />
    </div>
  );
}

/**
 * Vue skeleton minimaliste pour le chargement initial
 */
function AppSkeletonView() {
  return (
    <div className="min-h-screen flex">
      {/* Sidebar skeleton */}
      <div className="hidden lg:flex flex-col w-64 border-r border-[var(--color-border)] bg-[var(--color-surface)] p-4">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-lg bg-[var(--skeleton-base)] animate-pulse" />
          <div className="h-5 w-24 bg-[var(--skeleton-base)] rounded animate-pulse" />
        </div>
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-10 bg-[var(--skeleton-base)] rounded-lg animate-pulse" />
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="h-16 border-b border-[var(--color-border)] flex items-center justify-between px-6">
          <div className="h-5 w-32 bg-[var(--skeleton-base)] rounded animate-pulse" />
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[var(--skeleton-base)] rounded-lg animate-pulse" />
            <div className="w-8 h-8 bg-[var(--skeleton-base)] rounded-full animate-pulse" />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-[var(--skeleton-base)] rounded-xl animate-pulse" />
            ))}
          </div>

          {/* Chart placeholder */}
          <div className="h-64 bg-[var(--skeleton-base)] rounded-xl animate-pulse" />

          {/* Table placeholder */}
          <div className="bg-[var(--skeleton-base)] rounded-xl animate-pulse h-48" />
        </div>
      </div>
    </div>
  );
}

/**
 * Inline loader pour les sections
 */
export function InlineLoader({ 
  size = 'md',
  className = '' 
}: { 
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const sizeClasses = {
    sm: 'h-4 w-4 border',
    md: 'h-5 w-5 border-2',
    lg: 'h-6 w-6 border-2',
  };

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div className={cn(
        "animate-spin rounded-full border-primary border-t-transparent",
        sizeClasses[size]
      )} />
    </div>
  );
}

/**
 * Skeleton générique pour contenu
 */
export function ContentSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={cn("animate-pulse", className)}>
      <div className="h-4 bg-[var(--skeleton-base)] rounded w-3/4 mb-2" />
      <div className="h-4 bg-[var(--skeleton-base)] rounded w-1/2" />
    </div>
  );
}

export default LoadingScreen;

// src/components/ui/Spinner.tsx
import { cn } from '../../utils/cn';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'button' | 'table' | 'screen';
  className?: string;
  color?: string;
}

export function Spinner({ 
  size = 'md', 
  variant = 'default',
  className = '',
  color = 'border-primary'
}: SpinnerProps) {
  // Styles spécifiques selon votre approche
  const spinnerStyles = {
    // Spinner principal (LoadingScreen)
    screen: 'animate-spin rounded-full border-b-2',
    // Spinner bouton avec SVG
    button: 'animate-spin',
    // Spinner table
    table: 'animate-spin rounded-full border-b-2',
    // Default
    default: 'animate-spin rounded-full border-b-2'
  };

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6', 
    lg: 'h-8 w-8',
    xl: 'h-12 w-12'
  };

  // Pour les boutons, utiliser le SVG spécifique
  if (variant === 'button') {
    return (
      <svg 
        className={cn(
          spinnerStyles.button,
          "-ml-1 mr-2 h-4 w-4 text-white",
          className
        )}
        fill="none" 
        viewBox="0 0 24 24"
      >
        <circle 
          className="opacity-25" 
          cx="12" 
          cy="12" 
          r="10" 
          stroke="currentColor" 
          strokeWidth="4" 
        />
        <path 
          className="opacity-75" 
          fill="currentColor" 
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" 
        />
      </svg>
    );
  }

  // Pour les autres variants, utiliser le div avec border
  return (
    <div 
      className={cn(
        spinnerStyles[variant],
        sizeClasses[size],
        color,
        className
      )}
    />
  );
}

export default Spinner;

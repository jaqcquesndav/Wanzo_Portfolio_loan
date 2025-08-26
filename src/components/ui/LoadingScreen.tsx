import { cn } from '../../utils/cn';

interface LoadingScreenProps {
  message?: string;
  className?: string;
  overlay?: boolean;
}

export function LoadingScreen({ 
  message = "Chargement...", 
  className = '',
  overlay = true 
}: LoadingScreenProps) {
  return (
    <div 
      className={cn(
        "flex flex-col items-center justify-center",
        overlay ? "fixed inset-0 bg-white dark:bg-gray-900 z-50" : "min-h-[400px]",
        className
      )}
    >
      {/* Spinner principal avec style spécifié */}
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
      
      {/* Message de chargement */}
      {message && (
        <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
          {message}
        </p>
      )}
    </div>
  );
}

export default LoadingScreen;

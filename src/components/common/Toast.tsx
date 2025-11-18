import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

interface ToastProps {
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  onClose: () => void;
}

export function Toast({ type, message, onClose }: ToastProps) {
  // Détermine les classes et l'icône en fonction du type
  const getToastClasses = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-500 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'error':
        return 'bg-red-50 border-red-500 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'warning':
        return 'bg-yellow-50 border-yellow-500 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'info':
      default:
        return 'bg-blue-50 border-blue-500 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
    }
  };

  const getToastIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5" />;
      case 'error':
        return <AlertCircle className="h-5 w-5" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5" />;
      case 'info':
      default:
        return <Info className="h-5 w-5" />;
    }
  };

  return (
    <div className={`rounded-lg border-l-4 p-4 shadow-md ${getToastClasses()}`}>
      <div className="flex items-center">
        <div className="flex-shrink-0">
          {getToastIcon()}
        </div>
        <div className="ml-3 mr-8 flex-1">
          <p className="text-sm">{message}</p>
        </div>
        <button
          type="button"
          className="flex-shrink-0 ml-auto"
          onClick={onClose}
          aria-label="Fermer"
        >
          <X className="h-5 w-5 cursor-pointer hover:opacity-75" />
        </button>
      </div>
    </div>
  );
}

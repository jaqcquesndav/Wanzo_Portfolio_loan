import React from 'react';
import { AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';
import { cn } from '../../utils/cn';

const variants = {
  success: 'bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-100 border-green-200 dark:border-green-800',
  error: 'bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-100 border-red-200 dark:border-red-800',
  warning: 'bg-yellow-50 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-100 border-yellow-200 dark:border-yellow-800',
  info: 'bg-blue-50 text-blue-800 dark:bg-blue-900/20 dark:text-blue-100 border-blue-200 dark:border-blue-800',
} as const;

type AlertVariant = keyof typeof variants;

interface AlertProps {
  children: React.ReactNode;
  variant?: AlertVariant;
  className?: string;
}

export function Alert({ children, variant = 'info', className }: AlertProps) {
  const getIcon = () => {
    switch (variant) {
      case 'success':
        return <CheckCircle className="h-5 w-5 mr-3" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 mr-3" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 mr-3" />;
      default:
        return <Info className="h-5 w-5 mr-3" />;
    }
  };

  return (
    <div className={cn(
      'flex items-center p-4 rounded-lg border',
      variants[variant],
      className
    )}>
      {getIcon()}
      <div className="flex-1">{children}</div>
    </div>
  );
}

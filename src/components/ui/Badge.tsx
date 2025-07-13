import React from 'react';
import { cn } from '../../utils/cn';

const variants = {
  primary: 'bg-primary-light text-primary',
  secondary: 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
  success: 'bg-success-light text-success',
  warning: 'bg-warning-light text-warning',
  danger: 'bg-error-light text-error',
  error: 'bg-error-light text-error'
} as const;

type BadgeVariant = keyof typeof variants;

interface BadgeProps {
  children: React.ReactNode;
  variant: BadgeVariant;
  className?: string;
  onClick?: () => void;
}

export function Badge({ children, variant, className, onClick }: BadgeProps) {
  return (
    <span 
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        variants[variant],
        onClick ? 'cursor-pointer' : '',
        className
      )}
      onClick={onClick}
    >
      {children}
    </span>
  );
}
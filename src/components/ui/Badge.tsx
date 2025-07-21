import React from 'react';
import { cn } from '../../utils/cn';

const variants = {
  primary: 'bg-primary-light text-primary',
  secondary: 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
  success: 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100',
  warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100',
  danger: 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100',
  error: 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
} as const;

type BadgeVariant = keyof typeof variants;

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
  onClick?: () => void;
}

export function Badge({ children, variant = 'secondary', className, onClick }: BadgeProps) {
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
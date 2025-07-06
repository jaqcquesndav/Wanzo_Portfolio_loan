import React, { forwardRef } from 'react';
import { cn } from '../../../utils/cn';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = '', error, children, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={cn(
          'block w-full pl-3 pr-10 py-2 text-base border rounded-md shadow-sm',
          'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100',
          error
            ? 'border-red-300 focus:ring-red-500 focus:border-red-500 dark:border-red-600'
            : 'border-gray-300 focus:ring-primary focus:border-primary dark:border-gray-600',
          className
        )}
        {...props}
      >
        {children}
      </select>
    );
  }
);

Select.displayName = 'Select';
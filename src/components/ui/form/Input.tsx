import React, { forwardRef } from 'react';
import { cn } from '../../../utils/cn';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
  error?: boolean;
  multiline?: boolean;
  rows?: number;
}

export const Input = forwardRef<HTMLInputElement | HTMLTextAreaElement, InputProps>(
  ({ className = '', error, multiline, rows = 3, ...props }, ref) => {
    const baseStyles = cn(
      'block w-full px-3 py-2 border rounded-md shadow-sm text-sm',
      'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100',
      error
        ? 'border-red-300 focus:ring-red-500 focus:border-red-500 dark:border-red-600'
        : 'border-gray-300 focus:ring-primary focus:border-primary dark:border-gray-600',
      'placeholder-gray-400 dark:placeholder-gray-500',
      className
    );

    if (multiline) {
      return (
        <textarea
          ref={ref as React.ForwardedRef<HTMLTextAreaElement>}
          rows={rows}
          className={baseStyles}
          {...props}
        />
      );
    }

    return (
      <input
        ref={ref as React.ForwardedRef<HTMLInputElement>}
        className={baseStyles}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';
import React, { forwardRef } from 'react';
import { cn } from '../../../utils/cn';

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ className = '', error, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          'block w-full px-3 py-2 border rounded-md shadow-sm text-sm',
          'dark:bg-gray-700 dark:text-gray-200',
          error
            ? 'border-red-300 focus:ring-red-500 focus:border-red-500 dark:border-red-600'
            : 'border-gray-300 focus:ring-primary focus:border-primary dark:border-gray-600',
          className
        )}
        {...props}
      />
    );
  }
);

TextArea.displayName = 'TextArea';
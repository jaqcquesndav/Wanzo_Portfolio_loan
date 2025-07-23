// components/ui/Separator.tsx
import { cn } from '../../lib/utils';

interface SeparatorProps {
  className?: string;
  orientation?: 'horizontal' | 'vertical';
}

export function Separator({ 
  className, 
  orientation = 'horizontal',
  ...props
}: SeparatorProps) {
  return (
    <div
      className={cn(
        'shrink-0 bg-gray-200',
        orientation === 'horizontal' ? 'h-px w-full' : 'h-full w-px',
        className
      )}
      {...props}
    />
  );
}

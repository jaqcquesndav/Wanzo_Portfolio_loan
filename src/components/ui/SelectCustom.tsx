import * as React from 'react';
import { cn } from '../../utils/cn';

export interface SelectCustomProps {
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
  children: React.ReactNode;
}

export const SelectCustom = React.forwardRef<HTMLDivElement, SelectCustomProps>(
  ({ className, children, ...props }) => {
    // Référence pour détecter les clics en dehors du composant
    const selectRef = React.useRef<HTMLDivElement>(null);
    
    return (
      <div 
        ref={selectRef}
        className={cn(
          "relative",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

SelectCustom.displayName = 'SelectCustom';

export interface SelectTriggerProps {
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
}

export function SelectTrigger({ className, children, onClick }: SelectTriggerProps) {
  return (
    <div 
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2",
        "text-sm ring-offset-background placeholder:text-muted-foreground cursor-pointer",
        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      onClick={onClick}
    >
      {children}
      <span className="ml-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 opacity-50">
          <path d="m6 9 6 6 6-6"/>
        </svg>
      </span>
    </div>
  );
}

export interface SelectValueProps {
  placeholder?: string;
  children?: React.ReactNode;
}

export function SelectValue({ placeholder, children }: SelectValueProps) {
  return <span className="flex-grow">{children || placeholder}</span>;
}

export interface SelectContentProps {
  className?: string;
  children: React.ReactNode;
  isOpen?: boolean;
}

export function SelectContent({ className, children, isOpen }: SelectContentProps) {
  if (!isOpen) return null;
  
  return (
    <div className={cn(
      "absolute z-50 min-w-[8rem] w-full mt-1 overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md",
      "animate-in fade-in-0 zoom-in-95",
      className
    )}>
      <div className="p-1">{children}</div>
    </div>
  );
}

export interface SelectItemProps {
  value: string;
  className?: string;
  children: React.ReactNode;
  onSelect?: (value: string) => void;
}

export function SelectItem({ value, className, children, onSelect }: SelectItemProps) {
  return (
    <div 
      className={cn(
        "relative flex cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none",
        "hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className
      )} 
      data-value={value}
      onClick={() => onSelect && onSelect(value)}
    >
      {children}
    </div>
  );
}

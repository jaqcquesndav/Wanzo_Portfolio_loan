// src/components/ui/Tabs.tsx
import React from 'react';
import { cn } from '../../utils/cn';

interface TabsProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

export function Tabs({ value, onValueChange, children, className }: TabsProps) {
  return (
    <div className={cn('w-full', className)}>
      {children}
    </div>
  );
}

interface TabsListProps {
  children: React.ReactNode;
  className?: string;
}

export function TabsList({ children, className }: TabsListProps) {
  return (
    <div className={cn('flex border-b border-gray-200', className)}>
      {children}
    </div>
  );
}

interface TabsTriggerProps {
  value: string;
  currentValue: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

export function TabsTrigger({ 
  value, 
  currentValue, 
  onValueChange, 
  children, 
  className 
}: TabsTriggerProps) {
  return (
    <button
      onClick={() => onValueChange(value)}
      className={cn(
        'px-4 py-2 text-sm font-medium',
        'border-b-2',
        value === currentValue 
          ? 'text-primary border-primary' 
          : 'text-gray-500 border-transparent hover:text-gray-700',
        'focus:outline-none',
        className
      )}
    >
      {children}
    </button>
  );
}

interface TabsContentProps {
  value: string;
  currentValue: string;
  children: React.ReactNode;
  className?: string;
}

export function TabsContent({ 
  value, 
  currentValue, 
  children, 
  className 
}: TabsContentProps) {
  if (value !== currentValue) return null;
  
  return (
    <div className={cn('mt-4', className)}>
      {children}
    </div>
  );
}

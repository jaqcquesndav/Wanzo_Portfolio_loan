import React, { ReactNode } from 'react';

interface DialogProps {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  children: ReactNode;
}

interface DialogContentProps {
  children: ReactNode;
}

interface DialogHeaderProps {
  children: ReactNode;
}

interface DialogTitleProps {
  children: ReactNode;
}

interface DialogFooterProps {
  children: ReactNode;
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  if (!open) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget && onOpenChange) {
          onOpenChange(false);
        }
      }}
    >
      {children}
    </div>
  );
}

export function DialogContent({ children }: DialogContentProps) {
  return (
    <div 
      className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[85vh] overflow-y-auto"
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </div>
  );
}

export function DialogHeader({ children }: DialogHeaderProps) {
  return (
    <div className="p-6 pb-3 border-b border-gray-200 dark:border-gray-700">
      {children}
    </div>
  );
}

export function DialogTitle({ children }: DialogTitleProps) {
  return (
    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
      {children}
    </h2>
  );
}

export function DialogFooter({ children }: DialogFooterProps) {
  return (
    <div className="flex justify-end gap-3 p-6 pt-3 border-t border-gray-200 dark:border-gray-700">
      {children}
    </div>
  );
}

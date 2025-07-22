import { ReactNode } from 'react';

interface DialogProps {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  children: ReactNode;
}

interface DialogContentProps {
  children: ReactNode;
  className?: string;
}

interface DialogHeaderProps {
  children: ReactNode;
}

interface DialogTitleProps {
  children: ReactNode;
  className?: string;
}

interface DialogFooterProps {
  children: ReactNode;
  className?: string;
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

export function DialogContent({ children, className }: DialogContentProps) {
  return (
    <div 
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[85vh] overflow-y-auto my-8 mx-auto ${className || ''}`}
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

export function DialogTitle({ children, className }: DialogTitleProps) {
  return (
    <h2 className={`text-xl font-semibold text-gray-900 dark:text-gray-100 ${className || ''}`}>
      {children}
    </h2>
  );
}

export function DialogFooter({ children, className }: DialogFooterProps) {
  return (
    <div className={`flex justify-end gap-3 p-6 pt-3 border-t border-gray-200 dark:border-gray-700 ${className || ''}`}>
      {children}
    </div>
  );
}

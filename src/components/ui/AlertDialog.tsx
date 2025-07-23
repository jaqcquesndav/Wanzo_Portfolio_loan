// components/ui/AlertDialog.tsx
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './Dialog';
import { Button } from './Button';
import { cn } from '../../lib/utils';

export interface AlertDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
}

export function AlertDialog({ open = false, onOpenChange, children }: AlertDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {children}
    </Dialog>
  );
}

export const AlertDialogContent = DialogContent;
export const AlertDialogHeader = DialogHeader;
export const AlertDialogTitle = DialogTitle;
export const AlertDialogDescription = DialogDescription;
export const AlertDialogFooter = DialogFooter;

export interface AlertDialogActionProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  children?: React.ReactNode;
}

export function AlertDialogAction({ className, ...props }: AlertDialogActionProps) {
  return (
    <Button
      className={cn("bg-blue-600 hover:bg-blue-700 text-white", className)}
      {...props}
    />
  );
}

export function AlertDialogCancel({ className, ...props }: AlertDialogActionProps) {
  return (
    <Button
      variant="outline"
      className={cn("border-gray-200", className)}
      {...props}
    />
  );
}

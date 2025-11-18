import { ReactNode } from 'react';
import { Toast } from './Toast';
import { useToastStore } from '../../stores/toastStore';

interface ToastContainerProps {
  children?: ReactNode;
}

export function ToastContainer({ children }: ToastContainerProps) {
  const toasts = useToastStore((state) => state.toasts);
  const removeToast = useToastStore((state) => state.removeToast);

  return (
    <>
      {children}
      <div className="fixed top-4 right-4 z-50 w-80 space-y-2 transition-all">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            type={toast.type}
            message={toast.message}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </>
  );
}

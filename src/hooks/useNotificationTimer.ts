import { useEffect } from 'react';

export function useNotificationTimer(
  id: string,
  duration: number | undefined,
  onRemove: (id: string) => void
) {
  useEffect(() => {
    if (duration && duration > 0) {
      const timer = setTimeout(() => {
        onRemove(id);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [id, duration, onRemove]);
}
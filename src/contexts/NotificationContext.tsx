import React, { useState, useRef, useCallback } from 'react';
import { NotificationType, Notification } from '../types/notifications';
import NotificationContainer from '../components/notifications/NotificationContainer';
import { notificationsApi } from '../services/api/shared/notifications.api';
import { NotificationContext } from './notificationContextTypes';

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  // Rate limiting state
  const apiCallInProgress = useRef(false);
  const lastApiCall = useRef<number>(0);
  const backoffDelay = useRef<number>(1000); // Start with 1 second
  const pendingOperations = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Helper function to check if we can make API calls
  const canCallApi = useCallback((): boolean => {
    const now = Date.now();
    if (apiCallInProgress.current) {
      return false;
    }
    if (now - lastApiCall.current < backoffDelay.current) {
      return false;
    }
    return true;
  }, []);

  // Handle rate limit errors with exponential backoff
  const handleRateLimitError = useCallback(() => {
    backoffDelay.current = Math.min(backoffDelay.current * 2, 30000); // Max 30 seconds
    setTimeout(() => {
      backoffDelay.current = Math.max(backoffDelay.current / 2, 1000); // Gradually reduce
    }, backoffDelay.current);
  }, []);

  // Debounced API call with rate limiting
  const debouncedApiCall = useCallback(
    (operation: 'create' | 'delete', notificationData: { id?: string; type?: NotificationType; message?: string; duration?: number }, delay: number = 2000) => {
      const operationKey = `${operation}-${notificationData.id || notificationData.type}`;
      
      // Clear existing timeout for this operation
      const existingTimeout = pendingOperations.current.get(operationKey);
      if (existingTimeout) {
        clearTimeout(existingTimeout);
      }

      // Set new debounced timeout
      const timeout = setTimeout(async () => {
        if (!canCallApi()) {
          // Retry later if rate limited
          setTimeout(() => debouncedApiCall(operation, notificationData, delay * 1.5), backoffDelay.current);
          return;
        }

        try {
          apiCallInProgress.current = true;
          lastApiCall.current = Date.now();

          if (operation === 'create' && notificationData.type && notificationData.message) {
            // Ensure required properties are present
            const notificationPayload = {
              type: notificationData.type,
              message: notificationData.message,
              duration: notificationData.duration
            };
            await notificationsApi.createNotification(notificationPayload);
          } else if (operation === 'delete' && notificationData.id) {
            await notificationsApi.deleteNotification(notificationData.id);
          }
          
          // Reset backoff on success
          backoffDelay.current = 1000;
        } catch (error: unknown) {
          if (error && typeof error === 'object' && 'response' in error) {
            const httpError = error as { response?: { status?: number } };
            if (httpError.response?.status === 429) {
              handleRateLimitError();
            }
          }
          // Don't throw error to avoid disrupting user experience
          console.warn('Notification API sync failed, continuing with local state:', error);
        } finally {
          apiCallInProgress.current = false;
          pendingOperations.current.delete(operationKey);
        }
      }, delay);

      pendingOperations.current.set(operationKey, timeout);
    },
    [canCallApi, handleRateLimitError]
  );

  // Declare removeNotification before using it
  const removeNotification = useCallback((id: string) => {
    // Remove from UI immediately (optimistic update)
    setNotifications(prev => prev.filter(notification => notification.id !== id));
    
    // Debounced API sync - don't flood the server
    debouncedApiCall('delete', { id }, 3000); // 3 second debounce for deletions
  }, [debouncedApiCall]);

  const showNotification = useCallback((message: string, type: NotificationType, duration = 5000) => {
    // Generate a local temporary ID
    const id = Math.random().toString(36).substring(2);
    const notification: Notification = { 
      id, 
      type, 
      message, 
      duration,
      date: new Date().toISOString(),
      read: false
    };
    
    // Immediate addition for UI (optimistic update)
    setNotifications(prev => [...prev, notification]);

    // Debounced API sync - don't flood the server
    debouncedApiCall('create', { type, message, duration }, 1000); // 1 second debounce for creations
    
    // Remove after specified duration (local removal only)
    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }
  }, [debouncedApiCall, removeNotification]);

  return (
    <NotificationContext.Provider value={{ notifications, showNotification, removeNotification }}>
      {children}
      <NotificationContainer />
    </NotificationContext.Provider>
  );
}

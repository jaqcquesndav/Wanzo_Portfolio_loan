import React from 'react';
import { Bell, Check, X } from 'lucide-react';
import { Button } from '../ui/Button';
import { useNotifications } from './hooks/useNotifications';
import { formatNotificationDate } from './utils/formatters';

interface NotificationsPopoverProps {
  onClose: () => void;
}

export function NotificationsPopover({ onClose }: NotificationsPopoverProps) {
  const { notifications, markAsRead, clearAll } = useNotifications();

  return (
    <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg ring-1 ring-black ring-opacity-5">
      <div className="p-4 border-b dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Notifications</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            icon={<X className="h-5 w-5" />}
          />
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
            Aucune notification
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {notifications.map(notification => (
              <div
                key={notification.id}
                className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 ${
                  notification.read ? 'opacity-75' : ''
                }`}
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <Bell className="h-5 w-5 text-primary dark:text-primary-light" />
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm text-gray-900 dark:text-white">{notification.message}</p>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {formatNotificationDate(notification.date)}
                    </p>
                  </div>
                  {!notification.read && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => markAsRead(notification.id)}
                      icon={<Check className="h-4 w-4" />}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {notifications.length > 0 && (
        <div className="p-4 border-t dark:border-gray-700">
          <Button
            variant="outline"
            size="sm"
            onClick={clearAll}
            className="w-full"
          >
            Tout marquer comme lu
          </Button>
        </div>
      )}
    </div>
  );
}
import { AlertCircle, CheckCircle, Info, X, AlertTriangle } from 'lucide-react';
import { Notification } from '../../types/notifications';
import { useNotification } from '../../contexts/useNotification';

export default function NotificationContainer() {
  const context = useNotification();
  if (!context) return null;

  const { notifications, removeNotification } = context;

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {notifications.map(notification => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onRemove={removeNotification}
        />
      ))}
    </div>
  );
}

interface NotificationItemProps {
  notification: Notification;
  onRemove: (id: string) => void;
}

function NotificationItem({ notification, onRemove }: NotificationItemProps) {
  const getTypeStyles = () => {
    switch (notification.type) {
      case 'success':
        return 'bg-green-50 text-green-800 dark:bg-green-900 dark:text-green-100';
      case 'error':
        return 'bg-red-50 text-red-800 dark:bg-red-900 dark:text-red-100';
      case 'warning':
        return 'bg-amber-50 text-amber-800 dark:bg-amber-900 dark:text-amber-100';
      default:
        return 'bg-blue-50 text-blue-800 dark:bg-blue-900 dark:text-blue-100';
    }
  };

  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 mr-3" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 mr-3" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 mr-3" />;
      default:
        return <Info className="h-5 w-5 mr-3" />;
    }
  };

  return (
    <div className={`flex items-center p-4 rounded-lg shadow-lg min-w-[320px] ${getTypeStyles()}`}>
      {getIcon()}
      <p className="text-sm font-medium flex-1">{notification.message}</p>
      <button
        onClick={() => onRemove(notification.id)}
        className="ml-4 text-gray-400 hover:text-gray-500 focus:outline-none"
      >
        <X className="h-5 w-5" />
      </button>
    </div>
  );
}
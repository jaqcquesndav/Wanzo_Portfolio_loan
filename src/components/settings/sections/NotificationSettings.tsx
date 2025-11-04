import { Switch } from '../../ui/Switch';
import { useApplicationSettings } from '../../../hooks/useSettingsApi';

export function NotificationSettings() {
  const { settings, updateNotificationSettings, loading } = useApplicationSettings();

  const handleToggle = async (setting: string, value: boolean) => {
    if (!settings) return;
    
    try {
      await updateNotificationSettings({ [setting]: value });
    } catch (error) {
      console.error('Error updating notification setting:', error);
    }
  };

  if (!settings) return <div>Chargement...</div>;

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <NotificationOption
          title="Notifications par email"
          description="Recevoir des notifications par email"
          checked={settings.notifications.emailEnabled}
          onChange={value => handleToggle('emailEnabled', value)}
          disabled={loading}
        />
        <NotificationOption
          title="Notifications push"
          description="Recevoir des notifications push"
          checked={settings.notifications.pushEnabled}
          onChange={value => handleToggle('pushEnabled', value)}
          disabled={loading}
        />
        <NotificationOption
          title="Notifications de bureau"
          description="Recevoir des notifications sur le bureau"
          checked={settings.notifications.desktopEnabled}
          onChange={value => handleToggle('desktopEnabled', value)}
          disabled={loading}
        />
      </div>
    </div>
  );
}

interface NotificationOptionProps {
  title: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

function NotificationOption({ title, description, checked, onChange }: NotificationOptionProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-sm font-medium text-gray-900 dark:text-white">{title}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
      </div>
      <Switch checked={checked} onChange={onChange} />
    </div>
  );
}
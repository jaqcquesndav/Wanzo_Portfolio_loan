import { Switch } from '../../ui/Switch';
import { useApplicationSettings } from '../../../hooks/useSettingsApi';
import { useTranslation } from 'react-i18next';

export function NotificationSettings() {
  const { settings, updateNotificationSettings, loading } = useApplicationSettings();
  const { t } = useTranslation();

  const handleToggle = async (setting: string, value: boolean) => {
    if (!settings?.notifications) return;
    
    try {
      await updateNotificationSettings({ [setting]: value });
    } catch (error) {
      console.error('Error updating notification setting:', error);
    }
  };

  // Afficher un état de chargement si les données ne sont pas encore disponibles
  if (!settings || !settings.notifications) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500 dark:text-gray-400">{t('settings.notifications.loading')}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <NotificationOption
          title={t('settings.notifications.email')}
          description={t('settings.notifications.emailDescription')}
          checked={settings.notifications.emailEnabled}
          onChange={value => handleToggle('emailEnabled', value)}
          disabled={loading}
        />
        <NotificationOption
          title={t('settings.notifications.push')}
          description={t('settings.notifications.pushDescription')}
          checked={settings.notifications.pushEnabled}
          onChange={value => handleToggle('pushEnabled', value)}
          disabled={loading}
        />
        <NotificationOption
          title={t('settings.notifications.desktop')}
          description={t('settings.notifications.desktopDescription')}
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
import React from 'react';
import { Switch } from '../../ui/Switch';
import { Button } from '../../ui/Button';
import { useNotification } from '../../../contexts/NotificationContext';
import { useNotificationSettings } from '../hooks/useNotificationSettings';

export function NotificationSettings() {
  const { showNotification } = useNotification();
  const { settings, updateSetting } = useNotificationSettings();

  const handleSave = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      showNotification('Préférences de notification mises à jour', 'success');
    } catch (error) {
      showNotification('Erreur lors de la mise à jour des préférences', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <NotificationOption
          title="Notifications par email"
          description="Recevoir des notifications par email"
          checked={settings.email}
          onChange={value => updateSetting('email', value)}
        />
        <NotificationOption
          title="Notifications push"
          description="Recevoir des notifications push"
          checked={settings.push}
          onChange={value => updateSetting('push', value)}
        />
        <NotificationOption
          title="Notifications SMS"
          description="Recevoir des notifications par SMS"
          checked={settings.sms}
          onChange={value => updateSetting('sms', value)}
        />
        <NotificationOption
          title="Communications marketing"
          description="Recevoir des offres et actualités"
          checked={settings.marketing}
          onChange={value => updateSetting('marketing', value)}
        />
      </div>
      <Button onClick={handleSave}>Enregistrer les préférences</Button>
    </div>
  );
}

interface NotificationOptionProps {
  title: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

function NotificationOption({ title, description, checked, onChange }: NotificationOptionProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-sm font-medium text-gray-900">{title}</h3>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
      <Switch checked={checked} onChange={onChange} />
    </div>
  );
}
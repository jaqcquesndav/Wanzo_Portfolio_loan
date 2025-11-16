import { useState, Suspense } from 'react';
import { Settings as SettingsIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { SettingsTabs } from '../components/settings/SettingsTabs';
import { SettingsSkeleton } from '../components/ui/SettingsSkeleton';

export default function Settings() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('security');

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <SettingsIcon className="h-6 w-6 text-primary mr-3" />
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            {t('settings.title')}
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t('settings.description', 'Gérez vos préférences et la configuration de l\'application')}
          </p>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <Suspense fallback={<SettingsSkeleton />}>
          <SettingsTabs activeTab={activeTab} onTabChange={setActiveTab} />
        </Suspense>
      </div>
    </div>
  );
}
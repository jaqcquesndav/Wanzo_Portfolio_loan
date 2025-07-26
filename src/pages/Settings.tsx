import { useState, Suspense } from 'react';
import { Settings as SettingsIcon } from 'lucide-react';
import { SettingsTabs } from '../components/settings/SettingsTabs';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('security');

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <SettingsIcon className="h-6 w-6 text-primary mr-2" />
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Paramètres
        </h1>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <Suspense fallback={<div>Chargement des paramètres...</div>}>
          <SettingsTabs activeTab={activeTab} onTabChange={setActiveTab} />
        </Suspense>
      </div>
    </div>
  );
}
import React from 'react';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '../components/common/LanguageSwitcher';
import { SettingsTabs } from '../components/settings/SettingsTabs';

export default function I18nTestPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = React.useState('preferences');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header avec sélecteur de langue */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {t('settings.title')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Test de l'internationalisation (i18n)
            </p>
          </div>
          <LanguageSwitcher />
        </div>

        {/* Composant Settings traduit */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <SettingsTabs 
            activeTab={activeTab} 
            onTabChange={setActiveTab} 
          />
        </div>

        {/* Section de test des traductions communes */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Test des traductions communes
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <h3 className="font-medium text-gray-700 dark:text-gray-300">Actions</h3>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>{t('common.save')}</li>
                <li>{t('common.cancel')}</li>
                <li>{t('common.delete')}</li>
                <li>{t('common.edit')}</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium text-gray-700 dark:text-gray-300">Navigation</h3>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>{t('navigation.dashboard')}</li>
                <li>{t('navigation.portfolio')}</li>
                <li>{t('navigation.payments')}</li>
                <li>{t('navigation.users')}</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium text-gray-700 dark:text-gray-300">Devises</h3>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>{t('currencies.CDF')}</li>
                <li>{t('currencies.USD')}</li>
                <li>{t('currencies.EUR')}</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium text-gray-700 dark:text-gray-300">Langues</h3>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>{t('languages.fr')}</li>
                <li>{t('languages.en')}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
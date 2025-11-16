import { Shield, Bell, Languages, DollarSign } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { SecuritySettings } from './sections/SecuritySettings';
import { NotificationSettings } from './sections/NotificationSettings';
import { PreferencesSettings } from './sections/PreferencesSettings';
import { CurrencyManagementSettings } from './sections/CurrencyManagementSettings';

interface SettingsTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function SettingsTabs({ activeTab, onTabChange }: SettingsTabsProps) {
  const { t } = useTranslation();

  const TABS = [
    {
      id: 'security',
      label: t('settings.securityTab'),
      icon: Shield,
      component: SecuritySettings,
      description: t('settings.security.title')
    },
    {
      id: 'notifications',
      label: t('settings.notificationsTab'),
      icon: Bell,
      component: NotificationSettings,
      description: t('settings.notifications.title')
    },
    {
      id: 'preferences',
      label: t('settings.preferencesTab'),
      icon: Languages,
      component: PreferencesSettings,
      description: t('settings.preferences.title')
    },
    {
      id: 'currency',
      label: t('settings.currencyTab'),
      icon: DollarSign,
      component: CurrencyManagementSettings,
      description: t('settings.currency.title')
    }
  ];

  const ActiveComponent = TABS.find(tab => tab.id === activeTab)?.component;

  return (
    <div className="flex flex-col lg:flex-row">
      {/* Navigation latérale */}
      <div className="lg:w-64 lg:flex-shrink-0 border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-gray-700">
        <div className="p-6">
          <nav className="space-y-1">
            {TABS.map(tab => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`
                    w-full flex items-center p-3 rounded-lg text-left transition-colors duration-200
                    ${isActive
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-l-4 border-blue-500'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }
                  `}
                >
                  <tab.icon className={`
                    h-5 w-5 mr-3 transition-colors duration-200
                    ${isActive 
                      ? 'text-blue-600 dark:text-blue-400' 
                      : 'text-gray-400'
                    }
                  `} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium">
                      {tab.label}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {tab.description}
                    </div>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Contenu */}
      <div className="flex-1 min-w-0">
        <div className="p-6">
          {ActiveComponent && (
            <div>
              <div className="mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                {TABS.find(tab => tab.id === activeTab) && (
                  <>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {TABS.find(tab => tab.id === activeTab)!.label}
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {TABS.find(tab => tab.id === activeTab)!.description}
                    </p>
                  </>
                )}
              </div>
              <ActiveComponent />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
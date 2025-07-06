import React from 'react';
import { Shield, Bell, DollarSign, Languages } from 'lucide-react';
import { SecuritySettings } from './sections/SecuritySettings';
import { NotificationSettings } from './sections/NotificationSettings';
// import { SubscriptionSettings } from './sections/SubscriptionSettings';
import { PreferencesSettings } from './sections/PreferencesSettings';

const TABS = [
  {
    id: 'security',
    label: 'Sécurité',
    icon: Shield,
    component: SecuritySettings
  },
  {
    id: 'notifications',
    label: 'Notifications',
    icon: Bell,
    component: NotificationSettings
  },
  {
    id: 'subscription',
    label: 'Abonnement & Factures',
    icon: DollarSign,
    // component: SubscriptionSettings
  },
  {
    id: 'languages',
    label: 'Langues',
    icon: Languages,
    component: PreferencesSettings
  }
];

interface SettingsTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function SettingsTabs({ activeTab, onTabChange }: SettingsTabsProps) {
  const ActiveComponent = TABS.find(tab => tab.id === activeTab)?.component;

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Navigation latérale */}
      <div className="w-full lg:w-64 flex-shrink-0">
        <nav className="space-y-1">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                w-full flex items-center px-4 py-2 text-sm font-medium rounded-md
                ${activeTab === tab.id
                  ? 'bg-primary-light text-primary dark:bg-primary-dark dark:text-primary-light'
                  : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800'
                }
              `}
            >
              <tab.icon className="h-5 w-5 mr-3" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Contenu */}
      <div className="flex-1">
        {ActiveComponent && <ActiveComponent />}
      </div>
    </div>
  );
}
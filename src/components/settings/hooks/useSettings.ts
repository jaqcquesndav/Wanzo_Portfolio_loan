import { useState } from 'react';
import type { SettingsTab } from '../types';

export function useSettings() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');

  const handleTabChange = (tab: SettingsTab) => {
    setActiveTab(tab);
  };

  return {
    activeTab,
    handleTabChange
  };
}
import { useState } from 'react';

export interface UserPreferences {
  language: string;
  timezone: string;
}

export function usePreferences() {
  const [preferences, setPreferences] = useState<UserPreferences>({
    language: 'fr',
    timezone: 'UTC'
  });

  const updatePreference = (key: keyof UserPreferences, value: string) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  return {
    preferences,
    updatePreference
  };
}
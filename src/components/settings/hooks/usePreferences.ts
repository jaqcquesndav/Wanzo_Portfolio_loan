import { useState, useEffect } from 'react';

export interface UserPreferences {
  language: string;
  timezone: string;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  language: 'fr',
  timezone: 'UTC'
};

export function usePreferences() {
  const [preferences, setPreferences] = useState<UserPreferences>(() => {
    // Charger les préférences depuis localStorage au démarrage
    const savedPreferences = localStorage.getItem('userPreferences');
    return savedPreferences ? JSON.parse(savedPreferences) : DEFAULT_PREFERENCES;
  });

  // Sauvegarder les préférences dans localStorage à chaque changement
  useEffect(() => {
    localStorage.setItem('userPreferences', JSON.stringify(preferences));
  }, [preferences]);

  const updatePreference = (key: keyof UserPreferences, value: string) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  return {
    preferences,
    updatePreference
  };
}
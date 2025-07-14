import * as React from 'react';
import { FormField, Select } from '../../ui/Form';
import { Button } from '../../ui/Button';
import { useTheme } from '../../../hooks/useTheme';
import { usePreferences } from '../hooks/usePreferences';
import { useNotification } from '../../../contexts/NotificationContext';
import { useCurrencyContext } from '../../../hooks/useCurrencyContext';

export function PreferencesSettings() {
  const { theme, toggleTheme } = useTheme();
  const { preferences, updatePreference } = usePreferences();
  const { showNotification } = useNotification();
  const { currency, setCurrency } = useCurrencyContext();

  // Synchronize currency preference with context when component mounts
  React.useEffect(() => {
    if (preferences.currency !== currency) {
      setCurrency(preferences.currency);
    }
  }, [preferences.currency, currency, setCurrency]);

  const handleCurrencyChange = (value: string) => {
    const newCurrency = value as 'USD' | 'CDF' | 'EUR';
    updatePreference('currency', newCurrency);
    setCurrency(newCurrency);
  };

  const handleSave = async () => {
    try {
      // API call would go here
      showNotification('Préférences mises à jour', 'success');
    } catch {
      showNotification('Erreur lors de la mise à jour des préférences', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <FormField label="Langue">
        <Select 
          value={preferences.language} 
          onChange={(e) => updatePreference('language', e.target.value)}
        >
          <option value="fr">Français</option>
          <option value="en">English</option>
        </Select>
      </FormField>

      <FormField label="Fuseau horaire">
        <Select 
          value={preferences.timezone}
          onChange={(e) => updatePreference('timezone', e.target.value)}
        >
          <option value="UTC">UTC</option>
          <option value="UTC+1">UTC+1</option>
          <option value="UTC+2">UTC+2</option>
        </Select>
      </FormField>

      <FormField label="Thème">
        <Select value={theme} onChange={() => toggleTheme()}>
          <option value="light">Clair</option>
          <option value="dark">Sombre</option>
        </Select>
      </FormField>

      <FormField label="Devise">
        <Select 
          value={preferences.currency}
          onChange={(e) => handleCurrencyChange(e.target.value)}
        >
          <option value="CDF">Franc Congolais (CDF)</option>
          <option value="USD">Dollar Américain (USD)</option>
          <option value="EUR">Euro (EUR)</option>
        </Select>
      </FormField>

      <Button onClick={handleSave}>
        Enregistrer les préférences
      </Button>
    </div>
  );
}
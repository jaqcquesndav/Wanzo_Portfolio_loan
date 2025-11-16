import { FormField, Select } from '../../ui/Form';
import { Button } from '../../ui/Button';
import { useTheme } from '../../../hooks/useTheme';
import { usePreferences } from '../hooks/usePreferences';
import { useNotification } from '../../../contexts/useNotification';
import { useTranslation } from 'react-i18next';
import { Monitor, Sun, Moon, Globe, Clock, CheckCircle } from 'lucide-react';

export function PreferencesSettings() {
  const { theme, toggleTheme } = useTheme();
  const { preferences, updatePreference } = usePreferences();
  const { showNotification } = useNotification();
  const { t, i18n } = useTranslation();

  const handleLanguageChange = (language: string) => {
    updatePreference('language', language);
    i18n.changeLanguage(language);
    showNotification(t('settings.preferences.updated'), 'success');
  };

  const handleSave = async () => {
    try {
      showNotification(t('settings.preferences.updated'), 'success');
    } catch {
      showNotification(t('settings.preferences.error'), 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Interface */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center mb-4">
          <Monitor className="h-5 w-5 text-gray-600 dark:text-gray-400 mr-2" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">{t('settings.preferences.interface')}</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField label={t('settings.preferences.theme')}>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: 'light', label: t('settings.preferences.light'), icon: Sun },
                { value: 'dark', label: t('settings.preferences.dark'), icon: Moon }
              ].map(themeOption => (
                <button
                  key={themeOption.value}
                  onClick={() => toggleTheme()}
                  className={`
                    p-3 rounded-lg border-2 transition-colors duration-200
                    ${theme === themeOption.value
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }
                  `}
                >
                  <themeOption.icon className="h-5 w-5 mx-auto mb-2" />
                  <div className="text-sm font-medium">{themeOption.label}</div>
                  {theme === themeOption.value && (
                    <CheckCircle className="h-4 w-4 mx-auto mt-1 text-blue-600 dark:text-blue-400" />
                  )}
                </button>
              ))}
            </div>
          </FormField>

          <FormField label={t('settings.preferences.language')}>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Select 
                value={preferences.language} 
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="pl-10"
              >
                <option value="fr">🇫🇷 {t('languages.fr')}</option>
                <option value="en">🇺🇸 {t('languages.en')}</option>
              </Select>
            </div>
          </FormField>
        </div>
      </div>

      {/* Localisation */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center mb-4">
          <Clock className="h-5 w-5 text-gray-600 dark:text-gray-400 mr-2" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">{t('settings.preferences.localization')}</h3>
        </div>

        <FormField label={t('settings.preferences.timezone')}>
          <Select 
            value={preferences.timezone}
            onChange={(e) => updatePreference('timezone', e.target.value)}
          >
            <option value="UTC">🌍 {t('timezones.UTC')}</option>
            <option value="UTC+1">🇨🇩 {t('timezones.UTC+1')}</option>
            <option value="UTC+2">🇨🇩 {t('timezones.UTC+2')}</option>
          </Select>
        </FormField>
      </div>

      {/* Actions */}
      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <Button variant="outline" onClick={() => window.location.reload()}>
          {t('common.reset')}
        </Button>
        <Button onClick={handleSave}>
          <CheckCircle className="h-4 w-4 mr-2" />
          {t('common.save')}
        </Button>
      </div>
    </div>
  );
}
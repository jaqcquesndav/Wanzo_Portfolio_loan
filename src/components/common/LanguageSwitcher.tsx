import { useTranslation } from 'react-i18next';
import { Button } from '../ui/Button';

export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'fr' ? 'en' : 'fr';
    i18n.changeLanguage(newLang);
  };

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={toggleLanguage}
      className="flex items-center space-x-2"
    >
      <span>{i18n.language === 'fr' ? '🇫🇷' : '🇺🇸'}</span>
      <span>{i18n.language === 'fr' ? 'FR' : 'EN'}</span>
    </Button>
  );
}
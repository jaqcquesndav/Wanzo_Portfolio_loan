import React from 'react';
import { Input } from '../../ui/Form';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import { useTranslation } from 'react-i18next';
import { useCurrencyContext } from '../../../hooks/useCurrencyContext';
import { useNotification } from '../../../contexts/useNotification';
import { usePermissions } from '../../../hooks/usePermissions';
import { 
  DollarSign, 
  TrendingUp, 
  RefreshCw, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Lock,
  Unlock,
  Globe
} from 'lucide-react';

type CurrencyPair = {
  from: string;
  to: string;
  rate: number;
  displayName: string;
};

export function CurrencyManagementSettings() {
  const { currency, setCurrency, getExchangeRates, updateExchangeRate, lastUpdated, formatAmount } = useCurrencyContext();
  const { showNotification } = useNotification();
  const { canEditExchangeRates } = usePermissions();
  const { t, i18n } = useTranslation();
  
  // État pour gérer l'onglet actif
  const [activeTab, setActiveTab] = React.useState<'preferences' | 'rates'>('preferences');
  
  // Récupérer les taux de change actuels
  const currentRates = getExchangeRates();
  
  // État local pour stocker les valeurs de formulaire des taux de change
  const [rateValues, setRateValues] = React.useState<CurrencyPair[]>([]);
  
  // Initialiser les valeurs de formulaire à partir des taux actuels
  React.useEffect(() => {
    const formattedRates = currentRates.map(rate => ({
      from: rate.from,
      to: rate.to,
      rate: rate.rate,
      displayName: `${rate.from}/${rate.to}`
    }));
    setRateValues(formattedRates);
  }, [currentRates]);
  
  // Gérer le changement de devise
  const handleCurrencyChange = (value: string) => {
    const newCurrency = value as 'USD' | 'CDF' | 'EUR';
    setCurrency(newCurrency);
    showNotification(t('settings.currency.changed', { currency: newCurrency }), 'success');
  };
  
  // État pour les valeurs temporaires d'édition
  const [tempRates, setTempRates] = React.useState<Record<string, string>>({});
  
  // Initialiser les valeurs temporaires
  React.useEffect(() => {
    const initialTempRates: Record<string, string> = {};
    rateValues.forEach(pair => {
      initialTempRates[`${pair.from}-${pair.to}`] = pair.rate.toString();
    });
    setTempRates(initialTempRates);
  }, [rateValues]);
  
  // Gérer les changements de valeur des taux
  const handleRateInputChange = (pairKey: string, value: string) => {
    setTempRates(prev => ({
      ...prev,
      [pairKey]: value
    }));
  };
  
  // Sauvegarder les changements de taux
  const handleSaveRate = (pair: CurrencyPair) => {
    try {
      const tempValue = tempRates[`${pair.from}-${pair.to}`];
      const parsedRate = parseFloat(tempValue);
      
      if (isNaN(parsedRate) || parsedRate <= 0) {
        showNotification(t('messages.invalidRate'), 'error');
        return;
      }
      
      updateExchangeRate(
        pair.from as 'CDF' | 'USD' | 'EUR',
        pair.to as 'CDF' | 'USD' | 'EUR',
        parsedRate
      );
      
      const updatedRates = rateValues.map(r => 
        r.from === pair.from && r.to === pair.to 
          ? { ...r, rate: parsedRate } 
          : r
      );
      setRateValues(updatedRates);
      
      showNotification(t('messages.exchangeRateUpdated', { from: pair.from, to: pair.to }), 'success');
    } catch (error) {
      console.error("Erreur lors de la mise à jour du taux:", error);
      showNotification(t('messages.exchangeRateError', { from: pair.from, to: pair.to }), 'error');
    }
  };
  
  // Formater la date de dernière mise à jour
  const formatLastUpdated = () => {
    if (!lastUpdated) return t('settings.currency.never');
    
    return new Intl.DateTimeFormat(i18n.language === 'fr' ? 'fr-FR' : 'en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(lastUpdated);
  };

  const getCurrencyFlag = (curr: string) => {
    switch (curr) {
      case 'USD': return '🇺🇸';
      case 'EUR': return '🇪🇺';
      case 'CDF': return '🇨🇩';
      default: return '💱';
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Navigation par onglets */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8">
          {[
            { id: 'preferences', label: t('settings.currency.main'), icon: DollarSign },
            { id: 'rates', label: t('settings.currency.rates'), icon: TrendingUp }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'preferences' | 'rates')}
              className={`
                inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200
                ${activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }
              `}
            >
              <tab.icon className="mr-2 h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
      
      {/* Contenu de l'onglet Préférences */}
      {activeTab === 'preferences' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center mb-4">
              <Globe className="h-5 w-5 text-gray-600 dark:text-gray-400 mr-2" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Devise d'affichage</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { value: 'CDF', label: 'Franc Congolais', code: 'CDF', country: 'République Démocratique du Congo' },
                { value: 'USD', label: 'Dollar Américain', code: 'USD', country: 'États-Unis' },
                { value: 'EUR', label: 'Euro', code: 'EUR', country: 'Zone Euro' }
              ].map(currencyOption => (
                <button
                  key={currencyOption.value}
                  onClick={() => handleCurrencyChange(currencyOption.value)}
                  className={`
                    p-4 rounded-lg border-2 transition-colors duration-200 text-center
                    ${currency === currencyOption.value
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }
                  `}
                >
                  <div className="text-3xl mb-2">{getCurrencyFlag(currencyOption.code)}</div>
                  <div className="text-lg font-semibold">{currencyOption.label}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{currencyOption.country}</div>
                  <Badge variant={currency === currencyOption.value ? "primary" : "secondary"} className="mt-2">
                    {currencyOption.code}
                  </Badge>
                  {currency === currencyOption.value && (
                    <CheckCircle className="h-4 w-4 mx-auto mt-2 text-blue-600 dark:text-blue-400" />
                  )}
                </button>
              ))}
            </div>

            {/* Aperçu du formatage */}
            <div className="mt-6 bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">Aperçu du formatage</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Comment les montants apparaîtront</p>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-gray-900 dark:text-white">
                    {formatAmount(123456.78)}
                  </div>
                  <Badge variant="secondary" className="text-xs mt-1">
                    Format {currency}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Contenu de l'onglet Taux de change */}
      {activeTab === 'rates' && (
        <div className="space-y-6">
          {/* Info sur les permissions */}
          <div className={`
            rounded-lg p-4 border
            ${canEditExchangeRates 
              ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-700' 
              : 'bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-700'
            }
          `}>
            <div className="flex items-center space-x-3">
              {canEditExchangeRates ? (
                <Unlock className="h-5 w-5 text-green-600 dark:text-green-400" />
              ) : (
                <Lock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              )}
              <div>
                <div className={`
                  text-sm font-medium
                  ${canEditExchangeRates 
                    ? 'text-green-800 dark:text-green-200' 
                    : 'text-orange-800 dark:text-orange-200'
                  }
                `}>
                  {canEditExchangeRates ? 'Modification autorisée' : 'Accès en lecture seule'}
                </div>
                <div className={`
                  text-xs
                  ${canEditExchangeRates 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-orange-600 dark:text-orange-400'
                  }
                `}>
                  {canEditExchangeRates 
                    ? 'Vous pouvez modifier les taux de change' 
                    : 'Contactez un administrateur pour modifier les taux'
                  }
                </div>
              </div>
            </div>
          </div>

          {/* Taux de change */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <TrendingUp className="h-5 w-5 text-gray-600 dark:text-gray-400 mr-2" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Taux de change actuels</h3>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                <Clock className="h-4 w-4" />
                <span>Mis à jour: {formatLastUpdated()}</span>
              </div>
            </div>
            
            <div className="space-y-4">
              {rateValues.map((pair, index) => (
                <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    <div className="flex-grow">
                      <div className="flex items-center space-x-3 mb-3">
                        <span className="text-xl">{getCurrencyFlag(pair.from)}</span>
                        <div>
                          <div className="text-lg font-semibold text-gray-900 dark:text-white">
                            {pair.displayName}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            1 {pair.from} = ? {pair.to}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <span className="text-sm text-gray-700 dark:text-gray-300">Taux:</span>
                        <Input
                          type="number"
                          value={tempRates[`${pair.from}-${pair.to}`] || pair.rate}
                          onChange={(e) => handleRateInputChange(`${pair.from}-${pair.to}`, e.target.value)}
                          step="0.0001"
                          min="0"
                          className="w-32"
                          disabled={!canEditExchangeRates}
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{pair.to}</span>
                      </div>
                    </div>
                    
                    <div className="flex-shrink-0">
                      {canEditExchangeRates ? (
                        <Button onClick={() => handleSaveRate(pair)}>
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Mettre à jour
                        </Button>
                      ) : (
                        <Button disabled variant="outline">
                          <Lock className="h-4 w-4 mr-2" />
                          Verrouillé
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Informations importantes */}
          <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-700 p-4">
            <div className="flex items-center mb-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mr-2" />
              <h4 className="text-sm font-medium text-amber-800 dark:text-amber-200">
                Informations importantes
              </h4>
            </div>
            <div className="text-sm text-amber-700 dark:text-amber-300 space-y-2">
              <p>• Les taux de change sont utilisés pour convertir automatiquement tous les montants dans l'application.</p>
              <p>• Les modifications affectent immédiatement l'affichage pour tous les utilisateurs.</p>
              <p>• Pour une gestion précise, envisagez l'intégration d'une API de taux en temps réel.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

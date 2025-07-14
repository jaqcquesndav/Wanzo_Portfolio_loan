import * as React from 'react';
import { FormField, Select, Input } from '../../ui/Form';
import { Button, Tab } from '../../ui';
import { useCurrencyContext } from '../../../hooks/useCurrencyContext';
import { useNotification } from '../../../contexts/NotificationContext';
import { usePreferences } from '../hooks/usePreferences';
import { usePermissions } from '../../../hooks/usePermissions';

type CurrencyPair = {
  from: string;
  to: string;
  rate: number;
  displayName: string;
};

export function CurrencyManagementSettings() {
  const { currency, setCurrency, getExchangeRates, updateExchangeRate, lastUpdated } = useCurrencyContext();
  const { preferences, updatePreference } = usePreferences();
  const { showNotification } = useNotification();
  const { canEditExchangeRates } = usePermissions();
  
  // État pour gérer l'onglet actif
  const [activeTab, setActiveTab] = React.useState<'preferences' | 'rates'>('preferences');
  
  // Récupérer les taux de change actuels
  const currentRates = getExchangeRates();
  
  // État local pour stocker les valeurs de formulaire des taux de change
  const [rateValues, setRateValues] = React.useState<CurrencyPair[]>([]);
  
  // Synchroniser la devise de préférence avec le contexte lors du montage du composant
  React.useEffect(() => {
    if (preferences.currency !== currency) {
      setCurrency(preferences.currency);
    }
  }, [preferences.currency, currency, setCurrency]);
  
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
    updatePreference('currency', newCurrency);
    setCurrency(newCurrency);
  };
  
  // État pour les valeurs temporaires d'édition (chaînes de caractères pour l'input)
  const [tempRates, setTempRates] = React.useState<Record<string, string>>({});
  
  // Initialiser les valeurs temporaires lors du changement des taux réels
  React.useEffect(() => {
    const initialTempRates: Record<string, string> = {};
    rateValues.forEach(pair => {
      initialTempRates[`${pair.from}-${pair.to}`] = pair.rate.toString();
    });
    setTempRates(initialTempRates);
  }, [rateValues]);
  
  // Gérer les changements de valeur des taux (valeurs temporaires)
  const handleRateInputChange = (pairKey: string, value: string) => {
    setTempRates(prev => ({
      ...prev,
      [pairKey]: value
    }));
  };
  
  // Fonction supprimée car non utilisée
  
  // Sauvegarder les changements de taux
  const handleSaveRate = (pair: CurrencyPair) => {
    try {
      // Récupérer la valeur temporaire et la parser
      const tempValue = tempRates[`${pair.from}-${pair.to}`];
      const parsedRate = parseFloat(tempValue);
      
      if (isNaN(parsedRate) || parsedRate <= 0) {
        showNotification('Veuillez entrer un taux de change valide (supérieur à 0)', 'error');
        return;
      }
      
      // Mettre à jour avec la valeur parsée
      updateExchangeRate(
        pair.from as 'CDF' | 'USD' | 'EUR',
        pair.to as 'CDF' | 'USD' | 'EUR',
        parsedRate
      );
      
      // Mettre à jour la liste des taux
      const updatedRates = rateValues.map(r => 
        r.from === pair.from && r.to === pair.to 
          ? { ...r, rate: parsedRate } 
          : r
      );
      setRateValues(updatedRates);
      
      showNotification(`Taux de change ${pair.from}/${pair.to} mis à jour`, 'success');
    } catch (error) {
      console.error("Erreur lors de la mise à jour du taux:", error);
      showNotification(`Erreur lors de la mise à jour du taux ${pair.from}/${pair.to}`, 'error');
    }
  };
  
  // Sauvegarder les préférences
  const handleSavePreferences = async () => {
    try {
      // API call would go here
      showNotification('Préférences de devise mises à jour', 'success');
    } catch {
      showNotification('Erreur lors de la mise à jour des préférences', 'error');
    }
  };
  
  // Formater la date de dernière mise à jour
  const formatLastUpdated = () => {
    if (!lastUpdated) return 'Jamais';
    
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(lastUpdated);
  };
  
  return (
    <div className="space-y-6">
      <div className="pb-5">
        <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100">
          Gestion des devises
        </h3>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Configurez vos préférences de devise et gérez les taux de change utilisés dans l'application.
        </p>
      </div>
      
      {/* Navigation par onglets */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <div className="flex space-x-4">
          <Tab 
            active={activeTab === 'preferences'} 
            onClick={() => setActiveTab('preferences')}
          >
            Préférences
          </Tab>
          <Tab 
            active={activeTab === 'rates'} 
            onClick={() => setActiveTab('rates')}
          >
            Taux de change
            {!canEditExchangeRates && (
              <span className="ml-2 text-xs text-gray-500">(lecture seule)</span>
            )}
          </Tab>
        </div>
      </div>
      
      {/* Contenu de l'onglet Préférences */}
      {activeTab === 'preferences' && (
        <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md p-6">
          <FormField label="Devise par défaut">
            <Select 
              value={preferences.currency}
              onChange={(e) => handleCurrencyChange(e.target.value)}
              className="w-full"
            >
              <option value="CDF">Franc Congolais (CDF)</option>
              <option value="USD">Dollar Américain (USD)</option>
              <option value="EUR">Euro (EUR)</option>
            </Select>
            <p className="mt-1 text-sm text-gray-500">
              Cette devise sera utilisée pour afficher tous les montants dans l'application.
            </p>
          </FormField>

          <div className="mt-6">
            <Button onClick={handleSavePreferences}>
              Enregistrer les préférences
            </Button>
          </div>
        </div>
      )}
      
      {/* Contenu de l'onglet Taux de change */}
      {activeTab === 'rates' && (
        <>
          <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-md font-medium text-gray-900 dark:text-gray-100">
                Taux de change actuels
              </h4>
              <p className="text-xs text-gray-500">
                Dernière mise à jour : {formatLastUpdated()}
              </p>
            </div>
            
            <div className="space-y-6">
              {rateValues.map((pair, index) => (
                <div key={index} className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex-grow">
                    <FormField label={`Taux ${pair.displayName}`}>
                      <div className="flex items-center">
                        <span className="mr-3">1 {pair.from} =</span>
                        <Input
                          type="number"
                          value={tempRates[`${pair.from}-${pair.to}`] || pair.rate}
                          onChange={(e) => handleRateInputChange(`${pair.from}-${pair.to}`, e.target.value)}
                          step="0.01"
                          min="0"
                          className="w-24 sm:w-32"
                          disabled={!canEditExchangeRates}
                        />
                        <span className="ml-3">{pair.to}</span>
                      </div>
                    </FormField>
                  </div>
                  <div className="flex-shrink-0 mt-2 sm:mt-0">
                    {canEditExchangeRates ? (
                      <Button onClick={() => handleSaveRate(pair)}>
                        Mettre à jour
                      </Button>
                    ) : (
                      <Button disabled variant="outline">
                        Accès restreint
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md p-6">
            <h4 className="text-md font-medium text-gray-900 dark:text-gray-100 mb-4">
              À propos des taux de change
            </h4>
            <div className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
              <p>
                Les taux de change sont utilisés pour convertir les montants entre différentes devises dans l'application.
              </p>
              <p>
                Pour une gestion plus précise des taux, envisagez d'intégrer une API de taux de change en temps réel.
              </p>
              <p className="font-semibold">
                Note : Les modifications des taux affecteront automatiquement tous les montants affichés dans l'application.
              </p>
              {canEditExchangeRates && (
                <p className="mt-2 bg-blue-50 dark:bg-blue-900/30 p-2 rounded">
                  <span className="font-medium">Information administrateur :</span> Lorsque vous modifiez un taux de change,
                  toutes les valeurs monétaires dans l'application seront recalculées instantanément pour tous les utilisateurs.
                </p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

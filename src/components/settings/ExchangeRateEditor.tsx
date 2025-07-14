import React, { useState, useEffect } from 'react';
import { useCurrencyContext } from '../../hooks/useCurrencyContext';
import { useAuth } from '../../contexts/useAuth';

type CurrencyType = 'CDF' | 'USD' | 'EUR';

interface ExchangeRateEditorProps {
  className?: string;
}

interface RateInfo {
  from: CurrencyType;
  to: CurrencyType;
  rate: number;
  tempRate: string;
}

const ExchangeRateEditor: React.FC<ExchangeRateEditorProps> = ({ className }) => {
  const { getExchangeRates, updateExchangeRate, lastUpdated } = useCurrencyContext();
  const { user } = useAuth();
  
  // État pour stocker les taux de change modifiables
  const [rates, setRates] = useState<RateInfo[]>([]);
  
  // Charger les taux de change lors du montage du composant
  useEffect(() => {
    const currentRates = getExchangeRates();
    setRates(currentRates.map(rate => ({
      from: rate.from as CurrencyType,
      to: rate.to as CurrencyType,
      rate: rate.rate,
      tempRate: rate.rate.toString() // Valeur temporaire pour l'édition
    })));
  }, [getExchangeRates]);
  
  // Mettre à jour la valeur temporaire
  const handleRateChange = (index: number, value: string) => {
    const newRates = [...rates];
    newRates[index].tempRate = value;
    setRates(newRates);
  };
  
  // Sauvegarder le taux de change
  const saveRate = (index: number) => {
    const rate = rates[index];
    const parsedRate = parseFloat(rate.tempRate);
    
    if (!isNaN(parsedRate) && parsedRate > 0) {
      updateExchangeRate(rate.from, rate.to, parsedRate);
      
      // Mise à jour de l'état local après la sauvegarde
      const updatedRates = [...rates];
      updatedRates[index].rate = parsedRate;
      updatedRates[index].tempRate = parsedRate.toString();
      setRates(updatedRates);
    }
  };
  
  // Vérifier si l'utilisateur est administrateur
  const isAdmin = user?.role === 'admin';

  if (!isAdmin) {
    return null; // Ne pas afficher le composant si l'utilisateur n'est pas administrateur
  }

  return (
    <div className={`bg-white dark:bg-gray-800 p-4 rounded-lg shadow ${className}`}>
      <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
        Gestion des taux de change
      </h2>
      
      <div className="space-y-4">
        {rates.map((rate, index) => (
          <div key={`${rate.from}-${rate.to}`} className="flex items-center space-x-2">
            <span className="text-gray-700 dark:text-gray-300 min-w-[100px]">
              1 {rate.from} = 
            </span>
            <input
              type="text"
              value={rate.tempRate}
              onChange={(e) => handleRateChange(index, e.target.value)}
              className="border rounded px-2 py-1 w-24 text-right dark:bg-gray-700 dark:text-white"
            />
            <span className="text-gray-700 dark:text-gray-300 min-w-[30px]">
              {rate.to}
            </span>
            <button
              onClick={() => saveRate(index)}
              className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors"
            >
              Mettre à jour
            </button>
          </div>
        ))}
      </div>
      
      {lastUpdated && (
        <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
          Dernière mise à jour: {new Date(lastUpdated).toLocaleDateString()} à {new Date(lastUpdated).toLocaleTimeString()}
        </div>
      )}
    </div>
  );
};

export default ExchangeRateEditor;

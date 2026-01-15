import { useState } from 'react';
import { useCurrencyContext } from '../../hooks/useCurrencyContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Form';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { toast } from 'react-hot-toast';

export function CurrencyRatesManager() {
  const { getExchangeRates, updateExchangeRate, lastUpdated } = useCurrencyContext();
  
  // État pour stocker les nouveaux taux
  const [rates, setRates] = useState<Record<string, string>>({});
  
  // Obtenir les taux actuels pour l'affichage
  const currentRates = getExchangeRates();
  
  // Gérer le changement des taux
  const handleRateChange = (from: string, to: string, value: string) => {
    setRates({
      ...rates,
      [`${from}-${to}`]: value
    });
  };
  
  // Mettre à jour un taux de change
  const handleUpdateRate = (from: string, to: string) => {
    const rateKey = `${from}-${to}`;
    const newRateValue = rates[rateKey];
    
    if (!newRateValue || isNaN(Number(newRateValue))) {
      toast.error("Veuillez entrer un taux de change valide.");
      return;
    }
    
    const newRate = Number(newRateValue);
    
    if (newRate <= 0) {
      toast.error("Le taux de change doit être supérieur à zéro.");
      return;
    }
    
    updateExchangeRate(from as 'CDF' | 'USD' | 'EUR', to as 'CDF' | 'USD' | 'EUR', newRate);
    
    toast.success(`Taux ${from}/${to} mis à jour avec succès.`);
  };
  
  // Formater la date de dernière mise à jour
  const formattedDate = lastUpdated ? 
    new Date(lastUpdated).toLocaleString('fr-FR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }) : 'Jamais';

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Gestion des taux de change</CardTitle>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Dernière mise à jour: {formattedDate}
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            {currentRates.map((rate) => (
              <div key={`${rate.from}-${rate.to}`} className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex-1">
                  <p className="font-medium">
                    {rate.from} → {rate.to}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Taux actuel: 1 {rate.from} = {rate.rate.toFixed(6)} {rate.to}
                  </p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <Input
                    type="number"
                    step="0.000001"
                    min="0.000001"
                    placeholder={rate.rate.toString()}
                    value={rates[`${rate.from}-${rate.to}`] || ''}
                    onChange={(e) => handleRateChange(rate.from, rate.to, e.target.value)}
                    className="w-full sm:w-32"
                  />
                  <Button 
                    onClick={() => handleUpdateRate(rate.from, rate.to)}
                    disabled={!rates[`${rate.from}-${rate.to}`]}
                  >
                    Mettre à jour
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

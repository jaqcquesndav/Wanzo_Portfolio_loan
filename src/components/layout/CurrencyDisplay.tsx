import { useCurrencyContext } from '../../hooks/useCurrencyContext';

export function CurrencyDisplay() {
  const { currency, getExchangeRates, lastUpdated } = useCurrencyContext();
  
  // Obtenir les taux de change actuels
  const rates = getExchangeRates()
    .filter((rate: { from: string; to: string; rate: number; }) => rate.from === currency && rate.to !== currency)
    .map((rate: { from: string; to: string; rate: number; }) => `1 ${rate.from} = ${rate.rate.toFixed(4)} ${rate.to}`);
  
  // Formater la date de dernière mise à jour
  const formattedDate = lastUpdated ? 
    new Date(lastUpdated).toLocaleDateString('fr-FR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    }) : '';

  return (
    <>
      {/* Version desktop avec plus de détails */}
      <div className="hidden lg:flex items-center text-xs text-gray-500 dark:text-gray-400 mr-4">
        <span className="font-medium">{currency}</span>
        <span className="mx-2">|</span>
        <div className="flex flex-col">
          {rates.map((rate: string, index: number) => (
            <span key={index} className="text-xs">{rate}</span>
          ))}
          {formattedDate && (
            <span className="text-xs italic">Mis à jour: {formattedDate}</span>
          )}
        </div>
      </div>
      
      {/* Version mobile très simplifiée */}
      <div className="flex lg:hidden items-center text-xs text-gray-500 dark:text-gray-400 mr-4">
        <span className="font-medium">{currency}</span>
      </div>
    </>
  );
}

import { useCurrencyContext } from '../../hooks/useCurrencyContext';
import { Badge } from './Badge';

interface CurrencyTestDisplayProps {
  amount: number;
  className?: string;
}

/**
 * Composant de test pour vérifier l'application du Currency Context
 * Affiche un montant formaté selon la devise actuelle
 */
export function CurrencyTestDisplay({ amount, className = '' }: CurrencyTestDisplayProps) {
  const { formatAmount, currency } = useCurrencyContext();

  return (
    <div className={`inline-flex items-center space-x-2 ${className}`}>
      <span className="text-lg font-semibold">
        {formatAmount(amount)}
      </span>
      <Badge variant="secondary" className="text-xs">
        {currency}
      </Badge>
    </div>
  );
}
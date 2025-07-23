import { CurrencyRatesManager } from '../components/settings/CurrencyRatesManager';

export default function CurrencySettings() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Paramètres de devises</h1>
      <CurrencyRatesManager />
    </div>
  );
}

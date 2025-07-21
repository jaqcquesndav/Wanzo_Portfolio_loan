import { useCreditContracts } from '../../hooks/useCreditContracts';

export function ResetCreditContractsButton() {
  const { resetToMockData, loading } = useCreditContracts('default');
  
  const handleReset = async () => {
    if (confirm('Voulez-vous réinitialiser les données de contrats de crédit aux valeurs par défaut?')) {
      await resetToMockData();
      alert('Données réinitialisées avec succès!');
    }
  };
  
  return (
    <button
      onClick={handleReset}
      disabled={loading}
      className="px-3 py-2 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300"
    >
      Réinitialiser les contrats
    </button>
  );
}

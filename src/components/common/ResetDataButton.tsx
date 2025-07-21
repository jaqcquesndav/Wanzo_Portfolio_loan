import { Button } from '../ui/Button';
import { useCreditContracts } from '../../hooks/useCreditContracts';
import { useCreditRequests } from '../../hooks/useCreditRequests';

export function ResetDataButton() {
  const { resetToMockData: resetCreditContracts, loading: contractsLoading } = useCreditContracts('default');
  const { resetToMockData: resetCreditRequests, loading: requestsLoading } = useCreditRequests();
  
  const isLoading = contractsLoading || requestsLoading;
  
  const handleReset = async () => {
    if (confirm('Voulez-vous réinitialiser toutes les données de crédit aux valeurs par défaut?')) {
      try {
        await Promise.all([
          resetCreditContracts(),
          resetCreditRequests()
        ]);
        alert('Données réinitialisées avec succès!');
        // Rafraîchir la page pour voir les changements
        window.location.reload();
      } catch (error) {
        console.error('Erreur lors de la réinitialisation des données:', error);
        alert('Une erreur est survenue lors de la réinitialisation des données.');
      }
    }
  };
  
  return (
    <Button
      onClick={handleReset}
      disabled={isLoading}
      variant="outline"
      className="text-sm"
    >
      {isLoading ? 'Réinitialisation en cours...' : 'Réinitialiser les données'}
    </Button>
  );
}

import { Button } from '../../../ui/Button';

interface AmortizationSchedulesListProps {
  portfolioId: string;
}

// This is a stub component - portfolioId parameter will be used in future implementation
export function AmortizationSchedulesList({ portfolioId }: AmortizationSchedulesListProps) {
  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <div className="text-center py-12 text-gray-500">
        <h3 className="text-lg font-medium mb-2">Module Échéanciers</h3>
        <p className="mb-4">
          Cette fonctionnalité sera implémentée prochainement. Elle permettra de gérer les
          échéanciers d'amortissement des contrats de crédit pour le portefeuille {portfolioId}.
        </p>
        <Button variant="outline" disabled>
          Générer un échéancier
        </Button>
      </div>
    </div>
  );
}

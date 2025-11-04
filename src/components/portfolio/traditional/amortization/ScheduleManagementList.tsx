import { Button } from '../../../ui/Button';
import { Card } from '../../../ui/Card';
import { Badge } from '../../../ui/Badge';
import { EmptyState } from '../../../ui/EmptyState';
import { useCreditContracts } from '../../../../hooks/useCreditContracts';
import { Link } from 'react-router-dom';
import { Calendar, ArrowUpRight } from 'lucide-react';
import { CreditContract } from '../../../../types/credit';

interface ScheduleManagementListProps {
  portfolioId: string;
}

export function ScheduleManagementList({ portfolioId }: ScheduleManagementListProps) {
  const { contracts, loading } = useCreditContracts(portfolioId);
  
  if (loading) {
    return (
      <div className="p-6 space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="p-4 animate-pulse">
            <div className="h-5 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="flex justify-end mt-4">
              <div className="h-8 bg-gray-200 rounded w-24"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }
  
  if (!contracts || contracts.length === 0) {
    return (
      <EmptyState
        icon={Calendar}
        title="Aucun échéancier disponible"
        description="Il n'y a pas de contrats dans ce portefeuille pour lesquels vous pouvez gérer des échéanciers."
        size="md"
      />
    );
  }
  
  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium">Échéanciers de remboursement</h2>
      </div>
      
      {contracts.map((contract: CreditContract) => (
        <Card key={contract.id} className="p-4 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium">
                Contrat {contract.reference}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {contract.memberName} - {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(contract.amount)}
              </p>
              <div className="mt-2">
                <Badge variant={contract.status === 'active' ? 'success' : 'warning'}>
                  {contract.status === 'active' ? 'Actif' : contract.status}
                </Badge>
                <Badge variant="secondary" className="ml-2">
                  {contract.productName || 'Standard'}
                </Badge>
              </div>
            </div>
            <Link to={`/app/traditional/${portfolioId}/contracts/${contract.id}`}>
              <Button size="sm" className="flex items-center">
                <span>Voir l'échéancier</span>
                <ArrowUpRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
        </Card>
      ))}
    </div>
  );
}

import { useParams, useNavigate } from 'react-router-dom';
import { EditableAmortizationSchedule } from '../components/portfolio/traditional/contract/EditableAmortizationSchedule';
import { useCreditContracts } from '../hooks/useCreditContracts';
import { Card } from '../components/ui/Card';
import { Breadcrumb } from '../components/common/Breadcrumb';
import { Button } from '../components/ui/Button';
import { ArrowLeft } from 'lucide-react';

export default function CreditContractSchedulePage() {
  const { contractId, portfolioId } = useParams<{ contractId: string, portfolioId: string }>();
  const navigate = useNavigate();
  const { contracts, loading } = useCreditContracts(portfolioId || 'default');
  
  if (!contractId) {
    return <div className="p-4">Référence de contrat manquante</div>;
  }
  
  if (loading) {
    return (
      <div className="container mx-auto p-4 sm:p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-6"></div>
          <Card className="p-6">
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-8 bg-gray-200 rounded"></div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    );
  }
  
  const contract = contracts.find(c => c.id === contractId);
  
  if (!contract) {
    return (
      <div className="container mx-auto p-4 sm:p-6">
        <Breadcrumb 
          items={[
            { label: 'Portefeuilles', href: '/app/traditional' },
            { label: 'Portefeuille', href: `/app/traditional/${portfolioId || 'default'}` },
            { label: 'Contrats', href: `/app/traditional/${portfolioId || 'default'}?tab=contracts` },
            { label: 'Échéancier introuvable', href: '#' }
          ]} 
        />
        <div className="bg-amber-50 p-4 rounded-md border border-amber-200 mt-4">
          <h3 className="text-lg font-medium text-amber-800">Contrat non trouvé</h3>
          <p className="mt-2 text-sm text-amber-700">
            Le contrat que vous recherchez n'existe pas ou a été supprimé.
          </p>
          <Button 
            className="mt-4" 
            variant="outline" 
            onClick={() => navigate(`/app/traditional/${portfolioId || 'default'}?tab=contracts`)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour aux contrats
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-4 sm:p-6">
      <Breadcrumb 
        items={[
          { label: 'Portefeuilles', href: '/app/traditional' },
          { label: 'Portefeuille', href: `/app/traditional/${portfolioId || 'default'}` },
          { label: 'Contrats', href: `/app/traditional/${portfolioId || 'default'}?tab=contracts` },
          { label: `Contrat ${contract.reference}`, href: `/app/traditional/${portfolioId}/contracts/${contractId}` },
          { label: 'Échéancier', href: '#' }
        ]} 
      />
      
      <div className="flex justify-between items-center my-6">
        <Button 
          variant="outline" 
          onClick={() => navigate(`/app/traditional/${portfolioId || 'default'}/contracts/${contractId}`)}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour au contrat
        </Button>
      </div>
      
      <Card className="p-6">
        <EditableAmortizationSchedule 
          contractId={contractId} 
          amount={contract.amount} 
          startDate={contract.startDate} 
          endDate={contract.endDate} 
          interestRate={contract.interestRate} 
        />
      </Card>
    </div>
  );
}

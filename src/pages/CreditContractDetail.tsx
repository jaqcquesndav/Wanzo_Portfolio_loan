import { useParams, useNavigate } from 'react-router-dom';
import { useCreditContracts } from '../hooks/useCreditContracts';
import { Button } from '../components/ui/Button';
import { Breadcrumb } from '../components/common/Breadcrumb';
import { ArrowLeft } from 'lucide-react';
import { ContractDetailsResponsive } from '../components/portfolio/traditional/contract/ContractDetailsResponsive';
import { creditContractsStorageService } from '../services/storage/creditContractsStorage';
import { useNotification } from '../contexts/useNotification';
import { CreditContract } from '../types/credit-contract';

export default function CreditContractDetail() {
  const { portfolioId, contractId } = useParams();
  const navigate = useNavigate();
  const { contracts, loading, error, fetchContracts } = useCreditContracts(portfolioId || 'default');
  const { showNotification } = useNotification();
  
  // Trouver le contrat correspondant
  const contract = contracts.find(c => c.id === contractId);

  // Gestionnaire pour mettre à jour le contrat
  const handleUpdateContract = async (updatedData: Partial<CreditContract>) => {
    try {
      if (!contractId) return;
      
      await creditContractsStorageService.updateContract(contractId, updatedData);
      showNotification('Contrat mis à jour avec succès', 'success');
      fetchContracts(); // Rafraîchir les données pour afficher les modifications
    } catch (error) {
      console.error('Erreur lors de la mise à jour du contrat:', error);
      showNotification('Erreur lors de la mise à jour du contrat', 'error');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                <div className="h-5 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-50 p-4 rounded-md border border-red-200">
          <h3 className="text-lg font-medium text-red-800">Erreur</h3>
          <p className="mt-2 text-sm text-red-700">{error}</p>
          <Button 
            className="mt-4" 
            variant="outline" 
            onClick={() => navigate(`/app/traditional/${portfolioId || 'default'}`)}
          >
            Retour au portefeuille
          </Button>
        </div>
      </div>
    );
  }
  
  if (!contract) {
    return (
      <div className="container mx-auto p-6">
      <Breadcrumb 
        items={[
          { label: 'Portefeuilles', href: '/app/traditional' },
          { label: 'Traditionnel', href: '/app/traditional' },
          { label: `Portefeuille ${portfolioId ? portfolioId.slice(0, 8) : 'default'}`, href: `/app/traditional/${portfolioId || 'default'}` },
          { label: 'Contrat introuvable', href: '#' }
        ]} 
      />        <div className="bg-amber-50 p-4 rounded-md border border-amber-200 mt-4">
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
    <div className="container mx-auto p-6">
      <Breadcrumb 
        items={[
          { label: 'Tableau de bord', href: '/app/traditional' },
          { label: 'Portefeuille', href: `/app/traditional/${portfolioId || 'default'}` },
          { label: 'Contrats', href: `/app/traditional/${portfolioId || 'default'}?tab=contracts` },
          { label: `${contract.contract_number}`, href: '#' }
        ]} 
      />
      
      <div className="flex justify-between items-center my-6">
        <Button 
          variant="outline" 
          onClick={() => navigate(`/app/traditional/${portfolioId || 'default'}?tab=contracts`)}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour aux contrats
        </Button>
      </div>
      
      <ContractDetailsResponsive 
        contract={contract}
        onUpdateContract={handleUpdateContract}
      />
    </div>
  );
}

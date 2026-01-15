import { useParams, useNavigate } from 'react-router-dom';
import { useCreditContracts } from '../hooks/useCreditContracts';
import { Button } from '../components/ui/Button';
import { Breadcrumb } from '../components/common/Breadcrumb';
import { ArrowLeft } from 'lucide-react';
import { ContractDetailsResponsive } from '../components/portfolio/traditional/contract/ContractDetailsResponsive';
import { creditContractsStorageService } from '../services/storage/creditContractsStorage';
import { useNotification } from '../contexts/useNotification';
import { CreditContract } from '../types/credit-contract';
import { DetailsSkeleton } from '../components/ui/DetailsSkeleton';

export default function CreditContractDetail() {
  const { portfolioId, contractId } = useParams();
  const navigate = useNavigate();
  const { contracts, loading, error, fetchContracts } = useCreditContracts(portfolioId || 'default');
  const { showNotification } = useNotification();
  
  // Trouver le contrat correspondant
  const contract = contracts.find(c => c.id === contractId);
  
  // Construire l'URL de retour correcte en fonction de l'URL actuelle
  const getPortfolioUrl = () => {
    // Vérifier si l'URL actuelle contient "traditional/traditional" (format ancien)
    const currentPath = window.location.pathname;
    if (currentPath.includes('/app/traditional/traditional/')) {
      return `/app/traditional/traditional/${portfolioId || 'default'}?tab=contracts`;
    }
    // Sinon utiliser le format standard
    return `/app/traditional/${portfolioId || 'default'}?tab=contracts`;
  };

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
      <div className="container mx-auto p-4 sm:p-6">
        <DetailsSkeleton 
          showBreadcrumb={true} 
          variant="full" 
          infoSections={2} 
          rowsPerSection={4}
          showActions={true}
        />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto p-4 sm:p-6">
        <div className="bg-red-50 p-4 rounded-md border border-red-200">
          <h3 className="text-lg font-medium text-red-800">Erreur</h3>
          <p className="mt-2 text-sm text-red-700">{error}</p>
          <Button 
            className="mt-4" 
            variant="outline" 
            onClick={() => navigate(getPortfolioUrl())}
          >
            Retour au portefeuille
          </Button>
        </div>
      </div>
    );
  }
  
  if (!contract) {
    return (
      <div className="container mx-auto p-4 sm:p-6">
      <Breadcrumb 
        items={[
          { label: 'Tableau de bord', href: '/app' },
          { label: 'Portefeuilles', href: '/app/traditional' },
          { label: `Portefeuille ${portfolioId || 'default'}`, href: getPortfolioUrl() },
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
            onClick={() => navigate(getPortfolioUrl())}
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
          { label: 'Tableau de bord', href: '/app' },
          { label: 'Portefeuilles', href: '/app/traditional' },
          { label: `Portefeuille ${portfolioId || 'default'}`, href: getPortfolioUrl() },
          { label: contract.contract_number, href: '#' }
        ]} 
      />
      
      <div className="flex justify-between items-center my-6">
        <Button 
          variant="outline" 
          onClick={() => {
            // Retour à l'onglet contrats du portefeuille
            navigate(getPortfolioUrl());
          }}
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

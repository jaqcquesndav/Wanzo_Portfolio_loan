// components/portfolio/traditional/contract/CreditContractDetailPage.tsx
import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useCreditContracts } from '../../../../hooks/useCreditContracts';
import { Breadcrumb } from '../../../common/Breadcrumb';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../../ui/Tabs';
import { Separator } from '../../../ui/Separator';
import { Button } from '../../../ui/Button';
import { ArrowLeft } from 'lucide-react';
import { useNotification } from '../../../../contexts/NotificationContext';

// Composants pour les différentes sections
import { ContractOverview } from './ContractOverview';
// Import direct avec chemin relatif complet au cas où
import ContractDetails from '../../../../components/portfolio/traditional/contract/ContractDetails';
import { EditableAmortizationSchedule } from './EditableAmortizationSchedule';
import { ContractRepayments } from './ContractRepayments';
import { ContractGuarantees } from './ContractGuarantees';
import { ContractDocuments } from './ContractDocuments';
import { ContractRiskAnalysis } from './ContractRiskAnalysis';
import { ContractActionsPanel } from './ContractActionsPanel';
import { ConfigureContractForm } from './ConfigureContractForm';
import { EditContractForm } from './EditContractForm';

// Styles et utilitaires
import { creditContractsStorageService } from '../../../../services/storage/creditContractsStorage';
import { CreditContract } from '../../../../types/credit';

export default function CreditContractDetailPage() {
  const { portfolioId, contractId } = useParams();
  const navigate = useNavigate();
  const { contracts, loading, error, fetchContracts } = useCreditContracts(portfolioId || 'default');
  const [activeTab, setActiveTab] = useState('details');
  const [isConfigureModalOpen, setIsConfigureModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
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
    <div className="container mx-auto p-6">
      <Breadcrumb 
        items={[
          { label: 'Tableau de bord', href: '/app/traditional' },
          { label: 'Portefeuille', href: `/app/traditional/${portfolioId || 'default'}` },
          { label: 'Contrats', href: `/app/traditional/${portfolioId || 'default'}?tab=contracts` },
          { label: `${contract.reference}`, href: '#' }
        ]} 
      />
      
      {/* Aperçu du contrat */}
      <ContractOverview 
        contract={contract} 
      />
      
      <Separator className="my-6" />
      
      {/* Panneau d'actions contextuelles */}
      <ContractActionsPanel 
        contract={contract}
        onConfigure={() => setIsConfigureModalOpen(true)}
        onRefresh={fetchContracts}
        onEdit={() => setIsEditModalOpen(true)}
      />
      
      <div className="mt-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="details" currentValue={activeTab} onValueChange={setActiveTab}>Détails</TabsTrigger>
            <TabsTrigger value="schedule" currentValue={activeTab} onValueChange={setActiveTab}>Échéancier</TabsTrigger>
            <TabsTrigger value="repayments" currentValue={activeTab} onValueChange={setActiveTab}>Remboursements</TabsTrigger>
            <TabsTrigger value="guarantees" currentValue={activeTab} onValueChange={setActiveTab}>Garanties</TabsTrigger>
            <TabsTrigger value="documents" currentValue={activeTab} onValueChange={setActiveTab}>Documents</TabsTrigger>
            <TabsTrigger value="risk" currentValue={activeTab} onValueChange={setActiveTab}>Analyse de risque</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" currentValue={activeTab} className="p-4 bg-white rounded-md shadow">
            <div className="flex justify-end mb-4">
              <Button onClick={() => setIsEditModalOpen(true)} variant="outline">
                Modifier les paramètres
              </Button>
            </div>
            <ContractDetails contract={contract} />
          </TabsContent>
          
          <TabsContent value="schedule" currentValue={activeTab} className="p-4 bg-white rounded-md shadow">
            <EditableAmortizationSchedule 
              contractId={contract.id}
              amount={contract.amount}
              interestRate={contract.interestRate}
              startDate={contract.startDate || new Date().toISOString()}
              endDate={contract.endDate || new Date(new Date().setFullYear(new Date().getFullYear() + 2)).toISOString()}
              amortizationMethod={contract.amortization_method || 'linear'}
              onEditSchedule={async (updatedSchedule) => {
                // Si updatedSchedule est vide, cela signifie que seule la méthode d'amortissement a changé
                if (updatedSchedule.length === 0) {
                  // Mettre à jour la méthode d'amortissement du contrat
                  handleUpdateContract({
                    amortization_method: contract.amortization_method === 'linear' ? 'degressive' :
                                        contract.amortization_method === 'degressive' ? 'progressive' :
                                        contract.amortization_method === 'progressive' ? 'balloon' : 'linear'
                  });
                } else {
                  console.log('Échéancier mis à jour:', updatedSchedule);
                  showNotification('Échéancier mis à jour avec succès', 'success');
                }
              }}
            />
          </TabsContent>
          
          <TabsContent value="repayments" currentValue={activeTab} className="p-4 bg-white rounded-md shadow">
            <ContractRepayments contractId={contract.id} />
          </TabsContent>
          
          <TabsContent value="guarantees" currentValue={activeTab} className="p-4 bg-white rounded-md shadow">
            <ContractGuarantees contractId={contract.id} />
          </TabsContent>
          
          <TabsContent value="documents" currentValue={activeTab} className="p-4 bg-white rounded-md shadow">
            <ContractDocuments contractId={contract.id} />
          </TabsContent>
          
          <TabsContent value="risk" currentValue={activeTab} className="p-4 bg-white rounded-md shadow">
            <ContractRiskAnalysis contract={contract} />
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Formulaire de configuration du contrat */}
      {contract && (
        <ConfigureContractForm 
          isOpen={isConfigureModalOpen}
          onClose={() => setIsConfigureModalOpen(false)}
          onUpdate={handleUpdateContract}
          contract={contract}
        />
      )}
      
      {/* Formulaire d'édition des paramètres du contrat */}
      {contract && (
        <EditContractForm 
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleUpdateContract}
          contract={contract}
        />
      )}
    </div>
  );
}

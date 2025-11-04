// src/components/portfolio/traditional/contract/ContractDetailsResponsive.tsx
import { useState } from 'react';
import { CreditContract } from '../../../../types/credit-contract';
import { Card } from '../../../ui/Card';
import { Badge } from '../../../ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../ui/Tabs';
import { ContractDocumentsManager } from './ContractDocumentsManager';
import { EditableAmortizationSchedule } from './EditableAmortizationSchedule';
import { ContractActionsPanel } from './ContractActionsPanel';
import { ContractDetails } from './ContractDetails';
import { useNotification } from '../../../../contexts/useNotification';
import { ConfigureContractForm } from './ConfigureContractForm';
import { EditContractForm } from './EditContractForm';

// Fonction utilitaire pour le formatage des montants
// const formatAmount = (amount: number) => {
//   return new Intl.NumberFormat('fr-FR', { 
//     style: 'currency', 
//     currency: 'XAF',
//     maximumFractionDigits: 0
//   }).format(amount);
// };

// Configuration des status pour l'affichage
const statusConfig: Record<string, { label: string; variant: "success" | "secondary" | "danger" | "warning" }> = {
  'active': { label: 'Actif', variant: 'success' },
  'completed': { label: 'ClÃ´turÃ©', variant: 'secondary' },
  'defaulted': { label: 'En dÃ©faut', variant: 'danger' },
  'suspended': { label: 'Suspendu', variant: 'warning' },
  'in_litigation': { label: 'En contentieux', variant: 'danger' }
};

interface ContractDetailsResponsiveProps {
  contract: CreditContract;
  onUpdateContract: (updatedData: Partial<CreditContract>) => Promise<void>;
}

export function ContractDetailsResponsive({ contract, onUpdateContract }: ContractDetailsResponsiveProps) {
  const [activeTab, setActiveTab] = useState('general');
  const { showNotification } = useNotification();
  const [isConfigureModalOpen, setIsConfigureModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  return (
    <div className="contract-details-responsive space-y-6">
      <div className="flex justify-between items-start flex-wrap gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-xl font-semibold">DÃ©tails du contrat</h2>
            <Badge 
              variant={
                (statusConfig[contract.status] && statusConfig[contract.status].variant) 
                  ? statusConfig[contract.status].variant 
                  : "secondary"
              }
              className="text-sm"
            >
              {(statusConfig[contract.status] && statusConfig[contract.status].label) 
                ? statusConfig[contract.status].label 
                : contract.status}
            </Badge>
          </div>
          <p className="text-gray-500 mt-1">
            RÃ©fÃ©rence: {contract.contract_number} â€¢ Client: {contract.company_name}
          </p>
        </div>
        
        {/* Panneau d'actions du contrat */}
        <ContractActionsPanel 
          contract={contract}
          onConfigure={() => setIsConfigureModalOpen(true)}
          onRefresh={() => {}}
          onEdit={() => setIsEditModalOpen(true)}
        />
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-1 md:grid-cols-3 mb-4">
          <TabsTrigger value="general" currentValue={activeTab} onValueChange={setActiveTab}>Informations gÃ©nÃ©rales</TabsTrigger>
          <TabsTrigger value="schedule" currentValue={activeTab} onValueChange={setActiveTab}>Ã‰chÃ©ancier</TabsTrigger>
          <TabsTrigger value="documents" currentValue={activeTab} onValueChange={setActiveTab}>Documents</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" currentValue={activeTab} className="space-y-6">
          {/* Utiliser le composant ContractDetails avec la possibilitÃ© d'Ã©dition */}
          <ContractDetails 
            contract={contract}
            onUpdate={onUpdateContract}
          />
        </TabsContent>
        
        <TabsContent value="schedule" currentValue={activeTab}>
          <Card className="p-4">
            <EditableAmortizationSchedule 
              contractId={contract.id}
              amount={contract.amount}
              interestRate={contract.interest_rate}
              startDate={contract.start_date}
              endDate={contract.end_date}
              onEditSchedule={async () => {
                // Dans une application réelle, nous sauvegarderions l'échéancier mis à jour
                showNotification(
                  'Ã‰chÃ©ancier mis Ã  jour avec succÃ¨s',
                  'success'
                );
              }}
            />
          </Card>
        </TabsContent>
        
        <TabsContent value="documents" currentValue={activeTab}>
          <Card className="p-4">
            <ContractDocumentsManager contractId={contract.id} />
          </Card>
        </TabsContent>
      </Tabs>

      {/* Formulaire de configuration du contrat */}
      {contract && (
        <ConfigureContractForm 
          isOpen={isConfigureModalOpen}
          onClose={() => setIsConfigureModalOpen(false)}
          onUpdate={onUpdateContract}
          contract={contract}
        />
      )}
      
      {/* Formulaire d'Ã©dition des paramÃ¨tres du contrat */}
      {contract && (
        <EditContractForm 
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSave={onUpdateContract}
          contract={contract}
        />
      )}
    </div>
  );
}


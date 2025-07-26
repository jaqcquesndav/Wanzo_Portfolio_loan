// src/components/portfolio/traditional/contract/ContractDetailsResponsive.tsx
import { useState } from 'react';
import { CreditContract } from '../../../../types/credit';
import { Card } from '../../../ui/Card';
import { Badge } from '../../../ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../ui/Tabs';
import { ContractDocumentsManager } from './ContractDocumentsManager';
import { EditableAmortizationSchedule } from './EditableAmortizationSchedule';
import { ContractActionsPanel } from './ContractActionsPanel';
import { ContractDetails } from './ContractDetails';
import { useNotification } from '../../../../contexts/NotificationContext';
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
  'closed': { label: 'Clôturé', variant: 'secondary' },
  'defaulted': { label: 'En défaut', variant: 'danger' },
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
            <h2 className="text-xl font-semibold">Détails du contrat</h2>
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
            Référence: {contract.reference} • Client: {contract.memberName}
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
          <TabsTrigger value="general" currentValue={activeTab} onValueChange={setActiveTab}>Informations générales</TabsTrigger>
          <TabsTrigger value="schedule" currentValue={activeTab} onValueChange={setActiveTab}>Échéancier</TabsTrigger>
          <TabsTrigger value="documents" currentValue={activeTab} onValueChange={setActiveTab}>Documents</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" currentValue={activeTab} className="space-y-6">
          {/* Utiliser le composant ContractDetails avec la possibilité d'édition */}
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
              interestRate={contract.interestRate}
              startDate={contract.startDate}
              endDate={contract.endDate}
              onEditSchedule={async () => {
                // Dans une application réelle, nous sauvegarderions l'échéancier mis à jour
                showNotification(
                  'Échéancier mis à jour avec succès',
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
      
      {/* Formulaire d'édition des paramètres du contrat */}
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

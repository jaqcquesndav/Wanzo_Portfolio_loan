// src/components/portfolio/traditional/contract/ContractDetailsResponsive.tsx
import { useState } from 'react';
import { CreditContract } from '../../../../types/credit';
import { Card } from '../../../ui/Card';
import { Badge } from '../../../ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../ui/Tabs';
import { ContractDocumentsManager } from './ContractDocumentsManager';
import { EditableAmortizationSchedule } from './EditableAmortizationSchedule';
import { ContractActions } from './ContractActions';
import { ContractDetails } from './ContractDetails';
import { useNotification } from '../../../../contexts/NotificationContext';

// Fonction utilitaire pour le formatage des montants
const formatAmount = (amount: number) => {
  return new Intl.NumberFormat('fr-FR', { 
    style: 'currency', 
    currency: 'XAF',
    maximumFractionDigits: 0
  }).format(amount);
};

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
  
  // Gestionnaire pour changer le statut du contrat
  const handleStatusChange = async (newStatus: 'active' | 'closed' | 'defaulted' | 'suspended' | 'in_litigation', reason: string) => {
    // Nous ignorons le paramètre reason dans cette implémentation
    void reason;
    
    try {
      await onUpdateContract({
        ...contract,
        status: newStatus,
        lastUpdated: new Date().toISOString()
      });
      
      showNotification(
        `Le statut du contrat a été changé en ${statusConfig[newStatus]?.label || newStatus}`,
        'success'
      );
    } catch (error) {
      console.error('Erreur lors du changement de statut:', error);
      showNotification(
        'Erreur lors du changement de statut',
        'error'
      );
      throw error;
    }
  };
  
  // Gestionnaire pour enregistrer un remboursement
  const handleRepayment = async (amount: number, date: string, description: string) => {
    // Nous ignorons le paramètre description dans cette implémentation
    void description;
    
    try {
      // Simuler l'enregistrement d'un remboursement
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mise à jour du contrat (dans une application réelle, ce serait plus complexe)
      const remainingAmount = Math.max(0, contract.remainingAmount - amount);
      
      await onUpdateContract({
        ...contract,
        remainingAmount,
        lastPaymentDate: date,
        lastUpdated: new Date().toISOString()
      });
      
      showNotification(
        `Remboursement de ${formatAmount(amount)} enregistré avec succès`,
        'success'
      );
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement du remboursement:', error);
      showNotification(
        'Erreur lors de l\'enregistrement du remboursement',
        'error'
      );
      throw error;
    }
  };
  
  // Gestionnaire pour exporter en PDF
  const handleExportPdf = () => {
    showNotification(
      'Export PDF en cours...',
      'info'
    );
    
    // Simuler un export
    setTimeout(() => {
      showNotification(
        'Le contrat a été exporté en PDF avec succès',
        'success'
      );
    }, 1500);
  };

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
        
        <ContractActions 
          contractId={contract.id}
          status={contract.status}
          onStatusChange={handleStatusChange}
          onRepayment={handleRepayment}
          onExportPdf={handleExportPdf}
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
    </div>
  );
}

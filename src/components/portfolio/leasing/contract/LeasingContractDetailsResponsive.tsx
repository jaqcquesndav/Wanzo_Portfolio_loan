import { useState } from 'react';
import { Card } from '../../../ui/Card';
import { Badge } from '../../../ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../ui/Tabs';
import { Button as UIButton } from '../../../ui/Button';
import { LeasingContractDetails } from './LeasingContractDetails';
import { useNotification } from '../../../../contexts/NotificationContext';
import { LeasingContract } from '../../../../types/leasing';
import { EditableAmortizationSchedule } from '../../traditional/contract/EditableAmortizationSchedule';
import { ContractDocumentsManager } from '../../traditional/contract/ContractDocumentsManager';
import { useFormatCurrency } from '../../../../hooks/useFormatCurrency';

// Define the extended status type for our enriched contract
export type ExtendedLeasingStatusType = 'active' | 'pending' | 'completed' | 'terminated';

export interface EnrichedLeasingContract extends Omit<LeasingContract, 'status' | 'client_name'> {
  equipment_name?: string;
  equipment_category?: string;
  equipment_manufacturer?: string;
  equipment_model?: string;
  client_name: string;
  status: ExtendedLeasingStatusType;
  residual_value?: number;
  total_value?: number;
  payments_made?: number;
  remaining_payments?: number;
  last_payment_date?: string;
  next_payment_date?: string;
  delinquency_days?: number;
}

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
  'completed': { label: 'Terminé', variant: 'secondary' },
  'terminated': { label: 'Résilié', variant: 'danger' },
  'pending': { label: 'En attente', variant: 'warning' }
};

interface LeasingContractDetailsResponsiveProps {
  contract: EnrichedLeasingContract;
  onUpdateContract: (updatedData: Partial<EnrichedLeasingContract>) => Promise<void>;
}

export function LeasingContractDetailsResponsive({ contract, onUpdateContract }: LeasingContractDetailsResponsiveProps) {
  const [activeTab, setActiveTab] = useState('general');
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);
  const { showNotification } = useNotification();
  const { formatCurrency } = useFormatCurrency();
  
  // Gestionnaire pour changer le statut du contrat
  const handleStatusChange = async (newStatus: ExtendedLeasingStatusType, reason: string) => {
    // Nous ignorons le paramètre reason dans cette implémentation
    void reason;
    
    try {
      await onUpdateContract({
        ...contract,
        status: newStatus,
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
  
  // Gestionnaire pour enregistrer un paiement
  const handlePayment = async (amount: number, date: string, description: string) => {
    // Nous ignorons le paramètre description dans cette implémentation
    void description;
    
    try {
      // Simuler l'enregistrement d'un paiement
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Calculer les nouvelles valeurs
      const paymentsMade = (contract.payments_made || 0) + 1;
      const remainingPayments = contract.remaining_payments 
        ? Math.max(0, contract.remaining_payments - 1)
        : 0;
      
      await onUpdateContract({
        ...contract,
        payments_made: paymentsMade,
        remaining_payments: remainingPayments,
        last_payment_date: date,
        delinquency_days: 0 // Réinitialiser les jours de retard après un paiement
      });
      
      showNotification(
        `Paiement de ${formatCurrency(amount)} enregistré avec succès`,
        'success'
      );
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement du paiement:', error);
      showNotification(
        'Erreur lors de l\'enregistrement du paiement',
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
    <div className="leasing-contract-details-responsive space-y-6">
      <div className="flex justify-between items-start flex-wrap gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-xl font-semibold">Détails du contrat de leasing</h2>
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
            Référence: {contract.id} • Client: {contract.client_name || 'N/A'}
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <UIButton 
            variant="outline"
            onClick={() => handlePayment(contract.monthly_payment, new Date().toISOString(), 'Paiement régulier')}
          >
            Enregistrer un paiement
          </UIButton>
          <UIButton 
            variant="outline"
            onClick={handleExportPdf}
          >
            Exporter en PDF
          </UIButton>
          <div className="relative inline-block text-left">
            <UIButton variant="outline" onClick={() => setStatusMenuOpen(!statusMenuOpen)}>
              Modifier le statut
            </UIButton>
            {statusMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                <div className="py-1">
                  <div className="px-4 py-2 text-sm text-gray-700 font-medium">Changer le statut</div>
                  <div className="border-t border-gray-100 my-1"></div>
                  <button
                    className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => { handleStatusChange('active', ''); setStatusMenuOpen(false); }}
                  >
                    Actif
                  </button>
                  <button
                    className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => { handleStatusChange('pending', ''); setStatusMenuOpen(false); }}
                  >
                    En attente
                  </button>
                  <button
                    className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => { handleStatusChange('completed', ''); setStatusMenuOpen(false); }}
                  >
                    Terminé
                  </button>
                  <button
                    className="w-full text-left block px-4 py-2 text-sm text-red-500 hover:bg-gray-100"
                    onClick={() => { handleStatusChange('terminated', ''); setStatusMenuOpen(false); }}
                  >
                    Résilié
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-1 md:grid-cols-3 mb-4">
          <TabsTrigger value="general" currentValue={activeTab} onValueChange={setActiveTab}>Informations générales</TabsTrigger>
          <TabsTrigger value="payments" currentValue={activeTab} onValueChange={setActiveTab}>Historique des paiements</TabsTrigger>
          <TabsTrigger value="documents" currentValue={activeTab} onValueChange={setActiveTab}>Documents</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" currentValue={activeTab} className="space-y-6">
          {/* Utiliser le composant LeasingContractDetails avec la possibilité d'édition */}
          <LeasingContractDetails 
            contract={contract}
            onUpdate={onUpdateContract}
          />
        </TabsContent>
        
        <TabsContent value="payments" currentValue={activeTab}>
          <Card className="p-4">
            <EditableAmortizationSchedule 
              contractId={contract.id}
              amount={contract.monthly_payment * (contract.remaining_payments || 12)} // Montant total approximatif
              interestRate={contract.interest_rate}
              startDate={contract.start_date}
              endDate={contract.end_date}
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

// Fin du fichier

// Fin du fichier

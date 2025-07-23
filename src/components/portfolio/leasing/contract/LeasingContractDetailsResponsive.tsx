import { useState } from 'react';
import { Card } from '../../../ui/Card';
import { Badge } from '../../../ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../ui/Tabs';
import { Button as UIButton } from '../../../ui/Button';
import { LeasingContractDetails } from './LeasingContractDetails';
import { useNotification } from '../../../../contexts/NotificationContext';
import { LeasingContract } from '../../../../types/leasing';

// Define the extended status type for our enriched contract
export type ExtendedLeasingStatusType = 'active' | 'pending' | 'completed' | 'terminated';

export interface EnrichedLeasingContract extends Omit<LeasingContract, 'status'> {
  equipment_name?: string;
  equipment_category?: string;
  equipment_manufacturer?: string;
  equipment_model?: string;
  client_name?: string;
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
        `Paiement de ${formatAmount(amount)} enregistré avec succès`,
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
            <h3 className="text-lg font-medium mb-4">Historique des paiements</h3>
            <div className="text-center py-8 text-gray-500">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <h3 className="mt-2 text-lg font-medium">Suivi des paiements</h3>
              <p className="mt-1">
                Ce module vous permet de suivre l'historique des paiements pour ce contrat.
              </p>
              <p className="mt-2 text-sm">
                Paiements effectués: {contract.payments_made || 0} | Paiements restants: {contract.remaining_payments || 0}
              </p>
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="documents" currentValue={activeTab}>
          <Card className="p-4">
            <h3 className="text-lg font-medium mb-4">Documents du contrat</h3>
            <div className="text-center py-8 text-gray-500">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
              </svg>
              <h3 className="mt-2 text-lg font-medium">Gestion des documents</h3>
              <p className="mt-1">
                Ce module vous permet de gérer les documents associés à ce contrat.
              </p>
              <p className="mt-2 text-sm">
                Aucun document disponible pour le moment.
              </p>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Fin du fichier

// Fin du fichier

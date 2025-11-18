// components/portfolio/traditional/contract/ContractActionsPanel.tsx
import { useState } from 'react';
import { Button } from '../../../ui/Button';
// Utiliser Dialog directement en attendant que TypeScript reconnaisse AlertDialog
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../../ui/Dialog';
import { CreditContract } from '../../../../types/credit-contract';
import { creditContractsStorageService } from '../../../../services/storage/creditContractsStorage';
import { useNotification } from '../../../../contexts/useNotification';
import { BanknotesIcon } from '@heroicons/react/24/outline';
import { usePaymentOrder } from '../../../../hooks/usePaymentOrderContext';
import { openPaymentOrder } from '../../../../utils/openPaymentOrder';

interface ContractActionsPanelProps {
  contract: CreditContract;
  onConfigure: () => void;
  onRefresh: () => void;
  onEdit?: () => void;
}

export function ContractActionsPanel({ contract, onConfigure, onRefresh, onEdit }: ContractActionsPanelProps) {
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<CreditContract['status'] | null>(null);
  const [statusReason, setStatusReason] = useState('');
  const { showNotification } = useNotification();
  const { showPaymentOrderModal } = usePaymentOrder();

  // Ouvrir le modal de paiement pour cRéditer le client
  const handleCreditClient = () => {
    // PRéparer les données pour le modal de paiement
    openPaymentOrder(
      {
        action: 'validate_funding',
        portfolioId: contract.portfolioId || 'default',
        portfolioName: 'Portefeuille de crédit',
        itemId: contract.id,
        reference: contract.contract_number,
        amount: contract.amount,
        company: contract.company_name,
        companyId: contract.client_id, // ID de l'entreprise pour récupérer toutes ses données
        product: contract.product_type
      },
      showPaymentOrderModal
    );
  };

  const handleStatusChange = async () => {
    if (!selectedStatus) return;
    
    try {
      await creditContractsStorageService.updateContract(contract.id, {
        status: selectedStatus,
        updated_at: new Date().toISOString()
        // La propriété statusChangeReason n'existe pas dans le type CreditContract
        // Nous pouvons stocker cette information dans une table sépaRée ou dans localStorage
      });
      
      // Si besoin de conserver la raison du changement, nous pouvons utiliser localStorage
      if (statusReason) {
        const statusHistory = JSON.parse(localStorage.getItem(`statusHistory_${contract.id}`) || '[]');
        statusHistory.push({
          fromStatus: contract.status,
          toStatus: selectedStatus,
          reason: statusReason,
          date: new Date().toISOString()
        });
        localStorage.setItem(`statusHistory_${contract.id}`, JSON.stringify(statusHistory));
      }
      
      showNotification(`Statut du contrat mis à jour avec succès`, 'success');
      onRefresh();
      setIsStatusDialogOpen(false);
      setSelectedStatus(null);
      setStatusReason('');
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      showNotification('Erreur lors de la mise à jour du statut', 'error');
    }
  };

  const openStatusDialog = (status: CreditContract['status']) => {
    setSelectedStatus(status);
    setIsStatusDialogOpen(true);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border">
      <h3 className="text-lg font-medium mb-4">Actions du contrat</h3>
      
      <div className="space-y-4">
        {/* Actions principales */}
        <div className="flex flex-wrap gap-2">
          <Button 
            onClick={onConfigure} 
            size="sm"
          >
            Configurer
          </Button>
          
          {onEdit && (
            <Button 
              variant="outline" 
              onClick={onEdit} 
              size="sm"
            >
              Modifier
            </Button>
          )}
          
          <Button 
            variant="outline" 
            onClick={handleCreditClient} 
            size="sm"
            className="text-green-600 border-green-600 hover:bg-green-50"
          >
            <BanknotesIcon className="w-4 h-4 mr-1" />
            Débloquer
          </Button>
        </div>

        {/* Actions de changement de statut */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700">Changer le statut</h4>
          
          {/* Actions disponibles selon le statut actuel */}
          {contract.status === 'active' && (
            <div className="flex flex-wrap gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => openStatusDialog('suspended')}
              >
                Suspendre
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => openStatusDialog('completed')}
              >
                Clôturer
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="text-orange-600 border-orange-600 hover:bg-orange-50"
                onClick={() => openStatusDialog('defaulted')}
              >
                Marquer défaillant
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="text-red-600 border-red-600 hover:bg-red-50"
                onClick={() => openStatusDialog('in_litigation')}
              >
                Mettre en contentieux
              </Button>
            </div>
          )}

          {contract.status === 'suspended' && (
            <div className="flex flex-wrap gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => openStatusDialog('active')}
              >
                Réactiver
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => openStatusDialog('completed')}
              >
                Clôturer
              </Button>
            </div>
          )}

          {contract.status === 'defaulted' && (
            <div className="flex flex-wrap gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => openStatusDialog('active')}
              >
                Réactiver
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="text-red-600 border-red-600 hover:bg-red-50"
                onClick={() => openStatusDialog('in_litigation')}
              >
                Mettre en contentieux
              </Button>
            </div>
          )}

          {contract.status === 'in_litigation' && (
            <div className="flex flex-wrap gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => openStatusDialog('active')}
              >
                Réactiver
              </Button>
            </div>
          )}

          {contract.status === 'completed' && (
            <div className="flex flex-wrap gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => openStatusDialog('active')}
              >
                Réactiver
              </Button>
            </div>
          )}

          {contract.status === 'restructured' && (
            <div className="flex flex-wrap gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => openStatusDialog('active')}
              >
                Réactiver
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Dialog de confirmation pour le changement de statut */}
      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer le changement de statut</DialogTitle>
            <DialogDescription>
              Vous êtes sur le point de changer le statut du contrat {contract.contract_number} de "{contract.status}" vers "{selectedStatus}".
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
                Raison du changement (optionnel)
              </label>
              <textarea
                id="reason"
                value={statusReason}
                onChange={(e) => setStatusReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Expliquez la raison de ce changement de statut..."
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsStatusDialogOpen(false);
                setSelectedStatus(null);
                setStatusReason('');
              }}
            >
              Annuler
            </Button>
            <Button onClick={handleStatusChange}>
              Confirmer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}



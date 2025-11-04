// components/portfolio/traditional/contract/ContractActionsPanel.tsx
import { useState } from 'react';
import { Button } from '../../../ui/Button';
// Utiliser Dialog directement en attendant que TypeScript reconnaisse AlertDialog
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../../ui/Dialog';
import { CreditContract } from '../../../../types/credit';
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

  // Ouvrir le modal de paiement pour créditer le client
  const handleCreditClient = () => {
    // Préparer les données pour le modal de paiement
    openPaymentOrder(
      {
        action: 'validate_funding',
        portfolioId: contract.portfolioId || 'default',
        portfolioName: 'Portefeuille de crédit',
        itemId: contract.id,
        reference: contract.reference,
        amount: contract.amount,
        company: contract.memberName,
        product: contract.productName
      },
      showPaymentOrderModal
    );
  };

  const handleStatusChange = async () => {
    if (!selectedStatus) return;
    
    try {
      await creditContractsStorageService.updateContract(contract.id, {
        status: selectedStatus,
        lastUpdated: new Date().toISOString()
        // La propriété statusChangeReason n'existe pas dans le type CreditContract
        // Nous pouvons stocker cette information dans une table séparée ou dans localStorage
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
      
      showNotification(`Statut du contrat modifié en "${selectedStatus}"`, 'success');
      onRefresh();
      setIsStatusDialogOpen(false);
      setStatusReason('');
    } catch (error) {
      console.error('Erreur lors de la modification du statut:', error);
      showNotification('Erreur lors de la modification du statut', 'error');
    }
  };

  const openStatusDialog = (status: CreditContract['status']) => {
    setSelectedStatus(status);
    setIsStatusDialogOpen(true);
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-medium mb-4">Actions sur le contrat</h3>
      
      {/* Section des actions principales */}
      <div className="mb-4 border-b pb-4">
        <h4 className="text-md font-medium mb-2 text-gray-700">Actions principales</h4>
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={onConfigure}
            className="bg-blue-50 text-blue-700 border-blue-300 hover:bg-blue-100"
          >
            Configurer
          </Button>
          
          {onEdit && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={onEdit}
              className="bg-green-50 text-green-700 border-green-300 hover:bg-green-100"
            >
              Éditer les paramètres
            </Button>
          )}
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleCreditClient}
            className="bg-green-50 text-green-700 border-green-300 hover:bg-green-100 flex items-center"
          >
            <BanknotesIcon className="h-4 w-4 mr-1" />
            Créditer
          </Button>
        </div>
      </div>
      
      {/* Section des actions de gestion du statut */}
      <div>
        <h4 className="text-md font-medium mb-2 text-gray-700">Gestion du contrat</h4>
        <div className="flex flex-wrap gap-2">
          {contract.status === 'active' && (
            <>
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
                onClick={() => openStatusDialog('closed')}
              >
                Clôturer
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="text-amber-600"
                onClick={() => openStatusDialog('defaulted')}
              >
                Marquer en défaut
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="text-red-600"
                onClick={() => openStatusDialog('in_litigation')}
              >
                Mettre en contentieux
              </Button>
            </>
          )}
          
          {contract.status === 'suspended' && (
            <>
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
                onClick={() => openStatusDialog('closed')}
              >
                Clôturer
              </Button>
            </>
          )}
          
          {contract.status === 'defaulted' && (
            <>
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
                className="text-red-600"
                onClick={() => openStatusDialog('in_litigation')}
              >
                Mettre en contentieux
              </Button>
            </>
          )}
          
          {contract.status === 'in_litigation' && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => openStatusDialog('active')}
            >
              Réactiver
            </Button>
          )}
          
          {contract.status === 'closed' && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => openStatusDialog('active')}
            >
              Réactiver
            </Button>
          )}
        </div>
      </div>
      
      {/* Dialogue de confirmation pour changement de statut */}
      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier le statut du contrat</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir changer le statut du contrat {contract.reference} à "{selectedStatus}"?
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Motif du changement
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  value={statusReason}
                  onChange={(e) => setStatusReason(e.target.value)}
                  placeholder="Veuillez indiquer le motif du changement de statut..."
                />
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsStatusDialogOpen(false)}>Annuler</Button>
            <Button onClick={handleStatusChange}>Confirmer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

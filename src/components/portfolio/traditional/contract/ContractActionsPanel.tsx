// components/portfolio/traditional/contract/ContractActionsPanel.tsx
import { useState } from 'react';
import { Button } from '../../../ui/Button';
// Utiliser Dialog directement en attendant que TypeScript reconnaisse AlertDialog
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../../ui/Dialog';
import { CreditContract } from '../../../../types/credit';
import { creditContractsStorageService } from '../../../../services/storage/creditContractsStorage';
import { useNotification } from '../../../../contexts/NotificationContext';

interface ContractActionsPanelProps {
  contract: CreditContract;
  onConfigure: () => void;
  onRefresh: () => void;
}

export function ContractActionsPanel({ contract, onConfigure, onRefresh }: ContractActionsPanelProps) {
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<CreditContract['status'] | null>(null);
  const [statusReason, setStatusReason] = useState('');
  const { showNotification } = useNotification();

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
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
        {contract.status === 'active' && (
          <>
            <Button 
              variant="outline" 
              size="sm"
              onClick={onConfigure}
            >
              Configurer
            </Button>
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

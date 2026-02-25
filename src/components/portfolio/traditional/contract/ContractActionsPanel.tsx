// components/portfolio/traditional/contract/ContractActionsPanel.tsx
import { useState } from 'react';
import { Button } from '../../../ui/Button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../../ui/Dialog';
import { CreditContract } from '../../../../types/credit-contract';
import { creditContractApi } from '../../../../services/api/traditional/credit-contract.api';
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

// Transitions autorisées par le backend selon le statut courant
const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  draft:        ['active', 'canceled'],
  active:       ['suspended', 'defaulted', 'completed', 'restructured', 'in_litigation'],
  suspended:    ['active', 'defaulted', 'canceled'],
  defaulted:    ['restructured', 'in_litigation', 'written_off'],
  restructured: ['active', 'defaulted'],
  in_litigation:['written_off', 'completed'],
};

// Transitions qui nécessitent une raison
const NEEDS_REASON = new Set(['suspended', 'canceled', 'defaulted', 'in_litigation']);
// Transition contentieux nécessite aussi une date
const NEEDS_DATE = new Set(['in_litigation']);

export function ContractActionsPanel({ contract, onConfigure, onRefresh, onEdit }: ContractActionsPanelProps) {
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [statusReason, setStatusReason] = useState('');
  const [litigationDate, setLitigationDate] = useState(new Date().toISOString().slice(0, 10));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showNotification } = useNotification();
  const { showPaymentOrderModal } = usePaymentOrder();

  const handleCreditClient = () => {
    openPaymentOrder(
      {
        action: 'validate_funding',
        portfolioId: contract.portfolioId || 'default',
        portfolioName: 'Portefeuille de crédit',
        itemId: contract.id,
        reference: contract.contract_number,
        amount: contract.amount,
        company: contract.company_name,
        companyId: contract.client_id,
        product: contract.product_type
      },
      showPaymentOrderModal
    );
  };

  const handleStatusChange = async () => {
    if (!selectedStatus) return;
    setIsSubmitting(true);
    try {
      const id = contract.id;
      switch (selectedStatus) {
        case 'active':
          await creditContractApi.activateContract(id);
          break;
        case 'suspended':
          await creditContractApi.suspendContract(id, { reason: statusReason || 'Suspension administrative' });
          break;
        case 'canceled':
          await creditContractApi.cancelContract(id, { reason: statusReason || 'Annulation administrative' });
          break;
        case 'defaulted':
          await creditContractApi.markAsDefaulted(id, statusReason || 'Défaillance de paiement');
          break;
        case 'completed':
          await creditContractApi.completeContract(id);
          break;
        case 'in_litigation':
          await creditContractApi.putInLitigation(id, {
            litigation_reason: statusReason || 'Mise en contentieux',
            litigation_date: litigationDate
          });
          break;
        case 'written_off':
          // Pas d'endpoint dédié dans la doc — non implémenté côté backend pour l'instant
          showNotification('Action "passer en pertes" non disponible', 'error');
          return;
        default:
          showNotification(`Transition vers "${selectedStatus}" non supportée`, 'error');
          return;
      }
      showNotification('Statut du contrat mis à jour avec succès', 'success');
      onRefresh();
      closeDialog();
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      showNotification(
        error instanceof Error ? error.message : 'Erreur lors de la mise à jour du statut',
        'error'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const openStatusDialog = (status: string) => {
    setSelectedStatus(status);
    setStatusReason('');
    setLitigationDate(new Date().toISOString().slice(0, 10));
    setIsStatusDialogOpen(true);
  };

  const closeDialog = () => {
    setIsStatusDialogOpen(false);
    setSelectedStatus(null);
    setStatusReason('');
  };

  const currentStatus = contract.status ?? 'draft';
  const allowedNext = ALLOWED_TRANSITIONS[currentStatus] ?? [];

  const statusLabel: Record<string, string> = {
    active: 'Activer',
    suspended: 'Suspendre',
    canceled: 'Annuler',
    defaulted: 'Marquer défaillant',
    completed: 'Clôturer',
    in_litigation: 'Mettre en contentieux',
    written_off: 'Passer en pertes',
    restructured: 'Restructurer',
  };

  const statusVariant: Record<string, string> = {
    active: 'text-green-600 border-green-600 hover:bg-green-50',
    suspended: 'text-yellow-600 border-yellow-600 hover:bg-yellow-50',
    canceled: 'text-gray-600 border-gray-400 hover:bg-gray-50',
    defaulted: 'text-orange-600 border-orange-600 hover:bg-orange-50',
    completed: 'text-blue-600 border-blue-600 hover:bg-blue-50',
    in_litigation: 'text-red-600 border-red-600 hover:bg-red-50',
    written_off: 'text-red-800 border-red-800 hover:bg-red-50',
    restructured: 'text-purple-600 border-purple-600 hover:bg-purple-50',
  };

  const needsReason = selectedStatus ? NEEDS_REASON.has(selectedStatus) : false;
  const needsDate = selectedStatus ? NEEDS_DATE.has(selectedStatus) : false;

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border dark:border-gray-700">
      <h3 className="text-lg font-medium mb-4 dark:text-gray-100">Actions du contrat</h3>

      <div className="space-y-4">
        {/* Actions principales */}
        <div className="flex flex-wrap gap-2">
          <Button onClick={onConfigure} size="sm">
            Configurer
          </Button>

          {onEdit && (
            <Button variant="outline" onClick={onEdit} size="sm">
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

        {/* Transitions de statut disponibles */}
        {allowedNext.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Changer le statut</h4>
            <div className="flex flex-wrap gap-2">
              {allowedNext.map((next) => (
                <Button
                  key={next}
                  variant="outline"
                  size="sm"
                  className={statusVariant[next] ?? ''}
                  onClick={() => openStatusDialog(next)}
                >
                  {statusLabel[next] ?? next}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Dialog de confirmation */}
      <Dialog open={isStatusDialogOpen} onOpenChange={(open) => { if (!open) closeDialog(); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer le changement de statut</DialogTitle>
            <DialogDescription>
              Contrat {contract.contract_number} : <strong>{currentStatus}</strong> → <strong>{selectedStatus}</strong>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {needsReason && (
              <div>
                <label htmlFor="reason" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Raison <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="reason"
                  value={statusReason}
                  onChange={(e) => setStatusReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
                  rows={3}
                  placeholder="Expliquez la raison de ce changement..."
                />
              </div>
            )}
            {needsDate && (
              <div>
                <label htmlFor="litigationDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Date de mise en contentieux <span className="text-red-500">*</span>
                </label>
                <input
                  id="litigationDate"
                  type="date"
                  value={litigationDate}
                  onChange={(e) => setLitigationDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeDialog} disabled={isSubmitting}>
              Annuler
            </Button>
            <Button onClick={handleStatusChange} disabled={isSubmitting}>
              {isSubmitting ? 'En cours...' : 'Confirmer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}



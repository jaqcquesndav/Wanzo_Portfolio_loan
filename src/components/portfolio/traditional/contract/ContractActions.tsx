// src/components/portfolio/traditional/contract/ContractActions.tsx
import { useState } from 'react';
import { Card } from '../../../ui/Card';
import { Button } from '../../../ui/Button';
import { Modal } from '../../../ui/Modal';
import { Input, TextArea } from '../../../ui/Form';
import { 
  Banknote, PauseCircle, PlayCircle, AlertTriangle, 
  CheckCircle, History, Calendar, DollarSign, FileText
} from 'lucide-react';
import { useNotification } from '../../../../contexts/useNotification';

// Type pour les différents statuts de contrat
type ContractStatus = 'active' | 'suspended' | 'defaulted' | 'in_litigation' | 'closed';

interface ContractActionsProps {
  contractId: string;
  status: ContractStatus;
  onStatusChange: (newStatus: ContractStatus, reason: string) => Promise<void>;
  onRepayment: (amount: number, date: string, description: string) => Promise<void>;
  onExportPdf: () => void;
}

export function ContractActions({
  status,
  onStatusChange,
  onRepayment,
  onExportPdf
}: ContractActionsProps) {
  const [isRepaymentModalOpen, setIsRepaymentModalOpen] = useState(false);
  const [isStatusChangeModalOpen, setIsStatusChangeModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  
  const [targetStatus, setTargetStatus] = useState<ContractStatus>('active');
  const [statusChangeReason, setStatusChangeReason] = useState('');
  
  const [repaymentAmount, setRepaymentAmount] = useState<number>(0);
  const [repaymentDate, setRepaymentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [repaymentDescription, setRepaymentDescription] = useState('');
  
  const { showNotification } = useNotification();
  
  // Données simulées pour l'historique des actions
  const actionHistory = [
    { 
      date: '21/07/2025', 
      action: 'Création du contrat', 
      user: 'John Doe', 
      details: 'Contrat créé avec un montant de 5.000.000 XAF' 
    },
    { 
      date: '21/07/2025', 
      action: 'Activation du contrat', 
      user: 'John Doe', 
      details: 'Contrat activé suite à la signature du client' 
    },
    { 
      date: '25/07/2025', 
      action: 'Décaissement', 
      user: 'Jane Smith', 
      details: 'Décaissement effectué pour un montant de 5.000.000 XAF' 
    },
    { 
      date: '15/08/2025', 
      action: 'Remboursement', 
      user: 'System', 
      details: 'Remboursement automatique de la première échéance pour un montant de 450.000 XAF' 
    }
  ];

  // Gestionnaire pour le changement de statut
  const handleStatusChange = async () => {
    try {
      await onStatusChange(targetStatus, statusChangeReason);
      showNotification(`Statut du contrat modifié en "${targetStatus}"`, 'success');
      setIsStatusChangeModalOpen(false);
      
      // Réinitialiser les champs
      setStatusChangeReason('');
    } catch (error) {
      console.error('Erreur lors du changement de statut:', error);
      showNotification('Erreur lors du changement de statut du contrat', 'error');
    }
  };

  // Gestionnaire pour le remboursement
  const handleRepayment = async () => {
    try {
      await onRepayment(repaymentAmount, repaymentDate, repaymentDescription);
      showNotification('Remboursement enregistré avec succès', 'success');
      setIsRepaymentModalOpen(false);
      
      // Réinitialiser les champs
      setRepaymentAmount(0);
      setRepaymentDate(new Date().toISOString().split('T')[0]);
      setRepaymentDescription('');
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement du remboursement:', error);
      showNotification('Erreur lors de l\'enregistrement du remboursement', 'error');
    }
  };

  // Préparation des actions en fonction du statut
  const getAvailableActions = () => {
    const actions = [];
    
    // Action de remboursement (toujours disponible si le contrat est actif)
    if (status === 'active') {
      actions.push(
        <Button
          key="repayment"
          variant="outline"
          size="sm"
          className="flex items-center"
          onClick={() => setIsRepaymentModalOpen(true)}
        >
          <Banknote className="h-4 w-4 mr-2" />
          Remboursement
        </Button>
      );
    }
    
    // Actions spécifiques au statut
    switch (status) {
      case 'active':
        actions.push(
          <Button
            key="suspend"
            variant="outline"
            size="sm"
            className="flex items-center"
            onClick={() => {
              setTargetStatus('suspended');
              setIsStatusChangeModalOpen(true);
            }}
          >
            <PauseCircle className="h-4 w-4 mr-2" />
            Suspendre
          </Button>,
          <Button
            key="close"
            variant="outline"
            size="sm"
            className="flex items-center"
            onClick={() => {
              setTargetStatus('closed');
              setIsStatusChangeModalOpen(true);
            }}
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Clôturer
          </Button>,
          <Button
            key="default"
            variant="outline"
            size="sm"
            className="flex items-center text-amber-600"
            onClick={() => {
              setTargetStatus('defaulted');
              setIsStatusChangeModalOpen(true);
            }}
          >
            <AlertTriangle className="h-4 w-4 mr-2" />
            Marquer en défaut
          </Button>
        );
        break;
        
      case 'suspended':
      case 'defaulted':
      case 'in_litigation':
        actions.push(
          <Button
            key="reactivate"
            variant="outline"
            size="sm"
            className="flex items-center"
            onClick={() => {
              setTargetStatus('active');
              setIsStatusChangeModalOpen(true);
            }}
          >
            <PlayCircle className="h-4 w-4 mr-2" />
            Réactiver
          </Button>
        );
        break;
        
      case 'closed':
        // Pas d'actions supplémentaires pour un contrat clôturé
        break;
    }
    
    // Ajouter l'action d'historique (toujours disponible)
    actions.push(
      <Button
        key="history"
        variant="outline"
        size="sm"
        className="flex items-center"
        onClick={() => setIsHistoryModalOpen(true)}
      >
        <History className="h-4 w-4 mr-2" />
        Historique
      </Button>
    );
    
    // Ajouter l'action d'export (toujours disponible)
    actions.push(
      <Button
        key="export"
        variant="outline"
        size="sm"
        className="flex items-center"
        onClick={onExportPdf}
      >
        <FileText className="h-4 w-4 mr-2" />
        Exporter
      </Button>
    );
    
    return actions;
  };

  return (
    <>
      <Card className="p-4 bg-gray-50 dark:bg-gray-800">
        <h3 className="text-lg font-medium mb-4">Actions sur le contrat</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          {getAvailableActions()}
        </div>
      </Card>
      
      {/* Modal de changement de statut */}
      <Modal
        isOpen={isStatusChangeModalOpen}
        onClose={() => setIsStatusChangeModalOpen(false)}
        title={`Changer le statut du contrat en ${targetStatus}`}
      >
        <div className="space-y-4 py-2">
          <p className="text-gray-600 dark:text-gray-400">
            Vous êtes sur le point de modifier le statut du contrat. 
            Veuillez fournir une raison pour ce changement.
          </p>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Raison du changement
            </label>
            <TextArea
              value={statusChangeReason}
              onChange={(e) => setStatusChangeReason(e.target.value)}
              placeholder="Saisissez la raison du changement de statut..."
              rows={3}
            />
          </div>
          
          <div className="flex justify-end space-x-3 mt-5">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsStatusChangeModalOpen(false)}
            >
              Annuler
            </Button>
            <Button
              type="button"
              onClick={handleStatusChange}
              disabled={!statusChangeReason.trim()}
            >
              Confirmer
            </Button>
          </div>
        </div>
      </Modal>
      
      {/* Modal de remboursement */}
      <Modal
        isOpen={isRepaymentModalOpen}
        onClose={() => setIsRepaymentModalOpen(false)}
        title="Enregistrer un remboursement"
      >
        <div className="space-y-4 py-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Montant
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <DollarSign className="h-4 w-4 text-gray-400" />
              </div>
              <Input
                type="number"
                value={repaymentAmount}
                onChange={(e) => setRepaymentAmount(parseFloat(e.target.value))}
                placeholder="Montant du remboursement"
                className="pl-10"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Date
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Calendar className="h-4 w-4 text-gray-400" />
              </div>
              <Input
                type="date"
                value={repaymentDate}
                onChange={(e) => setRepaymentDate(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <TextArea
              value={repaymentDescription}
              onChange={(e) => setRepaymentDescription(e.target.value)}
              placeholder="Description du remboursement (ex: numéro de référence, méthode de paiement...)"
              rows={3}
            />
          </div>
          
          <div className="flex justify-end space-x-3 mt-5">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsRepaymentModalOpen(false)}
            >
              Annuler
            </Button>
            <Button
              type="button"
              onClick={handleRepayment}
              disabled={repaymentAmount <= 0}
            >
              Enregistrer
            </Button>
          </div>
        </div>
      </Modal>
      
      {/* Modal d'historique des actions */}
      <Modal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        title="Historique des actions"
      >
        <div className="py-2">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Utilisateur
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Détails
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {actionHistory.map((action, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {action.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {action.action}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {action.user}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {action.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="flex justify-end mt-5">
            <Button
              type="button"
              onClick={() => setIsHistoryModalOpen(false)}
            >
              Fermer
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

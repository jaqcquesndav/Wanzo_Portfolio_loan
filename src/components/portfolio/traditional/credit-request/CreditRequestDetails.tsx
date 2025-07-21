import { useState } from 'react';
import { CreditRequest, CreditRequestStatus } from '../../../../types/credit';
import { Button } from '../../../../components/ui/Button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../../../components/ui/Dialog';
import { Badge } from '../../../../components/ui/Badge';
import { useCreditRequests } from '../../../../hooks/useCreditRequests';

interface CreditRequestDetailsProps {
  creditRequest: CreditRequest;
  onClose: () => void;
  onStatusChange?: (request: CreditRequest, newStatus: CreditRequestStatus) => void;
}

// Fonction pour obtenir le texte et le variant du statut
const getStatusDetails = (status: CreditRequestStatus) => {
  switch (status) {
    case 'pending':
      return { text: 'En attente', variant: 'warning' as const };
    case 'analysis':
      return { text: 'En analyse', variant: 'primary' as const };
    case 'approved':
      return { text: 'Approuvée', variant: 'success' as const };
    case 'rejected':
      return { text: 'Rejetée', variant: 'danger' as const };
    case 'canceled':
      return { text: 'Annulée', variant: 'secondary' as const };
    default:
      return { text: 'Inconnu', variant: 'secondary' as const };
  }
};

// Fonction pour formater les dates
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date);
};

// Fonction pour convertir la périodicité en texte
const getPeriodicityText = (periodicity: string) => {
  const options: Record<string, string> = {
    'daily': 'Journalier',
    'weekly': 'Hebdomadaire',
    'biweekly': 'Bimensuel',
    'monthly': 'Mensuel',
    'quarterly': 'Trimestriel',
    'semiannual': 'Semestriel',
    'annual': 'Annuel'
  };
  
  return options[periodicity] || periodicity;
};

export function CreditRequestDetails({ 
  creditRequest, 
  onClose,
  onStatusChange
}: CreditRequestDetailsProps) {
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const { getMemberName, getCreditProductName, getCreditManagerName } = useCreditRequests();
  
  const statusDetails = getStatusDetails(creditRequest.status);
  
  const handleStatusChange = (newStatus: CreditRequestStatus) => {
    if (newStatus === 'rejected') {
      setIsRejectDialogOpen(true);
    } else if (onStatusChange) {
      onStatusChange(creditRequest, newStatus);
    }
  };
  
  const confirmRejection = () => {
    if (onStatusChange) {
      onStatusChange({
        ...creditRequest,
        rejectionReason
      }, 'rejected');
    }
    setIsRejectDialogOpen(false);
  };
  
  return (
    <>
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold">
              Demande de crédit #{creditRequest.id.substring(0, 8)}
            </h2>
            <div className="flex items-center mt-2">
              <Badge variant={statusDetails.variant}>
                {statusDetails.text}
              </Badge>
              <span className="ml-4 text-sm text-gray-500">
                Reçue le {formatDate(creditRequest.receptionDate)}
              </span>
            </div>
          </div>
          
          <div className="flex gap-2">
            {creditRequest.status === 'pending' && (
              <>
                <Button 
                  variant="outline" 
                  onClick={() => handleStatusChange('analysis')}
                >
                  Analyser
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={() => handleStatusChange('rejected')}
                >
                  Rejeter
                </Button>
              </>
            )}
            
            {creditRequest.status === 'analysis' && (
              <>
                <Button 
                  variant="outline" 
                  onClick={() => handleStatusChange('pending')}
                >
                  Remettre en attente
                </Button>
                <Button 
                  variant="primary" 
                  onClick={() => handleStatusChange('approved')}
                >
                  Approuver
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={() => handleStatusChange('rejected')}
                >
                  Rejeter
                </Button>
              </>
            )}
            
            <Button variant="ghost" onClick={onClose}>
              Fermer
            </Button>
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium mb-2">Informations client</h3>
            <dl className="grid grid-cols-2 gap-4">
              <div>
                <dt className="font-medium text-gray-600">Type de demande:</dt>
                <dd>{creditRequest.isGroup ? 'Groupe' : 'Individuelle'}</dd>
              </div>
              <div>
                <dt className="font-medium text-gray-600">Client:</dt>
                <dd>{getMemberName(creditRequest.memberId)}</dd>
              </div>
              <div>
                <dt className="font-medium text-gray-600">Produit:</dt>
                <dd>{getCreditProductName(creditRequest.productId)}</dd>
              </div>
              <div>
                <dt className="font-medium text-gray-600">Date de réception:</dt>
                <dd>{formatDate(creditRequest.receptionDate)}</dd>
              </div>
              <div>
                <dt className="font-medium text-gray-600">Gestionnaire:</dt>
                <dd>{getCreditManagerName(creditRequest.creditManagerId)}</dd>
              </div>
            </dl>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium mb-2">Objet du financement</h3>
            <div className="mb-4">
              <h4 className="font-medium text-gray-600">Raison de la demande:</h4>
              <p className="mt-1">{creditRequest.reason}</p>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-600">Objet du financement:</h4>
              <p className="mt-1">{creditRequest.financingPurpose}</p>
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium mb-2">Modalités de financement</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <dt className="font-medium text-gray-600">Montant demandé:</dt>
                <dd>{new Intl.NumberFormat('fr-FR', {
                  style: 'currency',
                  currency: 'XOF'
                }).format(creditRequest.requestAmount)}</dd>
              </div>
              
              <div>
                <dt className="font-medium text-gray-600">Taux d'intérêt:</dt>
                <dd>{creditRequest.interestRate}%</dd>
              </div>
              
              <div>
                <dt className="font-medium text-gray-600">Périodicité:</dt>
                <dd>{getPeriodicityText(creditRequest.periodicity)}</dd>
              </div>
              
              <div>
                <dt className="font-medium text-gray-600">Type d'échéance:</dt>
                <dd>{creditRequest.scheduleType === 'constant' ? 'Constante' : 'Dégressive'}</dd>
              </div>
              
              <div>
                <dt className="font-medium text-gray-600">Nombre d'échéances:</dt>
                <dd>{creditRequest.schedulesCount}</dd>
              </div>
            </div>
          </div>
          
          {creditRequest.isGroup && creditRequest.distributions && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium mb-2">Répartition entre les membres</h3>
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="text-left pb-2">Membre</th>
                    <th className="text-right pb-2">Montant</th>
                    <th className="text-right pb-2">Pourcentage</th>
                  </tr>
                </thead>
                <tbody>
                  {creditRequest.distributions.map(distribution => (
                    <tr key={distribution.id} className="border-t">
                      <td className="py-2">{getMemberName(distribution.memberId)}</td>
                      <td className="text-right py-2">
                        {new Intl.NumberFormat('fr-FR', {
                          style: 'currency',
                          currency: 'XOF'
                        }).format(distribution.amount)}
                      </td>
                      <td className="text-right py-2">
                        {((distribution.amount / creditRequest.requestAmount) * 100).toFixed(2)}%
                      </td>
                    </tr>
                  ))}
                  <tr className="border-t font-medium">
                    <td className="py-2">Total</td>
                    <td className="text-right py-2">
                      {new Intl.NumberFormat('fr-FR', {
                        style: 'currency',
                        currency: 'XOF'
                      }).format(creditRequest.requestAmount)}
                    </td>
                    <td className="text-right py-2">100%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
          
          {creditRequest.status === 'rejected' && creditRequest.rejectionReason && (
            <div className="bg-red-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium mb-2">Motif de rejet</h3>
              <p>{creditRequest.rejectionReason}</p>
            </div>
          )}
        </div>
      </div>
      
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeter la demande de crédit</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <label htmlFor="rejectionReason" className="block text-sm font-medium mb-1">
              Motif du rejet
            </label>
            <textarea
              id="rejectionReason"
              className="w-full border rounded p-2"
              rows={4}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Veuillez indiquer la raison du rejet..."
            />
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>
              Annuler
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmRejection}
              disabled={!rejectionReason.trim()}
            >
              Confirmer le rejet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

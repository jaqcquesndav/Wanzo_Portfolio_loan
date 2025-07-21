import { useState } from 'react';
import { useCreditRequests } from '../../../../hooks/useCreditRequests';
import { CreditRequest, CreditRequestStatus } from '../../../../types/credit';
import { Button } from '../../../ui/Button';
import { Card } from '../../../ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../ui/Table';
import { Badge } from '../../../ui/Badge';
import { TableSkeleton } from '../../../ui/TableSkeleton';
import { CreditRequestDetails } from './CreditRequestDetails';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '../../../ui/DropdownMenu';

// Fonction utilitaire pour le formatage des montants
const formatAmount = (amount: number) => {
  return new Intl.NumberFormat('fr-FR', { 
    style: 'currency', 
    currency: 'XAF',
    maximumFractionDigits: 0
  }).format(amount);
};

// Fonction utilitaire pour le formatage des dates
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date);
};

// Configuration des status pour l'affichage
const statusConfig: Partial<Record<CreditRequestStatus, { label: string; variant: "success" | "secondary" | "danger" | "warning" | "primary" }>> = {
  'pending': { label: 'En attente', variant: 'warning' },
  'analysis': { label: 'En analyse', variant: 'primary' },
  'approved': { label: 'Approuvée', variant: 'success' },
  'rejected': { label: 'Rejetée', variant: 'danger' },
  'canceled': { label: 'Annulée', variant: 'secondary' },
  'draft': { label: 'Brouillon', variant: 'secondary' },
  'submitted': { label: 'Soumise', variant: 'primary' },
  'under_review': { label: 'En revue', variant: 'primary' },
  'disbursed': { label: 'Décaissée', variant: 'success' },
  'active': { label: 'Active', variant: 'success' },
  'closed': { label: 'Fermée', variant: 'secondary' },
  'defaulted': { label: 'En défaut', variant: 'danger' },
  'restructured': { label: 'Restructurée', variant: 'warning' }
};

export function CreditRequestsList() {
  const { requests, loading, getMemberName, getCreditProductName, changeRequestStatus } = useCreditRequests();
  const [selectedRequest, setSelectedRequest] = useState<CreditRequest | null>(null);

  // Gestionnaire pour le changement de statut
  const handleStatusChange = async (request: CreditRequest, newStatus: CreditRequestStatus) => {
    await changeRequestStatus(request.id, newStatus);
    setSelectedRequest(null);
  };

  if (loading) {
    return <TableSkeleton columns={5} rows={5} />;
  }

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <h2 className="text-lg font-semibold mb-4">Demandes de crédit</h2>
        
        {requests.length > 0 ? (
          <Table>
            <TableHead>
              <TableRow>
                <TableHeader>ID</TableHeader>
                <TableHeader>Client</TableHeader>
                <TableHeader>Produit</TableHeader>
                <TableHeader>Montant</TableHeader>
                <TableHeader>Date</TableHeader>
                <TableHeader>Statut</TableHeader>
                <TableHeader>Actions</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {requests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell className="font-mono">{request.id}</TableCell>
                  <TableCell>{getMemberName(request.memberId)}</TableCell>
                  <TableCell>{getCreditProductName(request.productId)}</TableCell>
                  <TableCell>{formatAmount(request.requestAmount)}</TableCell>
                  <TableCell>{formatDate(request.createdAt)}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={statusConfig[request.status]?.variant || "secondary"}
                    >
                      {statusConfig[request.status]?.label || request.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          Actions
                          <svg className="ml-2 -mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                          </svg>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => setSelectedRequest(request)}>
                          Voir détails
                        </DropdownMenuItem>
                        {request.status === 'pending' && (
                          <DropdownMenuItem onClick={() => handleStatusChange(request, 'analysis')}>
                            Mettre en analyse
                          </DropdownMenuItem>
                        )}
                        {request.status === 'analysis' && (
                          <>
                            <DropdownMenuItem onClick={() => handleStatusChange(request, 'approved')}>
                              Approuver
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange(request, 'rejected')}>
                              Rejeter
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>Aucune demande de crédit n'a été trouvée pour ce portefeuille.</p>
          </div>
        )}
      </Card>

      {selectedRequest && (
        <CreditRequestDetails
          creditRequest={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
}

export default CreditRequestsList;

import React, { useState, useEffect } from 'react';
import { Plus, FileText, Download } from 'lucide-react';
import { Button } from '../ui/Button';
import { PaymentOrderModal, PaymentOrderData } from './PaymentOrderModal';
import { Badge } from '../ui/Badge';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../ui/Table';

// Type de l'historique des ordres de paiement
interface PaymentOrdersHistoryProps {
  portfolioId: string;
  portfolioType: string;
  companyId?: string; // Optionnel pour filtrer par entreprise
}

export const PaymentOrdersHistory: React.FC<PaymentOrdersHistoryProps> = ({
  portfolioId,
  portfolioType,
  companyId,
}) => {
  const [paymentOrders, setPaymentOrders] = useState<PaymentOrderData[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<PaymentOrderData | undefined>(undefined);
  const [isViewMode, setIsViewMode] = useState(false);

  // Effet pour charger les ordres de paiement
  useEffect(() => {
    // À implémenter: Chargement des ordres de paiement depuis l'API ou le store
    // Pour l'instant, on utilise des données fictives
    const mockData: PaymentOrderData[] = [
      {
        id: '1',
        orderNumber: 'PA12345678',
        portfolioManager: {
          name: 'Jean Dupont',
          accountNumber: '123456789',
          portfolioType: 'Traditionnel',
          bankName: 'Banque XYZ',
        },
        beneficiary: {
          companyName: 'Entreprise ABC',
          bank: 'Banque DEF',
          branch: 'Agence Centrale',
          accountNumber: '987654321',
          swiftCode: 'DEFXXX',
        },
        amount: 5000000,
        reference: 'REF-2023-001',
        paymentReason: 'Paiement pour services rendus',
        createdAt: new Date('2023-05-10'),
        status: 'paid',
      },
      {
        id: '2',
        orderNumber: 'PA87654321',
        portfolioManager: {
          name: 'Marie Martin',
          accountNumber: '987654321',
          portfolioType: 'Crédit',
          bankName: 'Banque ABC',
        },
        beneficiary: {
          companyName: 'Entreprise XYZ',
          bank: 'Banque GHI',
          accountNumber: '123456789',
        },
        amount: 2500000,
        reference: 'REF-2023-002',
        paymentReason: 'Déblocage de crédit',
        createdAt: new Date('2023-06-15'),
        status: 'pending',
      },
    ];

    // Filtrer par portfolioId et companyId si nécessaire
    const filtered = mockData.filter(() => true);
    
    // Assigner les données filtrées
    setPaymentOrders(filtered);
  }, [portfolioId, portfolioType, companyId]);

  // Gestionnaire pour créer un nouvel ordre de paiement
  const handleCreateNewOrder = () => {
    setCurrentOrder(undefined);
    setIsViewMode(false);
    setIsModalOpen(true);
  };

  // Gestionnaire pour voir un ordre existant
  const handleViewOrder = (order: PaymentOrderData) => {
    setCurrentOrder(order);
    setIsViewMode(true);
    setIsModalOpen(true);
  };

  // Gestionnaire pour enregistrer un ordre
  const handleSaveOrder = (data: PaymentOrderData) => {
    if (data.id) {
      // Mettre à jour un ordre existant
      setPaymentOrders(prev => prev.map(order => 
        order.id === data.id ? data : order
      ));
    } else {
      // Créer un nouvel ordre
      const newOrder: PaymentOrderData = {
        ...data,
        id: `${Date.now()}`, // Générer un ID temporaire
        createdAt: new Date(),
      };
      setPaymentOrders(prev => [...prev, newOrder]);
    }
  };

  // Gestionnaire pour exporter un ordre
  const handleExportOrder = (data: PaymentOrderData) => {
    // À implémenter: Export en PDF
    console.log('Exporting order to PDF', data);
    // Exemple: 
    // exportToPDF({
    //   ...data,
    //   filename: `Ordre_de_Paiement_${data.orderNumber}.pdf`
    // });
  };

  // Gestionnaire pour supprimer un ordre
  const handleDeleteOrder = (id: string) => {
    setPaymentOrders(prev => prev.filter(order => order.id !== id));
  };

  // Fonction pour obtenir la couleur du badge en fonction du statut
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'pending': return 'warning' as const;
      case 'approved': return 'secondary' as const;
      case 'paid': return 'success' as const;
      case 'rejected': return 'error' as const;
      default: return 'secondary' as const;
    }
  };

  // Fonction pour obtenir le texte du statut en français
  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'approved': return 'Approuvé';
      case 'paid': return 'Payé';
      case 'rejected': return 'Rejeté';
      default: return status;
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Ordres de Paiement</h2>
        <Button onClick={handleCreateNewOrder} className="flex items-center gap-2">
          <Plus className="w-4 h-4" /> Nouvel Ordre de Paiement
        </Button>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHead>
              <tr>
                <TableHeader>N° d'Ordre</TableHeader>
                <TableHeader>Bénéficiaire</TableHeader>
                <TableHeader>Montant</TableHeader>
                <TableHeader>Référence</TableHeader>
                <TableHeader>Date</TableHeader>
                <TableHeader>Statut</TableHeader>
                <TableHeader align="center">Actions</TableHeader>
              </tr>
            </TableHead>
            <TableBody>
              {paymentOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-400">
                    Aucun ordre de paiement trouvé
                  </TableCell>
                </TableRow>
              ) : (
                paymentOrders.map((order) => (
                  <TableRow
                    key={order.id}
                    className="cursor-pointer"
                    onClick={() => handleViewOrder(order)}
                  >
                    <TableCell className="font-medium">{order.orderNumber}</TableCell>
                    <TableCell>{order.beneficiary.companyName}</TableCell>
                    <TableCell>{order.amount.toLocaleString()} FCFA</TableCell>
                    <TableCell>{order.reference}</TableCell>
                    <TableCell>
                      {order.createdAt.toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      })}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(order.status)}>
                        {getStatusText(order.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewOrder(order);
                          }}
                        >
                          <FileText className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleExportOrder(order);
                          }}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {isModalOpen && (
        <PaymentOrderModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveOrder}
          onExport={handleExportOrder}
          onDelete={handleDeleteOrder}
          initialData={currentOrder}
          readOnly={isViewMode && currentOrder?.status === 'paid'}
        />
      )}
    </div>
  );
};

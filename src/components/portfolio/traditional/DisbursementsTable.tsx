import React from 'react';
import { ActionsDropdown } from '../../ui/ActionsDropdown';
import { Badge } from '../../ui/Badge';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../../ui/Table';
import { usePaymentOrder } from '../../../hooks/usePaymentOrderContext';
import { PaymentOrderData } from '../../payment/PaymentOrderModal';
import { PortfolioType } from '../../../contexts/portfolioTypes';

export interface Disbursement {
  id: string;
  company: string;
  product: string;
  amount: number;
  status: 'en attente' | 'effectué';
  date: string;
  requestId?: string;
  portfolioId: string;
  // Informations pour l'ordre de paiement
  beneficiary?: {
    accountNumber?: string;
    bank?: string;
    branch?: string;
    swiftCode?: string;
    companyName?: string;
  };
  // Informations spécifiques selon le type de portefeuille
  investmentType?: 'prise de participation' | 'complément' | 'dividende' | 'cession';
  leasingEquipmentDetails?: {
    equipmentId?: string;
    equipmentName?: string;
    equipmentCategory?: string;
    supplier?: string;
  };
}

interface DisbursementsTableProps {
  disbursements: Disbursement[];
  onConfirm: (id: string) => void;
  onView: (id: string) => void;
  portfolioType?: PortfolioType;
  // Informations sur le portfolio pour l'ordre de paiement
  portfolioInfo?: {
    managerName: string;
    accountNumber: string;
    portfolioType: string;
    bankName: string;
  };
}

// Configuration pour l'affichage des statuts
const statusConfig = {
  'en attente': { label: 'En attente', variant: 'warning', color: 'bg-yellow-100 text-yellow-700' },
  'effectué': { label: 'Effectué', variant: 'success', color: 'bg-green-100 text-green-700' },
};

export const DisbursementsTable: React.FC<DisbursementsTableProps> = ({ 
  disbursements, 
  onConfirm, 
  onView,
  portfolioType = 'traditional',
  portfolioInfo = {
    managerName: "Gestionnaire de portefeuille",
    accountNumber: "N/A",
    portfolioType: "Traditionnel",
    bankName: "Banque principale"
  }
}) => {
  // Utiliser le contexte d'ordre de paiement
  const { showPaymentOrderModal } = usePaymentOrder();
  
  // Adapter les libellés selon le type de portefeuille
  const labels = {
    traditional: {
      title: 'Virements',
      product: 'Produit',
      emptyMessage: 'Aucun virement',
      confirmAction: 'Confirmer virement'
    },
    investment: {
      title: 'Achats de valeurs',
      product: 'Instrument',
      emptyMessage: 'Aucun achat de valeurs',
      confirmAction: 'Confirmer achat'
    },
    leasing: {
      title: 'Achats d\'équipement',
      product: 'Équipement',
      emptyMessage: 'Aucun achat d\'équipement',
      confirmAction: 'Confirmer achat'
    }
  };
  
  // Sélectionner les libellés appropriés
  const currentLabels = portfolioType ? labels[portfolioType] : labels.traditional;
  
  // Gestionnaire d'événements pour la confirmation de paiement
  const handleConfirmPayment = (disbursement: Disbursement) => {
    // Information de base sur l'opération (sans préjuger du détail)
    const operationType = 
      portfolioType === 'investment' ? 'Ordre d\'achat' : 
      portfolioType === 'leasing' ? 'Acquisition' : 
      'Ordre de paiement';
    
    // Créer les données initiales de l'ordre de paiement
    // L'utilisateur pourra compléter les détails dans le modal
    const paymentOrderData: PaymentOrderData = {
      orderNumber: `OP${Date.now().toString().slice(-8)}`,
      portfolioManager: {
        name: portfolioInfo.managerName,
        accountNumber: portfolioInfo.accountNumber,
        portfolioType: portfolioInfo.portfolioType,
        bankName: portfolioInfo.bankName
      },
      beneficiary: {
        companyName: disbursement.company,
        bank: disbursement.beneficiary?.bank || '',
        branch: disbursement.beneficiary?.branch,
        accountNumber: disbursement.beneficiary?.accountNumber || '',
        swiftCode: disbursement.beneficiary?.swiftCode
      },
      amount: disbursement.amount,
      reference: disbursement.id,
      paymentReason: `${operationType} - ${disbursement.product}`,
      createdAt: new Date(),
      status: 'pending'
    };
    
    // Afficher le modal d'ordre de paiement pour que l'utilisateur puisse compléter les détails
    showPaymentOrderModal(paymentOrderData, portfolioType);
    
    // Appeler la fonction de confirmation originale
    onConfirm(disbursement.id);
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 shadow overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHead>
            <tr>
              <TableHeader>Entreprise</TableHeader>
              <TableHeader>{currentLabels.product}</TableHeader>
              <TableHeader>Montant</TableHeader>
              <TableHeader>Statut</TableHeader>
              <TableHeader>Date</TableHeader>
              <TableHeader align="center">Actions</TableHeader>
            </tr>
          </TableHead>
          <TableBody>
            {disbursements.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-400">
                  {currentLabels.emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              disbursements.map((d) => (
                <TableRow
                  key={d.id}
                  onClick={() => onView(d.id)}
                  className="cursor-pointer"
                >
                  <TableCell className="font-medium">{d.company}</TableCell>
                  <TableCell>{d.product}</TableCell>
                  <TableCell>{d.amount.toLocaleString()} FCFA</TableCell>
                  <TableCell>
                    <Badge variant={statusConfig[d.status].variant as "warning" | "success" | "error" | "secondary" | "primary" | "danger"}>
                      {statusConfig[d.status].label}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(d.date).toLocaleDateString()}</TableCell>
                  <TableCell className="text-center overflow-visible relative">
                    <div className="inline-block">
                      <ActionsDropdown
                        actions={[
                          { label: 'Voir', onClick: () => onView(d.id) },
                          d.status === 'en attente' ? { 
                            label: currentLabels.confirmAction, 
                            onClick: () => handleConfirmPayment(d) 
                          } : null,
                        ].filter(Boolean) as { label: string; onClick: () => void }[]}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

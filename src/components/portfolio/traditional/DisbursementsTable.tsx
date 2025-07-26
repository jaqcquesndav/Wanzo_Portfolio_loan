import React, { useState, useMemo } from 'react';
import { ActionsDropdown } from '../../ui/ActionsDropdown';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { ArrowUpDown, Download, Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../../ui/Table';
import { usePaymentOrder } from '../../../hooks/usePaymentOrderContext';
import { PaymentOrderData } from '../../payment/PaymentOrderModal';
import { PortfolioType } from '../../../contexts/portfolioTypes';
import { exportToExcel, exportToPDF } from '../../../utils/export';
import { useCurrencyContext } from '../../../hooks/useCurrencyContext';

export interface Disbursement {
  id: string;
  company: string;
  product: string;
  amount: number;
  status: 'en attente' | 'effectué';
  date: string;
  requestId?: string;
  portfolioId: string;
  contractReference: string;  // Référence du contrat associé (obligatoire)
  
  // Informations bancaires de l'ordre de virement
  transactionReference?: string;  // Référence de transaction bancaire
  valueDate?: string;  // Date de valeur
  executionDate?: string;  // Date d'exécution
  
  // Informations du compte débité (compte de l'institution)
  debitAccount: {
    accountNumber: string;
    accountName: string;
    bankName: string;
    bankCode: string;
    branchCode?: string;
  };
  
  // Informations du compte crédité (compte du bénéficiaire)
  beneficiary: {
    accountNumber: string;
    accountName: string;  // Nom du titulaire du compte
    bankName: string;
    bankCode?: string;
    branchCode?: string;
    swiftCode?: string;
    companyName: string;
    address?: string;
  };
  
  // Informations de paiement
  paymentMethod?: 'virement' | 'transfert' | 'chèque' | 'espèces';
  paymentReference?: string;
  description?: string;  // Description ou motif du paiement
  
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
  onViewCompany?: (company: string) => void; // Nouvelle prop pour afficher les détails de l'entreprise
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
  onViewCompany,
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
  const { formatAmount } = useCurrencyContext();
  
  // État pour la recherche et le filtrage
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'tous' | 'en attente' | 'effectué'>('tous');
  const [sortBy, setSortBy] = useState<{ key: keyof Disbursement; direction: 'asc' | 'desc' } | null>(null);
  
  // État pour la pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  
  // Fonction de tri
  const handleSort = (key: keyof Disbursement) => {
    if (sortBy && sortBy.key === key) {
      setSortBy({ key, direction: sortBy.direction === 'asc' ? 'desc' : 'asc' });
    } else {
      setSortBy({ key, direction: 'asc' });
    }
  };
  
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
  
  // Filtrer et trier les déboursements
  const filteredDisbursements = useMemo(() => {
    let filtered = disbursements;
    
    // Filtre par recherche
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(d => 
        d.company.toLowerCase().includes(term) || 
        d.product.toLowerCase().includes(term) || 
        d.contractReference.toLowerCase().includes(term)
      );
    }
    
    // Filtre par statut
    if (statusFilter !== 'tous') {
      filtered = filtered.filter(d => d.status === statusFilter);
    }
    
    // Tri
    if (sortBy) {
      filtered = [...filtered].sort((a, b) => {
        const aValue = a[sortBy.key];
        const bValue = b[sortBy.key];
        
        // Gestion des valeurs non comparables
        if (typeof aValue === 'undefined' || typeof bValue === 'undefined') return 0;
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortBy.direction === 'asc' 
            ? aValue.localeCompare(bValue) 
            : bValue.localeCompare(aValue);
        }
        
        // Pour les valeurs numériques ou dates
        return sortBy.direction === 'asc' 
          ? (aValue < bValue ? -1 : aValue > bValue ? 1 : 0)
          : (bValue < aValue ? -1 : bValue > aValue ? 1 : 0);
      });
    }
    
    return filtered;
  }, [disbursements, searchTerm, statusFilter, sortBy]);
  
  // Pagination
  const totalPages = Math.ceil(filteredDisbursements.length / itemsPerPage);
  const paginatedDisbursements = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredDisbursements.slice(start, start + itemsPerPage);
  }, [filteredDisbursements, currentPage, itemsPerPage]);
  
  // Export des données
  const handleExportExcel = () => {
    const dataToExport = filteredDisbursements.map(d => ({
      'Entreprise': d.company,
      'Produit': d.product,
      'Référence Contrat': d.contractReference,
      'Montant': d.amount.toLocaleString() + ' FCFA',
      'Statut': statusConfig[d.status].label,
      'Date': new Date(d.date).toLocaleDateString(),
      'Bénéficiaire': d.beneficiary?.accountName || d.company,
      'Compte': d.beneficiary?.accountNumber || 'N/A',
      'Banque': d.beneficiary?.bankName || 'N/A'
    }));
    exportToExcel(dataToExport, 'Virements');
  };

  const handleExportPDF = () => {
    exportToPDF({
      title: 'Liste des Virements',
      headers: ['Entreprise', 'Produit', 'Référence', 'Montant', 'Statut', 'Date'],
      data: filteredDisbursements.map(d => [
        d.company,
        d.product,
        d.contractReference,
        d.amount.toLocaleString() + ' FCFA',
        statusConfig[d.status].label,
        new Date(d.date).toLocaleDateString()
      ]),
      filename: 'Virements'
    });
  };
  
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
      id: `payment-${Date.now()}`,
      orderNumber: `OP${Date.now().toString().slice(-8)}`,
      date: new Date().toISOString(),
      amount: disbursement.amount,
      currency: 'FCFA',
      beneficiary: {
        name: disbursement.beneficiary?.accountName || disbursement.company,
        accountNumber: disbursement.beneficiary?.accountNumber || '',
        bankName: disbursement.beneficiary?.bankName || '',
        swiftCode: disbursement.beneficiary?.swiftCode
      },
      reference: disbursement.id,
      description: `${operationType} - ${disbursement.product}`,
      portfolioId: disbursement.portfolioId,
      portfolioName: portfolioInfo.portfolioType,
      status: 'pending',
      createdBy: 'current_user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Afficher le modal d'ordre de paiement pour que l'utilisateur puisse compléter les détails
    showPaymentOrderModal(paymentOrderData, portfolioType);
    
    // Appeler la fonction de confirmation originale
    onConfirm(disbursement.id);
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 shadow overflow-hidden">
      {/* En-tête avec recherche, filtres et options d'export */}
      <div className="p-4 flex flex-wrap items-center justify-between gap-4 border-b">
        <h2 className="text-lg font-medium">{currentLabels.title}</h2>
        <div className="flex flex-1 md:flex-none items-center gap-3 ml-auto">
          {/* Recherche */}
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input 
              type="search" 
              placeholder={`Rechercher...`} 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 w-full"
            />
          </div>
          
          {/* Filtre de statut */}
          <div className="relative">
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value as 'tous' | 'en attente' | 'effectué')}
              className="border rounded-md px-2 py-1 pr-8 bg-white dark:bg-gray-700 appearance-none"
            >
              <option value="tous">Tous</option>
              <option value="en attente">En attente</option>
              <option value="effectué">Effectué</option>
            </select>
            <Filter className="absolute right-2 top-2 h-4 w-4 text-gray-500 pointer-events-none" />
          </div>
        </div>
        
        {/* Boutons d'export */}
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleExportExcel}
            disabled={filteredDisbursements.length === 0}
          >
            <Download className="h-4 w-4 mr-1" />
            Excel
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleExportPDF}
            disabled={filteredDisbursements.length === 0}
          >
            <Download className="h-4 w-4 mr-1" />
            PDF
          </Button>
        </div>
      </div>
      
      {/* Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHead>
            <tr>
              <TableHeader onClick={() => handleSort('company')} className="cursor-pointer">
                Entreprise 
                <ArrowUpDown className="inline ml-1 h-4 w-4" />
              </TableHeader>
              <TableHeader onClick={() => handleSort('product')} className="cursor-pointer">
                {currentLabels.product}
                <ArrowUpDown className="inline ml-1 h-4 w-4" />
              </TableHeader>
              <TableHeader onClick={() => handleSort('amount')} className="cursor-pointer">
                Montant
                <ArrowUpDown className="inline ml-1 h-4 w-4" />
              </TableHeader>
              <TableHeader onClick={() => handleSort('contractReference')} className="cursor-pointer">
                Référence Contrat
                <ArrowUpDown className="inline ml-1 h-4 w-4" />
              </TableHeader>
              <TableHeader>Compte Bénéficiaire</TableHeader>
              <TableHeader onClick={() => handleSort('status')} className="cursor-pointer">
                Statut
                <ArrowUpDown className="inline ml-1 h-4 w-4" />
              </TableHeader>
              <TableHeader onClick={() => handleSort('date')} className="cursor-pointer">
                Date
                <ArrowUpDown className="inline ml-1 h-4 w-4" />
              </TableHeader>
              <TableHeader align="center">Actions</TableHeader>
            </tr>
          </TableHead>
          <TableBody>
            {paginatedDisbursements.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-gray-400">
                  {filteredDisbursements.length === 0 ? currentLabels.emptyMessage : 'Aucun résultat pour cette recherche'}
                </TableCell>
              </TableRow>
            ) : (
              paginatedDisbursements.map((d) => (
                <TableRow
                  key={d.id}
                  className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <TableCell className="font-medium">
                    <span 
                      className="hover:text-blue-600 hover:underline"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onViewCompany) {
                          onViewCompany(d.company);
                        } else {
                          onView(d.id);
                        }
                      }}
                    >
                      {d.company}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div onClick={() => onView(d.id)}>{d.product}</div>
                  </TableCell>
                  <TableCell>
                    <div onClick={() => onView(d.id)}>{formatAmount(d.amount)}</div>
                  </TableCell>
                  <TableCell>
                    <div onClick={() => onView(d.id)}>
                      <div className="text-sm text-gray-600 dark:text-gray-300">
                        {d.contractReference}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div onClick={() => onView(d.id)}>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{d.beneficiary?.accountName || d.company}</span>
                        <span className="text-xs text-gray-500">{d.beneficiary?.accountNumber}</span>
                        <span className="text-xs text-gray-500">{d.beneficiary?.bankName}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div onClick={() => onView(d.id)}>
                      <Badge variant={statusConfig[d.status].variant as "warning" | "success" | "error" | "secondary" | "primary" | "danger"}>
                        {statusConfig[d.status].label}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div onClick={() => onView(d.id)}>{new Date(d.date).toLocaleDateString()}</div>
                  </TableCell>
                  <TableCell className="text-center overflow-visible relative">
                    <div 
                      className="inline-block relative z-10" 
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ActionsDropdown
                        actions={[
                          { label: 'Voir', onClick: () => onView(d.id) },
                          d.status === 'en attente' ? { 
                            label: 'Paiement', 
                            onClick: () => handleConfirmPayment(d),
                            className: 'text-green-600 hover:text-green-800'
                          } : null,
                        ].filter(Boolean) as { label: string; onClick: () => void, className?: string }[]}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="p-4 border-t flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Affichage de {Math.min(filteredDisbursements.length, (currentPage - 1) * itemsPerPage + 1)} à {Math.min(currentPage * itemsPerPage, filteredDisbursements.length)} sur {filteredDisbursements.length} entrées
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Précédent
            </Button>
            {Array.from({ length: totalPages }, (_, i) => (
              <Button
                key={i + 1}
                variant={currentPage === i + 1 ? "primary" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(i + 1)}
                className="w-10"
              >
                {i + 1}
              </Button>
            )).slice(Math.max(0, currentPage - 3), Math.min(totalPages, currentPage + 2))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Suivant
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

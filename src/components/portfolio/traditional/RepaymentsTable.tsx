import React, { useState, useMemo } from 'react';
import { ActionsDropdown } from '../../ui/ActionsDropdown';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { ArrowUpDown, Download, Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../../ui/Table';
import { exportToExcel, exportToPDF } from '../../../utils/export';
import { useCurrencyContext } from '../../../hooks/useCurrencyContext';
import { useRepayments } from '../../../hooks/useRepayments';

/**
 * Interface repRésentant un remboursement (paiement d'une entreprise vers l'institution)
 */
export interface Repayment {
  id: string;
  company: string;
  product: string;
  dueDate: string;
  amount: number;
  status: 'à venir' | 'payé' | 'retard';
  requestId?: string;
  portfolioId: string;
  contractReference: string;  // référence du contrat associé (obligatoire)
  transactionReference?: string; // référence de la transaction bancaire
  
  // Informations bancaires
  paymentDate?: string;  // Date de paiement (si dûjà payé)
  valueDate?: string;  // Date de valeur
  
  // Informations du compte cRédité (compte de l'institution - destination)
  creditAccount?: {
    accountNumber: string;
    accountName: string;
    bankName: string;
    bankCode: string;
    branchCode?: string;
    portfolioName?: string; // Nom du portefeuille associé
  };
  
  // Informations du compte dûbité (compte de l'entreprise - source)
  debitAccount?: {
    accountNumber: string;
    accountName: string;
    bankName: string;
    bankCode?: string;
    branchCode?: string;
    companyName: string; // Nom de l'entreprise
  };
  
  // Informations du paiement
  paymentMethod?: 'virement' | 'transfert' | 'chèque' | 'espèces';
  paymentReference?: string;
  installmentNumber?: number;  // Numéro de l'échéance
  totalInstallments?: number;  // Nombre total d'échéances
  
  // dûtails du remboursement
  principal?: number;  // Montant principal
  interest?: number;  // Montant des intérêts
  penalties?: number;  // Pénalités de retard (le cas échéant)
  
  // Nouveaux champs demandûs
  receiptUrl?: string; // URL de la pièce justificative
  remainingAmount?: number; // Montant restant à payer
  remainingPercentage?: number; // Pourcentage du montant restant
  slippage?: number; // Glissement (jours de retard ou d'avance)
  
  // Informations d'intégration avec les API externes
  externalApiReference?: string; // référence de l'API externe qui a traité ce remboursement
  externalSystemId?: string; // Identifiant dans le système externe
  externalStatus?: string; // Statut dans le système externe
}

interface RepaymentsTableProps {
  portfolioId: string;
  onView: (id: string) => void;
  onViewCompany?: (company: string) => void; // Prop pour afficher les dûtails de l'entreprise
  onViewSchedule?: (contractReference: string) => void; // Prop pour naviguer vers l'échéancier
}

// Configuration pour l'affichage des statuts
const statusConfig = {
  'à venir': { label: 'À venir', variant: 'warning', color: 'bg-yellow-100 text-yellow-700' },
  'payé': { label: 'Payé', variant: 'success', color: 'bg-green-100 text-green-700' },
  'retard': { label: 'En retard', variant: 'error', color: 'bg-red-100 text-red-700' },
};

export const RepaymentsTable: React.FC<RepaymentsTableProps> = ({ 
  portfolioId,
  onView,
  onViewCompany,
  onViewSchedule 
}) => {
  // Utiliser le hook useRepayments pour la gestion des remboursements
  const { 
    repayments,
    loading: isLoading,
    error,
    markAsPaid,
    refresh: refreshRepayments
  } = useRepayments(undefined, portfolioId);
  // état pour la recherche et le filtrage
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'tous' | 'à venir' | 'payé' | 'retard'>('tous');
  const [sortBy, setSortBy] = useState<{ key: keyof Repayment; direction: 'asc' | 'desc' } | null>(null);
  const { formatAmount } = useCurrencyContext();
  
  // état pour la pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  
  // Filtrer et trier les remboursements
  const filteredRepayments = useMemo(() => {
    let filtered = repayments;
    
    // Filtre par recherche
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(r => 
        r.company.toLowerCase().includes(term) || 
        r.product.toLowerCase().includes(term) || 
        r.contractReference.toLowerCase().includes(term)
      );
    }
    
    // Filtre par statut
    if (statusFilter !== 'tous') {
      filtered = filtered.filter(r => r.status === statusFilter);
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
  }, [repayments, searchTerm, statusFilter, sortBy]);
  
  // Pagination
  const totalPages = Math.ceil(filteredRepayments.length / itemsPerPage);
  const paginatedRepayments = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredRepayments.slice(start, start + itemsPerPage);
  }, [filteredRepayments, currentPage, itemsPerPage]);
  
  // Fonction de tri
  const handleSort = (key: keyof Repayment) => {
    if (sortBy && sortBy.key === key) {
      setSortBy({ key, direction: sortBy.direction === 'asc' ? 'desc' : 'asc' });
    } else {
      setSortBy({ key, direction: 'asc' });
    }
  };
  
  // Export des données
  const handleExportExcel = () => {
    const dataToExport = filteredRepayments.map(r => ({
      'Entreprise': r.company,
      'Produit': r.product,
      'référence Contrat': r.contractReference,
      'échéance': new Date(r.dueDate).toLocaleDateString(),
      'échéance N°': r.installmentNumber ? `${r.installmentNumber}/${r.totalInstallments}` : 'N/A',
      'Montant': formatAmount(r.amount),
      'Principal': r.principal ? formatAmount(r.principal) : 'N/A',
      'Intérêts': r.interest ? formatAmount(r.interest) : 'N/A',
      'Pénalités': r.penalties ? formatAmount(r.penalties) : '0',
      'Statut': statusConfig[r.status].label
    }));
    exportToExcel(dataToExport, 'Remboursements');
  };

  const handleExportPDF = () => {
    exportToPDF({
      title: 'Liste des Remboursements',
      headers: ['Entreprise', 'Produit', 'référence', 'échéance', 'Montant', 'Statut'],
      data: filteredRepayments.map(r => [
        r.company,
        r.product,
        r.contractReference,
        new Date(r.dueDate).toLocaleDateString(),
        formatAmount(r.amount),
        statusConfig[r.status].label
      ]),
      filename: 'Remboursements'
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow overflow-hidden">
      {/* En-tête avec recherche, filtres et options d'export */}
      <div className="p-4 flex flex-wrap items-center justify-between gap-4 border-b">
        <h2 className="text-lg font-medium">Remboursements (Entreprises → Institution)</h2>
        <div className="flex flex-1 md:flex-none items-center gap-3 ml-auto">
          {/* Recherche */}
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input 
              type="search" 
              placeholder="Rechercher..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 w-full"
            />
          </div>
          
          {/* Filtre de statut */}
          <div className="relative">
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value as 'tous' | 'à venir' | 'payé' | 'retard')}
              className="border rounded-md px-2 py-1 pr-8 bg-white dark:bg-gray-700 appearance-none"
            >
              <option value="tous">Tous</option>
              <option value="à venir">À venir</option>
              <option value="payé">Payé</option>
              <option value="retard">En retard</option>
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
            disabled={filteredRepayments.length === 0}
          >
            <Download className="h-4 w-4 mr-1" />
            Excel
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleExportPDF}
            disabled={filteredRepayments.length === 0}
          >
            <Download className="h-4 w-4 mr-1" />
            PDF
          </Button>
          {refreshRepayments && (
            <Button
              variant="primary"
              size="sm"
              onClick={refreshRepayments}
            >
              Actualiser
            </Button>
          )}
        </div>
      </div>
      
      {/* Indicateur de chargement ou erreur */}
      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-gray-500">Chargement des remboursements...</p>
        </div>
      ) : error ? (
        <div className="text-center py-8 text-red-500">
          <p>Une erreur est survenue lors du chargement des remboursements.</p>
          {refreshRepayments && (
            <Button 
              variant="outline" 
              size="sm"
              className="mt-2"
              onClick={refreshRepayments}
            >
              Réessayer
            </Button>
          )}
        </div>
      ) : (
        <>
          {/* Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHead>
            <tr>
              <TableHeader>référence Trans.</TableHeader>
              <TableHeader onClick={() => handleSort('company')} className="cursor-pointer">
                Entreprise 
                <ArrowUpDown className="inline ml-1 h-4 w-4" />
              </TableHeader>
              <TableHeader onClick={() => handleSort('product')} className="cursor-pointer">
                Produit
                <ArrowUpDown className="inline ml-1 h-4 w-4" />
              </TableHeader>
              <TableHeader>Compte Source (Entreprise)</TableHeader>
              <TableHeader>Compte Destination (Institution)</TableHeader>
              <TableHeader onClick={() => handleSort('contractReference')} className="cursor-pointer">
                référence Contrat
                <ArrowUpDown className="inline ml-1 h-4 w-4" />
              </TableHeader>
              <TableHeader onClick={() => handleSort('dueDate')} className="cursor-pointer">
                échéance
                <ArrowUpDown className="inline ml-1 h-4 w-4" />
              </TableHeader>
              <TableHeader onClick={() => handleSort('amount')} className="cursor-pointer">
                Montant
                <ArrowUpDown className="inline ml-1 h-4 w-4" />
              </TableHeader>
              <TableHeader onClick={() => handleSort('remainingPercentage')} className="cursor-pointer">
                Restant (%)
                <ArrowUpDown className="inline ml-1 h-4 w-4" />
              </TableHeader>
              <TableHeader onClick={() => handleSort('slippage')} className="cursor-pointer">
                Glissement
                <ArrowUpDown className="inline ml-1 h-4 w-4" />
              </TableHeader>
              <TableHeader onClick={() => handleSort('status')} className="cursor-pointer">
                Statut
                <ArrowUpDown className="inline ml-1 h-4 w-4" />
              </TableHeader>
              <TableHeader>Justificatif</TableHeader>
              <TableHeader align="center">Actions</TableHeader>
            </tr>
          </TableHead>
          <TableBody>
            {paginatedRepayments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} className="text-center py-8 text-gray-400">
                  {filteredRepayments.length === 0 ? 'Aucun remboursement' : 'Aucun Résultat pour cette recherche'}
                </TableCell>
              </TableRow>
            ) : (
              paginatedRepayments.map((r) => (
                <TableRow
                  key={r.id}
                  onClick={() => onView(r.id)}
                  className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <TableCell className="font-medium">
                    {r.transactionReference || "-"}
                  </TableCell>
                  <TableCell>
                    <span 
                      className="hover:text-blue-600 hover:underline"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onViewCompany) {
                          onViewCompany(r.company);
                        }
                      }}
                    >
                      {r.company}
                    </span>
                  </TableCell>
                  <TableCell>{r.product}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">
                        {r.debitAccount?.companyName || r.company}
                      </span>
                      <span className="text-xs text-gray-500">
                        {r.debitAccount?.accountNumber || "N/A"}
                      </span>
                      <span className="text-xs text-gray-500">
                        {r.debitAccount?.bankName || "N/A"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">
                        {r.creditAccount?.accountName || "Portefeuille"}
                      </span>
                      <span className="text-xs text-gray-500">
                        {r.creditAccount?.accountNumber || "N/A"}
                      </span>
                      <span className="text-xs text-gray-500">
                        {r.creditAccount?.bankName || "N/A"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div 
                      className="text-sm text-blue-600 dark:text-blue-400 cursor-pointer hover:underline"
                      onClick={() => onViewSchedule && onViewSchedule(r.contractReference)}
                      title="Voir l'échéancier du contrat"
                    >
                      {r.contractReference}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{new Date(r.dueDate).toLocaleDateString()}</span>
                      {r.installmentNumber && r.totalInstallments && (
                        <span className="text-xs text-gray-500">échéance {r.installmentNumber}/{r.totalInstallments}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{formatAmount(r.amount)}</TableCell>
                  <TableCell>
                    {r.remainingPercentage !== undefined ? (
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2.5 mr-2">
                          <div 
                            className={`h-2.5 rounded-full ${
                              r.remainingPercentage <= 25 ? 'bg-green-500' : 
                              r.remainingPercentage <= 50 ? 'bg-blue-500' : 
                              r.remainingPercentage <= 75 ? 'bg-yellow-500' : 'bg-red-500'
                            }`} 
                            style={{ width: `${100 - r.remainingPercentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm">{r.remainingPercentage}%</span>
                      </div>
                    ) : (
                      <span>-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {r.slippage !== undefined ? (
                      <span className={`${
                        r.slippage > 0 ? 'text-red-600' : 
                        r.slippage < 0 ? 'text-green-600' : 'text-gray-600'
                      }`}>
                        {r.slippage > 0 ? `+${r.slippage} jours` : 
                         r.slippage < 0 ? `${r.slippage} jours` : 'À temps'}
                      </span>
                    ) : (
                      <span>-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusConfig[r.status].variant as "warning" | "success" | "error" | "secondary" | "primary" | "danger"}>
                      {statusConfig[r.status].label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {r.receiptUrl ? (
                      <a 
                        href={r.receiptUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-blue-600 hover:text-blue-800 hover:underline flex items-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Voir
                      </a>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center overflow-visible relative">
                    <div className="inline-block">
                      <ActionsDropdown
                        actions={[
                          { label: 'Voir', onClick: () => onView(r.id) },
                          { 
                            label: 'Marquer comme payé', 
                            onClick: () => markAsPaid(r.id, {
                              date: new Date().toISOString(),
                              method: 'virement',
                              reference: `REF-${Date.now()}`
                            }), 
                            disabled: r.status !== 'à venir',
                            className: r.status === 'à venir' ? 'text-green-600 hover:text-green-800' : ''
                          },
                          ...(r.status === 'payé' ? [
                            { 
                              label: 'Voir justificatif', 
                              onClick: () => {
                                if (r.receiptUrl) {
                                  window.open(r.receiptUrl, '_blank');
                                }
                              }, 
                              disabled: !r.receiptUrl,
                              className: 'text-blue-600 hover:text-blue-800'
                            }
                          ] : [])
                        ].filter(Boolean) as { label: string; onClick: () => void, disabled?: boolean, className?: string }[]}
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
            Affichage de {Math.min(filteredRepayments.length, (currentPage - 1) * itemsPerPage + 1)} à {Math.min(currentPage * itemsPerPage, filteredRepayments.length)} sur {filteredRepayments.length} entRées
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              PRécédent
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
        </>
      )}
    </div>
  );
};


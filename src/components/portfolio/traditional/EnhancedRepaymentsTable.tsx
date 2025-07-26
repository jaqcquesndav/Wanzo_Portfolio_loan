import React, { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '../../ui/Table';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { ActionsDropdown } from '../../ui/ActionsDropdown';
import { 
  FileDown, 
  FileUp, 
  Calendar, 
  ArrowUpDown,
  Search,
  ChevronLeft,
  ChevronRight,
  Download,
  Filter
} from 'lucide-react';
import { formatDate } from '../../../utils/formatters';
import { CreditPayment } from '../../../types/credit-payment';
import { useRepaymentsManager } from '../../../hooks/useRepaymentsManager';
import { useCurrencyContext } from '../../../hooks/useCurrencyContext';
import { exportToExcel, exportToPDF } from '../../../utils/export';

type EnhancedRepaymentsTableProps = {
  contractId?: string;
  className?: string;
  onMarkPaid?: (id: string) => void;
  onView?: (id: string) => void;
  onViewSchedule?: (contractReference: string) => void;
};

/**
 * Tableau des remboursements amélioré avec le nouveau hook
 * Affiche les remboursements avec les nouvelles colonnes (pièce justificative, pourcentage restant, glissement, référence)
 */
export const EnhancedRepaymentsTable: React.FC<EnhancedRepaymentsTableProps> = ({
  contractId,
  className,
  onMarkPaid,
  onView,
  onViewSchedule
}) => {
  const {
    payments,
    loading,
    error,
    uploadSupportingDocument,
    downloadSupportingDocument,
    deletePayment,
    compareWithSchedule
  } = useRepaymentsManager(contractId);

  // État pour le téléchargement du document
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  
  // État pour la recherche et le filtrage
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<{ key: keyof CreditPayment; direction: 'asc' | 'desc' } | null>(null);
  const { formatAmount } = useCurrencyContext();
  
  // État pour la pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  
  // Données pour la comparaison avec les échéances
  const scheduleComparison = useMemo(() => {
    if (!contractId) return [];
    return compareWithSchedule(contractId);
  }, [contractId, compareWithSchedule]);
  
  // Fusion des données de paiement avec les données de comparaison
  const enrichedPayments = useMemo(() => {
    return payments.map(payment => {
      // Trouver l'échéance potentiellement liée à ce paiement
      const relatedSchedule = scheduleComparison.find(s => 
        s.actual_payments.some(p => p.payment_id === payment.id)
      );
      
      return {
        ...payment,
        related_schedule: relatedSchedule || null,
        slippage: relatedSchedule?.slippage || payment.slippage || 0,
        remaining_percentage: relatedSchedule 
          ? Math.round((relatedSchedule.remaining_amount / relatedSchedule.expected_amount) * 100) 
          : 0
      };
    });
  }, [payments, scheduleComparison]);
  
  // Filtrage des paiements
  const filteredPayments = useMemo(() => {
    let filtered = enrichedPayments;
    
    // Filtrer par terme de recherche
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(payment => 
        payment.payment_reference?.toLowerCase().includes(term) ||
        payment.transaction_reference?.toLowerCase().includes(term) ||
        payment.contract_id.toLowerCase().includes(term) ||
        payment.id.toLowerCase().includes(term)
      );
    }
    
    // Filtrer par statut
    if (statusFilter !== 'all') {
      filtered = filtered.filter(payment => payment.status === statusFilter);
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
  }, [enrichedPayments, searchTerm, statusFilter, sortBy]);
  
  // Pagination
  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);
  const paginatedPayments = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredPayments.slice(start, start + itemsPerPage);
  }, [filteredPayments, currentPage, itemsPerPage]);
  
  // Fonction de tri
  const handleSort = (key: keyof CreditPayment) => {
    if (sortBy && sortBy.key === key) {
      setSortBy({ key, direction: sortBy.direction === 'asc' ? 'desc' : 'asc' });
    } else {
      setSortBy({ key, direction: 'asc' });
    }
  };

  // Gérer le téléchargement d'un fichier
  const handleFileUpload = async (paymentId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadingId(paymentId);
      try {
        await uploadSupportingDocument(paymentId, file);
      } finally {
        setUploadingId(null);
      }
    }
  };

  // Télécharger un document justificatif
  const handleDownloadDocument = async (paymentId: string) => {
    const blob = await downloadSupportingDocument(paymentId);
    if (blob) {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `justificatif-${paymentId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    }
  };

  // Gérer la suppression après confirmation
  const handleDeletePayment = async (paymentId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce remboursement ?')) {
      await deletePayment(paymentId);
    }
  };

  // Afficher un indicateur de statut coloré
  const getStatusBadge = (status: CreditPayment['status']) => {
    switch(status) {
      case 'completed':
        return <Badge variant="success">Complété</Badge>;
      case 'pending':
        return <Badge variant="warning">En attente</Badge>;
      case 'failed':
        return <Badge variant="error">Échoué</Badge>;
      case 'cancelled':
        return <Badge variant="secondary">Annulé</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // Afficher un indicateur de glissement
  const getSlippageBadge = (slippage: number) => {
    if (slippage > 7) {
      return <span className="text-red-600">{slippage} jours</span>;
    } else if (slippage > 0) {
      return <span className="text-yellow-600">{slippage} jours</span>;
    } else if (slippage < 0) {
      return <span className="text-green-600">{Math.abs(slippage)} jours d'avance</span>;
    } else {
      return <span className="text-blue-600">À temps</span>;
    }
  };
  
  // Export des données
  const handleExportExcel = () => {
    const dataToExport = filteredPayments.map(payment => ({
      'Référence': payment.transaction_reference || payment.payment_reference || payment.id,
      'Contrat': payment.contract_id,
      'Date de paiement': payment.payment_date ? formatDate(payment.payment_date) : 'N/A',
      'Montant': formatAmount(payment.amount),
      'Statut': payment.status,
      'Échéance liée': payment.related_schedule?.installment_number || 'N/A',
      'Glissement': payment.slippage || 0,
      '% Restant': payment.remaining_percentage || 0,
      'Méthode': payment.payment_method
    }));
    exportToExcel(dataToExport, 'Remboursements');
  };

  const handleExportPDF = () => {
    exportToPDF({
      title: 'Liste des Remboursements',
      headers: ['Référence', 'Contrat', 'Date', 'Montant', 'Statut', 'Glissement', '% Restant'],
      data: filteredPayments.map(payment => [
        payment.transaction_reference || payment.payment_reference || payment.id,
        payment.contract_id,
        payment.payment_date ? formatDate(payment.payment_date) : 'N/A',
        formatAmount(payment.amount),
        payment.status,
        `${payment.slippage || 0} jours`,
        `${payment.remaining_percentage || 0}%`
      ]),
      filename: 'Remboursements'
    });
  };

  if (loading) {
    return <div className="flex justify-center p-4">Chargement des remboursements...</div>;
  }

  if (error) {
    return <div className="flex justify-center p-4 text-red-500">{error}</div>;
  }

  return (
    <div className={`bg-white dark:bg-gray-800 shadow overflow-hidden ${className}`}>
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
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border rounded-md px-2 py-1 pr-8 bg-white dark:bg-gray-700 appearance-none"
            >
              <option value="all">Tous</option>
              <option value="completed">Complété</option>
              <option value="pending">En attente</option>
              <option value="failed">Échoué</option>
              <option value="cancelled">Annulé</option>
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
            disabled={filteredPayments.length === 0}
          >
            <Download className="h-4 w-4 mr-1" />
            Excel
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleExportPDF}
            disabled={filteredPayments.length === 0}
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
              <TableHeader onClick={() => handleSort('transaction_reference')} className="cursor-pointer">
                Référence Trans.
                <ArrowUpDown className="inline ml-1 h-4 w-4" />
              </TableHeader>
              <TableHeader onClick={() => handleSort('contract_id')} className="cursor-pointer">
                Contrat
                <ArrowUpDown className="inline ml-1 h-4 w-4" />
              </TableHeader>
              <TableHeader>Entreprise Payeur</TableHeader>
              <TableHeader>Compte Destination</TableHeader>
              <TableHeader onClick={() => handleSort('payment_date')} className="cursor-pointer">
                Date
                <ArrowUpDown className="inline ml-1 h-4 w-4" />
              </TableHeader>
              <TableHeader onClick={() => handleSort('amount')} className="cursor-pointer">
                Montant
                <ArrowUpDown className="inline ml-1 h-4 w-4" />
              </TableHeader>
              <TableHeader>Échéance liée</TableHeader>
              <TableHeader onClick={() => handleSort('slippage')} className="cursor-pointer">
                Glissement
                <ArrowUpDown className="inline ml-1 h-4 w-4" />
              </TableHeader>
              <TableHeader onClick={() => handleSort('remaining_percentage')} className="cursor-pointer">
                Restant (%)
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
            {paginatedPayments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-8 text-gray-400">
                  {filteredPayments.length === 0 ? 'Aucun remboursement' : 'Aucun résultat pour cette recherche'}
                </TableCell>
              </TableRow>
            ) : (
              paginatedPayments.map((payment) => (
                <TableRow
                  key={payment.id}
                  onClick={() => onView && onView(payment.id)}
                  className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <TableCell className="font-medium">
                    {payment.transaction_reference || payment.payment_reference || payment.id}
                  </TableCell>
                  <TableCell>
                    <div 
                      className="text-sm text-blue-600 dark:text-blue-400 cursor-pointer hover:underline"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onViewSchedule) onViewSchedule(payment.contract_id);
                      }}
                    >
                      {payment.contract_id}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">
                        {payment.source_account?.companyName || "Entreprise"}
                      </span>
                      <span className="text-xs text-gray-500">
                        {payment.source_account?.accountNumber || "N/A"}
                      </span>
                      <span className="text-xs text-gray-500">
                        {payment.source_account?.bankName || "N/A"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">
                        {payment.destination_account?.accountName || "Institution"}
                      </span>
                      <span className="text-xs text-gray-500">
                        {payment.destination_account?.accountNumber || "N/A"}
                      </span>
                      <span className="text-xs text-gray-500">
                        {payment.destination_account?.portfolioName || "N/A"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {payment.payment_date ? formatDate(payment.payment_date) : '-'}
                  </TableCell>
                  <TableCell>{formatAmount(payment.amount)}</TableCell>
                  <TableCell>
                    {payment.related_schedule ? (
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1 text-blue-500" />
                        <span>#{payment.related_schedule.installment_number}</span>
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {getSlippageBadge(payment.slippage || 0)}
                  </TableCell>
                  <TableCell>
                    {payment.related_schedule ? (
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2.5 mr-2">
                          <div 
                            className={`h-2.5 rounded-full ${
                              payment.remaining_percentage <= 25 ? 'bg-green-500' : 
                              payment.remaining_percentage <= 50 ? 'bg-blue-500' : 
                              payment.remaining_percentage <= 75 ? 'bg-yellow-500' : 'bg-red-500'
                            }`} 
                            style={{ width: `${100 - payment.remaining_percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm">{payment.remaining_percentage}%</span>
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(payment.status)}
                  </TableCell>
                  <TableCell>
                    {payment.has_supporting_document || payment.supporting_document_url ? (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownloadDocument(payment.id);
                        }}
                      >
                        <FileDown className="h-4 w-4 mr-1" />
                        Télécharger
                      </Button>
                    ) : (
                      <div className="relative">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={uploadingId === payment.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            document.getElementById(`file-upload-${payment.id}`)?.click();
                          }}
                        >
                          <FileUp className="h-4 w-4 mr-1" />
                          {uploadingId === payment.id ? 'En cours...' : 'Ajouter'}
                        </Button>
                        <input
                          id={`file-upload-${payment.id}`}
                          type="file"
                          className="hidden"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => handleFileUpload(payment.id, e)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-center overflow-visible relative">
                    <div className="inline-block" onClick={(e) => e.stopPropagation()}>
                      <ActionsDropdown
                        actions={[
                          { label: 'Voir', onClick: () => onView && onView(payment.id) },
                          ...(onMarkPaid && payment.status !== 'completed' ? [
                            { 
                              label: 'Marquer comme payé', 
                              onClick: () => onMarkPaid(payment.id), 
                              className: 'text-green-600 hover:text-green-800'
                            }
                          ] : []),
                          {
                            label: 'Supprimer',
                            onClick: () => handleDeletePayment(payment.id),
                            className: 'text-red-600 hover:text-red-800'
                          },
                          ...(payment.has_supporting_document || payment.supporting_document_url ? [
                            { 
                              label: 'Télécharger justificatif', 
                              onClick: () => handleDownloadDocument(payment.id), 
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
            Affichage de {Math.min(filteredPayments.length, (currentPage - 1) * itemsPerPage + 1)} à {Math.min(currentPage * itemsPerPage, filteredPayments.length)} sur {filteredPayments.length} entrées
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

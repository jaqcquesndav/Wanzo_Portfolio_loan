import React, { useState, useMemo } from 'react';
import { Filter, ArrowUpDown, Download, FileText, User, CreditCard, Search, Check, X } from 'lucide-react';
import { ActionsDropdown } from '../../ui/ActionsDropdown';
import { Input } from '../../ui/Input';
import { Button } from '../../ui/Button';
import { Select } from '../../ui/Select';
import { Badge } from '../../ui/Badge';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../../ui/Table';
import { Pagination } from '../../ui/Pagination';
import { TableSkeleton } from '../../ui/TableSkeleton';
import { EmptyState } from '../../ui/EmptyState';
import { exportToExcel, exportToPDF } from '../../../utils/export';
import { useCurrencyContext } from '../../../hooks/useCurrencyContext';
import { CreditRequest, CreditRequestStatus } from '../../../types/credit';

// Type amélioré et standardisé pour une demande de crédit
interface CreditRequestsTableProps {
  requests: CreditRequest[];
  onValidate: (id: string) => void;
  onRefuse: (id: string) => void;
  onDisburse: (id: string) => void;
  onView: (id: string) => void;
  onViewCompany?: (memberId: string) => void;
  onCreateContract?: (id: string) => void;
  loading?: boolean;
  companyNames?: Record<string, string>; // Map de memberId -> nom de la compagnie
  productNames?: Record<string, string>; // Map de productId -> nom du produit
}

// Mapping des statuts pour l'affichage cohérent
const statusConfig: Record<CreditRequestStatus, { label: string; variant: "success" | "error" | "warning" | "primary" | "secondary"; color: string }> = {
  'draft': { label: 'Brouillon', variant: 'secondary', color: 'bg-gray-100 text-gray-700' },
  'submitted': { label: 'Soumise', variant: 'secondary', color: 'bg-indigo-100 text-indigo-700' },
  'under_review': { label: 'En revue', variant: 'warning', color: 'bg-orange-100 text-orange-700' },
  'pending': { label: 'En attente', variant: 'warning', color: 'bg-yellow-100 text-yellow-700' },
  'analysis': { label: 'En analyse', variant: 'primary', color: 'bg-blue-100 text-blue-700' },
  'approved': { label: 'Approuvée', variant: 'success', color: 'bg-green-100 text-green-700' },
  'rejected': { label: 'Rejetée', variant: 'error', color: 'bg-red-100 text-red-700' },
  'canceled': { label: 'Annulée', variant: 'secondary', color: 'bg-gray-100 text-gray-700' },
  'disbursed': { label: 'Décaissée', variant: 'primary', color: 'bg-blue-100 text-blue-700' },
  'active': { label: 'Active', variant: 'success', color: 'bg-green-100 text-green-700' },
  'closed': { label: 'Fermée', variant: 'secondary', color: 'bg-gray-100 text-gray-700' },
  'defaulted': { label: 'En défaut', variant: 'error', color: 'bg-red-100 text-red-700' },
  'restructured': { label: 'Restructurée', variant: 'warning', color: 'bg-yellow-100 text-yellow-700' },
  'consolidated': { label: 'Consolidée', variant: 'primary', color: 'bg-blue-100 text-blue-700' },
  'in_litigation': { label: 'En litige', variant: 'error', color: 'bg-red-100 text-red-700' }
};

export const CreditRequestsTable: React.FC<CreditRequestsTableProps> = ({ 
  requests, 
  onValidate, 
  onRefuse, 
  onDisburse, 
  onView,
  onViewCompany,
  onCreateContract,
  loading = false,
  companyNames = {},
  productNames = {}
}) => {
  // États pour les filtres et la pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<CreditRequestStatus | ''>('');
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [sortField, setSortField] = useState<keyof CreditRequest | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const { formatAmount } = useCurrencyContext();
  const pageSize = 10;

  // Compter les demandes par statut
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {
      'pending': 0,
      'approved': 0,
      'rejected': 0,
      'disbursed': 0,
      'total': 0
    };
    
    requests.forEach(request => {
      counts.total++;
      // Mappez les statuts aux catégories comptabilisées
      if (request.status === 'pending' || request.status === 'submitted' || request.status === 'under_review' || request.status === 'analysis') {
        counts['pending']++;
      } else if (request.status === 'approved') {
        counts['approved']++;
      } else if (request.status === 'rejected' || request.status === 'canceled') {
        counts['rejected']++;
      } else if (request.status === 'disbursed' || request.status === 'active') {
        counts['disbursed']++;
      }
    });
    
    return counts;
  }, [requests]);
  
  // Filtrer et trier les données
  const filteredAndSortedData = useMemo(() => {
    let filtered = [...requests];
    
    // Appliquer le filtre de recherche
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(req => 
        (req.memberId && req.memberId.toLowerCase().includes(term)) || 
        (companyNames[req.memberId] && companyNames[req.memberId].toLowerCase().includes(term)) ||
        (req.productId && req.productId.toLowerCase().includes(term)) ||
        (productNames[req.productId] && productNames[req.productId].toLowerCase().includes(term)) ||
        req.id.toLowerCase().includes(term) ||
        formatAmount(req.requestAmount).includes(term)
      );
    }
    
    // Appliquer le filtre de statut
    if (statusFilter) {
      filtered = filtered.filter(req => req.status === statusFilter);
    }
    
    // Appliquer le tri
    if (sortField) {
      filtered.sort((a, b) => {
        const aValue = a[sortField];
        const bValue = b[sortField];
        
        // Convertir les dates pour le tri
        if (sortField === 'createdAt') {
          const aDate = new Date(a.createdAt).getTime();
          const bDate = new Date(b.createdAt).getTime();
          return sortDirection === 'asc' ? aDate - bDate : bDate - aDate;
        }
        
        // Pour les valeurs numériques ou chaînes de caractères
        if (aValue !== undefined && bValue !== undefined) {
          if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
          if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    
    return filtered;
  }, [requests, searchTerm, statusFilter, sortField, sortDirection, companyNames, productNames, formatAmount]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedData.length / pageSize);
  const currentPageData = filteredAndSortedData.slice(
    (page - 1) * pageSize,
    page * pageSize
  );
  
  // Trier
  const handleSort = (field: keyof CreditRequest) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  // Export Excel
  const handleExportExcel = () => {
    const dataToExport = filteredAndSortedData.map(req => ({
      'Référence': req.id,
      'Client': req.memberId,
      'Produit': req.productId,
      'Montant': formatAmount(req.requestAmount),
      'Statut': statusConfig[req.status]?.label || req.status,
      'Date': new Date(req.createdAt).toLocaleDateString(),
      'Taux': `${req.interestRate}%`,
      'Durée': `${req.schedulesCount} ${req.periodicity === 'monthly' ? 'mois' : req.periodicity}`
    }));
    
    exportToExcel(dataToExport, 'Demandes_Credit');
  };
  
  // Export PDF
  const handleExportPDF = () => {
    exportToPDF({
      title: 'Demandes de Crédit',
      headers: ['Référence', 'Client', 'Produit', 'Montant', 'Statut', 'Date'],
      data: filteredAndSortedData.map(req => [
        req.id,
        req.memberId,
        req.productId,
        formatAmount(req.requestAmount),
        statusConfig[req.status]?.label || req.status,
        new Date(req.createdAt).toLocaleDateString(),
      ]),
      filename: 'Demandes_Credit'
    });
  };
  
  // Afficher le loader si besoin
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <TableSkeleton columns={6} rows={5} />
      </div>
    );
  }
  
  return (
    <>
      {/* En-tête avec résumé et statistiques */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white p-4 rounded-t-lg mb-0">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold">Demandes de Crédit</h3>
          <div className="flex items-center space-x-6">
            <div className="text-center">
              <div className="text-2xl font-bold">{statusCounts.total}</div>
              <div className="text-xs uppercase">Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{statusCounts.pending}</div>
              <div className="text-xs uppercase">En cours</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{statusCounts.approved}</div>
              <div className="text-xs uppercase">Approuvées</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{statusCounts.rejected}</div>
              <div className="text-xs uppercase">Refusées</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{statusCounts.disbursed}</div>
              <div className="text-xs uppercase">Décaissées</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Barre de recherche et filtres */}
      <div className="bg-white dark:bg-gray-800 p-4 border-b">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative w-full md:w-64">
              <Input 
                placeholder="Rechercher..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className={showFilters ? "bg-blue-50 text-blue-700 border-blue-300" : ""}
            >
              <Filter className="h-4 w-4 mr-1" />
              Filtres
            </Button>
            
            <Select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value as CreditRequestStatus | '')}
              className="w-40 md:w-48"
            >
              <option value="">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="analysis">En analyse</option>
              <option value="approved">Approuvées</option>
              <option value="rejected">Refusées</option>
              <option value="disbursed">Décaissées</option>
              <option value="active">Actives</option>
              <option value="defaulted">En défaut</option>
            </Select>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleExportExcel}
              disabled={filteredAndSortedData.length === 0}
              title="Exporter en Excel"
            >
              <Download className="h-4 w-4 mr-1" />
              Excel
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleExportPDF}
              disabled={filteredAndSortedData.length === 0}
              title="Exporter en PDF"
            >
              <FileText className="h-4 w-4 mr-1" />
              PDF
            </Button>
          </div>
        </div>
      </div>
      
      {/* Tableau principal */}
      <div className="bg-white dark:bg-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHead>
              <TableRow>
                <TableHeader className="cursor-pointer" onClick={() => handleSort('id')}>
                  Référence
                  <ArrowUpDown className="h-4 w-4 inline-block ml-1" />
                </TableHeader>
                <TableHeader className="cursor-pointer" onClick={() => handleSort('memberId')}>
                  Client
                  <ArrowUpDown className="h-4 w-4 inline-block ml-1" />
                </TableHeader>
                <TableHeader className="cursor-pointer" onClick={() => handleSort('productId')}>
                  Produit
                  <ArrowUpDown className="h-4 w-4 inline-block ml-1" />
                </TableHeader>
                <TableHeader className="cursor-pointer" onClick={() => handleSort('requestAmount')}>
                  Montant
                  <ArrowUpDown className="h-4 w-4 inline-block ml-1" />
                </TableHeader>
                <TableHeader className="cursor-pointer" onClick={() => handleSort('status')}>
                  Statut
                  <ArrowUpDown className="h-4 w-4 inline-block ml-1" />
                </TableHeader>
                <TableHeader className="cursor-pointer" onClick={() => handleSort('createdAt')}>
                  Date de demande
                  <ArrowUpDown className="h-4 w-4 inline-block ml-1" />
                </TableHeader>
                <TableHeader>Actions</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {currentPageData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="p-0">
                    <EmptyState
                      icon={CreditCard}
                      title={searchTerm || statusFilter ? "Aucun résultat" : "Aucune demande de crédit"}
                      description={
                        searchTerm || statusFilter 
                          ? "Essayez de modifier vos critères de recherche ou filtres."
                          : "Les demandes de crédit apparaîtront ici une fois soumises par les clients."
                      }
                      size="sm"
                    />
                  </TableCell>
                </TableRow>
              ) : (
                currentPageData.map((request) => (
                  <TableRow key={request.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <TableCell 
                      className="font-medium cursor-pointer hover:text-blue-600"
                      onClick={() => onView(request.id)}
                    >
                      {request.id}
                    </TableCell>
                    <TableCell>
                      <div
                        className="cursor-pointer hover:text-blue-600 hover:underline flex items-center"
                        onClick={() => onViewCompany ? onViewCompany(request.memberId) : null}
                      >
                        <User className="h-4 w-4 mr-1 text-gray-400" />
                        {companyNames[request.memberId] || request.memberId}
                      </div>
                    </TableCell>
                    <TableCell>{productNames[request.productId] || request.productId}</TableCell>
                    <TableCell>
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {formatAmount(request.requestAmount)}
                      </span>
                      <span className="text-xs text-gray-500 block">
                        {request.interestRate}% - {request.schedulesCount} {
                          request.periodicity === 'monthly' ? 'mois' : 
                          request.periodicity === 'weekly' ? 'semaines' : 
                          request.periodicity
                        }
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusConfig[request.status]?.variant || "secondary"}>
                        {statusConfig[request.status]?.label || request.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-gray-800 dark:text-gray-200">
                        {new Date(request.createdAt).toLocaleDateString()}
                      </span>
                      <span className="text-xs text-gray-500 block">
                        {new Date(request.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </TableCell>
                    <TableCell>
                      <ActionsDropdown
                        actions={[
                          { 
                            label: 'Voir détails', 
                            onClick: () => onView(request.id),
                            icon: <FileText className="h-4 w-4 mr-2" />
                          },
                          request.status === 'pending' || request.status === 'analysis' || request.status === 'under_review' ? { 
                            label: 'Approuver', 
                            onClick: () => onValidate(request.id),
                            className: 'text-green-600 hover:text-green-800',
                            icon: <Check className="h-4 w-4 mr-2" />
                          } : null,
                          request.status === 'pending' || request.status === 'analysis' || request.status === 'under_review' ? { 
                            label: 'Refuser', 
                            onClick: () => onRefuse(request.id),
                            className: 'text-red-600 hover:text-red-800',
                            icon: <X className="h-4 w-4 mr-2" />
                          } : null,
                          request.status === 'approved' ? { 
                            label: 'Décaisser', 
                            onClick: () => onDisburse(request.id),
                            className: 'text-blue-600 hover:text-blue-800',
                            icon: <CreditCard className="h-4 w-4 mr-2" />
                          } : null,
                          request.status === 'approved' ? { 
                            label: 'Créer contrat', 
                            onClick: () => onCreateContract ? onCreateContract(request.id) : null,
                            className: 'text-purple-600 hover:text-purple-800',
                            icon: <FileText className="h-4 w-4 mr-2" />
                          } : null,
                          onViewCompany ? { 
                            label: 'Voir client', 
                            onClick: () => onViewCompany(request.memberId),
                            className: 'text-indigo-600 hover:text-indigo-800',
                            icon: <User className="h-4 w-4 mr-2" />
                          } : null,
                        ].filter(Boolean) as { label: string, onClick: () => void, className?: string, icon?: React.ReactNode }[]}
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white dark:bg-gray-800 p-4 border-t">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
            showPageNumbers
          />
        </div>
      )}
    </>
  );
};

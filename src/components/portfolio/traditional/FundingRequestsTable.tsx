import React, { useState, useMemo } from 'react';
import { Filter, ArrowUpDown, Download, FileText } from 'lucide-react';
import { ActionsDropdown } from '../../ui/ActionsDropdown';
import { Input } from '../../ui/Input';
import { Button } from '../../ui/Button';
import { Select } from '../../ui/Select';
import { Badge } from '../../ui/Badge';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../../ui/Table';
import { Pagination } from '../../ui/Pagination';
import { TableSkeleton } from '../../ui/TableSkeleton';
import { exportToExcel, exportToPDF } from '../../../utils/exports';

// Type amélioré pour une demande de financement PME
export interface FundingRequest {
  id: string;
  company: string;
  product: string;
  amount: number;
  status: 'en attente' | 'validée' | 'refusée' | 'décaissée';
  created_at: string;
  portfolioId: string;
  maturity?: string; // Échéance
  dueDate?: string; // Date d'échéance
  projectFile?: string; // Lien vers le fichier du projet
  attachments?: Array<{id: string, name: string, url: string}>; // Pièces jointes
  productDetails?: {
    type: string;
    rate: number;
    term: string;
  }; // Détails du produit sollicité
}

interface FundingRequestsTableProps {
  requests: FundingRequest[];
  onValidate: (id: string) => void;
  onRefuse: (id: string) => void;
  onDisburse: (id: string) => void;
  onView: (id: string) => void;
  onViewCompany?: (company: string) => void; // Nouvelle prop pour afficher les détails de l'entreprise
  loading?: boolean;
}

// Status map pour l'affichage cohérent
const statusConfig = {
  'en attente': { label: 'En attente', variant: 'warning' as const, color: 'bg-yellow-100 text-yellow-700' },
  'validée': { label: 'Validée', variant: 'success' as const, color: 'bg-green-100 text-green-700' },
  'refusée': { label: 'Refusée', variant: 'error' as const, color: 'bg-red-100 text-red-700' },
  'décaissée': { label: 'Décaissée', variant: 'primary' as const, color: 'bg-blue-100 text-blue-700' }
};

export const FundingRequestsTable: React.FC<FundingRequestsTableProps> = ({ 
  requests, 
  onValidate, 
  onRefuse, 
  onDisburse, 
  onView,
  onViewCompany,
  loading = false
}) => {
  // États pour les filtres et la pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const pageSize = 10;

  // Compter les demandes par statut
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {
      'en attente': 0,
      'validée': 0,
      'refusée': 0,
      'décaissée': 0,
      'total': 0
    };
    
    requests.forEach(request => {
      counts.total++;
      if (counts[request.status] !== undefined) {
        counts[request.status]++;
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
        req.company.toLowerCase().includes(term) || 
        req.product.toLowerCase().includes(term) ||
        req.id.toLowerCase().includes(term)
      );
    }
    
    // Appliquer le filtre de statut
    if (statusFilter) {
      filtered = filtered.filter(req => req.status === statusFilter);
    }
    
    // Appliquer le tri
    if (sortField) {
      filtered.sort((a, b) => {
        const aValue = a[sortField as keyof FundingRequest];
        const bValue = b[sortField as keyof FundingRequest];
        
        // Convertir les dates pour le tri
        if (sortField === 'created_at') {
          const aDate = new Date(a.created_at).getTime();
          const bDate = new Date(b.created_at).getTime();
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
  }, [requests, searchTerm, statusFilter, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedData.length / pageSize);
  const currentPageData = filteredAndSortedData.slice(
    (page - 1) * pageSize,
    page * pageSize
  );
  
  // Trier
  const handleSort = (field: string) => {
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
      'Entreprise': req.company,
      'Produit': req.product,
      'Montant': req.amount.toLocaleString() + ' FCFA',
      'Statut': statusConfig[req.status].label,
      'Date': new Date(req.created_at).toLocaleDateString(),
      'Échéance': req.maturity || 'N/A',
      'Date Échéance': req.dueDate ? new Date(req.dueDate).toLocaleDateString() : 'N/A',
    }));
    
    exportToExcel(dataToExport, 'Demandes_Financement');
  };
  
  // Export PDF
  const handleExportPDF = () => {
    exportToPDF({
      title: 'Demandes de Financement',
      headers: ['Référence', 'Entreprise', 'Produit', 'Montant', 'Statut', 'Date'],
      data: filteredAndSortedData.map(req => [
        req.id,
        req.company,
        req.product,
        req.amount.toLocaleString() + ' FCFA',
        statusConfig[req.status].label,
        new Date(req.created_at).toLocaleDateString(),
      ]),
      filename: 'Demandes_Financement.pdf'
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
          <h3 className="text-lg font-bold">Demandes de Financement</h3>
          <div className="flex items-center space-x-6">
            <div>
              <span className="text-xs block text-gray-200">Total</span>
              <span className="font-semibold">{statusCounts.total}</span>
            </div>
            <div>
              <span className="text-xs block text-gray-200">En attente</span>
              <span className="font-semibold text-yellow-300">{statusCounts['en attente']}</span>
            </div>
            <div>
              <span className="text-xs block text-gray-200">Validées</span>
              <span className="font-semibold text-green-300">{statusCounts['validée']}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Barre de recherche et filtres */}
      <div className="bg-white dark:bg-gray-800 p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Input
                type="search"
                placeholder="Rechercher une demande..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 w-[250px]"
              />
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                width="15"
                height="15"
                viewBox="0 0 15 15"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M10 6.5C10 8.433 8.433 10 6.5 10C4.567 10 3 8.433 3 6.5C3 4.567 4.567 3 6.5 3C8.433 3 10 4.567 10 6.5ZM9.30884 10.0159C8.53901 10.6318 7.56251 11 6.5 11C4.01472 11 2 8.98528 2 6.5C2 4.01472 4.01472 2 6.5 2C8.98528 2 11 4.01472 11 6.5C11 7.56251 10.6318 8.53901 10.0159 9.30884L12.8536 12.1464C13.0488 12.3417 13.0488 12.6583 12.8536 12.8536C12.6583 13.0488 12.3417 13.0488 12.1464 12.8536L9.30884 10.0159Z"
                  fill="currentColor"
                  fillRule="evenodd"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            
            <Button 
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filtres {showFilters ? 'actifs' : ''}
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleExportExcel} className="flex items-center">
              <Download className="mr-1 h-4 w-4" /> Excel
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportPDF} className="flex items-center">
              <Download className="mr-1 h-4 w-4" /> PDF
            </Button>
          </div>
        </div>
        
        {/* Filtres avancés */}
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
            <div className="flex flex-wrap gap-4">
              <div className="w-full max-w-xs">
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                  Statut
                </label>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">Tous les statuts</option>
                  <option value="en attente">En attente</option>
                  <option value="validée">Validée</option>
                  <option value="refusée">Refusée</option>
                  <option value="décaissée">Décaissée</option>
                </Select>
              </div>
              
              <div className="flex items-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('');
                  }}
                >
                  Réinitialiser
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Tableau des données */}
      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHead>
              <tr>
                <TableHeader className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700">
                  <div onClick={() => handleSort('company')} className="flex items-center">
                    Entreprise
                    {sortField === 'company' && (
                      <ArrowUpDown className={`inline ml-1 h-4 w-4 ${sortDirection === 'asc' ? 'transform rotate-180' : ''}`} />
                    )}
                  </div>
                </TableHeader>
                <TableHeader>Produit</TableHeader>
                <TableHeader className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700">
                  <div onClick={() => handleSort('amount')} className="flex items-center">
                    Montant
                    {sortField === 'amount' && (
                      <ArrowUpDown className={`inline ml-1 h-4 w-4 ${sortDirection === 'asc' ? 'transform rotate-180' : ''}`} />
                    )}
                  </div>
                </TableHeader>
                <TableHeader className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700">
                  <div onClick={() => handleSort('status')} className="flex items-center">
                    Statut
                    {sortField === 'status' && (
                      <ArrowUpDown className={`inline ml-1 h-4 w-4 ${sortDirection === 'asc' ? 'transform rotate-180' : ''}`} />
                    )}
                  </div>
                </TableHeader>
                <TableHeader className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700">
                  <div onClick={() => handleSort('created_at')} className="flex items-center">
                    Date
                    {sortField === 'created_at' && (
                      <ArrowUpDown className={`inline ml-1 h-4 w-4 ${sortDirection === 'asc' ? 'transform rotate-180' : ''}`} />
                    )}
                  </div>
                </TableHeader>
                <TableHeader>Échéance</TableHeader>
                <TableHeader>Documents</TableHeader>
                <TableHeader align="center">Actions</TableHeader>
              </tr>
            </TableHead>
            <TableBody>
              {currentPageData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-400">
                    Aucune demande ne correspond aux critères de recherche
                  </TableCell>
                </TableRow>
              ) : (
                currentPageData.map((req) => (
                  <TableRow
                    key={req.id}
                    onClick={e => {
                      if ((e.target as HTMLElement).closest('.actions-dropdown')) return;
                      onView(req.id);
                    }}
                    tabIndex={0}
                    aria-label={`Voir la demande de crédit ${req.company}`}
                    style={{ outline: 'none' }}
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        onView(req.id);
                      }
                    }}
                    className="cursor-pointer"
                  >
                    <TableCell className="font-medium">
                      <span 
                        className="hover:text-blue-600 hover:underline"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onViewCompany) {
                            onViewCompany(req.company);
                          }
                        }}
                      >
                        {req.company}
                      </span>
                    </TableCell>
                    <TableCell>{req.product}</TableCell>
                    <TableCell>{req.amount.toLocaleString()} FCFA</TableCell>
                    <TableCell>
                      <Badge variant={statusConfig[req.status].variant}>
                        {statusConfig[req.status].label}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(req.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>{req.maturity || 'N/A'}</TableCell>
                    <TableCell>
                      {req.projectFile && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(req.projectFile, '_blank');
                          }}
                        >
                          <FileText className="h-4 w-4 mr-1" />
                          Projet
                        </Button>
                      )}
                      {req.attachments && req.attachments.length > 0 && (
                        <Badge variant="secondary">{req.attachments.length} pièce(s)</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-center overflow-visible">
                      <div className="actions-dropdown inline-block">
                        <ActionsDropdown
                          actions={[
                            { 
                              label: 'Voir détails', 
                              onClick: () => onView(req.id)
                            },
                            req.status === 'en attente' ? { 
                              label: 'Valider', 
                              onClick: () => onValidate(req.id),
                              className: 'text-green-600 hover:text-green-700'
                            } : null,
                            req.status === 'validée' ? { 
                              label: 'Créer Contrat', 
                              onClick: () => onDisburse(req.id),
                              className: 'text-blue-600 hover:text-blue-700'
                            } : null,
                            req.status === 'en attente' ? { 
                              label: 'Refuser', 
                              onClick: () => onRefuse(req.id),
                              className: 'text-red-600 hover:text-red-700'
                            } : null,
                          ].filter(Boolean) as { label: string; onClick: () => void; className?: string }[]}
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
      
      {/* Pagination */}
      {filteredAndSortedData.length > pageSize && (
        <div className="mt-4 flex justify-center">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      )}
    </>
  );
};

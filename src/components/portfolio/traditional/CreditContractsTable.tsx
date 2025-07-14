import { useState, useMemo } from 'react';
import { Filter, ArrowUpDown, Download } from 'lucide-react';
import { ActionsDropdown } from '../../ui/ActionsDropdown';
import { Input } from '../../ui/Input';
import { Button } from '../../ui/Button';
import { Select } from '../../ui/Select';
import { Badge } from '../../ui/Badge';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../../ui/Table';
import { Pagination } from '../../ui/Pagination';
import { TableSkeleton } from '../../ui/TableSkeleton';
import { exportToExcel, exportToPDF } from '../../../utils/exports';

// Type pour un contrat de crédit
export interface CreditContract {
  id: string;
  reference: string;
  company: string;
  product: string;
  amount: number;
  status: 'actif' | 'clôturé' | 'en défaut' | 'suspendu';
  startDate: string;
  endDate: string;
  interestRate: number;
  remainingAmount?: number;
  createdAt: string;
  portfolioId: string;
  documentUrl?: string;
  lastPaymentDate?: string;
  nextPaymentDate?: string;
}

interface CreditContractsTableProps {
  contracts: CreditContract[];
  onViewDetails: (id: string) => void;
  onDownloadContract?: (id: string) => void;
  onModify?: (id: string) => void;
  onTerminate?: (id: string) => void;
  loading?: boolean;
}

// Status map pour l'affichage cohérent des statuts
const statusConfig = {
  'actif': { label: 'Actif', variant: 'success' as const, color: 'bg-green-100 text-green-700' },
  'clôturé': { label: 'Clôturé', variant: 'secondary' as const, color: 'bg-gray-100 text-gray-700' },
  'en défaut': { label: 'En défaut', variant: 'error' as const, color: 'bg-red-100 text-red-700' },
  'suspendu': { label: 'Suspendu', variant: 'warning' as const, color: 'bg-yellow-100 text-yellow-700' }
};

export function CreditContractsTable({
  contracts,
  onViewDetails,
  onDownloadContract,
  onModify,
  onTerminate,
  loading = false
}: CreditContractsTableProps) {
  // États pour les filtres et la pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [sortField, setSortField] = useState<keyof CreditContract | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const pageSize = 10;

  // Compter les contrats par statut
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {
      'actif': 0,
      'clôturé': 0,
      'en défaut': 0,
      'suspendu': 0,
      'total': 0
    };
    
    contracts.forEach(contract => {
      counts.total++;
      if (counts[contract.status] !== undefined) {
        counts[contract.status]++;
      }
    });
    
    return counts;
  }, [contracts]);
  
  // Filtrer et trier les données
  const filteredAndSortedData = useMemo(() => {
    let filtered = [...contracts];
    
    // Appliquer le filtre de recherche
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(contract => 
        contract.company.toLowerCase().includes(term) || 
        contract.product.toLowerCase().includes(term) ||
        contract.reference.toLowerCase().includes(term)
      );
    }
    
    // Appliquer le filtre de statut
    if (statusFilter) {
      filtered = filtered.filter(contract => contract.status === statusFilter);
    }
    
    // Appliquer le tri
    if (sortField) {
      filtered.sort((a, b) => {
        const aValue = a[sortField];
        const bValue = b[sortField];
        
        // Pour les dates
        if (typeof aValue === 'string' && (sortField === 'startDate' || sortField === 'endDate' || sortField === 'createdAt')) {
          const aDate = new Date(aValue).getTime();
          const bDate = new Date(bValue as string).getTime();
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
  }, [contracts, searchTerm, statusFilter, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedData.length / pageSize);
  const currentPageData = filteredAndSortedData.slice(
    (page - 1) * pageSize,
    page * pageSize
  );
  
  // Trier
  const handleSort = (field: keyof CreditContract) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  // Export Excel
  const handleExportExcel = () => {
    const dataToExport = filteredAndSortedData.map(contract => ({
      'Référence': contract.reference,
      'Entreprise': contract.company,
      'Produit': contract.product,
      'Montant': contract.amount.toLocaleString() + ' FCFA',
      'Statut': statusConfig[contract.status].label,
      'Taux d\'intérêt': contract.interestRate + '%',
      'Date début': new Date(contract.startDate).toLocaleDateString(),
      'Date fin': new Date(contract.endDate).toLocaleDateString(),
      'Montant restant': contract.remainingAmount ? contract.remainingAmount.toLocaleString() + ' FCFA' : 'N/A',
      'Prochain paiement': contract.nextPaymentDate ? new Date(contract.nextPaymentDate).toLocaleDateString() : 'N/A',
    }));
    
    exportToExcel(dataToExport, 'Contrats');
  };
  
  // Export PDF
  const handleExportPDF = () => {
    exportToPDF({
      title: 'Contrats',
      headers: ['Référence', 'Entreprise', 'Produit', 'Montant', 'Statut', 'Date début', 'Date fin'],
      data: filteredAndSortedData.map(contract => [
        contract.reference,
        contract.company,
        contract.product,
        contract.amount.toLocaleString() + ' FCFA',
        statusConfig[contract.status].label,
        new Date(contract.startDate).toLocaleDateString(),
        new Date(contract.endDate).toLocaleDateString(),
      ]),
      filename: 'Contrats.pdf'
    });
  };
  
  // Afficher le loader si besoin
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <TableSkeleton columns={7} rows={5} />
      </div>
    );
  }
  
  return (
    <>
      {/* En-tête avec résumé et statistiques */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white p-4 rounded-t-lg mb-0">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold">Contrats</h3>
          <div className="flex items-center space-x-6">
            <div>
              <span className="text-xs block text-gray-200">Total</span>
              <span className="font-semibold">{statusCounts.total}</span>
            </div>
            <div>
              <span className="text-xs block text-gray-200">Actifs</span>
              <span className="font-semibold text-green-300">{statusCounts['actif']}</span>
            </div>
            <div>
              <span className="text-xs block text-gray-200">En défaut</span>
              <span className="font-semibold text-red-300">{statusCounts['en défaut']}</span>
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
                placeholder="Rechercher un contrat..."
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
                  <option value="actif">Actif</option>
                  <option value="clôturé">Clôturé</option>
                  <option value="en défaut">En défaut</option>
                  <option value="suspendu">Suspendu</option>
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
                  <div onClick={() => handleSort('reference')} className="flex items-center">
                    Référence
                    {sortField === 'reference' && (
                      <ArrowUpDown className={`inline ml-1 h-4 w-4 ${sortDirection === 'asc' ? 'transform rotate-180' : ''}`} />
                    )}
                  </div>
                </TableHeader>
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
                  <div onClick={() => handleSort('startDate')} className="flex items-center">
                    Date début
                    {sortField === 'startDate' && (
                      <ArrowUpDown className={`inline ml-1 h-4 w-4 ${sortDirection === 'asc' ? 'transform rotate-180' : ''}`} />
                    )}
                  </div>
                </TableHeader>
                <TableHeader className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700">
                  <div onClick={() => handleSort('endDate')} className="flex items-center">
                    Date fin
                    {sortField === 'endDate' && (
                      <ArrowUpDown className={`inline ml-1 h-4 w-4 ${sortDirection === 'asc' ? 'transform rotate-180' : ''}`} />
                    )}
                  </div>
                </TableHeader>
                <TableHeader align="center">Actions</TableHeader>
              </tr>
            </TableHead>
            <TableBody>
              {currentPageData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-gray-400">
                    Aucun contrat ne correspond aux critères de recherche
                  </TableCell>
                </TableRow>
              ) : (
                currentPageData.map((contract) => (
                  <TableRow
                    key={contract.id}
                    onClick={e => {
                      if ((e.target as HTMLElement).closest('.actions-dropdown')) return;
                      onViewDetails(contract.id);
                    }}
                    tabIndex={0}
                    aria-label={`Voir le contrat de ${contract.company}`}
                    style={{ outline: 'none' }}
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        onViewDetails(contract.id);
                      }
                    }}
                    className="cursor-pointer"
                  >
                    <TableCell className="font-mono">{contract.reference}</TableCell>
                    <TableCell className="font-medium">{contract.company}</TableCell>
                    <TableCell>{contract.product}</TableCell>
                    <TableCell>{contract.amount.toLocaleString()} FCFA</TableCell>
                    <TableCell>
                      <Badge variant={statusConfig[contract.status].variant}>
                        {statusConfig[contract.status].label}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(contract.startDate).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(contract.endDate).toLocaleDateString()}</TableCell>
                    <TableCell className="text-center overflow-visible">
                      <div className="actions-dropdown inline-block">
                        <ActionsDropdown
                          actions={[
                            { label: 'Voir détails', onClick: () => onViewDetails(contract.id) },
                            onDownloadContract ? { 
                              label: 'Télécharger', 
                              onClick: () => onDownloadContract(contract.id) 
                            } : null,
                            contract.status === 'actif' && onModify ? { 
                              label: 'Modifier', 
                              onClick: () => onModify(contract.id) 
                            } : null,
                            contract.status === 'actif' && onTerminate ? { 
                              label: 'Clôturer', 
                              onClick: () => onTerminate(contract.id) 
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
}

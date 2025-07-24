import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarClock, ArrowUpRight, Filter, ChevronDown, ArrowDownUp, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { Button } from '../ui/Button';
import { formatDate } from '../../utils/formatters';
import { Badge } from '../ui/Badge';
import type { PortfolioType } from '../../types/portfolio';
import { useFormatCurrency } from '../../hooks/useFormatCurrency';

// Types d'opérations spécifiques pour chaque type de portefeuille
export type TraditionalOperation = {
  id: string;
  type: 'disbursement' | 'repayment' | 'request' | 'contract' | 'guarantee';
  amount: number;
  date: string;
  status: 'completed' | 'pending' | 'failed' | 'planned';
  portfolioId: string;
  portfolioName: string;
  clientName: string;
  contractId?: string;
  requestId?: string;
  description?: string;
};

export type LeasingOperation = {
  id: string;
  type: 'rental' | 'return' | 'maintenance' | 'payment' | 'incident';
  amount: number;
  date: string;
  status: 'completed' | 'pending' | 'failed' | 'planned';
  portfolioId: string;
  portfolioName: string;
  clientName: string;
  equipmentId: string;
  equipmentName?: string;
  description?: string;
};

export type InvestmentOperation = {
  id: string;
  type: 'subscription' | 'redemption' | 'valuation' | 'dividend' | 'transaction';
  amount: number;
  date: string;
  status: 'completed' | 'pending' | 'failed' | 'planned';
  portfolioId: string;
  portfolioName: string;
  clientName: string; // Ajout de clientName manquant
  assetName: string;
  assetId?: string;
  description?: string;
};

// Type union pour représenter n'importe quelle opération
export type PortfolioOperation = 
  | (TraditionalOperation & { portfolioType: 'traditional' })
  | (LeasingOperation & { portfolioType: 'leasing' })
  | (InvestmentOperation & { portfolioType: 'investment' });

interface RecentOperationsTableProps {
  operations: PortfolioOperation[];
  portfolioType: PortfolioType;
  isLoading?: boolean;
  onOperationClick?: (operation: PortfolioOperation) => void;
  onFilterChange?: (filters: { type: string; status: string; portfolioId: string }) => void;
  limit?: number;
}

const statusColors = {
  completed: { bg: 'bg-green-100 dark:bg-green-900/20', text: 'text-green-700 dark:text-green-300', icon: CheckCircle2 },
  pending: { bg: 'bg-amber-100 dark:bg-amber-900/20', text: 'text-amber-700 dark:text-amber-300', icon: Clock },
  failed: { bg: 'bg-red-100 dark:bg-red-900/20', text: 'text-red-700 dark:text-red-300', icon: AlertCircle },
  planned: { bg: 'bg-blue-100 dark:bg-blue-900/20', text: 'text-blue-700 dark:text-blue-300', icon: CalendarClock }
};

const typeLabels: Record<string, string> = {
  // Traditional
  disbursement: 'Virement',
  repayment: 'Remboursement',
  request: 'Demande',
  contract: 'Contrat',
  guarantee: 'Garantie',
  
  // Leasing
  rental: 'Location',
  return: 'Retour',
  maintenance: 'Maintenance',
  payment: 'Paiement',
  incident: 'Incident',
  
  // Investment
  subscription: 'Souscription',
  redemption: 'Rachat',
  valuation: 'Valorisation',
  dividend: 'Dividende',
  transaction: 'Transaction'
};

export const RecentOperationsTable: React.FC<RecentOperationsTableProps> = ({
  operations,
  portfolioType,
  isLoading = false,
  onOperationClick,
  onFilterChange,
  limit = 5
}) => {
  const navigate = useNavigate();
  const { formatCurrency } = useFormatCurrency();
  const [sortField, setSortField] = useState<string>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(limit);
  const [filters, setFilters] = useState({
    type: 'all',
    status: 'all',
    portfolioId: 'all'
  });
  
  // Mémoriser les opérations filtrées et triées
  const filteredOperations = useMemo(() => {
    // Appliquer les filtres
    let result = [...operations];
    
    if (filters.type !== 'all') {
      result = result.filter(op => op.type === filters.type);
    }
    
    if (filters.status !== 'all') {
      result = result.filter(op => op.status === filters.status);
    }
    
    if (filters.portfolioId !== 'all') {
      result = result.filter(op => op.portfolioId === filters.portfolioId);
    }
    
    // Trier les résultats
    result.sort((a, b) => {
      if (sortField === 'date') {
        return sortDirection === 'asc' 
          ? new Date(a.date).getTime() - new Date(b.date).getTime()
          : new Date(b.date).getTime() - new Date(a.date).getTime();
      } else if (sortField === 'amount') {
        return sortDirection === 'asc' ? a.amount - b.amount : b.amount - a.amount;
      }
      return 0;
    });
    
    return result;
  }, [operations, filters, sortField, sortDirection]);
  
  // Opérations paginées
  const paginatedOperations = useMemo(() => {
    // Utiliser la limite standard si elle est spécifiée
    if (limit && limit < pageSize) {
      return filteredOperations.slice(0, limit);
    }
    
    // Sinon, utiliser la pagination
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return filteredOperations.slice(start, end);
  }, [filteredOperations, currentPage, pageSize, limit]);
  
  // Nombre total de pages basé sur le nombre d'opérations filtrées et la taille de page
  const totalPages = Math.max(1, Math.ceil(filteredOperations.length / pageSize));
  
  // Obtenir les options de filtre à partir des données disponibles
  const filterOptions = useMemo(() => {
    const types = new Set<string>();
    const statuses = new Set<string>();
    const portfolios = new Map<string, string>();
    
    operations.forEach(op => {
      types.add(op.type);
      statuses.add(op.status);
      portfolios.set(op.portfolioId, op.portfolioName);
    });
    
    return {
      types: Array.from(types),
      statuses: Array.from(statuses),
      portfolios: Array.from(portfolios.entries()).map(([id, name]) => ({ id, name }))
    };
  }, [operations]);
  
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };
  
  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    if (onFilterChange) {
      onFilterChange(newFilters);
    }
  };
  
  const handleOperationClick = (operation: PortfolioOperation) => {
    if (onOperationClick) {
      onOperationClick(operation);
    } else {
      // Navigation par défaut vers le portefeuille et l'onglet approprié
      const route = `/portfolio/${portfolioType}/${operation.portfolioId}`;
      
      // Déterminer l'onglet en fonction du type d'opération
      let tab = '';
      if (portfolioType === 'traditional') {
        if (operation.type === 'disbursement') tab = '/disbursements';
        else if (operation.type === 'repayment') tab = '/repayments';
        else if (operation.type === 'request') tab = '/requests';
        else if (operation.type === 'contract') tab = '/contracts';
        else if (operation.type === 'guarantee') tab = '/guarantees';
      } else if (portfolioType === 'leasing') {
        if (operation.type === 'rental' || operation.type === 'return') tab = '/contracts';
        else if (operation.type === 'maintenance') tab = '/maintenance';
        else if (operation.type === 'payment') tab = '/payments';
        else if (operation.type === 'incident') tab = '/incidents';
      } else if (portfolioType === 'investment') {
        if (operation.type === 'subscription') tab = '/subscriptions';
        else if (operation.type === 'redemption') tab = '/subscriptions';
        else if (operation.type === 'valuation') tab = '/valuations';
        else if (operation.type === 'transaction' || operation.type === 'dividend') tab = '/assets';
      }
      
      navigate(route + tab);
    }
  };
  
  const getStatusDisplay = (status: string) => {
    const statusConfig = statusColors[status as keyof typeof statusColors];
    if (!statusConfig) return null;
    
    const Icon = statusConfig.icon;
    
    return (
      <div className={`flex items-center gap-1.5 px-2 py-1 rounded ${statusConfig.bg} ${statusConfig.text}`}>
        <Icon className="h-3.5 w-3.5" />
        <span className="text-xs font-medium capitalize">
          {status === 'completed' ? 'Terminé' : 
           status === 'pending' ? 'En cours' : 
           status === 'failed' ? 'Échoué' : 
           status === 'planned' ? 'Planifié' : status}
        </span>
      </div>
    );
  };
  
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Opérations récentes</h3>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }
  
  if (operations.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Opérations récentes</h3>
        </div>
        <div className="p-6 text-center">
          <p className="text-gray-500 dark:text-gray-400">Aucune opération récente</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Opérations récentes</h3>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-1"
          >
            <Filter className="h-4 w-4" />
            <span>Filtres</span>
            <ChevronDown className={`h-4 w-4 transform transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/portfolio/${portfolioType}`)}
            className="flex items-center gap-1"
          >
            <span>Voir tout</span>
            <ArrowUpRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {showFilters && (
        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700 flex flex-wrap gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Type</label>
            <select
              className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md px-3 py-1.5 text-sm"
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
            >
              <option value="all">Tous</option>
              {filterOptions.types.map(type => (
                <option key={type} value={type}>{typeLabels[type] || type}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Statut</label>
            <select
              className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md px-3 py-1.5 text-sm"
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="all">Tous</option>
              {filterOptions.statuses.map(status => (
                <option key={status} value={status}>
                  {status === 'completed' ? 'Terminé' : 
                   status === 'pending' ? 'En cours' : 
                   status === 'failed' ? 'Échoué' : 
                   status === 'planned' ? 'Planifié' : status}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Portefeuille</label>
            <select
              className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md px-3 py-1.5 text-sm"
              value={filters.portfolioId}
              onChange={(e) => handleFilterChange('portfolioId', e.target.value)}
            >
              <option value="all">Tous</option>
              {filterOptions.portfolios.map(portfolio => (
                <option key={portfolio.id} value={portfolio.id}>{portfolio.name}</option>
              ))}
            </select>
          </div>
        </div>
      )}
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-800/80">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Type
              </th>
              <th 
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('date')}
              >
                <div className="flex items-center gap-1">
                  <span>Date</span>
                  {sortField === 'date' && (
                    <ArrowDownUp className={`h-3.5 w-3.5 ${sortDirection === 'asc' ? 'rotate-180' : ''}`} />
                  )}
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {portfolioType === 'traditional' ? 'Client' : 
                 portfolioType === 'leasing' ? 'Client/Équipement' : 
                 'Actif'}
              </th>
              <th 
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('amount')}
              >
                <div className="flex items-center gap-1">
                  <span>Montant</span>
                  {sortField === 'amount' && (
                    <ArrowDownUp className={`h-3.5 w-3.5 ${sortDirection === 'asc' ? 'rotate-180' : ''}`} />
                  )}
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Statut
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Portefeuille
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {paginatedOperations.map((operation) => (
              <tr 
                key={operation.id}
                className="hover:bg-gray-50 dark:hover:bg-gray-800/60 cursor-pointer transition-colors"
                onClick={() => handleOperationClick(operation)}
              >
                <td className="px-4 py-3 whitespace-nowrap">
                  <Badge variant="secondary">
                    {typeLabels[operation.type] || operation.type}
                  </Badge>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                  {formatDate(operation.date)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                  {portfolioType === 'traditional' ? operation.clientName : 
                   portfolioType === 'leasing' ? (
                     <div>
                       <div>{operation.clientName}</div>
                       {(operation as LeasingOperation & { portfolioType: 'leasing' }).equipmentName && (
                         <div className="text-xs text-gray-500 dark:text-gray-400">
                           {(operation as LeasingOperation & { portfolioType: 'leasing' }).equipmentName}
                         </div>
                       )}
                     </div>
                   ) : 
                   (operation as InvestmentOperation & { portfolioType: 'investment' }).assetName}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                  {formatCurrency(operation.amount, undefined)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {getStatusDisplay(operation.status)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                  {operation.portfolioName}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-right text-sm">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-primary hover:text-primary-dark"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOperationClick(operation);
                    }}
                  >
                    <ArrowUpRight className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Pagination controls - Only show when limit is not provided or larger than pageSize */}
      {(!limit || limit > pageSize) && totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 px-4 py-3">
          <div className="flex-1 flex justify-between sm:hidden">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage <= 1}
            >
              Précédent
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage >= totalPages}
            >
              Suivant
            </Button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Affichage de <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span> à{" "}
                <span className="font-medium">
                  {Math.min(currentPage * pageSize, filteredOperations.length)}
                </span>{" "}
                sur <span className="font-medium">{filteredOperations.length}</span> résultats
              </p>
            </div>
            <div className="flex items-center gap-4">
              {/* Page size selector */}
              <div className="flex items-center gap-2">
                <label htmlFor="page-size-select" className="text-sm text-gray-600 dark:text-gray-400">
                  Afficher
                </label>
                <select
                  id="page-size-select"
                  className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-md text-sm py-1 px-2"
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1); // Reset to first page when changing page size
                  }}
                >
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="50">50</option>
                </select>
                <span className="text-sm text-gray-600 dark:text-gray-400">par page</span>
              </div>
              
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <Button
                  variant="outline"
                  size="sm"
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage <= 1}
                >
                  <span className="sr-only">Précédent</span>
                  <ChevronDown className="h-4 w-4 rotate-90" />
                </Button>
                
                {/* Page numbers */}
                {Array.from({ length: Math.min(5, totalPages) }).map((_, idx) => {
                  let pageNumber: number;
                  
                  // Calculate which page numbers to show
                  if (totalPages <= 5) {
                    pageNumber = idx + 1;
                  } else if (currentPage <= 3) {
                    pageNumber = idx + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNumber = totalPages - 4 + idx;
                  } else {
                    pageNumber = currentPage - 2 + idx;
                  }
                  
                  return (
                    <Button
                      key={pageNumber}
                      variant={currentPage === pageNumber ? "primary" : "outline"}
                      size="sm"
                      className="relative inline-flex items-center px-4 py-2"
                      onClick={() => setCurrentPage(pageNumber)}
                    >
                      {pageNumber}
                    </Button>
                  );
                })}
                
                <Button
                  variant="outline"
                  size="sm"
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage >= totalPages}
                >
                  <span className="sr-only">Suivant</span>
                  <ChevronDown className="h-4 w-4 -rotate-90" />
                </Button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecentOperationsTable;

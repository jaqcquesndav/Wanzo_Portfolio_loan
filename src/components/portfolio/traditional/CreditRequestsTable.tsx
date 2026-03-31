import React, { useState, useMemo } from 'react';
import { Filter, ArrowUpDown, Download, FileText, User, CreditCard, Search, Check, X, TrendingDown, RefreshCw, ArrowRight } from 'lucide-react';
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

// ─── Mappings produits API → labels affichables ──────────────────────────────
const PRODUCT_LABELS: Record<string, string> = {
  lineOfCredit: 'Ligne de crédit',
  term_loan: 'Crédit à terme',
  microfinance: 'Microfinance',
  mortgage: 'Crédit hypothécaire',
  equipment: 'Crédit équipement',
  operating_capital: 'Fonds de roulement',
  pledge: 'Nantissement',
  revolving: 'Crédit revolving',
  overdraft: 'Découvert',
  personal_loan: 'Prêt personnel',
  agricultural_loan: 'Crédit agricole',
  group_loan: 'Crédit de groupe',
};

// ─── Source système → badges ─────────────────────────────────────────────────
const SYNC_SOURCE_LABELS: Record<string, { label: string; color: string }> = {
  gestion_commerciale: { label: 'Gest. Com.', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200' },
  manual: { label: 'Manuel', color: 'bg-gray-100 text-gray-600' },
  api: { label: 'API', color: 'bg-blue-100 text-blue-700' },
};

// ─── Périodicité → unité ────────────────────────────────────────────────────
const periodicityLabel: Record<string, string> = {
  daily: 'j.', weekly: 'sem.', biweekly: 'quinz.',
  monthly: 'mois', quarterly: 'trim.', semiannual: 'semest.', annual: 'ans',
};

// ─── Helper : référence courte ───────────────────────────────────────────────
const shortRef = (id?: string | null) => id ? `#${id.slice(-8).toUpperCase()}` : '#—';

interface CreditRequestsTableProps {
  requests: CreditRequest[];
  onValidate: (id: string) => void;
  onRefuse: (id: string) => void;
  onDisburse: (id: string) => void;
  onView: (id: string) => void;
  /** companyId = UUID entreprise; companyName = nom lisible */
  onViewCompany?: (companyId: string, companyName?: string) => void;
  onCreateContract?: (id: string) => void;
  onRefresh?: () => void;
  loading?: boolean;
  /** Map memberId → nom entreprise (fallback si companyName absent) */
  companyNames?: Record<string, string>;
  /** Map productId → label produit (fallback si non dans PRODUCT_LABELS) */
  productNames?: Record<string, string>;
}

// Mapping des statuts pour l'affichage cohérent
const statusConfig: Record<CreditRequestStatus, { label: string; variant: 'success' | 'error' | 'warning' | 'primary' | 'secondary' }> = {
  draft:        { label: 'Brouillon',    variant: 'secondary' },
  submitted:    { label: 'Soumise',      variant: 'secondary' },
  under_review: { label: 'En revue',     variant: 'warning'   },
  pending:      { label: 'En attente',   variant: 'warning'   },
  analysis:     { label: 'En analyse',   variant: 'primary'   },
  approved:     { label: 'Approuvée',    variant: 'success'   },
  rejected:     { label: 'Rejetée',      variant: 'error'     },
  canceled:     { label: 'Annulée',      variant: 'secondary' },
  disbursed:    { label: 'Décaissée',    variant: 'primary'   },
  active:       { label: 'Active',       variant: 'success'   },
  closed:       { label: 'Fermée',       variant: 'secondary' },
  defaulted:    { label: 'En défaut',    variant: 'error'     },
  restructured: { label: 'Restructurée', variant: 'warning'   },
  consolidated: { label: 'Consolidée',   variant: 'primary'   },
  in_litigation:{ label: 'En litige',    variant: 'error'     },
};

export const CreditRequestsTable: React.FC<CreditRequestsTableProps> = ({ 
  requests, 
  onValidate, 
  onRefuse, 
  onDisburse, 
  onView,
  onViewCompany,
  onCreateContract,
  onRefresh,
  loading = false,
  companyNames = {},
  productNames = {}
}) => {
  // états pour les filtres et la pagination
  const [searchTerm, setSearchTerm]       = useState('');
  const [statusFilter, setStatusFilter]   = useState<CreditRequestStatus | ''>('');
  const [sourceFilter, setSourceFilter]   = useState('');
  const [showFilters, setShowFilters]     = useState(false);
  const [page, setPage]                   = useState(1);
  const [sortField, setSortField]         = useState<keyof CreditRequest | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const { formatAmount } = useCurrencyContext();
  const pageSize = 10;

  // Sources disponibles dans les données
  const availableSources = useMemo(() => {
    const sources = new Set(
      requests.map(r => r.metadata?.syncedFrom).filter(Boolean) as string[]
    );
    return Array.from(sources);
  }, [requests]);

  // Statistiques
  const stats = useMemo(() => {
    const s = { total: 0, pending: 0, approved: 0, rejected: 0, disbursed: 0, totalAmount: 0 };
    requests.forEach(r => {
      s.total++;
      s.totalAmount += r.requestAmount || 0;
      if (['pending','submitted','under_review','analysis'].includes(r.status)) s.pending++;
      else if (r.status === 'approved') s.approved++;
      else if (['rejected','canceled'].includes(r.status)) s.rejected++;
      else if (['disbursed','active'].includes(r.status)) s.disbursed++;
    });
    return s;
  }, [requests]);

  // Filtrer et trier
  const filteredAndSortedData = useMemo(() => {
    let filtered = [...requests];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(req =>
        req.id.toLowerCase().includes(term) ||
        // Nom entreprise (API ou cache)
        (req.companyName && req.companyName.toLowerCase().includes(term)) ||
        (companyNames[req.memberId] && companyNames[req.memberId].toLowerCase().includes(term)) ||
        // Produit
        (PRODUCT_LABELS[req.productId] || req.productId).toLowerCase().includes(term) ||
        (productNames[req.productId] && productNames[req.productId].toLowerCase().includes(term)) ||
        // Objet / motif
        (req.financingPurpose && req.financingPurpose.toLowerCase().includes(term)) ||
        (req.reason && req.reason.toLowerCase().includes(term)) ||
        // Montant
        formatAmount(req.requestAmount).includes(term)
      );
    }

    if (statusFilter) {
      filtered = filtered.filter(req => req.status === statusFilter);
    }

    if (sourceFilter) {
      filtered = filtered.filter(req => req.metadata?.syncedFrom === sourceFilter);
    }

    if (sortField) {
      filtered.sort((a, b) => {
        // Tri par date réception ou création
        if (sortField === 'receptionDate' || sortField === 'createdAt') {
          const aD = new Date((a[sortField] || a.createdAt) as string).getTime();
          const bD = new Date((b[sortField] || b.createdAt) as string).getTime();
          return sortDirection === 'asc' ? aD - bD : bD - aD;
        }
        const aVal = a[sortField];
        const bVal = b[sortField];
        if (aVal !== undefined && bVal !== undefined) {
          if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
          if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return filtered;
  }, [requests, searchTerm, statusFilter, sourceFilter, sortField, sortDirection, companyNames, productNames, formatAmount]);

  // Pagination
  const totalPages    = Math.ceil(filteredAndSortedData.length / pageSize);
  const currentPageData = filteredAndSortedData.slice((page - 1) * pageSize, page * pageSize);
  
  // Trier
  const handleSort = (field: keyof CreditRequest) => {
    if (sortField === field) setSortDirection(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDirection('asc'); }
  };

  // Export Excel
  const handleExportExcel = () => {
    const dataToExport = filteredAndSortedData.map(req => ({
      'Référence': req.id,
      'Réf. courte': shortRef(req.id),
      'Entreprise': req.companyName || companyNames[req.memberId] || req.memberId,
      'Produit': PRODUCT_LABELS[req.productId] || productNames[req.productId] || req.productId,
      'Objet': req.financingPurpose || req.reason || '',
      'Montant': formatAmount(req.requestAmount),
      'Devise': req.currency,
      'Statut': statusConfig[req.status]?.label || req.status,
      'Date réception': new Date(req.receptionDate || req.createdAt).toLocaleDateString('fr-FR'),
      'Taux': req.interestRate > 0 ? `${req.interestRate}%` : 'Sans intérêt',
      'Durée': `${req.schedulesCount} ${periodicityLabel[req.periodicity] || req.periodicity}`,
      'Source': req.metadata?.syncedFrom ? (SYNC_SOURCE_LABELS[req.metadata.syncedFrom]?.label || req.metadata.syncedFrom) : 'Manuel',
    }));
    exportToExcel(dataToExport, 'Demandes_de_credit');
  };

  // Export PDF
  const handleExportPDF = () => {
    exportToPDF({
      title: 'Demandes de crédit',
      headers: ['Réf.', 'Entreprise', 'Produit', 'Objet', 'Montant', 'Statut', 'Date réception'],
      data: filteredAndSortedData.map(req => [
        shortRef(req.id),
        req.companyName || companyNames[req.memberId] || req.memberId,
        PRODUCT_LABELS[req.productId] || productNames[req.productId] || req.productId,
        (req.financingPurpose || req.reason || '').slice(0, 40),
        formatAmount(req.requestAmount),
        statusConfig[req.status]?.label || req.status,
        new Date(req.receptionDate || req.createdAt).toLocaleDateString('fr-FR'),
      ]),
      filename: 'Demandes_de_credit',
    });
  };
  
  // Afficher le loader si besoin
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <TableSkeleton columns={8} rows={5} />
      </div>
    );
  }

  return (
    <>
      {/* En-tête avec statistiques — couleurs de marque */}
      <div className="bg-gradient-to-r from-[#156088] via-[#197ca8] to-[#1e90c3] text-white p-4 rounded-t-lg">
        <div className="flex flex-wrap justify-between items-center gap-3">
          <h3 className="text-lg font-bold">Demandes de crédit</h3>
          <div className="flex flex-wrap items-center gap-5">
            <StatItem value={stats.total}     label="Total"      />
            <StatItem value={stats.pending}   label="En cours"   color="text-yellow-200" />
            <StatItem value={stats.approved}  label="Approuvées" color="text-green-200"  />
            <StatItem value={stats.rejected}  label="Refusées"   color="text-red-200"    />
            <StatItem value={stats.disbursed} label="Décaissées" color="text-blue-200"   />
          </div>
        </div>
        {stats.totalAmount > 0 && (
          <p className="mt-1.5 text-xs text-blue-100">
            Montant total : <span className="font-semibold text-white">{formatAmount(stats.totalAmount)}</span>
          </p>
        )}
      </div>

      {/* Barre de recherche et filtres */}
      <div className="bg-white dark:bg-gray-800 p-3 border-b dark:border-gray-700">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative w-full md:w-72">
              <Input
                placeholder="Entreprise, objet, référence..."
                value={searchTerm}
                onChange={e => { setSearchTerm(e.target.value); setPage(1); }}
                className="pl-8 text-sm"
              />
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>

            <Select
              value={statusFilter}
              onChange={e => { setStatusFilter(e.target.value as CreditRequestStatus | ''); setPage(1); }}
              className="text-sm"
            >
              <option value="">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="submitted">Soumise</option>
              <option value="under_review">En revue</option>
              <option value="analysis">En analyse</option>
              <option value="approved">Approuvées</option>
              <option value="rejected">Refusées</option>
              <option value="disbursed">Décaissées</option>
              <option value="active">Actives</option>
              <option value="defaulted">En défaut</option>
            </Select>

            {availableSources.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(f => !f)}
                className={showFilters ? 'bg-blue-50 text-blue-700 border-blue-300' : ''}
              >
                <Filter className="h-4 w-4 mr-1" />
                Source
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleExportExcel}
              disabled={filteredAndSortedData.length === 0} title="Exporter en Excel">
              <Download className="h-4 w-4 mr-1" />Excel
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportPDF}
              disabled={filteredAndSortedData.length === 0} title="Exporter en PDF">
              <FileText className="h-4 w-4 mr-1" />PDF
            </Button>
            {onRefresh && (
              <Button variant="ghost" size="sm" onClick={onRefresh}
                title="Actualiser les demandes" className="text-gray-500 hover:text-primary">
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            )}
          </div>
        </div>

        {/* Source filter chips */}
        {showFilters && availableSources.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            <button onClick={() => setSourceFilter('')}
              className={`px-2 py-0.5 text-xs rounded-full border transition-colors ${
                !sourceFilter ? 'bg-[#197ca8] text-white border-[#197ca8]' : 'border-gray-300 text-gray-600 hover:border-gray-400'
              }`}>
              Toutes sources
            </button>
            {availableSources.map(src => {
              const info = SYNC_SOURCE_LABELS[src];
              return (
                <button key={src} onClick={() => setSourceFilter(src === sourceFilter ? '' : src)}
                  className={`px-2 py-0.5 text-xs rounded-full border flex items-center gap-1 transition-colors ${
                    sourceFilter === src
                      ? 'bg-purple-600 text-white border-purple-600'
                      : `${info?.color || 'border-gray-300 text-gray-600'} hover:opacity-80`
                  }`}>
                  <RefreshCw className="h-2.5 w-2.5" />
                  {info?.label || src}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Bandéau résultat filtres */}
      {(searchTerm || statusFilter || sourceFilter) && (
        <div className="bg-blue-50 dark:bg-blue-900/20 px-4 py-1.5 text-xs text-blue-700 dark:text-blue-300 border-b">
          {filteredAndSortedData.length} résultat{filteredAndSortedData.length !== 1 ? 's' : ''} sur {requests.length}
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="ml-2 bg-blue-100 dark:bg-blue-800 px-1.5 py-0.5 rounded">
              "{searchTerm}" ×
            </button>
          )}
        </div>
      )}

      {/* Tableau principal */}
      <div className="bg-white dark:bg-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHead>
              <TableRow>
                <TableHeader className="cursor-pointer whitespace-nowrap" onClick={() => handleSort('id')}>
                  Réf. <ArrowUpDown className="h-3 w-3 inline ml-1" />
                </TableHeader>
                <TableHeader className="cursor-pointer" onClick={() => handleSort('memberId')}>
                  Client <ArrowUpDown className="h-3 w-3 inline ml-1" />
                </TableHeader>
                <TableHeader>Objet / Produit</TableHeader>
                <TableHeader className="cursor-pointer" onClick={() => handleSort('requestAmount')}>
                  Montant <ArrowUpDown className="h-3 w-3 inline ml-1" />
                </TableHeader>
                <TableHeader className="cursor-pointer" onClick={() => handleSort('status')}>
                  Statut <ArrowUpDown className="h-3 w-3 inline ml-1" />
                </TableHeader>
                <TableHeader className="cursor-pointer whitespace-nowrap" onClick={() => handleSort('receptionDate')}>
                  Date réception <ArrowUpDown className="h-3 w-3 inline ml-1" />
                </TableHeader>
                <TableHeader>Dossier</TableHeader>
                <TableHeader>Actions</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {currentPageData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="p-0">
                    <EmptyState
                      icon={CreditCard}
                      title={searchTerm || statusFilter ? 'Aucun résultat' : 'Aucune demande de crédit'}
                      description={
                        searchTerm || statusFilter
                          ? 'Essayez de modifier vos critères de recherche ou filtres.'
                          : 'Les demandes de crédit apparaîtront ici une fois soumises par les clients.'
                      }
                      size="sm"
                    />
                  </TableCell>
                </TableRow>
              ) : (
                currentPageData.map(request => {
                  const companyDisplayName =
                    request.companyName ||
                    (request.memberId ? companyNames[request.memberId] : null) ||
                    (request.memberId ? `Client #${request.memberId.slice(-6).toUpperCase()}` : 'Client inconnu');
                  const productLabel =
                    PRODUCT_LABELS[request.productId] ||
                    productNames[request.productId] ||
                    request.productId;
                  const syncSource = request.metadata?.syncedFrom;
                  const sourceInfo = syncSource ? SYNC_SOURCE_LABELS[syncSource] : null;
                  const displayDate = request.receptionDate || request.createdAt;
                  const hasFinancialData =
                    request.metadata?.financialInformation &&
                    Object.values(request.metadata.financialInformation).some(v => v !== 0 && v !== undefined);

                  return (
                    <TableRow key={request.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">

                      {/* Référence courte + badges */}
                      <TableCell className="font-mono">
                        <button
                          className="font-semibold text-[#197ca8] hover:text-[#156088] hover:underline text-sm"
                          onClick={() => onView(request.id)}
                          title={`ID complet : ${request.id}`}
                        >
                          {shortRef(request.id)}
                        </button>
                        <div className="flex flex-wrap gap-1 mt-1">
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                            {productLabel}
                          </span>
                          {sourceInfo && (
                            <span className={`inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded ${sourceInfo.color}`}>
                              <RefreshCw className="h-2.5 w-2.5" />
                              {sourceInfo.label}
                            </span>
                          )}
                        </div>
                      </TableCell>

                      {/* Client */}
                      <TableCell>
                        <button
                          className="flex items-center gap-1.5 text-sm font-medium hover:text-[#197ca8] hover:underline text-left"
                          onClick={() => onViewCompany && onViewCompany(request.companyId || request.memberId, companyDisplayName)}
                          title={`ID membre : ${request.memberId}`}
                        >
                          <User className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                          <span>{companyDisplayName}</span>
                        </button>
                        {request.isGroup && (
                          <span className="text-[10px] text-purple-600 font-medium">• Demande groupe</span>
                        )}
                      </TableCell>

                      {/* Objet / Motif */}
                      <TableCell className="max-w-[200px]">
                        <p
                          className="text-sm text-gray-800 dark:text-gray-200 truncate leading-snug"
                          title={request.financingPurpose || request.reason}
                        >
                          {request.financingPurpose || request.reason || (
                            <span className="text-gray-400 italic text-xs">Non précisé</span>
                          )}
                        </p>
                        {hasFinancialData && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5">
                            <TrendingDown className="h-2.5 w-2.5" />
                            Données financ. dispos.
                          </span>
                        )}
                      </TableCell>

                      {/* Montant */}
                      <TableCell className="whitespace-nowrap">
                        <span className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                          {formatAmount(request.requestAmount)}
                        </span>
                        <span className="text-[10px] text-gray-400 ml-1">{request.currency}</span>
                        <div className="text-xs text-gray-500 mt-0.5">
                          {request.interestRate > 0 ? `${request.interestRate}%` : 'Sans intérêt'}
                          {' · '}
                          {request.schedulesCount} {periodicityLabel[request.periodicity] || request.periodicity}
                          {request.deferredPaymentsCount > 0 && (
                            <span className="ml-1 text-orange-500">+{request.deferredPaymentsCount} diff.</span>
                          )}
                        </div>
                      </TableCell>

                      {/* Statut */}
                      <TableCell>
                        <Badge variant={statusConfig[request.status]?.variant || 'secondary'}>
                          {statusConfig[request.status]?.label || request.status}
                        </Badge>
                      </TableCell>

                      {/* Date réception */}
                      <TableCell className="whitespace-nowrap text-sm">
                        <span className="text-gray-800 dark:text-gray-200">
                          {new Date(displayDate).toLocaleDateString('fr-FR')}
                        </span>
                        <span className="text-xs text-gray-400 block">
                          {new Date(displayDate).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {request.receptionDate && request.createdAt && request.receptionDate !== request.createdAt && (
                          <span className="text-[10px] text-gray-400 italic">
                            créée {new Date(request.createdAt).toLocaleDateString('fr-FR')}
                          </span>
                        )}
                      </TableCell>

                      {/* Dossier */}
                      <TableCell>
                        {request.documents && request.documents.length > 0 ? (
                          <div className="flex items-center gap-1">
                            <FileText className="h-4 w-4 text-[#197ca8]" />
                            <span className="text-sm font-medium text-[#197ca8]">{request.documents.length}</span>
                            <span className="text-xs text-gray-500">
                              {request.documents.length === 1 ? 'doc' : 'docs'}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 italic">—</span>
                        )}
                      </TableCell>

                      {/* Actions */}
                      <TableCell>
                        <ActionsDropdown
                          actions={[
                            {
                              label: 'Voir détails',
                              onClick: () => onView(request.id),
                              icon: <FileText className="h-4 w-4 mr-2" />,
                            },
                            ['pending','submitted','under_review','analysis'].includes(request.status) ? {
                              label: 'Approuver',
                              onClick: () => onValidate(request.id),
                              className: 'text-green-600 hover:text-green-800',
                              icon: <Check className="h-4 w-4 mr-2" />,
                            } : null,
                            ['pending','submitted','under_review','analysis'].includes(request.status) ? {
                              label: 'Refuser',
                              onClick: () => onRefuse(request.id),
                              className: 'text-red-600 hover:text-red-800',
                              icon: <X className="h-4 w-4 mr-2" />,
                            } : null,
                            request.status === 'approved' ? {
                              label: 'Décaissement',
                              onClick: () => onDisburse(request.id),
                              className: 'text-blue-600 hover:text-blue-800',
                              icon: <CreditCard className="h-4 w-4 mr-2" />,
                            } : null,
                            request.status === 'approved' && onCreateContract ? {
                              label: 'Créer contrat',
                              onClick: () => onCreateContract(request.id),
                              className: 'text-purple-600 hover:text-purple-800',
                              icon: <ArrowRight className="h-4 w-4 mr-2" />,
                            } : null,
                            onViewCompany ? {
                              label: 'Voir entreprise',
                              onClick: () => onViewCompany(request.companyId || request.memberId, companyDisplayName),
                              className: 'text-indigo-600 hover:text-indigo-800',
                              icon: <User className="h-4 w-4 mr-2" />,
                            } : null,
                          ].filter(Boolean) as { label: string; onClick: () => void; className?: string; icon?: React.ReactNode }[]}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white dark:bg-gray-800 p-4 border-t dark:border-gray-700">
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

// ─── StatItem : badge statistique dans l’en-tête ────────────────────────────
interface StatItemProps { value: number; label: string; color?: string; }
const StatItem: React.FC<StatItemProps> = ({ value, label, color = 'text-white' }) => (
  <div className="text-center min-w-[44px]">
    <div className={`text-xl font-bold ${color}`}>{value}</div>
    <div className="text-[10px] uppercase tracking-wide opacity-80">{label}</div>
  </div>
);


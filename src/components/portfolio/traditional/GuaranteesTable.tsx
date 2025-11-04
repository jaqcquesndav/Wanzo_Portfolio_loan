import { useState, useMemo } from 'react';
import { Filter, ArrowUpDown, Download, Info, Shield } from 'lucide-react';
import { ActionsDropdown } from '../../ui/ActionsDropdown';
import { Input } from '../../ui/Input';
import { Button } from '../../ui/Button';
import { Select } from '../../ui/Select';
import { Badge } from '../../ui/Badge';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../../ui/Table';
import { Pagination } from '../../ui/Pagination';
import { TableSkeleton } from '../../ui/TableSkeleton';
import { exportToExcel, exportToPDF } from '../../../utils/exports';
import { Guarantee } from '../../../types/guarantee';
import { useCurrencyContext } from '../../../hooks/useCurrencyContext';

interface GuaranteesTableProps {
  guarantees: Guarantee[];
  onRelease: (id: string) => void;
  onSeize: (id: string) => void;
  onView: (id: string) => void;
  loading?: boolean;
}

// Configuration pour l'affichage des types de garanties
const guaranteeTypeConfig: Record<string, { label: string; color: string; icon?: React.ReactNode }> = {
  'materiel': { label: 'Garantie Matériel', color: 'bg-blue-100 text-blue-700' },
  'immobilier': { label: 'Garantie Immobilier', color: 'bg-indigo-100 text-indigo-700' },
  'caution_bancaire': { label: 'Caution Bancaire', color: 'bg-purple-100 text-purple-700' },
  'fonds_garantie': { label: 'Fonds de Garantie', color: 'bg-green-100 text-green-700' },
  'assurance_credit': { label: 'Assurance cRédit', color: 'bg-teal-100 text-teal-700' },
  'nantissement': { label: 'Nantissement', color: 'bg-orange-100 text-orange-700' },
  'gage': { label: 'Gage', color: 'bg-amber-100 text-amber-700' },
  'hypotheque': { label: 'Hypothèque', color: 'bg-rose-100 text-rose-700' },
  'depot_especes': { label: 'dûpôt Espèces', color: 'bg-cyan-100 text-cyan-700' },
  'autre': { label: 'Autre', color: 'bg-gray-100 text-gray-700' },
  // Pour la Rétrocompatibilité avec les anciennes données
  'Hypothèque': { label: 'Hypothèque', color: 'bg-rose-100 text-rose-700' },
  'Caution bancaire': { label: 'Caution Bancaire', color: 'bg-purple-100 text-purple-700' },
  'dûpôt espèces': { label: 'dûpôt Espèces', color: 'bg-cyan-100 text-cyan-700' },
};

// Configuration pour l'affichage des statuts
const statusConfig = {
  'active': { label: 'Active', variant: 'warning', color: 'bg-yellow-100 text-yellow-700' },
  'pending': { label: 'En attente', variant: 'warning', color: 'bg-amber-100 text-amber-700' },
  'libéRée': { label: 'LibéRée', variant: 'success', color: 'bg-green-100 text-green-700' },
  'saisie': { label: 'Saisie', variant: 'error', color: 'bg-red-100 text-red-700' },
  'expiRée': { label: 'ExpiRée', variant: 'secondary', color: 'bg-gray-100 text-gray-700' },
};

export const GuaranteesTable: React.FC<GuaranteesTableProps> = ({ 
  guarantees, 
  onRelease, 
  onSeize, 
  onView,
  loading = false
}) => {
  // états pour les filtres et la pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const { formatAmount } = useCurrencyContext();
  const pageSize = 10;

  /* 
   * Compter les garanties par type - Code conservé pour une future implémentation 
   * d'un graphique de Répartition des garanties
   * 
  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    guarantees.forEach(g => {
      const type = g.type;
      counts[type] = (counts[type] || 0) + 1;
    });
    return counts;
  }, [guarantees]);
  */
  
  // Compter les garanties par statut
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {
      active: 0,
      libéRée: 0,
      saisie: 0,
      expiRée: 0,
      total: 0
    };
    
    guarantees.forEach(g => {
      counts.total++;
      counts[g.status] = (counts[g.status] || 0) + 1;
    });
    
    return counts;
  }, [guarantees]);
  
  // Filtrer et trier les données
  const filteredAndSortedData = useMemo(() => {
    let filtered = [...guarantees];
    
    // Appliquer le filtre de recherche
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(g => 
        g.company.toLowerCase().includes(term) || 
        g.id.toLowerCase().includes(term) ||
        (guaranteeTypeConfig[g.type]?.label || g.type).toLowerCase().includes(term)
      );
    }
    
    // Appliquer le filtre de type
    if (typeFilter) {
      filtered = filtered.filter(g => g.type === typeFilter);
    }
    
    // Appliquer le filtre de statut
    if (statusFilter) {
      filtered = filtered.filter(g => g.status === statusFilter);
    }
    
    // Appliquer le tri
    if (sortField) {
      filtered.sort((a, b) => {
        const aValue = a[sortField as keyof Guarantee];
        const bValue = b[sortField as keyof Guarantee];
        
        // Pour les dates
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
  }, [guarantees, searchTerm, typeFilter, statusFilter, sortField, sortDirection]);

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
    const dataToExport = filteredAndSortedData.map(g => ({
      'référence': g.id,
      'Entreprise': g.company,
      'Type de garantie': guaranteeTypeConfig[g.type]?.label || g.type,
      'Sous-type': g.subType || 'N/A',
      'Valeur': formatAmount(g.value),
      'Statut': statusConfig[g.status]?.label || g.status,
      'Date de cRéation': new Date(g.created_at).toLocaleDateString(),
      'Date d\'expiration': g.expiry_date ? new Date(g.expiry_date).toLocaleDateString() : 'N/A',
      'Description': g.details?.description || '',
      'Fournisseur': g.details?.provider || '',
      'Couverture (%)': g.details?.coverage || '',
    }));
    
    exportToExcel(dataToExport, 'Garanties');
  };
  
  // Export PDF
  const handleExportPDF = () => {
    exportToPDF({
      title: 'Liste des Garanties',
      headers: ['référence', 'Entreprise', 'Type', 'Valeur', 'Statut', 'Date'],
      data: filteredAndSortedData.map(g => [
        g.id,
        g.company,
        guaranteeTypeConfig[g.type]?.label || g.type,
        formatAmount(g.value),
        statusConfig[g.status]?.label || g.status,
        new Date(g.created_at).toLocaleDateString(),
      ]),
      filename: 'Garanties.pdf'
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
      {/* En-tête avec Résumé et statistiques */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white p-4 rounded-t-lg mb-0">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold">Garanties</h3>
          <div className="flex items-center space-x-6">
            <div>
              <span className="text-xs block text-gray-200">Total</span>
              <span className="font-semibold">{statusCounts.total}</span>
            </div>
            <div>
              <span className="text-xs block text-gray-200">Actives</span>
              <span className="font-semibold text-yellow-300">{statusCounts.active}</span>
            </div>
            <div>
              <span className="text-xs block text-gray-200">LibéRées</span>
              <span className="font-semibold text-green-300">{statusCounts.libéRée}</span>
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
                placeholder="Rechercher une garantie..."
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
                  Type de garantie
                </label>
                <Select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <option value="">Tous les types</option>
                  <option value="materiel">Garantie Matériel</option>
                  <option value="immobilier">Garantie Immobilier</option>
                  <option value="caution_bancaire">Caution Bancaire</option>
                  <option value="fonds_garantie">Fonds de Garantie</option>
                  <option value="assurance_credit">Assurance cRédit</option>
                  <option value="nantissement">Nantissement</option>
                  <option value="gage">Gage</option>
                  <option value="hypotheque">Hypothèque</option>
                  <option value="depot_especes">dûpôt Espèces</option>
                  <option value="autre">Autre</option>
                </Select>
              </div>
              
              <div className="w-full max-w-xs">
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                  Statut
                </label>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">Tous les statuts</option>
                  <option value="active">Active</option>
                  <option value="libéRée">LibéRée</option>
                  <option value="saisie">Saisie</option>
                  <option value="expiRée">ExpiRée</option>
                </Select>
              </div>
              
              <div className="flex items-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchTerm('');
                    setTypeFilter('');
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
                <TableHeader className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700">
                  <div onClick={() => handleSort('type')} className="flex items-center">
                    Type
                    {sortField === 'type' && (
                      <ArrowUpDown className={`inline ml-1 h-4 w-4 ${sortDirection === 'asc' ? 'transform rotate-180' : ''}`} />
                    )}
                  </div>
                </TableHeader>
                <TableHeader className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700">
                  <div onClick={() => handleSort('value')} className="flex items-center">
                    Valeur
                    {sortField === 'value' && (
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
                <TableHeader>Infos</TableHeader>
                <TableHeader className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700">
                  <div onClick={() => handleSort('created_at')} className="flex items-center">
                    Date
                    {sortField === 'created_at' && (
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
                  <TableCell colSpan={7} className="text-center py-8 text-gray-400">
                    Aucune garantie ne correspond aux critères de recherche
                  </TableCell>
                </TableRow>
              ) : (
                currentPageData.map((g) => (
                  <TableRow
                    key={g.id}
                    onClick={e => {
                      if ((e.target as HTMLElement).closest('.actions-dropdown')) return;
                      onView(g.id);
                    }}
                    tabIndex={0}
                    aria-label={`Voir la garantie de ${g.company}`}
                    style={{ outline: 'none' }}
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        onView(g.id);
                      }
                    }}
                    className="cursor-pointer"
                  >
                    <TableCell className="font-medium">{g.company}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        {g.type === 'assurance_credit' && <Shield className="w-4 h-4 mr-1 text-teal-600" />}
                        <span className={`px-2 py-1 rounded text-xs font-medium ${guaranteeTypeConfig[g.type]?.color || 'bg-gray-100 text-gray-700'}`}>
                          {guaranteeTypeConfig[g.type]?.label || g.type}
                        </span>
                      </div>
                      {g.subType && (
                        <div className="text-xs text-gray-500 mt-1">{g.subType}</div>
                      )}
                    </TableCell>
                    <TableCell>{formatAmount(g.value)}</TableCell>
                    <TableCell>
                      <Badge variant={statusConfig[g.status].variant as "warning" | "success" | "error" | "secondary" | "primary" | "danger"}>
                        {statusConfig[g.status].label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {g.details && (
                        <div className="relative group inline-block">
                          <span className="cursor-help">
                            <Info className="w-4 h-4 text-blue-500" />
                          </span>
                          <div className="absolute z-50 invisible group-hover:visible bg-white dark:bg-gray-800 p-2 rounded shadow-lg border border-gray-200 dark:border-gray-700 w-64 text-sm left-0 mt-1">
                            <div className="p-2 max-w-xs">
                              {g.details.description && <p><strong>Description:</strong> {g.details.description}</p>}
                              {g.details.provider && <p><strong>Fournisseur:</strong> {g.details.provider}</p>}
                              {g.details.coverage && <p><strong>Couverture:</strong> {g.details.coverage}%</p>}
                              {g.details.reference && <p><strong>référence:</strong> {g.details.reference}</p>}
                            </div>
                          </div>
                        </div>
                      )}
                      {g.expiry_date && (
                        <div className="text-xs text-gray-500 mt-1">
                          Exp: {new Date(g.expiry_date).toLocaleDateString()}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>{new Date(g.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-center overflow-visible relative">
                      <div className="actions-dropdown inline-block">
                        <ActionsDropdown
                          actions={[

                            g.status === 'active' ? { label: 'Mainlevée', onClick: () => onRelease(g.id) } : null,
                            g.status === 'active' ? { label: 'Saisir', onClick: () => onSeize(g.id) } : null,
                            g.details?.document_url ? { 
                              label: 'Télécharger', 
                              onClick: () => window.open(g.details?.document_url, '_blank') 
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


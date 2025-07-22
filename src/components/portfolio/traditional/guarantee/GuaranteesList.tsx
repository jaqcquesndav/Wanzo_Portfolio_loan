import React, { useState, useMemo } from 'react';
import { ArrowUpDown, Download, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Input } from '../../../ui/Input';
import { Button } from '../../../ui/Button';
import { Select } from '../../../ui/Select';
import { Badge } from '../../../ui/Badge';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../../../ui/Table';
import { Pagination } from '../../../ui/Pagination';
import { TableSkeleton } from '../../../ui/TableSkeleton';
import { ConfirmDialog } from '../../../ui/ConfirmDialog';
import { exportToExcel, exportToPDF } from '../../../../utils/export';
// Importation explicitement utilisée pour le typage
import type { Guarantee } from '../GuaranteesTable';
import { ActionMenu } from './ActionMenu';
import { useGuarantees } from '../../../../hooks/useGuarantees';
import { useGuaranteeActions } from '../../../../hooks/useGuaranteeActions';

// Configuration pour l'affichage des types de garanties
const guaranteeTypeConfig: Record<string, { label: string; color: string }> = {
  'materiel': { label: 'Garantie Matériel', color: 'bg-blue-100 text-blue-700' },
  'immobilier': { label: 'Garantie Immobilier', color: 'bg-indigo-100 text-indigo-700' },
  'caution_bancaire': { label: 'Caution Bancaire', color: 'bg-purple-100 text-purple-700' },
  'fonds_garantie': { label: 'Fonds de Garantie', color: 'bg-green-100 text-green-700' },
  'assurance_credit': { label: 'Assurance Crédit', color: 'bg-teal-100 text-teal-700' },
  'nantissement': { label: 'Nantissement', color: 'bg-orange-100 text-orange-700' },
  'gage': { label: 'Gage', color: 'bg-amber-100 text-amber-700' },
  'hypotheque': { label: 'Hypothèque', color: 'bg-rose-100 text-rose-700' },
  'depot_especes': { label: 'Dépôt Espèces', color: 'bg-cyan-100 text-cyan-700' },
  'autre': { label: 'Autre', color: 'bg-gray-100 text-gray-700' },
};

// Configuration pour l'affichage des statuts
const statusConfig: Record<string, { label: string; color: string }> = {
  'active': { label: 'Active', color: 'bg-green-100 text-green-700' },
  'libérée': { label: 'Libérée', color: 'bg-blue-100 text-blue-700' },
  'saisie': { label: 'Saisie', color: 'bg-red-100 text-red-700' },
  'expirée': { label: 'Expirée', color: 'bg-gray-100 text-gray-700' },
};

// Type explicitement utilisé pour les filtres et les transformations
type FilterableGuarantee = Guarantee;

interface GuaranteesListProps {
  portfolioId: string;
}

export function GuaranteesList({ portfolioId }: GuaranteesListProps) {
  const { guarantees, loading, error } = useGuarantees(portfolioId);
  const navigate = useNavigate();
  const {
    showConfirmDelete,
    showConfirmStatusChange,
    guaranteeToAction,
    newStatusToApply,
    handleDeleteGuarantee,
    confirmDeleteGuarantee,
    handleStatusChange,
    handleRelease,
    handleSeize,
    handleViewDetails,
    setShowConfirmDelete,
    setShowConfirmStatusChange
  } = useGuaranteeActions(portfolioId);

  // État pour la pagination et le filtrage
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10; // Nombre fixe d'éléments par page
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<string>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [filterType, setFilterType] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');

  // Filtrer et trier les garanties
  const filteredGuarantees = useMemo(() => {
    return guarantees
      .filter(g => {
        const matchesSearch = searchTerm === '' || 
          g.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
          g.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (g.contractReference || '').toLowerCase().includes(searchTerm.toLowerCase());
          
        const matchesType = filterType === '' || g.type === filterType;
        const matchesStatus = filterStatus === '' || g.status === filterStatus;
        
        return matchesSearch && matchesType && matchesStatus;
      })
      .sort((a: FilterableGuarantee, b: FilterableGuarantee) => {
        let comparison = 0;
        
        if (sortField === 'company') {
          comparison = a.company.localeCompare(b.company);
        } else if (sortField === 'type') {
          comparison = a.type.localeCompare(b.type);
        } else if (sortField === 'value') {
          comparison = a.value - b.value;
        } else if (sortField === 'status') {
          comparison = a.status.localeCompare(b.status);
        } else if (sortField === 'contractReference') {
          return (a.contractReference || '').localeCompare(b.contractReference || '');
        } else if (sortField === 'created_at') {
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        }
        
        return sortDirection === 'asc' ? comparison : -comparison;
      });
  }, [guarantees, searchTerm, filterType, filterStatus, sortField, sortDirection]);

  // Pagination
  const paginatedGuarantees = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredGuarantees.slice(startIndex, startIndex + pageSize);
  }, [filteredGuarantees, currentPage, pageSize]);

  // Fonction pour changer le tri
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  // Fonction pour naviguer vers les détails du contrat
  const handleViewContractDetails = (e: React.MouseEvent, contractReference: string) => {
    e.stopPropagation(); // Empêcher la navigation vers les détails de la garantie
    if (contractReference) {
      navigate(`/app/traditional/portfolio/${portfolioId}/contracts/${contractReference}`);
    }
  };

  // Exporter les données
  const handleExport = (format: 'excel' | 'pdf') => {
    const data = filteredGuarantees.map(g => ({
      'ID': g.id,
      'Entreprise': g.company,
      'Type': guaranteeTypeConfig[g.type]?.label || g.type,
      'Valeur': g.value.toLocaleString('fr-FR') + ' XAF',
      'Statut': statusConfig[g.status]?.label || g.status,
      'Date création': new Date(g.created_at).toLocaleDateString(),
      'Date expiration': g.expiry_date ? new Date(g.expiry_date).toLocaleDateString() : 'N/A',
      'Contrat associé': g.contractReference || 'N/A'
    }));
    
    if (format === 'excel') {
      exportToExcel(data, 'Garanties');
    } else {
      // Extraire les en-têtes et les valeurs pour le PDF
      const headers = Object.keys(data[0]);
      const pdfData = data.map(row => Object.values(row));
      exportToPDF({
        title: 'Liste des Garanties',
        headers,
        data: pdfData,
        filename: 'Garanties.pdf'
      });
    }
  };

  if (loading) {
    return <TableSkeleton columns={7} rows={10} />;
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-500 rounded-md">
        Erreur: {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Barre d'outils */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div className="flex flex-col md:flex-row gap-2">
          <Input
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-80"
          />
          <div className="flex gap-2">
            <Select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full md:w-40"
            >
              <option value="">Tous les types</option>
              {Object.entries(guaranteeTypeConfig).map(([key, { label }]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </Select>
            <Select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full md:w-40"
            >
              <option value="">Tous les statuts</option>
              {Object.entries(statusConfig).map(([key, { label }]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </Select>
          </div>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Button
            variant="outline"
            size="sm"
            className="ml-auto"
            onClick={() => handleExport('excel')}
          >
            <Download className="w-4 h-4 mr-2" />
            Excel
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport('pdf')}
          >
            <Download className="w-4 h-4 mr-2" />
            PDF
          </Button>
        </div>
      </div>

      {/* Tableau */}
      <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm rounded-lg">
        <div className="overflow-x-auto">
          <Table>
            <TableHead>
              <TableRow>
                <TableHeader onClick={() => handleSort('company')} className="cursor-pointer">
                  Entreprise {sortField === 'company' && (
                    <ArrowUpDown className={`w-4 h-4 inline ml-1 ${sortDirection === 'asc' ? 'transform rotate-180' : ''}`} />
                  )}
                </TableHeader>
                <TableHeader onClick={() => handleSort('type')} className="cursor-pointer">
                  Type {sortField === 'type' && (
                    <ArrowUpDown className={`w-4 h-4 inline ml-1 ${sortDirection === 'asc' ? 'transform rotate-180' : ''}`} />
                  )}
                </TableHeader>
                <TableHeader onClick={() => handleSort('value')} className="cursor-pointer">
                  Valeur {sortField === 'value' && (
                    <ArrowUpDown className={`w-4 h-4 inline ml-1 ${sortDirection === 'asc' ? 'transform rotate-180' : ''}`} />
                  )}
                </TableHeader>
                <TableHeader onClick={() => handleSort('status')} className="cursor-pointer">
                  Statut {sortField === 'status' && (
                    <ArrowUpDown className={`w-4 h-4 inline ml-1 ${sortDirection === 'asc' ? 'transform rotate-180' : ''}`} />
                  )}
                </TableHeader>
                <TableHeader onClick={() => handleSort('contractReference')} className="cursor-pointer">
                  Contrat associé {sortField === 'contractReference' && (
                    <ArrowUpDown className={`w-4 h-4 inline ml-1 ${sortDirection === 'asc' ? 'transform rotate-180' : ''}`} />
                  )}
                </TableHeader>
                <TableHeader onClick={() => handleSort('created_at')} className="cursor-pointer">
                  Date création {sortField === 'created_at' && (
                    <ArrowUpDown className={`w-4 h-4 inline ml-1 ${sortDirection === 'asc' ? 'transform rotate-180' : ''}`} />
                  )}
                </TableHeader>
                <TableHeader className="text-center">Actions</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedGuarantees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4 text-gray-500">
                    Aucune garantie trouvée
                  </TableCell>
                </TableRow>
              ) : (
                paginatedGuarantees.map((g) => (
                  <TableRow 
                    key={g.id} 
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                    onClick={() => handleViewDetails(g.id)}
                  >
                    <TableCell className="font-medium">{g.company}</TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={guaranteeTypeConfig[g.type]?.color || 'bg-gray-100 text-gray-700'}
                      >
                        {guaranteeTypeConfig[g.type]?.label || g.type}
                      </Badge>
                    </TableCell>
                    <TableCell>{g.value.toLocaleString('fr-FR')} XAF</TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={statusConfig[g.status]?.color || 'bg-gray-100 text-gray-700'}
                      >
                        {statusConfig[g.status]?.label || g.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {g.contractReference ? (
                        <div className="flex items-center" onClick={(e) => handleViewContractDetails(e, g.contractReference || '')}>
                          <span className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer">
                            {g.contractReference}
                          </span>
                          <ExternalLink className="w-4 h-4 ml-1 text-blue-600" />
                        </div>
                      ) : (
                        <span className="text-gray-500">Non associé</span>
                      )}
                    </TableCell>
                    <TableCell>{new Date(g.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-center overflow-visible relative">
                      <div className="actions-dropdown inline-block" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                        <ActionMenu
                          guarantee={g}
                          onView={handleViewDetails}
                          onRelease={handleRelease}
                          onSeize={handleSeize}
                          onDelete={handleDeleteGuarantee}
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
      <div className="flex items-center justify-end mt-4">
        <Pagination
          currentPage={currentPage}
          totalPages={Math.ceil(filteredGuarantees.length / pageSize)}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Boîtes de dialogue de confirmation */}
      <ConfirmDialog
        isOpen={showConfirmDelete}
        onClose={() => setShowConfirmDelete(false)}
        onConfirm={confirmDeleteGuarantee}
        title="Supprimer la garantie"
        description={`Êtes-vous sûr de vouloir supprimer la garantie ${guaranteeToAction?.id} ? Cette action est irréversible.`}
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
      />

      <ConfirmDialog
        isOpen={showConfirmStatusChange}
        onClose={() => setShowConfirmStatusChange(false)}
        onConfirm={() => {
          if (guaranteeToAction && newStatusToApply) {
            handleStatusChange(guaranteeToAction, newStatusToApply);
            setShowConfirmStatusChange(false);
          }
        }}
        title={`Changer le statut en ${newStatusToApply}`}
        description={`Êtes-vous sûr de vouloir changer le statut de la garantie ${guaranteeToAction?.id} en ${newStatusToApply} ?`}
        confirmLabel="Confirmer"
        cancelLabel="Annuler"
      />
    </div>
  );
}

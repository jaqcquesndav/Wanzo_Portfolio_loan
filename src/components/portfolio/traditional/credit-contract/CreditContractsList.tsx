import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Filter, Search, Star, X } from 'lucide-react';
import { useCreditContracts } from '../../../../hooks/useCreditContracts';
import { Card } from '../../../ui/Card';
import { Button } from '../../../ui/Button';
import { Badge } from '../../../ui/Badge';
import { Input } from '../../../ui/Input';
import { Select } from '../../../ui/Select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../ui/Table';
import { TableSkeleton } from '../../../ui/TableSkeleton';
import { ErrorDisplay } from '../../../common/ErrorDisplay';
import { useNotification } from '../../../../contexts/useNotification';
import { ConfirmDialog } from '../../../ui/ConfirmDialog';
import { formatAmount, formatDate, statusConfig } from '../../../../utils/credit';
import { ActionMenu } from './ActionMenu';
import { useContractActions } from '../../../../hooks/useContractActions';
import { CreditContract } from '../../../../types/credit-contract';

interface CreditContractsListProps {
  portfolioId?: string;
  onViewCompany?: (companyId: string) => void; // ✅ FIX: Changed from companyName to companyId
}

export function CreditContractsList({ 
  portfolioId = 'default',
  onViewCompany
}: CreditContractsListProps) {
  const { contracts, loading, error, resetToMockData } = useCreditContracts(portfolioId);
  const { showNotification } = useNotification();
  const navigate = useNavigate();
  
  // États locaux pour gérer les modals et actions
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showConfirmStatusChange, setShowConfirmStatusChange] = useState(false);
  const [contractToAction, setContractToAction] = useState<CreditContract | null>(null);
  const [newStatusToApply, setNewStatusToApply] = useState<'active' | 'completed' | 'defaulted' | 'suspended' | 'in_litigation' | null>(null);
  
  const {
    handleGeneratePDF,
    handleViewSchedule,
    handleUpdateContract,
    handleDeleteContract
  } = useContractActions(portfolioId);

  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{top: number, left: number} | null>(null);
  
  // États pour le filtrage et la recherche
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [amountRangeFilter, setAmountRangeFilter] = useState({min: '', max: ''});
  const [dateRangeFilter, setDateRangeFilter] = useState({start: '', end: ''});
  const [showFilters, setShowFilters] = useState(false);
  
  // États pour les filtres favoris
  const [savedFilters, setSavedFilters] = useState<Array<{
    id: string;
    name: string;
    searchTerm: string;
    statusFilter: string;
    amountRangeFilter: {min: string; max: string};
    dateRangeFilter: {start: string; end: string};
  }>>([]);
  const [showSaveFilterModal, setShowSaveFilterModal] = useState(false);
  const [filterName, setFilterName] = useState('');
  
  const portalRoot = typeof document !== 'undefined' ? document.body : null;
  
  // Fonction pour gérer le changement de statut
  const handleStatusChange = useCallback((contract: CreditContract, newStatus: 'active' | 'completed' | 'defaulted' | 'suspended' | 'in_litigation') => {
    setContractToAction(contract);
    setNewStatusToApply(newStatus);
    setShowConfirmStatusChange(true);
    setOpenDropdown(null);
  }, []);
  
  // Fonction pour confirmer le changement de statut
  const confirmStatusChange = useCallback(() => {
    if (!contractToAction || !newStatusToApply) return;
    
    handleUpdateContract(contractToAction.id, { status: newStatusToApply })
      .then(() => {
        showNotification(`Statut du contrat ${contractToAction.contract_number} changé en "${newStatusToApply}"`, 'success');
      })
      .catch(() => {
        showNotification(`Erreur lors du changement de statut du contrat ${contractToAction.contract_number}`, 'error');
      })
      .finally(() => {
        setContractToAction(null);
        setNewStatusToApply(null);
        setShowConfirmStatusChange(false);
      });
  }, [contractToAction, newStatusToApply, handleUpdateContract, showNotification]);
  
  // Fonction pour ouvrir la confirmation de suppression
  const openDeleteConfirm = useCallback((contract: CreditContract) => {
    setContractToAction(contract);
    setShowConfirmDelete(true);
  }, []);
  
  // Fonction pour exécuter la suppression
  const executeDeleteContract = useCallback(() => {
    if (!contractToAction) return;
    
    handleDeleteContract(contractToAction.id)
      .then((success) => {
        if (success) {
          showNotification(`Contrat ${contractToAction.contract_number} supprimé avec succès`, 'success');
        } else {
          showNotification(`Erreur lors de la suppression du contrat ${contractToAction.contract_number}`, 'error');
        }
      })
      .catch(() => {
        showNotification(`Erreur lors de la suppression du contrat ${contractToAction.contract_number}`, 'error');
      })
      .finally(() => {
        setContractToAction(null);
        setShowConfirmDelete(false);
      });
  }, [contractToAction, handleDeleteContract, showNotification]);
  
  // Fonctions pour gérer les filtres favoris
  const saveCurrentFilter = () => {
    if (!filterName.trim()) {
      showNotification('Veuillez entrer un nom pour le filtre', 'warning');
      return;
    }

    const newFilter = {
      id: Date.now().toString(),
      name: filterName.trim(),
      searchTerm,
      statusFilter,
      amountRangeFilter: {...amountRangeFilter},
      dateRangeFilter: {...dateRangeFilter},
    };

    setSavedFilters(prev => [...prev, newFilter]);
    setFilterName('');
    setShowSaveFilterModal(false);
    showNotification(`Filtre "${newFilter.name}" sauvegardé`, 'success');
  };

  const applySavedFilter = (filter: typeof savedFilters[0]) => {
    setSearchTerm(filter.searchTerm);
    setStatusFilter(filter.statusFilter);
    setAmountRangeFilter(filter.amountRangeFilter);
    setDateRangeFilter(filter.dateRangeFilter);
    showNotification(`Filtre "${filter.name}" appliqué`, 'success');
  };

  const deleteSavedFilter = (filterId: string) => {
    setSavedFilters(prev => prev.filter(f => f.id !== filterId));
    showNotification('Filtre supprimé', 'success');
  };

  const resetAllFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setAmountRangeFilter({min: '', max: ''});
    setDateRangeFilter({start: '', end: ''});
    showNotification('Tous les filtres ont été réinitialisés', 'success');
  };

  const hasActiveFilters = searchTerm || statusFilter || dateRangeFilter.start || dateRangeFilter.end || 
    amountRangeFilter.min || amountRangeFilter.max;

  // Logique de filtrage avec useMemo pour optimiser les performances
  const filteredContracts = useMemo(() => {
    let filtered = [...contracts];
    
    // Appliquer le filtre de recherche
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(contract => 
        contract.contract_number?.toLowerCase().includes(term) ||
        contract.company_name?.toLowerCase().includes(term) ||
        contract.product_type?.toLowerCase().includes(term) ||
        contract.id?.toLowerCase().includes(term)
      );
    }
    
    // Appliquer le filtre de statut
    if (statusFilter) {
      filtered = filtered.filter(contract => contract.status === statusFilter);
    }
    
    // Appliquer le filtre de montant
    if (amountRangeFilter.min || amountRangeFilter.max) {
      filtered = filtered.filter(contract => {
        const amount = contract.amount || 0;
        const min = amountRangeFilter.min ? parseFloat(amountRangeFilter.min) : 0;
        const max = amountRangeFilter.max ? parseFloat(amountRangeFilter.max) : Infinity;
        return amount >= min && amount <= max;
      });
    }
    
    // Appliquer le filtre de date
    if (dateRangeFilter.start || dateRangeFilter.end) {
      filtered = filtered.filter(contract => {
        if (!contract.start_date) return false;
        const contractDate = new Date(contract.start_date);
        const startDate = dateRangeFilter.start ? new Date(dateRangeFilter.start) : null;
        const endDate = dateRangeFilter.end ? new Date(dateRangeFilter.end) : null;
        
        if (startDate && contractDate < startDate) return false;
        if (endDate && contractDate > endDate) return false;
        return true;
      });
    }
    
    return filtered;
  }, [contracts, searchTerm, statusFilter, amountRangeFilter, dateRangeFilter]);
  
  useEffect(() => {
    const handleClickOutside = () => {
      if (openDropdown) {
        setOpenDropdown(null);
        setDropdownPosition(null);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [openDropdown]);

  if (loading) {
    return <TableSkeleton columns={6} rows={5} />;
  }
  
  if (error) {
    return (
      <ErrorDisplay 
        errorDetails={error}
        onReset={async () => {
          await resetToMockData();
          showNotification('Données réinitialisées avec succès!', 'success');
        }}
      />
    );
  }

  const handleRowClick = (e: React.MouseEvent, contract: CreditContract) => {
    if ((e.target as HTMLElement).closest('.dropdown-menu-container')) return;
    navigate(`/app/traditional/portfolio/${portfolioId}/contracts/${contract.id}`);
    showNotification(`Navigation vers le contrat ${contract.contract_number}`, 'info');
  };

  const toggleDropdown = (e: React.MouseEvent, contractId: string) => {
    e.stopPropagation();
    if (openDropdown === contractId) {
      setOpenDropdown(null);
      setDropdownPosition(null);
    } else {
      const rect = e.currentTarget.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY,
        left: rect.right - 224 + window.scrollX
      });
      setOpenDropdown(contractId);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold mb-4">Contrats de crédit</h2>
      
      <div className="grid grid-cols-1 gap-6">
        <div className="col-span-12 transition-all duration-300">
          <Card className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Liste des contrats</h3>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    resetToMockData();
                    showNotification(`Les données ont été réinitialisées pour le portefeuille ID: ${portfolioId}`, 'success');
                  }}
                >
                  Réinitialiser les données
                </Button>
              </div>
            </div>
            
            {/* Barre de recherche et filtres */}
            <div className="mb-4 space-y-4">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                {/* Barre de recherche */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="Rechercher par référence, client, produit..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full"
                  />
                </div>
                
                {/* Boutons d'actions */}
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center"
                  >
                    <Filter className="w-4 h-4 mr-2" />
                    Filtres {showFilters ? 'actifs' : ''}
                    {hasActiveFilters && (
                      <Badge variant="danger" className="ml-2 px-2 py-0 text-xs">
                        {[searchTerm, statusFilter, dateRangeFilter.start, amountRangeFilter.min].filter(Boolean).length}
                      </Badge>
                    )}
                  </Button>
                  
                  {/* Filtres favoris */}
                  {savedFilters.length > 0 && (
                    <div className="relative">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowSaveFilterModal(!showSaveFilterModal)}
                        className="flex items-center"
                      >
                        <Star className="w-4 h-4 mr-2" />
                        Favoris ({savedFilters.length})
                      </Button>
                      
                      {showSaveFilterModal && (
                        <div className="absolute top-full right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg z-10 min-w-64">
                          <div className="p-2">
                            <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Filtres sauvegardés
                            </div>
                            {savedFilters.map((filter) => (
                              <div key={filter.id} className="flex items-center justify-between py-1 hover:bg-gray-50 dark:hover:bg-gray-700 rounded px-2">
                                <button
                                  onClick={() => applySavedFilter(filter)}
                                  className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 flex-1 text-left"
                                >
                                  {filter.name}
                                </button>
                                <button
                                  onClick={() => deleteSavedFilter(filter.id)}
                                  className="text-red-500 hover:text-red-700 ml-2"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {hasActiveFilters && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={resetAllFilters}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Effacer
                    </Button>
                  )}
                </div>
              </div>
              
              {/* Filtres avancé©s */}
              {showFilters && (
                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                        Statut
                      </label>
                      <Select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                      >
                        <option value="">Tous les statuts</option>
                        <option value="active">Actif</option>
                        <option value="completed">Fermé©</option>
                        <option value="defaulted">En dû©faut</option>
                        <option value="suspended">Suspendu</option>
                        <option value="in_litigation">En litige</option>
                      </Select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                        Montant Min
                      </label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={amountRangeFilter.min}
                        onChange={(e) => setAmountRangeFilter(prev => ({...prev, min: e.target.value}))}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                        Montant Max
                      </label>
                      <Input
                        type="number"
                        placeholder="âˆž"
                        value={amountRangeFilter.max}
                        onChange={(e) => setAmountRangeFilter(prev => ({...prev, max: e.target.value}))}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                        Date début
                      </label>
                      <Input
                        type="date"
                        value={dateRangeFilter.start}
                        onChange={(e) => setDateRangeFilter(prev => ({...prev, start: e.target.value}))}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                        Date fin
                      </label>
                      <Input
                        type="date"
                        value={dateRangeFilter.end}
                        onChange={(e) => setDateRangeFilter(prev => ({...prev, end: e.target.value}))}
                      />
                    </div>
                    
                    <div className="md:col-span-2 lg:col-span-3 flex items-end gap-2">
                      {hasActiveFilters && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (hasActiveFilters) {
                              setShowSaveFilterModal(true);
                            }
                          }}
                          className="flex items-center"
                        >
                          <Star className="w-4 h-4 mr-2" />
                          Sauvegarder ce filtre
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  {/* Modal pour sauvegarder un filtre */}
                  {showSaveFilterModal && hasActiveFilters && (
                    <div className="mt-4 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md">
                      <div className="flex items-center gap-2">
                        <Input
                          type="text"
                          placeholder="Nom du filtre..."
                          value={filterName}
                          onChange={(e) => setFilterName(e.target.value)}
                          className="flex-1"
                        />
                        <Button
                          size="sm"
                          onClick={saveCurrentFilter}
                          disabled={!filterName.trim()}
                        >
                          Sauvegarder
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setShowSaveFilterModal(false);
                            setFilterName('');
                          }}
                        >
                          Annuler
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {portfolioId && portfolioId !== 'qf3081zdd' && (
              <div className="bg-blue-50 p-3 rounded-md mb-4 text-sm">
                <p>Note: Ces données sont générées pour le portefeuille avec l'ID: <strong>{portfolioId}</strong></p>
              </div>
            )}
            
            {filteredContracts.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableHeader>Référence</TableHeader>
                      <TableHeader>Client</TableHeader>
                      <TableHeader>Montant</TableHeader>
                      <TableHeader>Statut</TableHeader>
                      <TableHeader>Date début</TableHeader>
                      <TableHeader>Actions</TableHeader>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredContracts.map((contract) => (
                      <TableRow 
                        key={contract.id} 
                        className="interactive-table-row"
                        onClick={(e) => handleRowClick(e, contract)}
                      >
                        <TableCell className="font-mono">{contract.contract_number}</TableCell>
                        <TableCell>
                          {onViewCompany ? (
                            <div 
                              className="cursor-pointer hover:text-blue-600 hover:underline"
                              onClick={(e) => {
                                e.stopPropagation();
                                // ✅ FIX: Pass memberId (company ID) instead of company_name
                                onViewCompany(contract.memberId || contract.company_name);
                              }}
                            >
                              {contract.company_name}
                            </div>
                          ) : (
                            contract.company_name
                          )}
                        </TableCell>
                        <TableCell>{formatAmount(contract.amount)}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={statusConfig[contract.status]?.variant || "secondary"}
                          >
                            {statusConfig[contract.status]?.label || contract.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(contract.start_date)}</TableCell>
                        <TableCell>
                          <div className="relative dropdown-menu-container" onClick={(e) => e.stopPropagation()}>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0 action-button"
                              onClick={(e) => toggleDropdown(e, contract.id)}
                            >
                              <span className="sr-only">Ouvrir le menu</span>
                              <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                              </svg>
                            </Button>
                            
                            {openDropdown === contract.id && dropdownPosition && portalRoot && (
                              <ActionMenu
                                contract={contract}
                                dropdownPosition={dropdownPosition}
                                portalRoot={portalRoot}
                                onClose={() => setOpenDropdown(null)}
                                onNavigate={(path) => {
                                  navigate(path);
                                  showNotification(`Navigation vers le contrat ${contract.contract_number}`, 'info');
                                }}
                                onViewSchedule={() => handleViewSchedule(contract)}
                                onGeneratePDF={() => handleGeneratePDF(contract)}
                                onChangeStatus={(newStatus) => handleStatusChange(contract, newStatus)}
                                onDelete={() => {
                                  openDeleteConfirm(contract);
                                  setOpenDropdown(null);
                                }}
                              />
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center p-6">
                <svg className="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  {hasActiveFilters ? 'Aucun contrat ne correspond aux critères de recherche' : 'Aucun contrat trouvé'}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {hasActiveFilters 
                    ? 'Essayez de modifier vos critères de recherche ou de supprimer certains filtres.' 
                    : 'Commencez par créer un nouveau contrat de crédit.'
                  }
                </p>
                <div className="mt-6">
                  <Button
                    variant="primary"
                    onClick={() => {
                      showNotification("Cette fonctionnalité n'est pas encore implémentée", "info");
                    }}
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                    </svg>
                    Nouveau contrat
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
      
      <ConfirmDialog 
        isOpen={showConfirmDelete}
        title="Confirmer la suppression"
        description={`éŠtes-vous sé»r de vouloir supprimer le contrat ${contractToAction?.contract_number} ? Cette action est irRé©versible.`}
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        onConfirm={executeDeleteContract}
        onClose={() => {
          setContractToAction(null);
          setShowConfirmDelete(false);
        }}
      />
      
      <ConfirmDialog 
        isOpen={showConfirmStatusChange}
        title="Confirmer le changement de statut"
        description={`éŠtes-vous sé»r de vouloir changer le statut du contrat ${contractToAction?.contract_number} en "${newStatusToApply && statusConfig[newStatusToApply] ? statusConfig[newStatusToApply].label : newStatusToApply}" ? Cette action pourrait avoir des consé©quences importantes.`}
        confirmLabel="Confirmer"
        cancelLabel="Annuler"
        onConfirm={confirmStatusChange}
        onClose={() => {
          setContractToAction(null);
          setNewStatusToApply(null);
          setShowConfirmStatusChange(false);
        }}
      />
    </div>
  );
}






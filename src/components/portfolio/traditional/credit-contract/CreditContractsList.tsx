import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreditContracts } from '../../../../hooks/useCreditContracts';
import { Card } from '../../../ui/Card';
import { Button } from '../../../ui/Button';
import { Badge } from '../../../ui/Badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../ui/Table';
import { TableSkeleton } from '../../../ui/TableSkeleton';
import { ErrorDisplay } from '../../../common/ErrorDisplay';
import { useNotification } from '../../../../contexts/NotificationContext';
import { ConfirmDialog } from '../../../ui/ConfirmDialog';
import { formatAmount, formatDate, statusConfig } from '../../../../utils/credit';
import { ActionMenu } from './ActionMenu';
import { useContractActions } from '../../../../hooks/useContractActions';
import { CreditContract } from '../../../../types/credit';

export function CreditContractsList({ portfolioId = 'default' }: { portfolioId?: string }) {
  const { contracts, loading, error, resetToMockData } = useCreditContracts(portfolioId);
  const { showNotification } = useNotification();
  const navigate = useNavigate();
  
  const {
    showConfirmDelete,
    showConfirmStatusChange,
    contractToAction,
    newStatusToApply,
    handleStatusChange,
    confirmStatusChange,
    handleDeleteContract,
    handleGeneratePDF,
    handleViewSchedule,
    openDeleteConfirm,
    setShowConfirmDelete,
    setContractToAction,
    setShowConfirmStatusChange,
    setNewStatusToApply,
  } = useContractActions(portfolioId);

  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{top: number, left: number} | null>(null);
  
  const portalRoot = typeof document !== 'undefined' ? document.body : null;
  
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
    showNotification(`Navigation vers le contrat ${contract.reference}`, 'info');
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
            
            {portfolioId && portfolioId !== 'qf3081zdd' && (
              <div className="bg-blue-50 p-3 rounded-md mb-4 text-sm">
                <p>Note: Ces données sont générées pour le portefeuille avec l'ID: <strong>{portfolioId}</strong></p>
              </div>
            )}
            
            {contracts.length > 0 ? (
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
                    {contracts.map((contract) => (
                      <TableRow 
                        key={contract.id} 
                        className="interactive-table-row"
                        onClick={(e) => handleRowClick(e, contract)}
                      >
                        <TableCell className="font-mono">{contract.reference}</TableCell>
                        <TableCell>{contract.memberName}</TableCell>
                        <TableCell>{formatAmount(contract.amount)}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={statusConfig[contract.status]?.variant || "secondary"}
                          >
                            {statusConfig[contract.status]?.label || contract.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(contract.startDate)}</TableCell>
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
                                  showNotification(`Navigation vers le contrat ${contract.reference}`, 'info');
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
                <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun contrat trouvé</h3>
                <p className="mt-1 text-sm text-gray-500">Commencez par créer un nouveau contrat de crédit.</p>
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
        description={`Êtes-vous sûr de vouloir supprimer le contrat ${contractToAction?.reference} ? Cette action est irréversible.`}
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        onConfirm={handleDeleteContract}
        onClose={() => {
          setContractToAction(null);
          setShowConfirmDelete(false);
        }}
      />
      
      <ConfirmDialog 
        isOpen={showConfirmStatusChange}
        title="Confirmer le changement de statut"
        description={`Êtes-vous sûr de vouloir changer le statut du contrat ${contractToAction?.reference} en "${newStatusToApply && statusConfig[newStatusToApply] ? statusConfig[newStatusToApply].label : newStatusToApply}" ? Cette action pourrait avoir des conséquences importantes.`}
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
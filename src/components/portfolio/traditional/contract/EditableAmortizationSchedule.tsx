// src/components/portfolio/traditional/contract/EditableAmortizationSchedule.tsx
import { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../ui/Table';
import { Badge } from '../../../ui/Badge';
import { Button } from '../../../ui/Button';
import { Card } from '../../../ui/Card';
import { Input } from '../../../ui/Form';
import { Modal } from '../../../ui/Modal';
import { Tabs, TabsList, TabsTrigger } from '../../../ui/Tabs';
import { Save, Edit, Download, Printer, ChevronLeft, ChevronRight, Plus, Trash2 } from 'lucide-react';
import { useNotification } from '../../../../contexts/NotificationContext';
import useAmortizationSchedules from '../../../../hooks/useAmortizationSchedules';
import { useFormatCurrency } from '../../../../hooks/useFormatCurrency';
import { AmortizationScheduleItem } from '../../../../types/amortization';

interface EditableAmortizationScheduleProps {
  contractId: string;
  amount: number;
  interestRate: number;
  startDate: string;
  endDate: string;
  onEditSchedule?: (updatedSchedule: AmortizationScheduleItem[]) => Promise<void>;
}

// Fonction utilitaire pour le formatage des montants
// const formatAmount = (amount: number) => {
//   return new Intl.NumberFormat('fr-FR', { 
//     style: 'currency', 
//     currency: 'XAF',
//     maximumFractionDigits: 0
//   }).format(amount);
// };

// Fonction utilitaire pour le formatage des dates
const formatDate = (dateString: string | undefined) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date);
};

export function EditableAmortizationSchedule({
  contractId,
  amount,
  interestRate,
  startDate,
  endDate,
  onEditSchedule
}: EditableAmortizationScheduleProps) {
  const [scheduleItems, setScheduleItems] = useState<AmortizationScheduleItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<AmortizationScheduleItem | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newItem, setNewItem] = useState<Partial<AmortizationScheduleItem>>({
    status: 'pending',
    dueDate: new Date().toISOString().split('T')[0],
    principal: 0,
    interest: 0,
    totalPayment: 0,
    remainingBalance: 0
  });
  const [activeTab, setActiveTab] = useState('all');
  // État pour la pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10); // Nombre d'éléments par page
  const { showNotification } = useNotification();
  const { formatCurrency } = useFormatCurrency();
  
  // Log pour voir les paramètres de pagination passés au hook
  console.log(`Appel du hook avec: page=${currentPage}, pageSize=${pageSize}, filter=${activeTab}`);
  
  const amortizationSchedules = useAmortizationSchedules({
    contractId,
    amount,
    interestRate,
    startDate,
    endDate,
    page: currentPage,
    pageSize,
    filter: activeTab
  });

  // Charger ou générer les échéanciers pour ce contrat
  useEffect(() => {
    const loadOrGenerateSchedules = async () => {
      setIsLoading(true);
      
      try {
        // Utiliser les données provenant du hook useAmortizationSchedules
        if (!amortizationSchedules.isLoading) {
          console.log('Données chargées depuis le hook:', amortizationSchedules.items.length, 'éléments');
          setScheduleItems(amortizationSchedules.items as AmortizationScheduleItem[]);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des échéanciers:', error);
        showNotification('Erreur lors du chargement des échéanciers', 'error');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadOrGenerateSchedules();
  }, [amortizationSchedules, showNotification]);

  // On n'a plus besoin de filtrer ici car le hook s'en charge
  // Utiliser directement les données paginées du hook
  const paginatedItems = scheduleItems;
  const totalItems = amortizationSchedules.totalItems;
  const totalPages = amortizationSchedules.totalPages;

  // Gestionnaire pour changer de page
  const handlePageChange = (newPage: number) => {
    console.log(`Changement de page: ${currentPage} -> ${newPage}`);
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
      // Le hook se rechargera automatiquement grâce à la dépendance "page" dans son useEffect
    }
  };

  // Gestionnaire pour changer d'onglet (filtre)
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setCurrentPage(1); // Réinitialiser à la première page lors du changement de filtre
  };

  // Gestionnaire pour ouvrir le modal d'édition
  const handleEditItem = (item: AmortizationScheduleItem) => {
    setEditingItem({...item});
    setIsEditModalOpen(true);
  };

  // Gestionnaire pour sauvegarder les modifications
  const handleSaveEdit = async () => {
    if (!editingItem) return;
    
    try {
      // Convertir l'éditingItem en AmortizationScheduleItem
      const updatedItem: AmortizationScheduleItem = {
        ...editingItem,
        contractId, // Ajouter le contractId qui est requis par l'interface AmortizationScheduleItem
      };
      
      // Utiliser le hook pour mettre à jour l'élément
      const success = await amortizationSchedules.updateScheduleItem(updatedItem);
      
      if (success) {
        // Mettre à jour l'état local
        const updatedItems = scheduleItems.map(item => 
          item.id === editingItem.id ? editingItem : item
        );
        
        setScheduleItems(updatedItems);
        
        // Appeler le callback si fourni
        if (onEditSchedule) {
          await onEditSchedule(updatedItems);
        }
        
        showNotification('Échéance mise à jour avec succès', 'success');
        setIsEditModalOpen(false);
      } else {
        showNotification('Erreur lors de la mise à jour de l\'échéance', 'error');
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'échéance:', error);
      showNotification('Erreur lors de la mise à jour de l\'échéance', 'error');
    }
  };

  // Gestionnaire pour marquer une échéance comme payée
  const handleMarkAsPaid = async (item: AmortizationScheduleItem) => {
    try {
      // Utiliser le hook pour marquer l'échéance comme payée
      const success = await amortizationSchedules.markAsPaid(item.id);
      
      if (success) {
        // Mettre à jour l'état local
        const updatedItems = scheduleItems.map(scheduleItem => {
          if (scheduleItem.id === item.id) {
            return {
              ...scheduleItem,
              status: 'paid' as const,
              paymentDate: new Date().toISOString(),
              paymentAmount: item.totalPayment
            };
          }
          return scheduleItem;
        });
        
        setScheduleItems(updatedItems);
        
        // Appeler le callback si fourni
        if (onEditSchedule) {
          await onEditSchedule(updatedItems);
        }
        
        showNotification('Échéance marquée comme payée', 'success');
      } else {
        showNotification('Erreur lors de la mise à jour de l\'échéance', 'error');
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'échéance:', error);
      showNotification('Erreur lors de la mise à jour de l\'échéance', 'error');
    }
  };

  // Gestionnaire pour ouvrir le modal d'ajout d'échéance
  const handleOpenAddModal = () => {
    // Initialiser le nouvel item avec des valeurs par défaut
    setNewItem({
      status: 'pending',
      dueDate: new Date().toISOString().split('T')[0],
      principal: 0,
      interest: 0,
      totalPayment: 0,
      remainingBalance: scheduleItems.length > 0 
        ? scheduleItems[scheduleItems.length - 1].remainingBalance
        : amount
    });
    setIsAddModalOpen(true);
  };

  // Gestionnaire pour ajouter une nouvelle échéance
  const handleAddItem = async () => {
    try {
      // Générer un ID unique
      const id = `schedule-${contractId}-${Date.now()}`;
      
      // Créer le nouvel item complet
      const completeNewItem: AmortizationScheduleItem = {
        id,
        contractId,
        number: scheduleItems.length + 1,
        dueDate: new Date(newItem.dueDate || '').toISOString(),
        principal: newItem.principal || 0,
        interest: newItem.interest || 0,
        totalPayment: (newItem.principal || 0) + (newItem.interest || 0),
        remainingBalance: newItem.remainingBalance || 0,
        status: newItem.status as 'paid' | 'due' | 'overdue' | 'pending' | 'rescheduled',
        ...(newItem.paymentDate && { paymentDate: new Date(newItem.paymentDate).toISOString() }),
        ...(newItem.paymentAmount && { paymentAmount: newItem.paymentAmount }),
        ...(newItem.comments && { comments: newItem.comments })
      };
      
      // Ajouter l'item à la liste locale
      const updatedItems = [...scheduleItems, completeNewItem as AmortizationScheduleItem];
      setScheduleItems(updatedItems);
      
      // Mettre à jour le localStorage via le hook
      await amortizationSchedules.updateScheduleItem(completeNewItem);
      
      // Appeler le callback si fourni
      if (onEditSchedule) {
        await onEditSchedule(updatedItems);
      }
      
      setIsAddModalOpen(false);
      showNotification('Nouvelle échéance ajoutée avec succès', 'success');
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'échéance:', error);
      showNotification('Erreur lors de l\'ajout de l\'échéance', 'error');
    }
  };

  // États pour le modal de suppression
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Gestionnaire pour supprimer une échéance
  const handleDeleteItem = async (itemId: string) => {
    setDeleteItemId(itemId);
    setShowDeleteConfirm(true);
  };
  
  // Confirmer la suppression de l'échéance
  const confirmDeleteItem = async () => {
    if (!deleteItemId) return;
    
    try {
      // Mettre à jour l'état local
      const updatedItems = scheduleItems.filter(item => item.id !== deleteItemId);
      setScheduleItems(updatedItems);
      
      // Mettre à jour le localStorage via le hook
      // Note: Il faudrait idéalement ajouter une méthode deleteScheduleItem au hook
      
      // Appeler le callback si fourni
      if (onEditSchedule) {
        await onEditSchedule(updatedItems);
      }
      
      showNotification('Échéance supprimée avec succès', 'success');
      
      setShowDeleteConfirm(false);
      setDeleteItemId(null);
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'échéance:', error);
      showNotification('Erreur lors de la suppression de l\'échéance', 'error');
    }
  };
  
  // Annuler la suppression
  const cancelDeleteItem = () => {
    setShowDeleteConfirm(false);
    setDeleteItemId(null);
  };

  // Statistiques de l'échéancier
  const totalSchedules = scheduleItems.length;
  const paidSchedules = scheduleItems.filter(item => item.status === 'paid').length;
  const overdueSchedules = scheduleItems.filter(item => item.status === 'overdue').length;
  const pendingSchedules = scheduleItems.filter(item => item.status === 'pending').length;
  const dueSchedules = scheduleItems.filter(item => item.status === 'due').length;
  const rescheduledSchedules = scheduleItems.filter(item => item.status === 'rescheduled').length;
  
  // Calcul des montants totaux
  const totalAmount = scheduleItems.reduce((sum, item) => sum + item.totalPayment, 0);
  const paidAmount = scheduleItems
    .filter(item => item.status === 'paid')
    .reduce((sum, item) => sum + (item.paymentAmount || 0), 0);
  const remainingAmount = totalAmount - paidAmount;

  // Statistiques sur les retards
  const overdueAmount = scheduleItems
    .filter(item => item.status === 'overdue')
    .reduce((sum, item) => sum + item.totalPayment, 0);

  return (
    <div className="editable-amortization-schedule w-full">
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card className="p-4 flex flex-col">
              <span className="text-sm text-gray-500">Montant total</span>
              <span className="text-xl font-bold">{formatCurrency(totalAmount)}</span>
              <div className="mt-2 text-xs text-gray-400">{totalSchedules} échéances</div>
            </Card>
            <Card className="p-4 flex flex-col">
              <span className="text-sm text-gray-500">Montant payé</span>
              <span className="text-xl font-bold text-green-600">{formatCurrency(paidAmount)}</span>
              <div className="mt-2 text-xs text-gray-400">{paidSchedules} échéances payées</div>
            </Card>
            <Card className="p-4 flex flex-col">
              <span className="text-sm text-gray-500">Montant restant</span>
              <span className="text-xl font-bold text-blue-600">{formatCurrency(remainingAmount)}</span>
              <div className="mt-2 text-xs text-gray-400">{pendingSchedules + dueSchedules} échéances à venir</div>
            </Card>
            <Card className="p-4 flex flex-col">
              <span className="text-sm text-gray-500">Montant en retard</span>
              <span className="text-xl font-bold text-red-600">{formatCurrency(overdueAmount)}</span>
              <div className="mt-2 text-xs text-gray-400">{overdueSchedules} échéances en retard</div>
            </Card>
          </div>
          
          <div className="flex justify-between items-center mb-4">
            <Tabs 
              value={activeTab}
              className="w-full" 
              onValueChange={handleTabChange}
            >
              <TabsList className="grid grid-cols-3 md:grid-cols-6 gap-2">
                <TabsTrigger value="all" currentValue={activeTab} onValueChange={handleTabChange}>
                  Toutes ({totalSchedules})
                </TabsTrigger>
                <TabsTrigger value="paid" currentValue={activeTab} onValueChange={handleTabChange}>
                  Payées ({paidSchedules})
                </TabsTrigger>
                <TabsTrigger value="due" currentValue={activeTab} onValueChange={handleTabChange}>
                  À payer ({dueSchedules})
                </TabsTrigger>
                <TabsTrigger value="overdue" currentValue={activeTab} onValueChange={handleTabChange}>
                  En retard ({overdueSchedules})
                </TabsTrigger>
                <TabsTrigger value="pending" currentValue={activeTab} onValueChange={handleTabChange}>
                  À venir ({pendingSchedules})
                </TabsTrigger>
                <TabsTrigger value="rescheduled" currentValue={activeTab} onValueChange={handleTabChange}>
                  Rééchelonnées ({rescheduledSchedules})
                </TabsTrigger>
              </TabsList>
            </Tabs>
            
            <div className="flex gap-2 ml-4">
              <Button variant="outline" size="sm" onClick={handleOpenAddModal}>
                <Plus className="h-4 w-4 mr-2" />
                Ajouter
              </Button>
              <Button variant="outline" size="sm">
                <Printer className="h-4 w-4 mr-2" />
                Imprimer
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exporter
              </Button>
            </div>
          </div>
          
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeader>N°</TableHeader>
                    <TableHeader>Date d'échéance</TableHeader>
                    <TableHeader>Principal</TableHeader>
                    <TableHeader>Intérêts</TableHeader>
                    <TableHeader>Montant total</TableHeader>
                    <TableHeader>Capital restant</TableHeader>
                    <TableHeader>Statut</TableHeader>
                    <TableHeader>Date de paiement</TableHeader>
                    <TableHeader>Actions</TableHeader>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedItems.map((item) => (
                    <TableRow key={item.id} className={
                      item.status === 'overdue' 
                        ? 'bg-red-50 hover:bg-red-100' 
                        : item.status === 'paid' 
                          ? 'bg-green-50 hover:bg-green-100'
                          : item.status === 'rescheduled'
                            ? 'bg-amber-50 hover:bg-amber-100'
                            : ''
                    }>
                      <TableCell>{item.number}</TableCell>
                      <TableCell>{formatDate(item.dueDate)}</TableCell>
                      <TableCell>{formatCurrency(item.principal)}</TableCell>
                      <TableCell>{formatCurrency(item.interest)}</TableCell>
                      <TableCell className="font-bold">{formatCurrency(item.totalPayment)}</TableCell>
                      <TableCell>{formatCurrency(item.remainingBalance)}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            item.status === 'paid' ? 'success' :
                            item.status === 'due' ? 'warning' :
                            item.status === 'overdue' ? 'danger' :
                            item.status === 'rescheduled' ? 'primary' :
                            'secondary'
                          }
                        >
                          {item.status === 'paid' ? 'Payé' :
                           item.status === 'due' ? 'À payer' :
                           item.status === 'overdue' ? 'En retard' :
                           item.status === 'rescheduled' ? 'Rééchelonné' :
                           'À venir'}
                        </Badge>
                      </TableCell>
                      <TableCell>{item.paymentDate ? formatDate(item.paymentDate) : '-'}</TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleEditItem(item)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          
                          {(item.status === 'due' || item.status === 'overdue') && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleMarkAsPaid(item)}
                            >
                              <Save className="h-4 w-4 text-green-600" />
                            </Button>
                          )}
                          
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDeleteItem(item.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            {/* Pagination - toujours afficher pour le debugging */}
            <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
              <div className="flex items-center">
                <p className="text-sm text-gray-700">
                  Affichage de <span className="font-medium">{((currentPage - 1) * pageSize) + 1}</span> à{' '}
                  <span className="font-medium">{Math.min(currentPage * pageSize, totalItems)}</span> sur{' '}
                  <span className="font-medium">{totalItems}</span> résultats
                </p>
                <p className="ml-4 text-xs text-gray-500">
                  (Page {currentPage}/{totalPages}, Éléments affichés: {paginatedItems.length})
                </p>
              </div>
              <div className="flex justify-between sm:justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="mr-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="ml-1">Précédent</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  <span className="mr-1">Suivant</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
          
          {/* Modal d'édition d'échéance */}
          {editingItem && (
            <Modal
              isOpen={isEditModalOpen}
              onClose={() => setIsEditModalOpen(false)}
              title={`Édition de l'échéance n°${editingItem.number}`}
            >
              <div className="space-y-4 py-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Date d'échéance
                    </label>
                    <Input
                      type="date"
                      value={editingItem.dueDate.split('T')[0]}
                      onChange={(e) => setEditingItem({
                        ...editingItem,
                        dueDate: new Date(e.target.value).toISOString()
                      })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Statut
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      value={editingItem.status}
                      onChange={(e) => setEditingItem({
                        ...editingItem,
                        status: e.target.value as 'pending' | 'due' | 'paid' | 'overdue' | 'rescheduled'
                      })}
                    >
                      <option value="pending">À venir</option>
                      <option value="due">À payer</option>
                      <option value="paid">Payé</option>
                      <option value="overdue">En retard</option>
                      <option value="rescheduled">Rééchelonné</option>
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Principal
                    </label>
                    <Input
                      type="number"
                      value={editingItem.principal}
                      onChange={(e) => setEditingItem({
                        ...editingItem,
                        principal: parseFloat(e.target.value),
                        totalPayment: parseFloat(e.target.value) + editingItem.interest
                      })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Intérêts
                    </label>
                    <Input
                      type="number"
                      value={editingItem.interest}
                      onChange={(e) => setEditingItem({
                        ...editingItem,
                        interest: parseFloat(e.target.value),
                        totalPayment: editingItem.principal + parseFloat(e.target.value)
                      })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Montant total
                    </label>
                    <Input
                      type="number"
                      value={editingItem.totalPayment}
                      disabled
                    />
                  </div>
                </div>
                
                {editingItem.status === 'paid' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Date de paiement
                      </label>
                      <Input
                        type="date"
                        value={(editingItem.paymentDate || '').split('T')[0]}
                        onChange={(e) => setEditingItem({
                          ...editingItem,
                          paymentDate: new Date(e.target.value).toISOString()
                        })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Montant payé
                      </label>
                      <Input
                        type="number"
                        value={editingItem.paymentAmount || editingItem.totalPayment}
                        onChange={(e) => setEditingItem({
                          ...editingItem,
                          paymentAmount: parseFloat(e.target.value)
                        })}
                      />
                    </div>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Commentaires
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    rows={3}
                    value={editingItem.comments || ''}
                    onChange={(e) => setEditingItem({
                      ...editingItem,
                      comments: e.target.value
                    })}
                  />
                </div>
                
                <div className="flex justify-end space-x-3 mt-5">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditModalOpen(false)}
                  >
                    Annuler
                  </Button>
                  <Button
                    type="button"
                    onClick={handleSaveEdit}
                  >
                    Enregistrer
                  </Button>
                </div>
              </div>
            </Modal>
          )}
          
          {/* Modal d'ajout d'échéance */}
          <Modal
            isOpen={isAddModalOpen}
            onClose={() => setIsAddModalOpen(false)}
            title="Ajouter une nouvelle échéance"
          >
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Date d'échéance
                  </label>
                  <Input
                    type="date"
                    value={newItem.dueDate as string}
                    onChange={(e) => setNewItem({
                      ...newItem,
                      dueDate: e.target.value
                    })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Statut
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    value={newItem.status as string}
                    onChange={(e) => setNewItem({
                      ...newItem,
                      status: e.target.value as 'pending' | 'due' | 'paid' | 'overdue' | 'rescheduled'
                    })}
                  >
                    <option value="pending">À venir</option>
                    <option value="due">À payer</option>
                    <option value="paid">Payé</option>
                    <option value="overdue">En retard</option>
                    <option value="rescheduled">Rééchelonné</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Principal
                  </label>
                  <Input
                    type="number"
                    value={newItem.principal || 0}
                    onChange={(e) => {
                      const principal = parseFloat(e.target.value);
                      setNewItem({
                        ...newItem,
                        principal,
                        totalPayment: principal + (newItem.interest || 0)
                      });
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Intérêts
                  </label>
                  <Input
                    type="number"
                    value={newItem.interest || 0}
                    onChange={(e) => {
                      const interest = parseFloat(e.target.value);
                      setNewItem({
                        ...newItem,
                        interest,
                        totalPayment: (newItem.principal || 0) + interest
                      });
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Montant total
                  </label>
                  <Input
                    type="number"
                    value={(newItem.principal || 0) + (newItem.interest || 0)}
                    disabled
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Capital restant
                </label>
                <Input
                  type="number"
                  value={newItem.remainingBalance || 0}
                  onChange={(e) => setNewItem({
                    ...newItem,
                    remainingBalance: parseFloat(e.target.value)
                  })}
                />
              </div>
              
              {newItem.status === 'paid' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Date de paiement
                    </label>
                    <Input
                      type="date"
                      value={newItem.paymentDate as string || ''}
                      onChange={(e) => setNewItem({
                        ...newItem,
                        paymentDate: e.target.value
                      })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Montant payé
                    </label>
                    <Input
                      type="number"
                      value={newItem.paymentAmount || (newItem.principal || 0) + (newItem.interest || 0)}
                      onChange={(e) => setNewItem({
                        ...newItem,
                        paymentAmount: parseFloat(e.target.value)
                      })}
                    />
                  </div>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Commentaires
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  rows={3}
                  value={newItem.comments || ''}
                  onChange={(e) => setNewItem({
                    ...newItem,
                    comments: e.target.value
                  })}
                />
              </div>
              
              <div className="flex justify-end space-x-3 mt-5">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Annuler
                </Button>
                <Button
                  type="button"
                  onClick={handleAddItem}
                >
                  Ajouter
                </Button>
              </div>
            </div>
          </Modal>
          
          {/* Modal de confirmation de suppression */}
          <Modal
            isOpen={showDeleteConfirm}
            onClose={cancelDeleteItem}
            title="Confirmer la suppression"
          >
            <div className="p-4">
              <p className="text-sm text-gray-500 mb-4">
                Êtes-vous sûr de vouloir supprimer cette échéance ? Cette action est irréversible.
              </p>
              <div className="flex justify-end space-x-3 mt-5">
                <Button
                  type="button"
                  variant="outline"
                  onClick={cancelDeleteItem}
                >
                  Annuler
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={confirmDeleteItem}
                >
                  Supprimer
                </Button>
              </div>
            </div>
          </Modal>
        </>
      )}
    </div>
  );
}

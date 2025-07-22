import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../../ui/Dialog';
import { FormField } from '../../../ui/form/FormField';
import { Input } from '../../../ui/form/Input';
import { Select } from '../../../ui/form/Select';
import { Button } from '../../../ui/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../ui/Tabs';
import { useNotification } from '../../../../contexts/NotificationContext';
import { formatCurrency } from '../../../../utils/formatters';
import type { Guarantee } from '../../../../types/guarantee';
import type { CreditContract } from '../../../../types/credit';
import { guaranteeStorageService } from '../../../../services/storage/guaranteeStorage';

interface ConfigureContractFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedContract: Partial<CreditContract>) => Promise<void>;
  contract: CreditContract;
}

export function ConfigureContractForm({ isOpen, onClose, onSave, contract }: ConfigureContractFormProps) {
  const { showNotification } = useNotification();
  const [activeTab, setActiveTab] = useState('details');
  const [isLoading, setIsLoading] = useState(true);
  const [guarantees, setGuarantees] = useState<Guarantee[]>([]);
  const [selectedGuaranteeId, setSelectedGuaranteeId] = useState<string>(contract.guaranteeId || '');
  
  // Champs du contrat
  const [interestRate, setInterestRate] = useState<string>(contract.interestRate?.toString() || '');
  const [duration, setDuration] = useState<string>(contract.duration?.toString() || '');
  const [amount, setAmount] = useState<string>(contract.amount?.toString() || '');
  const [productName, setProductName] = useState<string>(contract.productName || '');
  const [gracePeriod, setGracePeriod] = useState<string>(contract.gracePeriod?.toString() || '0');
  
  // Erreurs
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Charger les garanties disponibles
  useEffect(() => {
    const loadGuarantees = async () => {
      try {
        setIsLoading(true);
        const loadedGuarantees = await guaranteeStorageService.getGuarantees();
        
        // Filtrer les garanties pour cette entreprise et qui sont actives
        const availableGuarantees = loadedGuarantees.filter((g: Guarantee) => 
          g.company === contract.memberName && g.status === 'active'
        );
        
        setGuarantees(availableGuarantees);
        setIsLoading(false);
      } catch (error) {
        console.error('Erreur lors du chargement des garanties:', error);
        setIsLoading(false);
        showNotification('Impossible de charger les garanties disponibles', 'error');
      }
    };
    
    if (isOpen) {
      loadGuarantees();
    }
  }, [isOpen, contract.memberName, showNotification]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      // Créer l'objet contrat mis à jour
      const updatedContract: Partial<CreditContract> = {
        interestRate: parseFloat(interestRate),
        duration: parseInt(duration, 10),
        amount: parseFloat(amount),
        productName,
        gracePeriod: parseInt(gracePeriod, 10),
        guaranteeId: selectedGuaranteeId,
      };
      
      // Si une garantie est sélectionnée, mettre à jour sa référence de contrat
      if (selectedGuaranteeId) {
        const selectedGuarantee = guarantees.find(g => g.id === selectedGuaranteeId);
        if (selectedGuarantee) {
          // Mettre à jour la garantie avec la référence du contrat
          const updatedGuarantee: Partial<Guarantee> = {
            ...selectedGuarantee,
            contractId: contract.id,
            contractReference: contract.reference,
          };
          
          // Mettre à jour la garantie dans le stockage
          await guaranteeStorageService.updateGuarantee(selectedGuaranteeId, updatedGuarantee);
        }
      }
      
      // Sauvegarder les modifications du contrat
      await onSave(updatedContract);
      showNotification('Configuration du contrat enregistrée avec succès', 'success');
      onClose();
    } catch (error) {
      console.error('Erreur lors de la configuration du contrat:', error);
      showNotification('Erreur lors de la configuration du contrat', 'error');
      setErrors({ submit: 'Une erreur est survenue lors de la sauvegarde des données.' });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!interestRate) newErrors.interestRate = 'Le taux d\'intérêt est requis';
    else if (parseFloat(interestRate) < 0 || parseFloat(interestRate) > 100) 
      newErrors.interestRate = 'Le taux d\'intérêt doit être entre 0 et 100';
      
    if (!duration) newErrors.duration = 'La durée est requise';
    else if (parseInt(duration, 10) <= 0) newErrors.duration = 'La durée doit être supérieure à 0';
    
    if (!amount) newErrors.amount = 'Le montant est requis';
    else if (parseFloat(amount) <= 0) newErrors.amount = 'Le montant doit être supérieur à 0';
    
    if (!productName) newErrors.productName = 'Le produit est requis';
    
    // Garantie - La garantie n'est pas obligatoire
    if (selectedGuaranteeId) {
      const selectedGuarantee = guarantees.find(g => g.id === selectedGuaranteeId);
      if (!selectedGuarantee) {
        newErrors.guaranteeId = 'La garantie sélectionnée n\'existe pas';
      } else if (parseFloat(amount) > selectedGuarantee.value) {
        // Avertissement si la garantie a une valeur inférieure au montant du crédit
        newErrors.guaranteeId = 'La valeur de la garantie est inférieure au montant du crédit';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="p-0 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="sticky top-0 bg-white dark:bg-gray-900 z-10 p-6 pb-4 mb-0 border-b border-gray-200 dark:border-gray-700">
          <DialogTitle className="text-xl font-bold">
            Configuration du contrat {contract.reference}
          </DialogTitle>
        </DialogHeader>
        
        {isLoading ? (
          <div className="p-6 flex flex-col items-center justify-center min-h-[200px]">
            <div className="w-10 h-10 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Chargement des données...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 pt-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
              <TabsList className="grid grid-cols-2">
                <TabsTrigger value="details" currentValue={activeTab} onValueChange={setActiveTab}>Détails du contrat</TabsTrigger>
                <TabsTrigger value="guarantee" currentValue={activeTab} onValueChange={setActiveTab}>Garantie</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" currentValue={activeTab} className="pt-4">
                <div className="space-y-6">
                  <div className="p-5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                    <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-gray-100">Informations du contrat</h3>
                    
                    <div className="grid grid-cols-2 gap-6">
                      <FormField label="Montant du crédit (FCFA)" error={errors.amount}>
                        <Input 
                          type="number" 
                          value={amount} 
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAmount(e.target.value)}
                          error={!!errors.amount}
                          placeholder="0"
                        />
                      </FormField>
                      
                      <FormField label="Produit de crédit" error={errors.productName}>
                        <Input 
                          type="text" 
                          value={productName} 
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProductName(e.target.value)}
                          error={!!errors.productName}
                          placeholder="Nom du produit"
                        />
                      </FormField>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-6 mt-4">
                      <FormField label="Taux d'intérêt (%)" error={errors.interestRate}>
                        <Input 
                          type="number" 
                          value={interestRate} 
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInterestRate(e.target.value)}
                          error={!!errors.interestRate}
                          placeholder="0.00"
                          step="0.01"
                        />
                      </FormField>
                      
                      <FormField label="Durée (mois)" error={errors.duration}>
                        <Input 
                          type="number" 
                          value={duration} 
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDuration(e.target.value)}
                          error={!!errors.duration}
                          placeholder="12"
                        />
                      </FormField>
                      
                      <FormField label="Période de grâce (mois)" error={errors.gracePeriod}>
                        <Input 
                          type="number" 
                          value={gracePeriod} 
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setGracePeriod(e.target.value)}
                          error={!!errors.gracePeriod}
                          placeholder="0"
                        />
                      </FormField>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="guarantee" currentValue={activeTab} className="pt-4">
                <div className="p-5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                  <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-gray-100">
                    Garantie associée à ce contrat
                  </h3>
                  
                  <FormField 
                    label="Sélectionner une garantie" 
                    error={errors.guaranteeId}
                  >
                    <div>
                      <p className="text-sm text-gray-500 mb-2">La garantie sera automatiquement liée à ce contrat et ne sera plus disponible pour d'autres contrats.</p>
                      <Select 
                        value={selectedGuaranteeId} 
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedGuaranteeId(e.target.value)}
                        error={!!errors.guaranteeId}
                      >
                        <option value="">Aucune garantie</option>
                        {guarantees.map(guarantee => (
                          <option key={guarantee.id} value={guarantee.id}>
                            {guarantee.id} - {guarantee.type} ({formatCurrency(guarantee.value)})
                          </option>
                        ))}
                      </Select>
                    </div>                    {guarantees.length === 0 && (
                      <div className="mt-2 p-3 bg-amber-50 text-amber-700 rounded-md">
                        Aucune garantie active n'est disponible pour cette entreprise. 
                        Veuillez d'abord créer une garantie pour cette entreprise.
                      </div>
                    )}
                    
                    {selectedGuaranteeId && (
                      <div className="mt-4 p-4 border border-gray-200 rounded-md">
                        {(() => {
                          const selectedGuarantee = guarantees.find(g => g.id === selectedGuaranteeId);
                          if (!selectedGuarantee) return null;
                          
                          const isSufficient = selectedGuarantee.value >= parseFloat(amount);
                          
                          return (
                            <>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <span className="text-sm text-gray-500">Type:</span> 
                                  <span className="ml-2 font-medium">{selectedGuarantee.type}</span>
                                </div>
                                <div>
                                  <span className="text-sm text-gray-500">Valeur:</span>
                                  <span className="ml-2 font-medium">{formatCurrency(selectedGuarantee.value)}</span>
                                </div>
                                <div>
                                  <span className="text-sm text-gray-500">ID:</span>
                                  <span className="ml-2 font-medium">{selectedGuarantee.id}</span>
                                </div>
                                <div>
                                  <span className="text-sm text-gray-500">Statut:</span>
                                  <span className="ml-2 font-medium">{selectedGuarantee.status}</span>
                                </div>
                              </div>
                              
                              {!isSufficient && (
                                <div className="mt-3 p-2 bg-amber-50 text-amber-700 rounded-md text-sm">
                                  Attention: La valeur de cette garantie ({formatCurrency(selectedGuarantee.value)}) 
                                  est inférieure au montant du crédit ({formatCurrency(parseFloat(amount))}).
                                </div>
                              )}
                            </>
                          );
                        })()}
                      </div>
                    )}
                  </FormField>
                </div>
              </TabsContent>
            </Tabs>
            
            {/* Error générale */}
            {errors.submit && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-500 text-sm">
                {errors.submit}
              </div>
            )}
            
            <DialogFooter className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                className="mr-2"
              >
                Annuler
              </Button>
              <Button type="submit">
                Enregistrer la configuration
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

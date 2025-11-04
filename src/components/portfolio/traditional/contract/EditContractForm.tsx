// components/portfolio/traditional/contract/EditContractForm.tsx
import { useState, useEffect } from 'react';
import { Button } from '../../../ui/Button';
import { Input, Select, TextArea } from '../../../ui/Form';
import { Card } from '../../../ui/Card';
import { CreditContract } from '../../../../types/credit-contract';
import { Guarantee, GuaranteeType } from '../../../../types/guarantee';
import { useNotification } from '../../../../contexts/useNotification';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../../ui/Dialog';
import { DocumentIcon, UserIcon, CurrencyDollarIcon, ScaleIcon, ShieldCheckIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { guaranteeService } from '../../../../services/guaranteeService';

interface EditContractFormProps {
  contract: CreditContract;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<CreditContract>) => Promise<void>;
}

export function EditContractForm({ contract, isOpen, onClose, onSave }: EditContractFormProps) {
  const [formData, setFormData] = useState<Partial<CreditContract>>({
    // Informations gé©né©rales
    product_type: contract.product_type,
    start_date: contract.start_date ? contract.start_date.split('T')[0] : '',
    end_date: contract.end_date ? contract.end_date.split('T')[0] : '',
    
    // Informations financières
    amount: contract.amount,
    interest_rate: contract.interest_rate,
    amortization_method: contract.amortization_method || 'linear',
    
    // Informations client
    company_name: contract.company_name,
    
    // Informations légales et complémentaires
    status: contract.status,
    risk_rating: contract.risk_rating,
    disbursements: contract.disbursements,
    days_past_due: contract.days_past_due,
    
    // Garantie principale
    guarantees: contract.guarantees || [],
    guarantee_amount: contract.guarantee_amount || 0,
    
    // Paramètres additionnels
    term_months: contract.term_months || calculateTermInMonths(contract.start_date || '', contract.end_date || ''),
    grace_period: contract.grace_period || 0
  });
  
  const [guarantees, setGuarantees] = useState<Guarantee[]>([]);
  const [newGuarantee, setNewGuarantee] = useState<Partial<Guarantee>>({
    type: 'materiel',
    value: 0,
    status: 'active'
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showNotification } = useNotification();

  // Calculer la duRé©e en mois entre la date de dû©but et la date de fin
  function calculateTermInMonths(startDateStr: string, endDateStr: string): number {
    if (!startDateStr || !endDateStr) return 0;
    
    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);
    
    return (endDate.getFullYear() - startDate.getFullYear()) * 12 + 
           (endDate.getMonth() - startDate.getMonth());
  }

  // Mettre à jour la Durée lorsque les dates changent
  useEffect(() => {
    if (formData.start_date && formData.end_date) {
      const durationMonths = calculateTermInMonths(formData.start_date, formData.end_date);
      setFormData(prev => ({ ...prev, term_months: durationMonths }));
    }
  }, [formData.start_date, formData.end_date]);

  // Charger les garanties existantes
  useEffect(() => {
    if (contract?.id) {
      const loadGuarantees = async () => {
        try {
          const contractGuarantees = await guaranteeService.getGuaranteesByContractId(contract.id);
          setGuarantees(contractGuarantees || []);
        } catch (error) {
          console.error('Erreur lors du chargement des garanties:', error);
          showNotification('Erreur lors du chargement des garanties', 'error');
        }
      };
      
      loadGuarantees();
    }
  }, [contract, showNotification]);

  // Gestionnaire pour les champs input et textarea
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    // Convertir les valeurs numé©riques
    if (type === 'number') {
      setFormData(prev => ({ 
        ...prev, 
        [name]: value === '' ? 0 : parseFloat(value) 
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Gestionnaire pour les é©lé©ments select
  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Gestionnaire pour les champs de la nouvelle garantie
  const handleGuaranteeInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Convertir les valeurs numé©riques
    if (type === 'number') {
      setNewGuarantee(prev => ({ 
        ...prev, 
        [name]: value === '' ? 0 : parseFloat(value) 
      }));
    } else {
      setNewGuarantee(prev => ({ ...prev, [name]: value }));
    }
  };

  // Ajouter une nouvelle garantie
  const handleAddGuarantee = () => {
    // Gé©né©rer un ID temporaire pour la nouvelle garantie
    const newId = `temp-${Date.now()}`;
    
    const newGuaranteeItem: Guarantee = {
      id: newId,
      company: contract.company_name,
      type: newGuarantee.type as GuaranteeType,
      value: newGuarantee.value || 0,
      status: newGuarantee.status as 'active' | 'libérée' | 'saisie' | 'expirée' | 'pending',
      created_at: new Date().toISOString(),
      contractId: contract.id,
      contractReference: contract.contract_number,
      portfolioId: contract.portfolioId,
      details: {
        description: newGuarantee.details?.description || '',
        contract_number: newGuarantee.details?.contract_number || '',
      }
    };
    
    setGuarantees(prev => [...prev, newGuaranteeItem]);
    
    // Ré©initialiser le formulaire de nouvelle garantie
    setNewGuarantee({
      type: 'materiel',
      value: 0,
      status: 'active'
    });
    
    // Mettre à jour la valeur totale des garanties
    const totalValue = [...guarantees, newGuaranteeItem].reduce((sum, g) => sum + g.value, 0);
    setFormData(prev => ({ ...prev, guarantee_amount: totalValue }));
  };

  // Supprimer une garantie
  const handleRemoveGuarantee = (guaranteeId: string) => {
    const currentGuarantees = Array.isArray(guarantees) ? guarantees : [];
    const updatedGuarantees = currentGuarantees.filter((g: Guarantee) => g.id !== guaranteeId);
    setGuarantees(updatedGuarantees);
    
    // Mettre à jour la valeur totale des garanties
    const totalValue = updatedGuarantees.reduce((sum: number, g: Guarantee) => sum + g.value, 0);
    setFormData(prev => ({ ...prev, guarantee_amount: totalValue }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Sauvegarder les modifications du contrat
      await onSave(formData);
      
      // Sauvegarder les garanties
      if (contract.id) {
        // Utiliser le nouveau service de garanties pour sauvegarder
        await Promise.all(guarantees.map(async (guarantee) => {
          if (guarantee.id.startsWith('new-')) {
            // C'est une nouvelle garantie, l'ajouter
            // Gé©né©rer un nouvel ID au format "g-" + timestamp + random
            const newId = `g-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
            const newGuarantee = { ...guarantee, id: newId, contractId: contract.id };
            await guaranteeService.addGuarantee(newGuarantee);
          } else {
            // C'est une garantie existante, la mettre à jour
            await guaranteeService.updateGuarantee(guarantee.id, guarantee);
          }
        }));
        
        // Supprimer les garanties qui ont é©té© retiRé©es
        const existingGuarantees = await guaranteeService.getGuaranteesByContractId(contract.id);
        const guaranteeIds = guarantees.map(g => g.id);
        
        for (const existingGuarantee of existingGuarantees) {
          if (!guaranteeIds.includes(existingGuarantee.id)) {
            await guaranteeService.deleteGuarantee(existingGuarantee.id);
          }
        }
      }
      
      showNotification('Paramé¨tres du contrat mis é  jour avec succé¨s', 'success');
      onClose();
    } catch (error) {
      console.error('Erreur lors de la mise é  jour des paramé¨tres du contrat:', error);
      showNotification('Erreur lors de la mise é  jour des paramé¨tres du contrat', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={isOpen => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Modifier les paramé¨tres du contrat</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          {/* Informations gé©né©rales */}
          <Card className="p-4">
            <div className="flex items-center mb-4">
              <DocumentIcon className="h-5 w-5 text-gray-500 mr-2" />
              <h3 className="text-lg font-medium">Informations gé©né©rales</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ré©fé©rence du contrat
                </label>
                <Input
                  value={contract.contract_number}
                  disabled
                  className="bg-gray-100"
                />
                <p className="text-xs text-gray-500 mt-1">La Ré©fé©rence du contrat ne peut pas éªtre modifié©e</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type de produit
                </label>
                <Input
                  name="productName"
                  value={formData.product_type}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date de signature
                </label>
                <Input
                  type="date"
                  name="startDate"
                  value={formData.start_date}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date d'é©ché©ance
                </label>
                <Input
                  type="date"
                  name="endDate"
                  value={formData.end_date}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
          </Card>
          
          {/* Informations financières */}
          <Card className="p-4">
            <div className="flex items-center mb-4">
              <CurrencyDollarIcon className="h-5 w-5 text-gray-500 mr-2" />
              <h3 className="text-lg font-medium">Informations financières</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Montant accordû©
                </label>
                <Input
                  type="number"
                  step="0.01"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  required
                  min="0"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Montant restant dû»
                </label>
                <Input
                  type="number"
                  step="0.01"
                  name="remainingAmount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  required
                  min="0"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Taux d'inté©Réªt (%)
                </label>
                <Input
                  type="number"
                  step="0.01"
                  name="interestRate"
                  value={formData.interest_rate}
                  onChange={handleInputChange}
                  required
                  min="0"
                  max="100"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mé©thode d'amortissement
                </label>
                <Select
                  name="amortization_method"
                  value={formData.amortization_method}
                  onChange={handleSelectChange}
                  required
                  className="block w-full"
                >
                  <option value="linear">Liné©aire (constant)</option>
                  <option value="degressive">dû©gressive</option>
                  <option value="progressive">Progressive</option>
                  <option value="balloon">Paiement ballon</option>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  DuRé©e (mois)
                </label>
                <Input
                  type="number"
                  name="duration"
                  value={formData.term_months}
                  onChange={handleInputChange}
                  min="1"
                  disabled
                  className="bg-gray-100"
                />
                <p className="text-xs text-gray-500 mt-1">Calculé automatiquement à partir des dates</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pé©riode de gRé¢ce (mois)
                </label>
                <Input
                  type="number"
                  name="gracePeriod"
                  value={formData.grace_period}
                  onChange={handleInputChange}
                  min="0"
                />
              </div>
            </div>
          </Card>
          
          {/* Informations client */}
          <Card className="p-4">
            <div className="flex items-center mb-4">
              <UserIcon className="h-5 w-5 text-gray-500 mr-2" />
              <h3 className="text-lg font-medium">Informations client</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Client
                </label>
                <Input
                  name="memberName"
                  value={formData.company_name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ID du client
                </label>
                <Input
                  value={contract.client_id}
                  disabled
                  className="bg-gray-100"
                />
                <p className="text-xs text-gray-500 mt-1">L'ID du client ne peut pas éªtre modifié©</p>
              </div>
            </div>
          </Card>
          
          {/* Informations lé©gales et complé©mentaires */}
          <Card className="p-4">
            <div className="flex items-center mb-4">
              <ScaleIcon className="h-5 w-5 text-gray-500 mr-2" />
              <h3 className="text-lg font-medium">Informations lé©gales et complé©mentaires</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Statut du contrat
                </label>
                <Select
                  name="status"
                  value={formData.status}
                  onChange={handleSelectChange}
                  required
                  className="block w-full"
                >
                  <option value="active">Actif</option>
                  <option value="suspended">Suspendu</option>
                  <option value="completed">Clé´tuRé©</option>
                  <option value="defaulted">En dû©faut</option>
                  <option value="in_litigation">En contentieux</option>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Classe de risque
                </label>
                <Select
                  name="riskClass"
                  value={formData.risk_rating}
                  onChange={handleSelectChange}
                  required
                  className="block w-full"
                >
                  <option value="standard">Standard</option>
                  <option value="watch">Surveillance</option>
                  <option value="substandard">Sous-standard</option>
                  <option value="doubtful">Douteux</option>
                  <option value="loss">Perte</option>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Montant dû©caissé©
                </label>
                <Input
                  type="number"
                  step="0.01"
                  name="disbursedAmount"
                  value={formData.disbursements?.reduce((sum, d) => sum + d.amount, 0) || 0}
                  onChange={handleInputChange}
                  min="0"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Jours de retard
                </label>
                <Input
                  type="number"
                  name="delinquencyDays"
                  value={formData.days_past_due}
                  onChange={handleInputChange}
                  min="0"
                />
              </div>
            </div>
          </Card>
          
          {/* Section des garanties */}
          <Card className="p-4">
            <div className="flex items-center mb-4">
              <ShieldCheckIcon className="h-5 w-5 text-gray-500 mr-2" />
              <h3 className="text-lg font-medium">Garanties</h3>
            </div>
            
            {/* Liste des garanties existantes */}
            {guarantees.length > 0 ? (
              <div className="mb-6">
                <h4 className="text-md font-medium mb-2">Garanties existantes</h4>
                <div className="space-y-3">
                  {guarantees.map(guarantee => (
                    <div key={guarantee.id} className="flex items-center justify-between p-3 border rounded-md">
                      <div>
                        <div className="font-medium">{guarantee.type.charAt(0).toUpperCase() + guarantee.type.slice(1).replace('_', ' ')}</div>
                        <div className="text-sm text-gray-500">
                          Valeur: {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XAF' }).format(guarantee.value)}
                          {guarantee.details?.contract_number && ` ¢ Ré©f: ${guarantee.details.contract_number}`}
                        </div>
                      </div>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        className="text-red-500"
                        onClick={() => handleRemoveGuarantee(guarantee.id)}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="mt-3 text-sm">
                  <div className="font-medium">Valeur totale des garanties:</div>
                  <div className="text-gray-700">{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XAF' }).format(formData.guarantee_amount || 0)}</div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic mb-4">Aucune garantie associée à ce contrat</p>
            )}
            
            {/* Formulaire d'ajout de garantie */}
            <div className="mt-4 border-t pt-4">
              <h4 className="text-md font-medium mb-3">Ajouter une garantie</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type de garantie
                  </label>
                  <Select
                    name="type"
                    value={newGuarantee.type}
                    onChange={handleGuaranteeInputChange}
                    className="block w-full"
                  >
                    <option value="materiel">Maté©riel</option>
                    <option value="immobilier">Immobilier</option>
                    <option value="caution_bancaire">Caution bancaire</option>
                    <option value="fonds_garantie">Fonds de garantie</option>
                    <option value="assurance_credit">Assurance cRé©dit</option>
                    <option value="nantissement">Nantissement</option>
                    <option value="gage">Gage</option>
                    <option value="hypotheque">Hypothé¨que</option>
                    <option value="depot_especes">dû©pé´t espé¨ces</option>
                    <option value="autre">Autre</option>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Valeur
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    name="value"
                    value={newGuarantee.value}
                    onChange={handleGuaranteeInputChange}
                    min="0"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Statut
                  </label>
                  <Select
                    name="status"
                    value={newGuarantee.status}
                    onChange={handleGuaranteeInputChange}
                    className="block w-full"
                  >
                    <option value="active">Active</option>
                    <option value="pending">En attente</option>
                    <option value="libé©Ré©e">Libé©Ré©e</option>
                    <option value="saisie">Saisie</option>
                    <option value="expiRé©e">ExpiRé©e</option>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ré©fé©rence
                  </label>
                  <Input
                    name="reference"
                    value={newGuarantee.details?.contract_number || ''}
                    onChange={e => setNewGuarantee(prev => ({ 
                      ...prev, 
                      details: { ...prev.details, contract_number: e.target.value } 
                    }))}
                    placeholder="Numé©ro de Ré©fé©rence (facultatif)"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <TextArea
                    name="description"
                    value={newGuarantee.details?.description || ''}
                    onChange={e => setNewGuarantee(prev => ({ 
                      ...prev, 
                      details: { ...prev.details, description: e.target.value } 
                    }))}
                    rows={2}
                    placeholder="Description de la garantie (facultatif)"
                  />
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button
                  type="button"
                  onClick={handleAddGuarantee}
                  variant="outline"
                  className="flex items-center"
                >
                  <PlusIcon className="h-4 w-4 mr-1" />
                  Ajouter cette garantie
                </Button>
              </div>
            </div>
          </Card>
          
          <DialogFooter className="flex justify-end space-x-3 pt-4 border-t">
            <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}







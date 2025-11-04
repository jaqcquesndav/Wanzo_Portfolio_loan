// components/portfolio/traditional/contract/ContractDetails.tsx
import { useState, useEffect } from 'react';
import { CreditContract } from '../../../../types/credit';
import { Card } from '../../../ui/Card';
import { Button } from '../../../ui/Button';
import { Input } from '../../../ui/Form';
import { CalendarIcon, DocumentIcon, UserIcon, BuildingOfficeIcon, CurrencyDollarIcon, ScaleIcon, PencilIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useNotification } from '../../../../contexts/useNotification';
import { useCurrencyContext } from '../../../../hooks/useCurrencyContext';
import { GuaranteeCard } from '../guarantees/GuaranteeCard';
import { Guarantee } from '../../../../types/guarantee';
import { traditionalDataService } from '../../../../services/api/traditional/dataService';

// Fonction utilitaire pour le formatage des dates
const formatDate = (dateString?: string) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

// Interface pour les options de sélection
interface SelectOption {
  value: string;
  label: string;
}

// Interface pour les champs d'information
interface InfoField {
  field: string;
  label: string;
  value: string | number;
  icon: JSX.Element;
  editable: boolean;
  type?: 'text' | 'number' | 'date' | 'select';
  displayValue?: string;
  options?: SelectOption[];
}

interface ContractDetailsProps {
  contract: CreditContract;
  onUpdate?: (updatedContract: Partial<CreditContract>) => Promise<void>;
}

export default function ContractDetails({ contract, onUpdate }: ContractDetailsProps) {
  const [editMode, setEditMode] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<CreditContract>>({});
  const [guarantees, setGuarantees] = useState<Guarantee[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const { showNotification } = useNotification();
  const { formatAmount } = useCurrencyContext();
  
  // Récupérer les garanties associées au contrat
  useEffect(() => {
    if (contract?.id) {
      const contractGuarantees = traditionalDataService.getContractRelatedData<Guarantee>(
        contract.id,
        'GUARANTEES'
      );
      setGuarantees(contractGuarantees);
    }
  }, [contract?.id]);
  
  // Calculer la durée en mois entre la date de début et la date de fin
  const calculateTermInMonths = (): number => {
    const startDate = new Date(contract.startDate);
    const endDate = new Date(contract.endDate);
    return (endDate.getFullYear() - startDate.getFullYear()) * 12 + 
           (endDate.getMonth() - startDate.getMonth());
  };

  // Activer le mode d'édition pour un champ spécifique
  const handleEnableEdit = (field: string, initialValue: string | number) => {
    setEditMode(field);
    setEditValues({
      ...editValues,
      [field]: initialValue
    });
  };

  // Annuler l'édition
  const handleCancelEdit = () => {
    setEditMode(null);
    setEditValues({});
  };

  // Sauvegarder les modifications
  const handleSaveEdit = async (field: string) => {
    if (!onUpdate) {
      setEditMode(null);
      return;
    }

    try {
      // Créer l'objet de mise à jour avec seulement le champ modifié
      const updateData: Partial<CreditContract> = {
        [field]: editValues[field as keyof typeof editValues]
      };

      // Appeler la fonction de mise à jour fournie
      await onUpdate(updateData);
      
      // Afficher une notification de succès
      showNotification('Information mise à jour avec succès', 'success');
      
      // Quitter le mode édition
      setEditMode(null);
    } catch (error) {
      showNotification('Erreur lors de la mise à jour', 'error');
      console.error('Erreur lors de la mise à jour:', error);
    }
  };
  
  // Gérer le changement de valeur dans l'édition
  const handleChange = (field: string, value: string | number) => {
    setEditValues({
      ...editValues,
      [field]: value
    });
    setHasChanges(true);
  };
  
  // Sauvegarder toutes les modifications
  const handleSaveAllChanges = async () => {
    if (!onUpdate || !hasChanges) return;
    
    try {
      // Appeler la fonction de mise à jour fournie avec toutes les modifications
      await onUpdate(editValues);
      
      // Afficher une notification de succès
      showNotification('Toutes les informations ont été mises à jour avec succès', 'success');
      
      // Réinitialiser
      setEditValues({});
      setHasChanges(false);
      setEditMode(null);
    } catch (error) {
      showNotification('Erreur lors de la mise à jour', 'error');
      console.error('Erreur lors de la mise à jour:', error);
    }
  };
  
  // Fonction pour rendre un champ éditable
  const renderEditableField = (
    field: string, 
    label: string, 
    value: string | number, 
    icon: React.ReactNode, 
    type: 'text' | 'number' | 'date' | 'select' = 'text', 
    options?: SelectOption[]
  ) => {
    const isEditing = editMode === field;
    const currentValue = isEditing ? editValues[field as keyof typeof editValues] || value : value;

    return (
      <div key={field} className="flex items-start">
        <div className="mr-2 mt-1">{icon}</div>
        <div className="flex-1">
          <dt className="text-sm font-medium text-gray-500">{label}</dt>
          
          {isEditing ? (
            <div className="mt-1 flex items-center">
              {type === 'select' && options ? (
                <select
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  value={currentValue as string}
                  onChange={(e) => handleChange(field, e.target.value)}
                >
                  {options.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              ) : (
                <Input
                  type={type}
                  value={currentValue !== undefined ? String(currentValue) : ''}
                  onChange={(e) => handleChange(
                    field, 
                    type === 'number' ? parseFloat(e.target.value) : e.target.value
                  )}
                  className="w-full"
                />
              )}
              
              <div className="ml-2 flex space-x-1">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleSaveEdit(field)}
                  title="Enregistrer"
                >
                  <CheckIcon className="h-4 w-4 text-green-600" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleCancelEdit}
                  title="Annuler"
                >
                  <XMarkIcon className="h-4 w-4 text-red-600" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="mt-1 flex items-center group">
              <dd className="text-sm text-gray-900">{value}</dd>
              {onUpdate && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleEnableEdit(field, value)}
                  title="Modifier"
                >
                  <PencilIcon className="h-4 w-4 text-gray-500" />
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Définir les options pour les champs de type select
  const statusOptions: SelectOption[] = [
    { value: 'active', label: 'Actif' },
    { value: 'suspended', label: 'Suspendu' },
    { value: 'closed', label: 'Clôturé' },
    { value: 'defaulted', label: 'En défaut' }
  ];

  const riskClassOptions: SelectOption[] = [
    { value: 'A', label: 'A - Très faible risque' },
    { value: 'B', label: 'B - Faible risque' },
    { value: 'C', label: 'C - Risque modéré' },
    { value: 'D', label: 'D - Risque élevé' },
    { value: 'E', label: 'E - Très haut risque' }
  ];

  // Organiser les informations à afficher
  // Informations générales
  const generalInfoFields: InfoField[] = [
    { 
      field: 'reference', 
      label: 'Référence du contrat', 
      value: contract.reference, 
      icon: <DocumentIcon className="h-5 w-5 text-gray-500" />,
      editable: false // ID ne doit pas être modifiable
    },
    { 
      field: 'productName', 
      label: 'Type de produit', 
      value: contract.productName, 
      icon: <CurrencyDollarIcon className="h-5 w-5 text-gray-500" />,
      editable: true,
      type: 'text'
    },
    { 
      field: 'startDate', 
      label: 'Date de signature', 
      value: contract.startDate ? contract.startDate.split('T')[0] : '', 
      displayValue: formatDate(contract.startDate),
      icon: <CalendarIcon className="h-5 w-5 text-gray-500" />,
      editable: true,
      type: 'date'
    },
    { 
      field: 'endDate', 
      label: 'Date d\'échéance', 
      value: contract.endDate ? contract.endDate.split('T')[0] : '',
      displayValue: formatDate(contract.endDate),
      icon: <CalendarIcon className="h-5 w-5 text-gray-500" />,
      editable: true,
      type: 'date'
    }
  ];
  
  // Informations financières
  const financialInfoFields: InfoField[] = [
    { 
      field: 'amount', 
      label: 'Montant accordé', 
      value: contract.amount,
      displayValue: formatAmount(contract.amount),
      icon: <CurrencyDollarIcon className="h-5 w-5 text-gray-500" />,
      editable: true,
      type: 'number'
    },
    { 
      field: 'remainingAmount', 
      label: 'Montant restant dû', 
      value: contract.remainingAmount || 0,
      displayValue: formatAmount(contract.remainingAmount || 0),
      icon: <CurrencyDollarIcon className="h-5 w-5 text-gray-500" />,
      editable: true,
      type: 'number'
    },
    { 
      field: 'amortization_method', 
      label: 'Méthode d\'amortissement', 
      value: contract.amortization_method || 'linear',
      displayValue: contract.amortization_method === 'linear' ? 'Linéaire (constant)' :
                   contract.amortization_method === 'degressive' ? 'Dégressive' :
                   contract.amortization_method === 'progressive' ? 'Progressive' :
                   contract.amortization_method === 'balloon' ? 'Paiement ballon' : 'Linéaire (constant)',
      icon: <ScaleIcon className="h-5 w-5 text-gray-500" />,
      editable: true,
      type: 'select',
      options: [
        { value: 'linear', label: 'Linéaire (constant)' },
        { value: 'degressive', label: 'Dégressive' },
        { value: 'progressive', label: 'Progressive' },
        { value: 'balloon', label: 'Paiement ballon' }
      ]
    },
    { 
      field: 'interestRate', 
      label: 'Taux d\'intérêt', 
      value: contract.interestRate,
      displayValue: `${contract.interestRate}%`,
      icon: <CurrencyDollarIcon className="h-5 w-5 text-gray-500" />,
      editable: true,
      type: 'number'
    },
    { 
      field: 'term', 
      label: 'Durée (mois)', 
      value: calculateTermInMonths(),
      displayValue: calculateTermInMonths().toString(),
      icon: <CalendarIcon className="h-5 w-5 text-gray-500" />,
      editable: false // Calculé automatiquement
    }
  ];
  
  // Informations client
  const clientInfoFields: InfoField[] = [
    { 
      field: 'memberName', 
      label: 'Client', 
      value: contract.memberName,
      icon: <UserIcon className="h-5 w-5 text-gray-500" />,
      editable: true,
      type: 'text'
    },
    { 
      field: 'memberId', 
      label: 'ID du client', 
      value: contract.memberId,
      icon: <BuildingOfficeIcon className="h-5 w-5 text-gray-500" />,
      editable: false // ID ne doit pas être modifiable
    }
  ];
  
  // Informations légales
  const legalInfoFields: InfoField[] = [
    { 
      field: 'status', 
      label: 'Statut du contrat', 
      value: contract.status,
      icon: <ScaleIcon className="h-5 w-5 text-gray-500" />,
      editable: true,
      type: 'select',
      options: statusOptions
    },
    { 
      field: 'riskClass', 
      label: 'Classe de risque', 
      value: contract.riskClass,
      icon: <DocumentIcon className="h-5 w-5 text-gray-500" />,
      editable: true,
      type: 'select',
      options: riskClassOptions
    }
  ];
  
  // Intégrer les champs importants des informations supplémentaires
  const importantAdditionalFields: InfoField[] = [
    { 
      field: 'disbursedAmount', 
      label: 'Montant décaissé', 
      value: contract.disbursedAmount || 0,
      displayValue: formatAmount(contract.disbursedAmount || 0),
      icon: <CurrencyDollarIcon className="h-5 w-5 text-gray-500" />,
      editable: true,
      type: 'number'
    },
    { 
      field: 'delinquencyDays', 
      label: 'Jours de retard', 
      value: contract.delinquencyDays,
      displayValue: contract.delinquencyDays.toString(),
      icon: <UserIcon className="h-5 w-5 text-gray-500" />,
      editable: true,
      type: 'number'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Détails du contrat</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Informations générales */}
        <Card className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Informations générales</h3>
            
            {/* Bouton d'enregistrement dans la carte des informations générales */}
            {onUpdate && hasChanges && editMode === null && (
              <Button 
                onClick={handleSaveAllChanges}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm flex items-center"
                size="sm"
              >
                <CheckIcon className="h-4 w-4 mr-1" />
                Enregistrer
              </Button>
            )}
          </div>
          
          <dl className="grid grid-cols-1 gap-3">
            {generalInfoFields.map((item) => (
              item.editable 
                ? renderEditableField(
                    item.field, 
                    item.label, 
                    item.displayValue ? item.displayValue : item.value, 
                    item.icon, 
                    item.type, 
                    item.options
                  )
                : (
                  <div key={item.field} className="flex items-center">
                    <div className="mr-2">{item.icon}</div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">{item.label}</dt>
                      <dd className="mt-1 text-sm text-gray-900">{item.displayValue || item.value}</dd>
                    </div>
                  </div>
                )
            ))}
          </dl>
        </Card>
        
        {/* Informations financières */}
        <Card className="p-4">
          <h3 className="text-lg font-medium mb-4">Informations financières</h3>
          <dl className="grid grid-cols-1 gap-3">
            {financialInfoFields.map((item) => (
              item.editable 
                ? renderEditableField(
                    item.field, 
                    item.label, 
                    item.displayValue ? item.displayValue : item.value, 
                    item.icon, 
                    item.type, 
                    item.options
                  )
                : (
                  <div key={item.field} className="flex items-center">
                    <div className="mr-2">{item.icon}</div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">{item.label}</dt>
                      <dd className="mt-1 text-sm text-gray-900">{item.displayValue || item.value}</dd>
                    </div>
                  </div>
                )
            ))}
          </dl>
        </Card>
        
        {/* Informations client */}
        <Card className="p-4">
          <h3 className="text-lg font-medium mb-4">Informations client</h3>
          <dl className="grid grid-cols-1 gap-3">
            {clientInfoFields.map((item) => (
              item.editable 
                ? renderEditableField(
                    item.field, 
                    item.label, 
                    item.displayValue ? item.displayValue : item.value, 
                    item.icon, 
                    item.type, 
                    item.options
                  )
                : (
                  <div key={item.field} className="flex items-center">
                    <div className="mr-2">{item.icon}</div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">{item.label}</dt>
                      <dd className="mt-1 text-sm text-gray-900">{item.displayValue || item.value}</dd>
                    </div>
                  </div>
                )
            ))}
          </dl>
        </Card>
        
        {/* Fusion des informations légales et autres informations importantes */}
        <Card className="p-4">
          <h3 className="text-lg font-medium mb-4">Informations légales et complémentaires</h3>
          <dl className="grid grid-cols-1 gap-3">
            {[...legalInfoFields, ...importantAdditionalFields].map((item) => (
              item.editable 
                ? renderEditableField(
                    item.field, 
                    item.label, 
                    item.displayValue ? item.displayValue : item.value, 
                    item.icon, 
                    item.type, 
                    item.options
                  )
                : (
                  <div key={item.field} className="flex items-center">
                    <div className="mr-2">{item.icon}</div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">{item.label}</dt>
                      <dd className="mt-1 text-sm text-gray-900">{item.displayValue || item.value}</dd>
                    </div>
                  </div>
                )
            ))}
          </dl>
        </Card>
      </div>
      
      {/* Affichage du lien vers le document du contrat s'il existe */}
      {contract.documentUrl && (
        <Card className="p-4 mt-4">
          <h3 className="text-lg font-medium mb-4">Documents associés</h3>
          <p className="text-sm text-gray-700">
            <a href={contract.documentUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center">
              <DocumentIcon className="h-5 w-5 mr-2" />
              Ouvrir le document du contrat
            </a>
          </p>
        </Card>
      )}
      
      {/* Carte des garanties */}
      <Card className="p-4 mt-4">
        <h3 className="text-lg font-medium mb-4">Garanties associées</h3>
        {guarantees.length > 0 ? (
          <div className="space-y-4">
            {guarantees.map(guarantee => (
              <GuaranteeCard key={guarantee.id} guarantee={guarantee} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 italic">Aucune garantie associée à ce contrat</p>
        )}
      </Card>
      
      {/* Bouton flottant d'enregistrement des modifications */}
      {onUpdate && hasChanges && (
        <div className="fixed bottom-4 right-4 z-10">
          <Button 
            onClick={handleSaveAllChanges}
            className="shadow-lg bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
          >
            <CheckIcon className="h-5 w-5 mr-2" />
            Enregistrer les modifications
          </Button>
        </div>
      )}
    </div>
  );
}

// Exportation nommée pour la compatibilité
export { ContractDetails };

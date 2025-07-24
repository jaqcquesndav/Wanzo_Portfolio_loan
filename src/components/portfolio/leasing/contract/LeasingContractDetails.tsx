// components/portfolio/leasing/contract/LeasingContractDetails.tsx
import { useState } from 'react';
import { Card } from '../../../ui/Card';
import { Button } from '../../../ui/Button';
import { Input } from '../../../ui/Form';
import { 
  CalendarIcon, 
  DocumentIcon, 
  UserIcon, 
  BuildingOfficeIcon, 
  CurrencyDollarIcon, 
  ScaleIcon, 
  PencilIcon, 
  CheckIcon, 
  XMarkIcon,
  WrenchIcon,
  ShieldCheckIcon,
  TruckIcon
} from '@heroicons/react/24/outline';
import { useNotification } from '../../../../contexts/NotificationContext';
import { useFormatCurrency } from '../../../../hooks/useFormatCurrency';

// Interface pour les données du contrat de leasing (simplifié)
interface LeasingContract {
  id: string;
  equipment_id: string;
  equipment_name?: string;
  equipment_category?: string;
  equipment_manufacturer?: string;
  equipment_model?: string;
  client_id: string;
  client_name?: string;
  start_date: string;
  end_date: string;
  monthly_payment: number;
  interest_rate: number;
  maintenance_included: boolean;
  insurance_included: boolean;
  status: 'active' | 'pending' | 'completed' | 'terminated';
  residual_value?: number;
  total_value?: number;
  payments_made?: number;
  remaining_payments?: number;
  last_payment_date?: string;
  next_payment_date?: string;
  delinquency_days?: number;
}

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
  value: string | number | boolean;
  icon: JSX.Element;
  editable: boolean;
  type?: 'text' | 'number' | 'date' | 'select' | 'checkbox';
  displayValue?: string;
  options?: SelectOption[];
}

interface LeasingContractDetailsProps {
  contract: LeasingContract;
  onUpdate?: (updatedContract: Partial<LeasingContract>) => Promise<void>;
}

export default function LeasingContractDetails({ contract, onUpdate }: LeasingContractDetailsProps) {
  const [editMode, setEditMode] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<LeasingContract>>({});
  const { showNotification } = useNotification();
  const { formatCurrency } = useFormatCurrency();
  
  // Calculer la durée en mois entre la date de début et la date de fin
  const calculateTermInMonths = (): number => {
    const startDate = new Date(contract.start_date);
    const endDate = new Date(contract.end_date);
    return (endDate.getFullYear() - startDate.getFullYear()) * 12 + 
           (endDate.getMonth() - startDate.getMonth());
  };

  // Activer le mode d'édition pour un champ spécifique
  const handleEnableEdit = (field: string, initialValue: string | number | boolean) => {
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
      const updateData: Partial<LeasingContract> = {
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
  const handleChange = (field: string, value: string | number | boolean) => {
    setEditValues({
      ...editValues,
      [field]: value
    });
  };
  
  // Fonction pour rendre un champ éditable
  const renderEditableField = (
    field: string, 
    label: string, 
    value: string | number | boolean, 
    icon: React.ReactNode, 
    type: 'text' | 'number' | 'date' | 'select' | 'checkbox' = 'text', 
    options?: SelectOption[]
  ) => {
    const isEditing = editMode === field;
    const currentValue = isEditing ? editValues[field as keyof typeof editValues] ?? value : value;

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
              ) : type === 'checkbox' ? (
                <input
                  type="checkbox"
                  checked={Boolean(currentValue)}
                  onChange={(e) => handleChange(field, e.target.checked)}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
              ) : (
                <Input
                  type={type}
                  value={currentValue !== undefined && typeof currentValue !== 'boolean' ? String(currentValue) : ''}
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
              {typeof value === 'boolean' ? (
                <dd className="text-sm text-gray-900">{value ? 'Oui' : 'Non'}</dd>
              ) : (
                <dd className="text-sm text-gray-900">{value}</dd>
              )}
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
    { value: 'pending', label: 'En attente' },
    { value: 'completed', label: 'Terminé' },
    { value: 'terminated', label: 'Résilié' }
  ];

  // Organiser les informations à afficher
  // Informations générales
  const generalInfoFields: InfoField[] = [
    { 
      field: 'id', 
      label: 'Référence du contrat', 
      value: contract.id, 
      icon: <DocumentIcon className="h-5 w-5 text-gray-500" />,
      editable: false // ID ne doit pas être modifiable
    },
    { 
      field: 'equipment_name', 
      label: 'Équipement', 
      value: contract.equipment_name || 'N/A', 
      icon: <TruckIcon className="h-5 w-5 text-gray-500" />,
      editable: false
    },
    { 
      field: 'start_date', 
      label: 'Date de début', 
      value: contract.start_date ? contract.start_date.split('T')[0] : '', 
      displayValue: formatDate(contract.start_date),
      icon: <CalendarIcon className="h-5 w-5 text-gray-500" />,
      editable: true,
      type: 'date'
    },
    { 
      field: 'end_date', 
      label: 'Date de fin', 
      value: contract.end_date ? contract.end_date.split('T')[0] : '',
      displayValue: formatDate(contract.end_date),
      icon: <CalendarIcon className="h-5 w-5 text-gray-500" />,
      editable: true,
      type: 'date'
    }
  ];
  
  // Informations financières
  const financialInfoFields: InfoField[] = [
    { 
      field: 'monthly_payment', 
      label: 'Paiement mensuel', 
      value: contract.monthly_payment,
      displayValue: formatCurrency(contract.monthly_payment),
      icon: <CurrencyDollarIcon className="h-5 w-5 text-gray-500" />,
      editable: true,
      type: 'number'
    },
    { 
      field: 'total_value', 
      label: 'Valeur totale du contrat', 
      value: contract.total_value || calculateTermInMonths() * contract.monthly_payment,
      displayValue: formatCurrency(contract.total_value || calculateTermInMonths() * contract.monthly_payment),
      icon: <CurrencyDollarIcon className="h-5 w-5 text-gray-500" />,
      editable: false // Calculé automatiquement
    },
    { 
      field: 'interest_rate', 
      label: 'Taux d\'intérêt', 
      value: contract.interest_rate,
      displayValue: `${contract.interest_rate}%`,
      icon: <CurrencyDollarIcon className="h-5 w-5 text-gray-500" />,
      editable: true,
      type: 'number'
    },
    { 
      field: 'residual_value', 
      label: 'Valeur résiduelle', 
      value: contract.residual_value || 0,
      displayValue: formatCurrency(contract.residual_value || 0),
      icon: <CurrencyDollarIcon className="h-5 w-5 text-gray-500" />,
      editable: true,
      type: 'number'
    }
  ];
  
  // Informations client
  const clientInfoFields: InfoField[] = [
    { 
      field: 'client_name', 
      label: 'Client', 
      value: contract.client_name || 'N/A',
      icon: <UserIcon className="h-5 w-5 text-gray-500" />,
      editable: true,
      type: 'text'
    },
    { 
      field: 'client_id', 
      label: 'ID du client', 
      value: contract.client_id,
      icon: <BuildingOfficeIcon className="h-5 w-5 text-gray-500" />,
      editable: false // ID ne doit pas être modifiable
    }
  ];
  
  // Informations équipement et services
  const equipmentInfoFields: InfoField[] = [
    { 
      field: 'equipment_model', 
      label: 'Modèle', 
      value: contract.equipment_model || 'N/A',
      icon: <TruckIcon className="h-5 w-5 text-gray-500" />,
      editable: false
    },
    { 
      field: 'equipment_manufacturer', 
      label: 'Fabricant', 
      value: contract.equipment_manufacturer || 'N/A',
      icon: <BuildingOfficeIcon className="h-5 w-5 text-gray-500" />,
      editable: false
    },
    { 
      field: 'maintenance_included', 
      label: 'Maintenance incluse', 
      value: contract.maintenance_included,
      displayValue: contract.maintenance_included ? 'Oui' : 'Non',
      icon: <WrenchIcon className="h-5 w-5 text-gray-500" />,
      editable: true,
      type: 'checkbox'
    },
    { 
      field: 'insurance_included', 
      label: 'Assurance incluse', 
      value: contract.insurance_included,
      displayValue: contract.insurance_included ? 'Oui' : 'Non',
      icon: <ShieldCheckIcon className="h-5 w-5 text-gray-500" />,
      editable: true,
      type: 'checkbox'
    }
  ];
  
  // Informations sur les paiements
  const paymentInfoFields: InfoField[] = [
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
      field: 'payments_made', 
      label: 'Paiements effectués', 
      value: contract.payments_made || 0,
      icon: <CurrencyDollarIcon className="h-5 w-5 text-gray-500" />,
      editable: false
    },
    { 
      field: 'remaining_payments', 
      label: 'Paiements restants', 
      value: contract.remaining_payments || 0,
      icon: <CurrencyDollarIcon className="h-5 w-5 text-gray-500" />,
      editable: false
    },
    { 
      field: 'delinquency_days', 
      label: 'Jours de retard', 
      value: contract.delinquency_days || 0,
      icon: <CalendarIcon className="h-5 w-5 text-gray-500" />,
      editable: true,
      type: 'number'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Détails du contrat de leasing</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Informations générales */}
        <Card className="p-4">
          <h3 className="text-lg font-medium mb-4">Informations générales</h3>
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
        
        {/* Informations équipement et services */}
        <Card className="p-4">
          <h3 className="text-lg font-medium mb-4">Équipement et services</h3>
          <dl className="grid grid-cols-1 gap-3">
            {equipmentInfoFields.map((item) => (
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
                      <dd className="mt-1 text-sm text-gray-900">
                        {typeof item.value === 'boolean' 
                          ? (item.value ? 'Oui' : 'Non') 
                          : (item.displayValue || item.value)}
                      </dd>
                    </div>
                  </div>
                )
            ))}
          </dl>
        </Card>
        
        {/* Informations sur les paiements */}
        <Card className="p-4 md:col-span-2">
          <h3 className="text-lg font-medium mb-4">Suivi des paiements</h3>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {paymentInfoFields.map((item) => (
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
    </div>
  );
}

// Exportation nommée pour la compatibilité
export { LeasingContractDetails };

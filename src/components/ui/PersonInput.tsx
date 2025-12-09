import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from './Button';
import { PeopleTable } from '../company/PeopleTable';
import { EditableField } from './EditableField';

interface PersonData {
  id: string;
  nom: string;
  prenoms: string;
  fonction: string;
  nationalite?: string;
  telephone?: string;
  email?: string;
  adresse?: string;
  pourcentageActions?: number;
  dateNomination?: string;
  typeContrat?: string;
  salaire?: number;
  diplomes?: string[];
}

interface PersonInputProps {
  people: PersonData[];
  onChange: (people: PersonData[]) => void;
  isEditing: boolean;
  disabled?: boolean;
  title?: string;
  subtitle?: string;
}

export const PersonInput: React.FC<PersonInputProps> = ({
  people,
  onChange,
  isEditing,
  disabled = false,
  title = 'Personnes',
  subtitle
}) => {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<PersonData>>({});

  const handleAddNew = () => {
    setFormData({
      id: crypto.randomUUID(),
      nom: '',
      prenoms: '',
      fonction: '',
    });
    setEditingId(null);
    setShowForm(true);
  };

  const handleSave = () => {
    if (!formData.nom || !formData.prenoms || !formData.fonction) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (editingId) {
      // Edit existing
      const updated = people.map(p =>
        p.id === editingId ? { ...p, ...formData } as PersonData : p
      );
      onChange(updated);
    } else {
      // Add new
      onChange([...people, formData as PersonData]);
    }

    setShowForm(false);
    setFormData({});
  };

  const handleCancel = () => {
    setShowForm(false);
    setFormData({});
    setEditingId(null);
  };

  if (!isEditing) {
    return (
      <div className="space-y-3">
        <div>
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">{title}</h3>
          {subtitle && <p className="text-xs text-gray-600 dark:text-gray-400">{subtitle}</p>}
        </div>
        <PeopleTable people={people} editable={false} compact={false} />
      </div>
    );
  }

  // Editing mode
  return (
    <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">{title}</h3>
          {subtitle && <p className="text-xs text-gray-600 dark:text-gray-400">{subtitle}</p>}
        </div>
        <Button
          size="sm"
          onClick={handleAddNew}
          disabled={disabled || showForm}
          className="flex items-center gap-1"
        >
          <Plus className="w-4 h-4" />
          Ajouter
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white dark:bg-gray-700 p-4 rounded-md border border-gray-300 dark:border-gray-600 space-y-3">
          <h4 className="font-medium text-gray-900 dark:text-white">
            {editingId ? 'Éditer une personne' : 'Ajouter une nouvelle personne'}
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <EditableField
              label="Nom *"
              value={formData.nom || ''}
              onChange={(value) => setFormData({ ...formData, nom: value })}
              isEditing={true}
              disabled={disabled}
            />
            <EditableField
              label="Prénoms *"
              value={formData.prenoms || ''}
              onChange={(value) => setFormData({ ...formData, prenoms: value })}
              isEditing={true}
              disabled={disabled}
            />
            <EditableField
              label="Fonction *"
              value={formData.fonction || ''}
              onChange={(value) => setFormData({ ...formData, fonction: value })}
              isEditing={true}
              disabled={disabled}
            />
            <EditableField
              label="Nationalité"
              value={formData.nationalite || ''}
              onChange={(value) => setFormData({ ...formData, nationalite: value })}
              isEditing={true}
              disabled={disabled}
            />
            <EditableField
              label="Email"
              value={formData.email || ''}
              onChange={(value) => setFormData({ ...formData, email: value })}
              isEditing={true}
              type="email"
              disabled={disabled}
            />
            <EditableField
              label="Téléphone"
              value={formData.telephone || ''}
              onChange={(value) => setFormData({ ...formData, telephone: value })}
              isEditing={true}
              type="tel"
              disabled={disabled}
            />
            <EditableField
              label="% d'actions"
              value={formData.pourcentageActions?.toString() || ''}
              onChange={(value) => setFormData({ ...formData, pourcentageActions: parseFloat(value) || 0 })}
              isEditing={true}
              type="number"
              disabled={disabled}
            />
            <EditableField
              label="Date de nomination"
              value={formData.dateNomination || ''}
              onChange={(value) => setFormData({ ...formData, dateNomination: value })}
              isEditing={true}
              type="date"
              disabled={disabled}
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button size="sm" onClick={handleSave} disabled={disabled}>
              {editingId ? 'Mettre à jour' : 'Ajouter'}
            </Button>
            <Button size="sm" variant="outline" onClick={handleCancel}>
              Annuler
            </Button>
          </div>
        </div>
      )}

      {/* List */}
      <PeopleTable
        people={people}
        editable={true}
        compact={false}
      />
    </div>
  );
};

import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from './Button';
import { EditableField } from './EditableField';
import { AssetTable } from '../company/AssetTable';

interface AssetData {
  id: string;
  designation: string;
  type: 'immobilier' | 'vehicule' | 'equipement' | 'stock' | 'autre';
  description?: string;
  prixAchat?: number;
  valeurActuelle?: number;
  devise?: 'USD' | 'CDF' | 'EUR';
  dateAcquisition?: string;
  etatActuel?: 'neuf' | 'excellent' | 'bon' | 'moyen' | 'mauvais' | 'deteriore';
  localisation?: string;
  numeroSerie?: string;
  marque?: string;
  modele?: string;
  quantite?: number;
  unite?: string;
  proprietaire?: 'propre' | 'location' | 'leasing' | 'emprunt';
  observations?: string;
}

interface AssetInputProps {
  assets: AssetData[];
  onChange: (assets: AssetData[]) => void;
  isEditing: boolean;
  disabled?: boolean;
  title?: string;
  assetTypes?: Array<'immobilier' | 'vehicule' | 'equipement' | 'stock' | 'autre'>;
}

export const AssetInput: React.FC<AssetInputProps> = ({
  assets,
  onChange,
  isEditing,
  disabled = false,
  title = 'Actifs et Équipements',
  assetTypes = ['immobilier', 'vehicule', 'equipement', 'autre']
}) => {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<AssetData>>({
    type: assetTypes[0],
    devise: 'USD',
    proprietaire: 'propre'
  });

  const typeLabels: Record<string, string> = {
    immobilier: 'Immobilier',
    vehicule: 'Véhicule',
    equipement: 'Équipement',
    stock: 'Stock',
    autre: 'Autre'
  };

  const stateOptions = [
    { value: 'neuf', label: 'Neuf' },
    { value: 'excellent', label: 'Excellent' },
    { value: 'bon', label: 'Bon' },
    { value: 'moyen', label: 'Moyen' },
    { value: 'mauvais', label: 'Mauvais' },
    { value: 'deteriore', label: 'Détérioré' }
  ];

  const ownerOptions = [
    { value: 'propre', label: 'Propre' },
    { value: 'location', label: 'Location' },
    { value: 'leasing', label: 'Leasing' },
    { value: 'emprunt', label: 'Emprunt' }
  ];

  const handleAddNew = () => {
    setFormData({
      id: crypto.randomUUID(),
      designation: '',
      type: assetTypes[0],
      devise: 'USD',
      proprietaire: 'propre'
    });
    setEditingId(null);
    setShowForm(true);
  };

  const handleSave = () => {
    if (!formData.designation || !formData.type) {
      alert('Veuillez remplir les champs obligatoires');
      return;
    }

    if (editingId) {
      const updated = assets.map(a =>
        a.id === editingId ? { ...a, ...formData } as AssetData : a
      );
      onChange(updated);
    } else {
      onChange([...assets, formData as AssetData]);
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
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">{title}</h3>
        <AssetTable assets={assets} editable={false} />
      </div>
    );
  }

  // Editing mode
  return (
    <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">{title}</h3>
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
            {editingId ? 'Éditer un actif' : 'Ajouter un nouvel actif'}
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <EditableField
              label="Désignation *"
              value={formData.designation || ''}
              onChange={(value) => setFormData({ ...formData, designation: value })}
              isEditing={true}
              disabled={disabled}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type *</label>
              <select
                value={formData.type || ''}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as 'immobilier' | 'vehicule' | 'equipement' | 'stock' | 'autre' })}
                disabled={disabled}
                className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:text-white dark:border-gray-600"
              >
                <option value="">Sélectionner un type</option>
                {assetTypes.map(t => (
                  <option key={t} value={t}>{typeLabels[t]}</option>
                ))}
              </select>
            </div>

            <EditableField
              label="Marque"
              value={formData.marque || ''}
              onChange={(value) => setFormData({ ...formData, marque: value })}
              isEditing={true}
              disabled={disabled}
            />

            <EditableField
              label="Modèle"
              value={formData.modele || ''}
              onChange={(value) => setFormData({ ...formData, modele: value })}
              isEditing={true}
              disabled={disabled}
            />

            <EditableField
              label="Prix d'achat"
              value={formData.prixAchat?.toString() || ''}
              onChange={(value) => setFormData({ ...formData, prixAchat: parseFloat(value) || 0 })}
              isEditing={true}
              type="number"
              disabled={disabled}
            />

            <EditableField
              label="Valeur actuelle"
              value={formData.valeurActuelle?.toString() || ''}
              onChange={(value) => setFormData({ ...formData, valeurActuelle: parseFloat(value) || 0 })}
              isEditing={true}
              type="number"
              disabled={disabled}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Devise</label>
              <select
                value={formData.devise || 'USD'}
                onChange={(e) => setFormData({ ...formData, devise: e.target.value as 'USD' | 'CDF' | 'EUR' })}
                disabled={disabled}
                className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:text-white dark:border-gray-600"
              >
                <option value="USD">USD</option>
                <option value="CDF">CDF</option>
                <option value="EUR">EUR</option>
              </select>
            </div>

            <EditableField
              label="Date d'acquisition"
              value={formData.dateAcquisition || ''}
              onChange={(value) => setFormData({ ...formData, dateAcquisition: value })}
              isEditing={true}
              type="date"
              disabled={disabled}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">État actuel</label>
              <select
                value={formData.etatActuel || ''}
                onChange={(e) => setFormData({ ...formData, etatActuel: e.target.value as 'neuf' | 'excellent' | 'bon' | 'moyen' | 'mauvais' | 'deteriore' })}
                disabled={disabled}
                className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:text-white dark:border-gray-600"
              >
                <option value="">Sélectionner un état</option>
                {stateOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <EditableField
              label="Localisation"
              value={formData.localisation || ''}
              onChange={(value) => setFormData({ ...formData, localisation: value })}
              isEditing={true}
              disabled={disabled}
            />

            <EditableField
              label="N° de série"
              value={formData.numeroSerie || ''}
              onChange={(value) => setFormData({ ...formData, numeroSerie: value })}
              isEditing={true}
              disabled={disabled}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Propriétaire</label>
              <select
                value={formData.proprietaire || 'propre'}
                onChange={(e) => setFormData({ ...formData, proprietaire: e.target.value as 'propre' | 'location' | 'leasing' | 'emprunt' })}
                disabled={disabled}
                className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:text-white dark:border-gray-600"
              >
                {ownerOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <EditableField
              label="Observations"
              value={formData.observations || ''}
              onChange={(value) => setFormData({ ...formData, observations: value })}
              isEditing={true}
              multiline={true}
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
      <AssetTable assets={assets} editable={true} />
    </div>
  );
};

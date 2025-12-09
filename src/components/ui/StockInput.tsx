import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from './Button';
import { EditableField } from './EditableField';
import { StockTable } from '../company/StockTable';

interface StockData {
  id: string;
  designation: string;
  categorie: 'matiere_premiere' | 'produit_semi_fini' | 'produit_fini' | 'fourniture' | 'emballage' | 'autre';
  description?: string;
  quantiteStock: number;
  unite: string;
  seuilMinimum?: number;
  seuilMaximum?: number;
  coutUnitaire: number;
  valeurTotaleStock: number;
  devise: 'USD' | 'CDF' | 'EUR';
  dateDernierInventaire?: string;
  dureeRotationMoyenne?: number;
  datePeremption?: string;
  emplacement?: string;
  conditionsStockage?: string;
  fournisseurPrincipal?: string;
  numeroLot?: string;
  codeArticle?: string;
  etatStock: 'excellent' | 'bon' | 'moyen' | 'deteriore' | 'perime';
  observations?: string;
}

interface StockInputProps {
  stocks: StockData[];
  onChange: (stocks: StockData[]) => void;
  isEditing: boolean;
  disabled?: boolean;
  title?: string;
}

export const StockInput: React.FC<StockInputProps> = ({
  stocks,
  onChange,
  isEditing,
  disabled = false,
  title = 'Stock et Inventaire'
}) => {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<StockData>>({
    devise: 'USD',
    etatStock: 'bon'
  });

  const categoryOptions = [
    { value: 'matiere_premiere', label: 'Matière première' },
    { value: 'produit_semi_fini', label: 'Produit semi-fini' },
    { value: 'produit_fini', label: 'Produit fini' },
    { value: 'fourniture', label: 'Fourniture' },
    { value: 'emballage', label: 'Emballage' },
    { value: 'autre', label: 'Autre' }
  ];

  const stateOptions = [
    { value: 'excellent', label: 'Excellent' },
    { value: 'bon', label: 'Bon' },
    { value: 'moyen', label: 'Moyen' },
    { value: 'deteriore', label: 'Détérioré' },
    { value: 'perime', label: 'Périmé' }
  ];

  const handleAddNew = () => {
    setFormData({
      id: crypto.randomUUID(),
      designation: '',
      categorie: 'produit_fini',
      quantiteStock: 0,
      unite: '',
      coutUnitaire: 0,
      valeurTotaleStock: 0,
      devise: 'USD',
      etatStock: 'bon'
    });
    setEditingId(null);
    setShowForm(true);
  };

  const handleSave = () => {
    if (!formData.designation || !formData.categorie || formData.quantiteStock === undefined || !formData.unite) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    // Calculate total value
    const totalValue = (formData.quantiteStock || 0) * (formData.coutUnitaire || 0);

    if (editingId) {
      const updated = stocks.map(s =>
        s.id === editingId
          ? { ...s, ...formData, valeurTotaleStock: totalValue } as StockData
          : s
      );
      onChange(updated);
    } else {
      onChange([
        ...stocks,
        { ...formData, valeurTotaleStock: totalValue } as StockData
      ]);
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
        <StockTable stocks={stocks} editable={false} compact={false} />
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
            {editingId ? 'Éditer un article' : 'Ajouter un nouvel article'}
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <EditableField
              label="Désignation *"
              value={formData.designation || ''}
              onChange={(value) => setFormData({ ...formData, designation: value })}
              isEditing={true}
              disabled={disabled}
            />

            <EditableField
              label="Code article"
              value={formData.codeArticle || ''}
              onChange={(value) => setFormData({ ...formData, codeArticle: value })}
              isEditing={true}
              disabled={disabled}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Catégorie *</label>
              <select
                value={formData.categorie || 'produit_fini'}
                onChange={(e) => setFormData({ ...formData, categorie: e.target.value as 'matiere_premiere' | 'produit_semi_fini' | 'produit_fini' | 'fourniture' | 'emballage' | 'autre' })}
                disabled={disabled}
                className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:text-white dark:border-gray-600"
              >
                {categoryOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <EditableField
              label="Quantité *"
              value={formData.quantiteStock?.toString() || ''}
              onChange={(value) => setFormData({ ...formData, quantiteStock: parseFloat(value) || 0 })}
              isEditing={true}
              type="number"
              disabled={disabled}
            />

            <EditableField
              label="Unité *"
              value={formData.unite || ''}
              onChange={(value) => setFormData({ ...formData, unite: value })}
              isEditing={true}
              disabled={disabled}
            />

            <EditableField
              label="Coût unitaire *"
              value={formData.coutUnitaire?.toString() || ''}
              onChange={(value) => setFormData({ ...formData, coutUnitaire: parseFloat(value) || 0 })}
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
              label="Seuil minimum"
              value={formData.seuilMinimum?.toString() || ''}
              onChange={(value) => setFormData({ ...formData, seuilMinimum: parseFloat(value) || 0 })}
              isEditing={true}
              type="number"
              disabled={disabled}
            />

            <EditableField
              label="Fournisseur principal"
              value={formData.fournisseurPrincipal || ''}
              onChange={(value) => setFormData({ ...formData, fournisseurPrincipal: value })}
              isEditing={true}
              disabled={disabled}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">État du stock</label>
              <select
                value={formData.etatStock || 'bon'}
                onChange={(e) => setFormData({ ...formData, etatStock: e.target.value as 'excellent' | 'bon' | 'moyen' | 'deteriore' | 'perime' })}
                disabled={disabled}
                className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:text-white dark:border-gray-600"
              >
                {stateOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <EditableField
              label="Date de dernière inventaire"
              value={formData.dateDernierInventaire || ''}
              onChange={(value) => setFormData({ ...formData, dateDernierInventaire: value })}
              isEditing={true}
              type="date"
              disabled={disabled}
            />

            <EditableField
              label="Conditions de stockage"
              value={formData.conditionsStockage || ''}
              onChange={(value) => setFormData({ ...formData, conditionsStockage: value })}
              isEditing={true}
              multiline={true}
              disabled={disabled}
            />

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
      <StockTable stocks={stocks} editable={true} compact={false} />
    </div>
  );
};

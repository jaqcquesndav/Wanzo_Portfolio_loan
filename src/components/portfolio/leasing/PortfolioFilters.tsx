import React from 'react';
import { FormField, Select } from '../../ui/Form';

interface PortfolioFiltersProps {
  filters: {
    status: string;
    riskProfile: string;
    sector: string;
    minAmount: string;
    equipmentType?: string;
  };
  onFilterChange: (key: string, value: string) => void;
}

export function PortfolioFilters({ filters, onFilterChange }: PortfolioFiltersProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
      <FormField label="Statut">
        <Select
          value={filters.status}
          onChange={(e) => onFilterChange('status', e.target.value)}
        >
          <option value="">Tous les statuts</option>
          <option value="active">Actif</option>
          <option value="inactive">Inactif</option>
        </Select>
      </FormField>

      <FormField label="Profil de risque">
        <Select
          value={filters.riskProfile}
          onChange={(e) => onFilterChange('riskProfile', e.target.value)}
        >
          <option value="">Tous les profils</option>
          <option value="conservative">Conservateur</option>
          <option value="moderate">Modéré</option>
          <option value="aggressive">Agressif</option>
        </Select>
      </FormField>

      <FormField label="Secteur">
        <Select
          value={filters.sector}
          onChange={(e) => onFilterChange('sector', e.target.value)}
        >
          <option value="">Tous les secteurs</option>
          <option value="Industrie">Industrie</option>
          <option value="Transport">Transport</option>
          <option value="Construction">Construction</option>
          <option value="Agriculture">Agriculture</option>
          <option value="Logistique">Logistique</option>
        </Select>
      </FormField>

      <FormField label="Montant minimum">
        <Select
          value={filters.minAmount}
          onChange={(e) => onFilterChange('minAmount', e.target.value)}
        >
          <option value="">Tous les montants</option>
          <option value="5000000">5M FCFA</option>
          <option value="25000000">25M FCFA</option>
          <option value="50000000">50M FCFA</option>
          <option value="100000000">100M FCFA</option>
        </Select>
      </FormField>

      <FormField label="Type d'équipement">
        <Select
          value={filters.equipmentType}
          onChange={(e) => onFilterChange('equipmentType', e.target.value)}
        >
          <option value="">Tous les types</option>
          <option value="industrial">Équipement industriel</option>
          <option value="transport">Véhicules</option>
          <option value="construction">Matériel BTP</option>
          <option value="agricultural">Matériel agricole</option>
          <option value="medical">Équipement médical</option>
        </Select>
      </FormField>
    </div>
  );
}
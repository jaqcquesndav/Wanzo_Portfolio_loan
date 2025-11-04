import React from 'react';
import { FormField, Select } from '../../ui/Form';

interface PortfolioFiltersProps {
  filters: {
    status: string;
    riskProfile: string;
    sector: string;
    minAmount: string;
  };
  onFilterChange: (key: string, value: string) => void;
}

export function PortfolioFilters({ filters, onFilterChange }: PortfolioFiltersProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
          <option value="moderate">ModûRé</option>
          <option value="aggressive">Agressif</option>
        </Select>
      </FormField>

      <FormField label="Secteur">
        <Select
          value={filters.sector}
          onChange={(e) => onFilterChange('sector', e.target.value)}
        >
          <option value="">Tous les secteurs</option>
          <option value="Agriculture">Agriculture</option>
          <option value="Commerce">Commerce</option>
          <option value="Education">Education</option>
          <option value="Energie">Energie</option>
          <option value="Industrie">Industrie</option>
          <option value="Santé">Santé</option>
          <option value="Services">Services</option>
          <option value="Technologies">Technologies</option>
          <option value="Transport">Transport</option>
        </Select>
      </FormField>

      <FormField label="Montant minimum">
        <Select
          value={filters.minAmount}
          onChange={(e) => onFilterChange('minAmount', e.target.value)}
        >
          <option value="">Tous les montants</option>
          <option value="1000000">1M FCFA</option>
          <option value="5000000">5M FCFA</option>
          <option value="10000000">10M FCFA</option>
          <option value="50000000">50M FCFA</option>
        </Select>
      </FormField>
    </div>
  );
}

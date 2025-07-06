import React from 'react';
import { FormField, Select } from '../ui/Form';

export function FundingFilters() {
  return (
    <div className="bg-white p-4 rounded-lg shadow space-y-4">
      <h3 className="font-medium text-gray-900">Filtres</h3>
      
      <FormField label="Type de financement">
        <Select defaultValue="">
          <option value="">Tous les types</option>
          <option value="equity">Capital-investissement</option>
          <option value="credit">Crédit</option>
          <option value="leasing">Leasing</option>
          <option value="grant">Subvention</option>
        </Select>
      </FormField>

      <FormField label="Montant minimum">
        <Select defaultValue="">
          <option value="">Tous les montants</option>
          <option value="10000000">10M FCFA</option>
          <option value="50000000">50M FCFA</option>
          <option value="100000000">100M FCFA</option>
        </Select>
      </FormField>

      <FormField label="Durée">
        <Select defaultValue="">
          <option value="">Toutes les durées</option>
          <option value="12">12 mois</option>
          <option value="24">24 mois</option>
          <option value="36">36 mois</option>
        </Select>
      </FormField>

      <FormField label="Fournisseur">
        <Select defaultValue="">
          <option value="">Tous les fournisseurs</option>
          <option value="boad">BOAD</option>
          <option value="bad">BAD</option>
          <option value="avc">Africa Venture Capital</option>
        </Select>
      </FormField>
    </div>
  );
}
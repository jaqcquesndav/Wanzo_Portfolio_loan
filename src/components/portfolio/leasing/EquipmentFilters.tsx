import React from 'react';
import { Search } from 'lucide-react';
import { FormField, Input, Select } from '../../ui/Form';

interface EquipmentFilters {
  category: string;
  condition: string;
  availability: string;
  priceRange: string;
  manufacturer: string;
}

interface EquipmentFiltersProps {
  filters: EquipmentFilters;
  onFilterChange: (key: keyof EquipmentFilters, value: string) => void;
  onSearch: (value: string) => void;
  searchTerm: string;
}

export function EquipmentFilters({
  filters,
  onFilterChange,
  onSearch,
  searchTerm
}: EquipmentFiltersProps) {
  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <Input
          type="text"
          placeholder="Rechercher un équipement..."
          value={searchTerm}
          onChange={(e) => onSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <FormField label="Catégorie">
          <Select
            value={filters.category}
            onChange={(e) => onFilterChange('category', e.target.value)}
          >
            <option value="">Toutes les catégories</option>
            <option value="Véhicules utilitaires">Véhicules utilitaires</option>
            <option value="Machines industrielles">Machines industrielles</option>
            <option value="Équipement BTP">Équipement BTP</option>
            <option value="Matériel agricole">Matériel agricole</option>
            <option value="Équipement médical">Équipement médical</option>
            <option value="Matériel informatique">Matériel informatique</option>
          </Select>
        </FormField>

        <FormField label="État">
          <Select
            value={filters.condition}
            onChange={(e) => onFilterChange('condition', e.target.value)}
          >
            <option value="">Tous les états</option>
            <option value="new">Neuf</option>
            <option value="used">Occasion</option>
          </Select>
        </FormField>

        <FormField label="Disponibilité">
          <Select
            value={filters.availability}
            onChange={(e) => onFilterChange('availability', e.target.value)}
          >
            <option value="">Toutes</option>
            <option value="true">Disponible</option>
            <option value="false">Non disponible</option>
          </Select>
        </FormField>

        <FormField label="Gamme de prix">
          <Select
            value={filters.priceRange}
            onChange={(e) => onFilterChange('priceRange', e.target.value)}
          >
            <option value="">Tous les prix</option>
            <option value="0-1000000">0 - 1M FCFA</option>
            <option value="1000000-5000000">1M - 5M FCFA</option>
            <option value="5000000-10000000">5M - 10M FCFA</option>
            <option value="10000000+">Plus de 10M FCFA</option>
          </Select>
        </FormField>

        <FormField label="Fabricant">
          <Select
            value={filters.manufacturer}
            onChange={(e) => onFilterChange('manufacturer', e.target.value)}
          >
            <option value="">Tous les fabricants</option>
            <option value="Toyota">Toyota</option>
            <option value="Caterpillar">Caterpillar</option>
            <option value="John Deere">John Deere</option>
            <option value="Siemens">Siemens</option>
            <option value="Philips">Philips</option>
          </Select>
        </FormField>
      </div>
    </div>
  );
}
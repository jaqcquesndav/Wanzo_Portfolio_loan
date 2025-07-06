import React from 'react';
import { Search, Filter } from 'lucide-react';
import { FormField, Input, Select } from '../ui/Form';
import { Button } from '../ui/Button';

interface CompanyFiltersProps {
  onSearch: (term: string) => void;
  onFilterChange: (filters: CompanyFilters) => void;
}

export interface CompanyFilters {
  sector?: string;
  size?: string;
  revenueMin?: number;
  revenueMax?: number;
  growthMin?: number;
  location?: string;
}

export function CompanyFilters({ onSearch, onFilterChange }: CompanyFiltersProps) {
  const [showAdvanced, setShowAdvanced] = React.useState(false);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 space-y-4">
      <div className="flex space-x-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Rechercher une entreprise..."
              onChange={(e) => onSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Button
          variant="outline"
          onClick={() => setShowAdvanced(!showAdvanced)}
          icon={<Filter className="h-4 w-4" />}
        >
          Filtres avancés
        </Button>
      </div>

      {showAdvanced && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField label="Secteur d'activité">
            <Select
              onChange={(e) => onFilterChange({ sector: e.target.value })}
            >
              <option value="">Tous les secteurs</option>
              <option value="tech">Technologies</option>
              <option value="health">Santé</option>
              <option value="education">Éducation</option>
              <option value="agriculture">Agriculture</option>
              <option value="energy">Énergie</option>
              <option value="transport">Transport</option>
              <option value="retail">Commerce</option>
              <option value="services">Services</option>
            </Select>
          </FormField>

          <FormField label="Taille de l'entreprise">
            <Select
              onChange={(e) => onFilterChange({ size: e.target.value })}
            >
              <option value="">Toutes les tailles</option>
              <option value="micro">Micro (1-9 employés)</option>
              <option value="small">Petite (10-49 employés)</option>
              <option value="medium">Moyenne (50-249 employés)</option>
              <option value="large">Grande (250+ employés)</option>
            </Select>
          </FormField>

          <FormField label="Chiffre d'affaires minimum">
            <Input
              type="number"
              placeholder="En FCFA"
              onChange={(e) => onFilterChange({ 
                revenueMin: e.target.value ? Number(e.target.value) : undefined 
              })}
            />
          </FormField>

          <FormField label="Chiffre d'affaires maximum">
            <Input
              type="number"
              placeholder="En FCFA"
              onChange={(e) => onFilterChange({ 
                revenueMax: e.target.value ? Number(e.target.value) : undefined 
              })}
            />
          </FormField>

          <FormField label="Croissance minimum (%)">
            <Input
              type="number"
              placeholder="Ex: 10"
              onChange={(e) => onFilterChange({ 
                growthMin: e.target.value ? Number(e.target.value) : undefined 
              })}
            />
          </FormField>

          <FormField label="Localisation">
            <Select
              onChange={(e) => onFilterChange({ location: e.target.value })}
            >
              <option value="">Toutes les régions</option>
              <option value="dakar">Dakar</option>
              <option value="thies">Thiès</option>
              <option value="saint-louis">Saint-Louis</option>
              <option value="kaolack">Kaolack</option>
              <option value="ziguinchor">Ziguinchor</option>
            </Select>
          </FormField>
        </div>
      )}
    </div>
  );
}
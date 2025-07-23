import { useState, useMemo, ReactNode } from 'react';
import { Button } from '../ui/Button';
import { Eye, TrendingUp, TrendingDown } from 'lucide-react';
import { useFormatCurrency } from '../../hooks/useFormatCurrency';
import type { Company } from '../../types/company';
import { Select } from '../ui/form/Select';
import { PaginatedTable } from '../ui/PaginatedTable';
import { Column } from '../ui/TableTypes';

interface CompanyListPaginatedProps {
  companies: Company[];
  onViewDetails: (company: Company) => void;
}

export function CompanyListPaginated({
  companies,
  onViewDetails
}: CompanyListPaginatedProps) {
  const [sectorFilter, setSectorFilter] = useState<string>('all');
  const [sizeFilter, setSizeFilter] = useState<string>('all');
  
  const { formatCurrency, currentCurrency } = useFormatCurrency();
  
  // Fonctions de tendance (simulées)
  const getTrendIcon = (trend: number) => {
    if (trend > 0) {
      return <span title="En hausse" className="ml-1 text-green-500"><TrendingUp size={16} /></span>;
    } else if (trend < 0) {
      return <span title="En baisse" className="ml-1 text-red-500"><TrendingDown size={16} /></span>;
    } else {
      return <span title="Stable" className="ml-1 text-gray-400">-</span>;
    }
  };
  
  const getRandomTrend = () => [1, 0, -1][Math.floor(Math.random() * 3)];
  
  // Fonction pour générer un rapport H/F pour chaque entreprise
  const getGenderRatio = (company: Company) => {
    // Si l'entreprise a déjà un rapport H/F, on l'utilise
    if (company.esg_metrics?.gender_ratio) {
      return company.esg_metrics.gender_ratio;
    }
    
    // Sinon, on génère des données aléatoires
    const male = Math.floor(Math.random() * 70) + 30; // Entre 30% et 100%
    return {
      male,
      female: 100 - male
    };
  };
  
  // Calculer les métriques pour la synthèse
  const marketSummary = useMemo(() => {
    const totalCompanies = companies.length;
    const provinces = new Set(companies.map(c => c.sector || 'Divers')).size;
    const countries = 1;
    const marketSize = companies.reduce((sum, c) => sum + c.annual_revenue, 0);
    const totalEmployees = companies.reduce((sum, c) => sum + c.employee_count, 0);
    const averageGrowth = companies.length > 0 
      ? companies.reduce((sum, c) => sum + c.financial_metrics.revenue_growth, 0) / companies.length 
      : 0;
    
    const totalMale = companies.reduce((sum, c) => {
      const ratio = getGenderRatio(c);
      return sum + ratio.male;
    }, 0);
    const averageMale = totalCompanies > 0 ? totalMale / totalCompanies : 0;
    const averageFemale = 100 - averageMale;
    
    return {
      totalCompanies,
      provinces,
      countries,
      marketSize,
      totalEmployees,
      averageGrowth,
      averageMale,
      averageFemale,
      growthTrend: averageGrowth > 10 ? 'up' : 'down',
      genderTrend: averageFemale > 35 ? 'up' : 'down'
    };
  }, [companies]);
  
  // Filtrer les données
  const filteredCompanies = useMemo(() => {
    let filtered = [...companies];
    
    if (sectorFilter !== 'all') {
      filtered = filtered.filter(c => c.sector === sectorFilter);
    }
    
    if (sizeFilter !== 'all') {
      filtered = filtered.filter(c => c.size === sizeFilter);
    }
    
    return filtered;
  }, [companies, sectorFilter, sizeFilter]);

  // Extraire les secteurs uniques pour le filtre
  const uniqueSectors = useMemo(() => {
    const sectors = companies.map(c => c.sector);
    return ['all', ...Array.from(new Set(sectors))];
  }, [companies]);
  
  // Définir les colonnes pour PaginatedTable
  const columns: Column<Company>[] = [
    {
      header: 'Entreprise',
      accessor: 'name' as keyof Company
    },
    {
      header: 'Secteur',
      accessor: 'sector' as keyof Company
    },
    {
      header: 'Employés',
      accessor: (c: Company) => c.employee_count.toString()
    },
    {
      header: 'Valeur (CA)',
      accessor: (c: Company) => {
        const trend = getRandomTrend();
        return (
          <span className="flex items-center">
            {formatCurrency(c.annual_revenue, undefined, 'USD')}
            {getTrendIcon(trend)}
          </span>
        );
      }
    },
    {
      header: `Croissance`,
      accessor: (c: Company) => `${c.financial_metrics.revenue_growth}%`
    },
    {
      header: 'MBE (EBITDA)',
      accessor: (c: Company) => {
        const trend = getRandomTrend();
        return (
          <span className="flex items-center">
            {c.financial_metrics.ebitda ? formatCurrency(c.financial_metrics.ebitda, undefined, 'USD') : '-'}
            {getTrendIcon(trend)}
          </span>
        );
      }
    },
    {
      header: 'Cote crédit',
      accessor: (c: Company) => {
        const trend = getRandomTrend();
        return (
          <span className="flex items-center">
            {c.financial_metrics.credit_score}
            {getTrendIcon(trend)}
          </span>
        );
      }
    },
    {
      header: 'H/F (%)',
      accessor: (c: Company) => {
        const genderRatio = getGenderRatio(c);
        return (
          <span className="flex items-center">
            {genderRatio.male}% H / {genderRatio.female}% F
            {getTrendIcon(genderRatio.female > 40 ? 1 : -1)}
          </span>
        );
      }
    },
    {
      header: 'Note ESG',
      accessor: (c: Company) => c.esg_metrics?.esg_rating || '-'
    },
    {
      header: 'Action',
      accessor: (c: Company): ReactNode => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onViewDetails(c)}
          icon={<Eye className="h-4 w-4" />}
        >
          Voir détails
        </Button>
      ),
      className: 'text-right'
    }
  ];

  return (
    <div className="w-full overflow-x-auto">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm">
          {/* En-tête synthétique */}
          <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-3 px-5 rounded-t-lg">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Marché des Entreprises</h2>
              <div className="flex flex-wrap items-center space-x-6">
                <div>
                  <span className="text-xs block text-gray-200">Entreprises</span>
                  <span className="font-semibold">{marketSummary.totalCompanies}</span>
                </div>
                <div>
                  <span className="text-xs block text-gray-200">Provinces</span>
                  <span className="font-semibold">{marketSummary.provinces}</span>
                </div>
                <div>
                  <span className="text-xs block text-gray-200">Pays</span>
                  <span className="font-semibold">{marketSummary.countries}</span>
                </div>
                <div>
                  <span className="text-xs block text-gray-200">Taille du marché</span>
                  <span className="font-semibold">{formatCurrency(marketSummary.marketSize, undefined, 'USD')}</span>
                </div>
                <div>
                  <span className="text-xs block text-gray-200">Employés</span>
                  <span className="font-semibold">{marketSummary.totalEmployees.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Filtres */}
          <div className="p-4 border-b">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Secteur:</span>
                <Select 
                  value={sectorFilter}
                  onChange={(e) => setSectorFilter(e.target.value)}
                  className="w-40"
                >
                  <option value="all">Tous</option>
                  {uniqueSectors.filter(s => s !== 'all').map(sector => (
                    <option key={sector} value={sector}>{sector}</option>
                  ))}
                </Select>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Taille:</span>
                <Select 
                  value={sizeFilter}
                  onChange={(e) => setSizeFilter(e.target.value)}
                  className="w-40"
                >
                  <option value="all">Toutes</option>
                  <option value="micro">Micro</option>
                  <option value="small">Petite</option>
                  <option value="medium">Moyenne</option>
                  <option value="large">Grande</option>
                </Select>
              </div>
            </div>
          </div>
          
          {/* Table paginée */}
          <PaginatedTable
            data={filteredCompanies}
            columns={columns}
            keyField="id"
            itemsPerPage={10}
            emptyMessage="Aucune entreprise à afficher"
          />
        </div>
      </div>
    </div>
  );
}

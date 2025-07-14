import { useState, useMemo } from 'react';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../ui/Table';
import { Button } from '../ui/Button';
import { Eye, ArrowUpDown, TrendingUp, TrendingDown } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import type { Company } from '../../types/company';
import { Select } from '../ui/form/Select';

interface CompanyListProps {
  companies: Company[];
  // onContact: (company: Company) => void;
  // onScheduleMeeting: (company: Company) => void;
  onViewDetails: (company: Company) => void;
}

export function CompanyList({
  companies,
  // onContact,
  // onScheduleMeeting,
  onViewDetails
}: CompanyListProps) {
  const [sortBy, setSortBy] = useState<{ key: keyof Company | string; direction: 'asc' | 'desc' } | null>(null);
  const [sectorFilter, setSectorFilter] = useState<string>('all');
  const [sizeFilter, setSizeFilter] = useState<string>('all');
  
  // Fonctions de tendance (simulées)
  const getTrendIcon = (trend: number) => {
    if (trend > 0) {
      return <span title="En hausse" className="ml-1 text-green-500"><svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 7l-5 5-5-5"/><path d="M12 12V3"/></svg></span>;
    } else if (trend < 0) {
      return <span title="En baisse" className="ml-1 text-red-500"><svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M7 17l5-5 5 5"/><path d="M12 12v9"/></svg></span>;
    } else {
      return <span title="Stable" className="ml-1 text-gray-400"><svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 12h14"/></svg></span>;
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
    
    // Utilisons les propriétés qui existent sur l'objet Company
    const provinces = new Set(companies.map(c => c.sector || 'Divers')).size; // Utilisé comme proxy pour les provinces
    const countries = 1; // Nous supposons que toutes les entreprises sont dans le même pays
    
    const marketSize = companies.reduce((sum, c) => sum + c.annual_revenue, 0);
    const totalEmployees = companies.reduce((sum, c) => sum + c.employee_count, 0);
    const averageGrowth = companies.length > 0 
      ? companies.reduce((sum, c) => sum + c.financial_metrics.revenue_growth, 0) / companies.length 
      : 0;
    
    // Calculer la moyenne de la répartition H/F sur tout le portefeuille
    const totalMale = companies.reduce((sum, c) => {
      const ratio = getGenderRatio(c);
      return sum + ratio.male;
    }, 0);
    const averageMale = totalCompanies > 0 ? totalMale / totalCompanies : 0;
    const averageFemale = 100 - averageMale;
    
    // Calculer les tendances (simulées ici)
    const growthTrend = averageGrowth > 10 ? 'up' : 'down';
    const genderTrend = averageFemale > 35 ? 'up' : 'down'; // Seuil arbitraire pour la démonstration
    
    return {
      totalCompanies,
      provinces,
      countries,
      marketSize,
      totalEmployees,
      averageGrowth,
      averageMale,
      averageFemale,
      growthTrend,
      genderTrend
    };
  }, [companies]);
  
  // Fonction pour trier et filtrer les données
  const filteredAndSortedCompanies = useMemo(() => {
    let filtered = [...companies];
    
    // Appliquer les filtres
    if (sectorFilter !== 'all') {
      filtered = filtered.filter(c => c.sector === sectorFilter);
    }
    
    if (sizeFilter !== 'all') {
      filtered = filtered.filter(c => c.size === sizeFilter);
    }
    
    // Appliquer le tri
    if (sortBy) {
      filtered.sort((a, b) => {
        let aValue, bValue;
        
        // Gérer les propriétés imbriquées comme financial_metrics.revenue_growth
        if (sortBy.key.includes('.')) {
          const [parentKey, childKey] = sortBy.key.split('.');
          const aParent = a[parentKey as keyof Company];
          const bParent = b[parentKey as keyof Company];
          
          if (typeof aParent === 'object' && aParent !== null && typeof bParent === 'object' && bParent !== null) {
            // Typage explicite pour éviter les erreurs d'index
            aValue = (aParent as Record<string, unknown>)[childKey];
            bValue = (bParent as Record<string, unknown>)[childKey];
          } else {
            aValue = undefined;
            bValue = undefined;
          }
        } else if (sortBy.key === 'gender_ratio') {
          aValue = getGenderRatio(a).female;
          bValue = getGenderRatio(b).female;
        } else {
          aValue = a[sortBy.key as keyof Company];
          bValue = b[sortBy.key as keyof Company];
        }
        
        // Vérifier si les valeurs sont nulles ou indéfinies
        if (aValue === undefined || bValue === undefined || aValue === null || bValue === null) return 0;
        
        // Convertir en chaînes pour les comparaisons si nécessaire
        const aComp = typeof aValue === 'string' ? aValue.toLowerCase() : aValue;
        const bComp = typeof bValue === 'string' ? bValue.toLowerCase() : bValue;
        
        // Comparaison sécurisée
        if (aComp < bComp) return sortBy.direction === 'asc' ? -1 : 1;
        if (aComp > bComp) return sortBy.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    
    return filtered;
  }, [companies, sortBy, sectorFilter, sizeFilter]);
  
  // Les fonctions de pagination ont été supprimées car non utilisées
  
  const handleSort = (key: keyof Company | string) => {
    if (sortBy && sortBy.key === key) {
      setSortBy({ key, direction: sortBy.direction === 'asc' ? 'desc' : 'asc' });
    } else {
      setSortBy({ key, direction: 'asc' });
    }
  };

  // Extraire les secteurs uniques pour le filtre
  const uniqueSectors = useMemo(() => {
    const sectors = companies.map(c => c.sector);
    return ['all', ...Array.from(new Set(sectors))];
  }, [companies]);
  
  // Extraire les tailles d'entreprise uniques pour le filtre
  // On pourrait utiliser cette liste pour ajouter plus de filtres si nécessaire
  // const uniqueSizes = useMemo(() => {
  //   const sizes = companies.map(c => c.size);
  //   return ['all', ...Array.from(new Set(sizes))];
  // }, [companies]);
  
  return (
    <div className="w-full overflow-x-auto">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm min-w-[900px]">
          {/* En-tête synthétique, inspiré du MarketSecuritiesTable */}
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
                  <span className="font-semibold">{formatCurrency(marketSummary.marketSize)}</span>
                </div>
                <div>
                  <span className="text-xs block text-gray-200">Emplois</span>
                  <span className="font-semibold">{marketSummary.totalEmployees.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-xs block text-gray-200">Croissance moy.</span>
                  <span className="font-semibold">
                    {marketSummary.averageGrowth.toFixed(1)}% 
                    {marketSummary.growthTrend === 'up' 
                      ? <TrendingUp className="inline ml-1 text-green-400 h-4 w-4" />
                      : <TrendingDown className="inline ml-1 text-red-400 h-4 w-4" />
                    }
                  </span>
                </div>
                <div>
                  <span className="text-xs block text-gray-200">Rapport F/H</span>
                  <span className="font-semibold">
                    {marketSummary.averageFemale.toFixed(1)}% 
                    {marketSummary.genderTrend === 'up' 
                      ? <TrendingUp className="inline ml-1 text-green-400 h-4 w-4" />
                      : <TrendingDown className="inline ml-1 text-red-400 h-4 w-4" />
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Filtres de colonnes */}
          <div className="bg-gray-50 dark:bg-gray-800 p-3 border-b border-gray-200 dark:border-gray-700">
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
          
          <Table className="min-w-full">
            <TableHead>
              <TableRow>
                <TableHeader onClick={() => handleSort('name')} className="cursor-pointer">
                  <div className="flex items-center">
                    <span>Entreprise</span>
                    <ArrowUpDown className={`ml-1 h-3 w-3 ${sortBy && sortBy.key === 'name' ? 'text-primary' : 'text-gray-500'}`} />
                  </div>
                </TableHeader>
                <TableHeader onClick={() => handleSort('sector')} className="cursor-pointer">
                  <div className="flex items-center">
                    <span>Secteur</span>
                    <ArrowUpDown className={`ml-1 h-3 w-3 ${sortBy && sortBy.key === 'sector' ? 'text-primary' : 'text-gray-500'}`} />
                  </div>
                </TableHeader>
                <TableHeader onClick={() => handleSort('employee_count')} className="cursor-pointer">
                  <div className="flex items-center">
                    <span>Employés</span>
                    <ArrowUpDown className={`ml-1 h-3 w-3 ${sortBy && sortBy.key === 'employee_count' ? 'text-primary' : 'text-gray-500'}`} />
                  </div>
                </TableHeader>
                <TableHeader onClick={() => handleSort('annual_revenue')} className="cursor-pointer">
                  <div className="flex items-center">
                    <span>Valeur (CA)</span>
                    <ArrowUpDown className={`ml-1 h-3 w-3 ${sortBy && sortBy.key === 'annual_revenue' ? 'text-primary' : 'text-gray-500'}`} />
                  </div>
                </TableHeader>
                <TableHeader onClick={() => handleSort('financial_metrics.revenue_growth')} className="cursor-pointer">
                  <div className="flex items-center">
                    <span>Croissance</span>
                    <ArrowUpDown className={`ml-1 h-3 w-3 ${sortBy && sortBy.key === 'financial_metrics.revenue_growth' ? 'text-primary' : 'text-gray-500'}`} />
                  </div>
                </TableHeader>
                <TableHeader onClick={() => handleSort('financial_metrics.ebitda')} className="cursor-pointer">
                  <div className="flex items-center">
                    <span>MBE (EBITDA)</span>
                    <ArrowUpDown className={`ml-1 h-3 w-3 ${sortBy && sortBy.key === 'financial_metrics.ebitda' ? 'text-primary' : 'text-gray-500'}`} />
                  </div>
                </TableHeader>
                <TableHeader onClick={() => handleSort('financial_metrics.credit_score')} className="cursor-pointer">
                  <div className="flex items-center">
                    <span>Cote crédit</span>
                    <ArrowUpDown className={`ml-1 h-3 w-3 ${sortBy && sortBy.key === 'financial_metrics.credit_score' ? 'text-primary' : 'text-gray-500'}`} />
                  </div>
                </TableHeader>
                <TableHeader onClick={() => handleSort('gender_ratio')} className="cursor-pointer">
                  <div className="flex items-center">
                    <span>H/F (%)</span>
                    <ArrowUpDown className={`ml-1 h-3 w-3 ${sortBy && sortBy.key === 'gender_ratio' ? 'text-primary' : 'text-gray-500'}`} />
                  </div>
                </TableHeader>
                <TableHeader>Note ESG</TableHeader>
                <TableHeader align="right">Action</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredAndSortedCompanies.map((company) => {
                const caTrend = getRandomTrend();
                const creditTrend = getRandomTrend();
                const mbeTrend = getRandomTrend();
                const genderRatio = getGenderRatio(company);
                return (
                  <TableRow key={company.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {company.name}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{company.sector}</TableCell>
                    <TableCell>{company.employee_count}</TableCell>
                    <TableCell>
                      <span className="flex items-center">
                        {formatCurrency(company.annual_revenue)}
                        {getTrendIcon(caTrend)}
                      </span>
                    </TableCell>
                    <TableCell>{company.financial_metrics.revenue_growth}%</TableCell>
                    <TableCell>
                      <span className="flex items-center">
                        {company.financial_metrics.ebitda ? formatCurrency(company.financial_metrics.ebitda) : '-'}
                        {getTrendIcon(mbeTrend)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="flex items-center">
                        {company.financial_metrics.credit_score}
                        {getTrendIcon(creditTrend)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="flex items-center">
                        {genderRatio.male}% H / {genderRatio.female}% F
                        {getTrendIcon(genderRatio.female > 40 ? 1 : -1)}
                      </span>
                    </TableCell>
                    <TableCell>{company.esg_metrics?.esg_rating || '-'}</TableCell>
                    <TableCell align="right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewDetails(company)}
                        icon={<Eye className="h-4 w-4" />}
                      >
                        Voir détails
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
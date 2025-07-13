import { useState, useMemo } from 'react';
import {
  ArrowUpDown,
  Download,
  FileText,
  Table2,
  Filter,
  Calendar,
  MapPin,
  Settings,
  Layers,
  Sliders,
  FileBarChart,
  FileSpreadsheet
} from 'lucide-react';
import { utils, writeFile } from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { Popover, PopoverTrigger, PopoverContent } from '../ui/Popover';
import { Checkbox } from '../ui/Checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/DropdownMenu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';

// Constante pour faciliter l'affichage des devises
const CURRENCY_FORMATTER = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'XAF',
  minimumFractionDigits: 0,
});

const formatCurrency = (value: number): string => CURRENCY_FORMATTER.format(value);

// Options pour les filtres de régions (basées sur l'Afrique centrale et zones OHADA/CEMAC)
const regionOptions = [
  { value: 'rdc', label: 'République Démocratique du Congo' },
  { value: 'cameroun', label: 'Cameroun' },
  { value: 'gabon', label: 'Gabon' },
  { value: 'congo', label: 'Congo-Brazzaville' },
  { value: 'car', label: 'République Centrafricaine' },
  { value: 'tchad', label: 'Tchad' },
  { value: 'guinee_equatoriale', label: 'Guinée Équatoriale' },
  { value: 'cote_ivoire', label: 'Côte d\'Ivoire' },
  { value: 'senegal', label: 'Sénégal' },
  { value: 'autres_ohada', label: 'Autres pays OHADA' },
];

// Options de secteur selon les classifications OHADA
const sectorOptions = [
  { value: 'agriculture', label: 'Agriculture et agro-industrie' },
  { value: 'mines', label: 'Mines et extraction' },
  { value: 'energie', label: 'Énergie' },
  { value: 'manufacture', label: 'Manufacture et production' },
  { value: 'telecom', label: 'Télécommunications' },
  { value: 'fintech', label: 'Fintech et services financiers' },
  { value: 'sante', label: 'Santé et pharmaceutique' },
  { value: 'education', label: 'Éducation' },
  { value: 'commerce', label: 'Commerce et distribution' },
  { value: 'transport', label: 'Transport et logistique' },
  { value: 'immobilier', label: 'Immobilier et construction' },
];

// Options pour les périodes de temps
const timeRangeOptions = [
  { value: 'trimestre_actuel', label: 'Trimestre actuel' },
  { value: 'annee_actuelle', label: 'Année actuelle' },
  { value: 'annee_precedente', label: 'Année précédente' },
  { value: '3_ans', label: 'Derniers 3 ans' },
  { value: '5_ans', label: 'Derniers 5 ans' },
  { value: 'personnalise', label: 'Période personnalisée' },
];

// Options pour les indicateurs disponibles
const indicatorOptions = [
  { value: 'rendement', label: 'Rendement annualisé (TRI)' },
  { value: 'multiple', label: 'Multiple d\'investissement' },
  { value: 'valeur', label: 'Valeur actuelle' },
  { value: 'croissance', label: 'Croissance (YoY)' },
  { value: 'distribution', label: 'Distributions réalisées' },
  { value: 'provisions', label: 'Provisions pour risques' },
  { value: 'valorisation', label: 'Méthode de valorisation' },
  { value: 'conformite_ohada', label: 'Conformité OHADA' },
  { value: 'conformite_cemac', label: 'Conformité réglementaire CEMAC' },
  { value: 'impact_social', label: 'Indicateurs d\'impact social' },
  { value: 'impact_environnemental', label: 'Impact environnemental' },
];

// Options d'extraction
const exportOptions = [
  { value: 'pdf', label: 'PDF', icon: FileText },
  { value: 'excel', label: 'Excel', icon: FileSpreadsheet },
  { value: 'csv', label: 'CSV', icon: FileBarChart },
];

interface ReportItem {
  id?: string;
  nom?: string;
  entreprise?: string;
  region?: string;
  secteur?: string;
  montant_investi: number;
  date_entree: string;
  valorisation_actuelle: number;
  rendement: number;
  multiple: number;
  duree?: number;
  conformite_ohada?: boolean;
  conformite_cemac?: boolean;
  impact_social?: string;
  impact_environnemental?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

interface AdvancedReportingTableProps {
  data: ReportItem[];
  title?: string;
}

export const AdvancedReportingTable = ({ data, title }: AdvancedReportingTableProps) => {
  // États pour les filtres et la configuration du tableau
  const [searchQuery, setSearchQuery] = useState('');
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [selectedSectors, setSelectedSectors] = useState<string[]>([]);
  const [selectedTimeRange, setSelectedTimeRange] = useState('annee_actuelle');
  const [selectedIndicators, setSelectedIndicators] = useState(['rendement', 'valeur', 'multiple']);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [visibleColumns, setVisibleColumns] = useState([
    'nom', 'region', 'secteur', 'montant_investi', 'date_entree', 'valorisation_actuelle', 'rendement', 'multiple'
  ]);
  // State for tabs
  const [currentTab, setCurrentTab] = useState('region');

  // Gestion des tris
  const handleSort = (column: string): void => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  // Filtrage et tri des données
  const filteredAndSortedData = useMemo(() => {
    let filtered = [...data];
    
    // Filtrage par recherche
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item => 
        item.nom?.toLowerCase().includes(query) ||
        item.entreprise?.toLowerCase().includes(query) ||
        item.secteur?.toLowerCase().includes(query)
      );
    }
    
    // Filtrage par région
    if (selectedRegions.length > 0) {
      filtered = filtered.filter(item => item.region && selectedRegions.includes(item.region));
    }
    
    // Filtrage par secteur
    if (selectedSectors.length > 0) {
      filtered = filtered.filter(item => item.secteur && selectedSectors.includes(item.secteur));
    }
    
    // Filtrage par période
    // Logique simplifiée, à adapter selon les besoins réels
    if (selectedTimeRange === 'personnalise' && startDate && endDate) {
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.date_entree);
        return itemDate >= new Date(startDate) && itemDate <= new Date(endDate);
      });
    }
    
    // Tri
    if (sortColumn) {
      filtered.sort((a, b) => {
        if (a[sortColumn] < b[sortColumn]) return sortDirection === 'asc' ? -1 : 1;
        if (a[sortColumn] > b[sortColumn]) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }
    
    return filtered;
  }, [data, searchQuery, selectedRegions, selectedSectors, selectedTimeRange, startDate, endDate, sortColumn, sortDirection]);

  // Calcul des totaux pour le récapitulatif
  const summaryStats = useMemo(() => {
    const totalInvested = filteredAndSortedData.reduce((sum, item) => sum + (item.montant_investi || 0), 0);
    const totalValue = filteredAndSortedData.reduce((sum, item) => sum + (item.valorisation_actuelle || 0), 0);
    const weightedTRI = filteredAndSortedData.reduce((sum, item) => {
      const weight = item.montant_investi / totalInvested;
      return sum + (item.rendement * weight || 0);
    }, 0);
    
    return {
      count: filteredAndSortedData.length,
      totalInvested,
      totalValue,
      averageTRI: weightedTRI,
      multiple: totalValue / totalInvested || 0
    };
  }, [filteredAndSortedData]);

  // Fonctions pour l'exportation des données
  const handleExport = (format: string): void => {
    console.log(`Exporting data in ${format} format...`);
    
    switch (format) {
      case 'excel':
        exportToExcel();
        break;
      case 'pdf':
        exportToPDF();
        break;
      case 'csv':
        exportToCSV();
        break;
      default:
        console.warn(`Format d'exportation non pris en charge: ${format}`);
    }
  };

  // Exportation au format Excel
  const exportToExcel = (): void => {
    // Préparer les données pour Excel
    const exportData = filteredAndSortedData.map(item => {
      const row: Record<string, unknown> = {};
      visibleColumns.forEach(col => {
        let value = item[col];
        
        // Formater les valeurs selon le type
        if (typeof value === 'number') {
          if (col === 'montant_investi' || col === 'valorisation_actuelle') {
            value = formatCurrency(value);
          } else if (col === 'rendement') {
            value = `${(value * 100).toFixed(2)}%`;
          }
        } else if (typeof value === 'boolean') {
          value = value ? 'Oui' : 'Non';
        }
        
        // Utiliser des noms de colonnes plus descriptifs
        const columnName = col === 'nom' ? 'Nom du projet' :
                          col === 'entreprise' ? 'Entreprise' :
                          col === 'region' ? 'Région' :
                          col === 'secteur' ? 'Secteur' :
                          col === 'montant_investi' ? 'Montant investi' :
                          col === 'date_entree' ? 'Date d\'entrée' :
                          col === 'valorisation_actuelle' ? 'Valorisation actuelle' :
                          col === 'rendement' ? 'Rendement (TRI)' :
                          col === 'multiple' ? 'Multiple' :
                          col === 'duree' ? 'Durée (années)' :
                          col === 'conformite_ohada' ? 'Conformité OHADA' :
                          col === 'conformite_cemac' ? 'Conformité CEMAC' :
                          col === 'impact_social' ? 'Impact social' :
                          col === 'impact_environnemental' ? 'Impact environnemental' : col;
        
        row[columnName] = value;
      });
      return row;
    });

    // Créer une feuille Excel
    const ws = utils.json_to_sheet(exportData);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, 'Rapport');
    
    // Télécharger le fichier Excel
    const fileName = `${title || 'Rapport'}_${new Date().toISOString().split('T')[0]}.xlsx`;
    writeFile(wb, fileName);
  };

  // Exportation au format PDF
  const exportToPDF = (): void => {
    const doc = new jsPDF();
    
    // Ajouter le titre
    doc.setFontSize(16);
    doc.text(title || 'Rapport', 14, 20);
    doc.setFontSize(12);
    doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR')}`, 14, 30);
    
    // Préparer les en-têtes et les données
    const headers = visibleColumns.map(col => {
      return col === 'nom' ? 'Nom du projet' :
             col === 'entreprise' ? 'Entreprise' :
             col === 'region' ? 'Région' :
             col === 'secteur' ? 'Secteur' :
             col === 'montant_investi' ? 'Montant investi' :
             col === 'date_entree' ? 'Date d\'entrée' :
             col === 'valorisation_actuelle' ? 'Valorisation actuelle' :
             col === 'rendement' ? 'Rendement (TRI)' :
             col === 'multiple' ? 'Multiple' :
             col === 'duree' ? 'Durée (années)' :
             col === 'conformite_ohada' ? 'Conformité OHADA' :
             col === 'conformite_cemac' ? 'Conformité CEMAC' :
             col === 'impact_social' ? 'Impact social' :
             col === 'impact_environnemental' ? 'Impact environnemental' : col;
    });
    
    const rows = filteredAndSortedData.map(item => {
      return visibleColumns.map(col => {
        let value = item[col];
        
        // Formater les valeurs
        if (typeof value === 'number') {
          if (col === 'montant_investi' || col === 'valorisation_actuelle') {
            value = formatCurrency(value);
          } else if (col === 'rendement') {
            value = `${(value * 100).toFixed(2)}%`;
          } else {
            value = String(value);
          }
        } else if (typeof value === 'boolean') {
          value = value ? 'Oui' : 'Non';
        } else if (value === undefined || value === null) {
          value = '';
        }
        
        return String(value);
      });
    });
    
    // Créer le tableau dans le PDF
    autoTable(doc, {
      head: [headers],
      body: rows,
      startY: 40,
      styles: {
        fontSize: 8,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: 'bold',
      },
    });
    
    // Télécharger le PDF
    const fileName = `${title || 'Rapport'}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  };

  // Exportation au format CSV
  const exportToCSV = (): void => {
    // Préparer les en-têtes
    const headers = visibleColumns.map(col => {
      return col === 'nom' ? 'Nom du projet' :
             col === 'entreprise' ? 'Entreprise' :
             col === 'region' ? 'Région' :
             col === 'secteur' ? 'Secteur' :
             col === 'montant_investi' ? 'Montant investi' :
             col === 'date_entree' ? 'Date d\'entrée' :
             col === 'valorisation_actuelle' ? 'Valorisation actuelle' :
             col === 'rendement' ? 'Rendement (TRI)' :
             col === 'multiple' ? 'Multiple' :
             col === 'duree' ? 'Durée (années)' :
             col === 'conformite_ohada' ? 'Conformité OHADA' :
             col === 'conformite_cemac' ? 'Conformité CEMAC' :
             col === 'impact_social' ? 'Impact social' :
             col === 'impact_environnemental' ? 'Impact environnemental' : col;
    }).join(',');
    
    // Préparer les lignes de données
    const rows = filteredAndSortedData.map(item => {
      return visibleColumns.map(col => {
        let value = item[col];
        
        // Formater et échapper les valeurs
        if (typeof value === 'number') {
          if (col === 'montant_investi' || col === 'valorisation_actuelle') {
            value = formatCurrency(value).replace(/\s/g, '');
          } else if (col === 'rendement') {
            value = `${(value * 100).toFixed(2)}%`;
          } else {
            value = String(value);
          }
        } else if (typeof value === 'boolean') {
          value = value ? 'Oui' : 'Non';
        } else if (value === undefined || value === null) {
          value = '';
        } else if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
          // Échapper les valeurs avec des guillemets si nécessaire
          value = `"${value.replace(/"/g, '""')}"`;
        }
        
        return value;
      }).join(',');
    }).join('\n');
    
    // Créer le contenu CSV
    const csvContent = `${headers}\n${rows}`;
    
    // Créer un lien de téléchargement
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const fileName = `${title || 'Rapport'}_${new Date().toISOString().split('T')[0]}.csv`;
    
    if ('msSaveBlob' in navigator) {
      // Pour IE et Edge
      navigator.msSaveBlob?.(blob, fileName);
    } else {
      // Pour les autres navigateurs
      const url = URL.createObjectURL(blob);
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  // Gestion de la sélection des régions
  const toggleRegion = (region: string): void => {
    setSelectedRegions(prev => 
      prev.includes(region)
        ? prev.filter(r => r !== region)
        : [...prev, region]
    );
  };

  // Gestion de la sélection des secteurs
  const toggleSector = (sector: string): void => {
    setSelectedSectors(prev => 
      prev.includes(sector)
        ? prev.filter(s => s !== sector)
        : [...prev, sector]
    );
  };

  // Gestion des colonnes visibles
  const toggleColumn = (column: string): void => {
    setVisibleColumns(prev => 
      prev.includes(column)
        ? prev.filter(c => c !== column)
        : [...prev, column]
    );
  };

  // Gestion des indicateurs sélectionnés
  const toggleIndicator = (indicator: string): void => {
    setSelectedIndicators(prev => 
      prev.includes(indicator)
        ? prev.filter(i => i !== indicator)
        : [...prev, indicator]
    );
  };

  interface TableColumn {
    key: string;
    label: string;
    always?: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    format?: (val: any) => string;
  }

  // Déterminer les colonnes à afficher en fonction des sélections
  const columns = useMemo(() => {
    const allColumns: TableColumn[] = [
      { key: 'nom', label: 'Nom du Projet', always: true },
      { key: 'entreprise', label: 'Entreprise' },
      { key: 'region', label: 'Région' },
      { key: 'secteur', label: 'Secteur' },
      { key: 'montant_investi', label: 'Investissement', format: (val: number) => formatCurrency(val) },
      { key: 'date_entree', label: 'Date d\'entrée', format: (val: string) => new Date(val).toLocaleDateString('fr-FR') },
      { key: 'valorisation_actuelle', label: 'Valeur Actuelle', format: (val: number) => formatCurrency(val) },
      { key: 'rendement', label: 'TRI', format: (val: number) => `${(val * 100).toFixed(2)}%` },
      { key: 'multiple', label: 'Multiple', format: (val: number) => val.toFixed(2) + 'x' },
      { key: 'duree', label: 'Durée (années)', format: (val?: number) => val?.toFixed(1) || '-' },
      { key: 'conformite_ohada', label: 'Conformité OHADA', format: (val?: boolean) => val ? 'Conforme' : 'Non conforme' },
      { key: 'conformite_cemac', label: 'Conformité CEMAC', format: (val?: boolean) => val ? 'Conforme' : 'Non conforme' },
      { key: 'impact_social', label: 'Impact Social', format: (val?: string) => val || '-' },
      { key: 'impact_environnemental', label: 'Impact Env.', format: (val?: string) => val || '-' },
    ];
    
    // Filtrer les colonnes visibles
    return allColumns.filter(col => col.always || visibleColumns.includes(col.key));
  }, [visibleColumns]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
      {/* En-tête avec titre et statistiques */}
      <div className="bg-gradient-to-r from-blue-800 to-blue-600 text-white p-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h2 className="text-xl font-bold">{title || "Rapport d'investissements"}</h2>
            <p className="text-sm text-blue-100">Données actualisées au {new Date().toLocaleDateString('fr-FR')}</p>
          </div>
          <div className="flex flex-wrap gap-4 mt-3 md:mt-0">
            <div className="text-center">
              <p className="text-xs text-blue-200">Nombre de projets</p>
              <p className="font-semibold">{summaryStats.count}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-blue-200">Capital investi</p>
              <p className="font-semibold">{formatCurrency(summaryStats.totalInvested)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-blue-200">Valeur actuelle</p>
              <p className="font-semibold">{formatCurrency(summaryStats.totalValue)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-blue-200">TRI moyen</p>
              <p className="font-semibold">{(summaryStats.averageTRI * 100).toFixed(2)}%</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-blue-200">Multiple global</p>
              <p className="font-semibold">{summaryStats.multiple.toFixed(2)}x</p>
            </div>
          </div>
        </div>
      </div>

      {/* Barre d'outils de filtrage et d'export */}
      <div className="bg-gray-50 dark:bg-gray-700 p-4 border-b border-gray-200 dark:border-gray-600">
        <div className="flex flex-col gap-4">
          {/* Première ligne: recherche et actions */}
          <div className="flex flex-wrap gap-3 justify-between">
            <div className="relative">
              <Input
                placeholder="Rechercher un projet ou une entreprise..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-full md:w-80"
              />
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 absolute top-3 left-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            <div className="flex flex-wrap gap-2">
              {/* Menu de configuration des colonnes */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="secondary" size="sm" className="flex items-center">
                    <Table2 className="h-4 w-4 mr-2" />
                    Colonnes
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div className="space-y-2">
                    <h3 className="font-medium mb-2">Colonnes visibles</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { key: 'entreprise', label: 'Entreprise' },
                        { key: 'region', label: 'Région' },
                        { key: 'secteur', label: 'Secteur' },
                        { key: 'montant_investi', label: 'Investissement' },
                        { key: 'date_entree', label: 'Date d\'entrée' },
                        { key: 'valorisation_actuelle', label: 'Valeur Actuelle' },
                        { key: 'rendement', label: 'TRI' },
                        { key: 'multiple', label: 'Multiple' },
                        { key: 'duree', label: 'Durée' },
                        { key: 'conformite_ohada', label: 'Conformité OHADA' },
                        { key: 'conformite_cemac', label: 'Conformité CEMAC' },
                        { key: 'impact_social', label: 'Impact Social' },
                        { key: 'impact_environnemental', label: 'Impact Env.' },
                      ].map((col) => (
                        <div key={col.key} className="flex items-center">
                          <Checkbox 
                            id={`col-${col.key}`}
                            checked={visibleColumns.includes(col.key)}
                            onCheckedChange={(): void => toggleColumn(col.key)}
                          />
                          <label htmlFor={`col-${col.key}`} className="ml-2 text-sm">
                            {col.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              {/* Menu de filtrage */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="secondary" size="sm" className="flex items-center">
                    <Filter className="h-4 w-4 mr-2" />
                    Filtres
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-96">
                  <Tabs value={currentTab} onValueChange={setCurrentTab}>
                    <TabsList className="grid grid-cols-3">
                      <TabsTrigger value="region" currentValue={currentTab} onValueChange={setCurrentTab}>Région</TabsTrigger>
                      <TabsTrigger value="secteur" currentValue={currentTab} onValueChange={setCurrentTab}>Secteur</TabsTrigger>
                      <TabsTrigger value="periode" currentValue={currentTab} onValueChange={setCurrentTab}>Période</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="region" currentValue={currentTab} className="space-y-4 mt-2">
                          <h3 className="font-medium mb-2">Régions</h3>
                      <div className="grid grid-cols-2 gap-2">
                        {regionOptions.map((region) => (
                          <div key={region.value} className="flex items-center">
                            <Checkbox 
                              id={`region-${region.value}`}
                              checked={selectedRegions.includes(region.value)}
                              onCheckedChange={(): void => toggleRegion(region.value)}
                            />
                            <label htmlFor={`region-${region.value}`} className="ml-2 text-sm">
                              {region.label}
                            </label>
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="secteur" currentValue={currentTab} className="space-y-4 mt-2">
                      <h3 className="font-medium mb-2">Secteurs d'activité</h3>
                      <div className="grid grid-cols-2 gap-2">
                        {sectorOptions.map((sector) => (
                          <div key={sector.value} className="flex items-center">
                            <Checkbox 
                              id={`sector-${sector.value}`}
                              checked={selectedSectors.includes(sector.value)}
                              onCheckedChange={(): void => toggleSector(sector.value)}
                            />
                            <label htmlFor={`sector-${sector.value}`} className="ml-2 text-sm">
                              {sector.label}
                            </label>
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="periode" currentValue={currentTab} className="space-y-4 mt-2">
                      <h3 className="font-medium mb-2">Période</h3>
                      <div className="space-y-2">
                        <select 
                          className="w-full p-2 border border-gray-300 rounded-md"
                          value={selectedTimeRange}
                          onChange={(e: React.ChangeEvent<HTMLSelectElement>): void => setSelectedTimeRange(e.target.value)}
                        >
                          {timeRangeOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        
                        {selectedTimeRange === 'personnalise' && (
                          <div className="grid grid-cols-2 gap-2 mt-2">
                            <div>
                              <label className="text-sm font-medium">Date début</label>
                              <Input 
                                type="date" 
                                value={startDate}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>): void => setStartDate(e.target.value)}
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium">Date fin</label>
                              <Input 
                                type="date" 
                                value={endDate}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>): void => setEndDate(e.target.value)}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                </PopoverContent>
              </Popover>

              {/* Menu indicateurs */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="secondary" size="sm" className="flex items-center">
                    <Sliders className="h-4 w-4 mr-2" />
                    Indicateurs
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div className="space-y-2">
                    <h3 className="font-medium mb-2">Indicateurs à calculer</h3>
                    <div className="grid grid-cols-1 gap-2">
                      {indicatorOptions.map((indicator) => (
                        <div key={indicator.value} className="flex items-center">
                          <Checkbox 
                            id={`indicator-${indicator.value}`}
                            checked={selectedIndicators.includes(indicator.value)}
                            onCheckedChange={(): void => toggleIndicator(indicator.value)}
                          />
                          <label htmlFor={`indicator-${indicator.value}`} className="ml-2 text-sm">
                            {indicator.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              {/* Menu d'export */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="secondary" size="sm" className="flex items-center">
                    <Download className="h-4 w-4 mr-2" />
                    Exporter
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {exportOptions.map((option) => (
                    <DropdownMenuItem 
                      key={option.value} 
                      onClick={(): void => handleExport(option.value)}
                      className="cursor-pointer"
                    >
                      <option.icon className="h-4 w-4 mr-2" />
                      <span>Exporter en {option.label}</span>
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer">
                    <Settings className="h-4 w-4 mr-2" />
                    <span>Options d'export</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          {/* Filtres actifs */}
          <div className="flex flex-wrap gap-2 items-center">
            {selectedRegions.length > 0 && (
              <>
                <span className="text-xs font-medium text-gray-500">Régions:</span>
                {selectedRegions.map(region => {
                  const regionLabel = regionOptions.find(r => r.value === region)?.label;
                  return (
                    <Badge 
                      key={region} 
                      variant="secondary" 
                      className="flex items-center gap-1 bg-blue-50 text-blue-700 border-blue-200"
                    >
                      <MapPin className="h-3 w-3" />
                      {regionLabel}
                      <button 
                        onClick={(): void => toggleRegion(region)} 
                        className="ml-1 hover:text-blue-900"
                      >
                        ×
                      </button>
                    </Badge>
                  );
                })}
              </>
            )}
            
            {selectedSectors.length > 0 && (
              <>
                <span className="text-xs font-medium text-gray-500 ml-2">Secteurs:</span>
                {selectedSectors.map(sector => {
                  const sectorLabel = sectorOptions.find(s => s.value === sector)?.label;
                  return (
                    <Badge 
                      key={sector} 
                      variant="secondary" 
                      className="flex items-center gap-1 bg-green-50 text-green-700 border-green-200"
                    >
                      <Layers className="h-3 w-3" />
                      {sectorLabel}
                      <button 
                        onClick={(): void => toggleSector(sector)} 
                        className="ml-1 hover:text-green-900"
                      >
                        ×
                      </button>
                    </Badge>
                  );
                })}
              </>
            )}
            
            {selectedTimeRange && (
              <>
                <span className="text-xs font-medium text-gray-500 ml-2">Période:</span>
                <Badge 
                  variant="secondary" 
                  className="flex items-center gap-1 bg-purple-50 text-purple-700 border-purple-200"
                >
                  <Calendar className="h-3 w-3" />
                  {timeRangeOptions.find(t => t.value === selectedTimeRange)?.label}
                </Badge>
              </>
            )}
            
            {(selectedRegions.length > 0 || selectedSectors.length > 0 || selectedTimeRange !== 'annee_actuelle') && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={(): void => {
                  setSelectedRegions([]);
                  setSelectedSectors([]);
                  setSelectedTimeRange('annee_actuelle');
                  setStartDate('');
                  setEndDate('');
                }}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                Réinitialiser les filtres
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Tableau de données */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => handleSort(column.key)}
                >
                  <div className="flex items-center">
                    <span>{column.label}</span>
                    {sortColumn === column.key ? (
                      <ArrowUpDown className="ml-1 h-3 w-3 text-blue-500" />
                    ) : (
                      <ArrowUpDown className="ml-1 h-3 w-3 text-gray-300 dark:text-gray-600" />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
            {filteredAndSortedData.length > 0 ? (
              filteredAndSortedData.map((item, index) => (
                <tr 
                  key={item.id || index} 
                  className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  {columns.map((column) => (
                    <td key={`${item.id}-${column.key}`} className="py-3 px-4 text-sm">
                      {column.format 
                        ? column.format(item[column.key]) 
                        : item[column.key] || '-'}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td 
                  colSpan={columns.length} 
                  className="py-10 text-center text-gray-500 dark:text-gray-400"
                >
                  Aucune donnée ne correspond à vos critères de recherche.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination et récapitulatif */}
      <div className="bg-gray-50 dark:bg-gray-800 py-3 px-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Affichage de <span className="font-medium">{filteredAndSortedData.length}</span> sur <span className="font-medium">{data.length}</span> projets
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {selectedRegions.length > 0 || selectedSectors.length > 0 ? "(Filtré)" : ""}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="secondary" 
              size="sm"
              disabled={true}
              className="border-gray-300 dark:border-gray-600"
            >
              Précédent
            </Button>
            <span className="px-3 py-1 rounded-md bg-primary text-white">1</span>
            <Button 
              variant="secondary" 
              size="sm"
              disabled={true}
              className="border-gray-300 dark:border-gray-600"
            >
              Suivant
            </Button>
          </div>
        </div>
      </div>

      {/* Note informative */}
      <div className="bg-blue-50 dark:bg-blue-900/30 p-3 text-xs text-blue-700 dark:text-blue-300 border-t border-blue-100 dark:border-blue-800">
        <p className="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          Les données présentées sont conformes aux normes comptables OHADA et aux directives de la CEMAC pour le capital-investissement.
          <a href="/docs/compliance" className="underline ml-2">En savoir plus</a>
        </p>
      </div>
    </div>
  );
};

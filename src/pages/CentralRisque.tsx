import { useState } from 'react';
import { Button } from '../components/ui/Button';
import { Download, CreditCard, Truck, TrendingUp, Filter, Plus } from 'lucide-react';
import { useCentraleRisqueComplete } from '../hooks/useCentraleRisqueApi';
import type { 
  CreditRiskEntry, 
  LeasingRiskEntry, 
  InvestmentRiskEntry 
} from '../data/mockCentraleRisque';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/Tabs';
import { AddRiskEntryForm } from '../components/risk/AddRiskEntryForm';
import { CreditRiskTable } from '../components/risk/CreditRiskTable';
import { LeasingRiskTable } from '../components/risk/LeasingRiskTable';
import { InvestmentRiskTable } from '../components/risk/InvestmentRiskTable';
import { RiskSkeleton } from '../components/ui/RiskSkeleton';
import { CentraleRisqueAdapter } from '../adapters/centraleRisqueAdapter';

// Type pour les filtres
interface FilterState {
  institution?: string;
  statut?: string;
  coteCredit?: string;
  secteur?: string;
}

export default function CentralRisque() {
  // État pour gérer le type de données de risque affiché
  const [activeTab, setActiveTab] = useState<'credit' | 'leasing' | 'investment'>('credit');
  
  // État pour le modal d'ajout
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  // États pour les filtres
  const [filters, setFilters] = useState<FilterState>({});
  const [searchTerm, setSearchTerm] = useState('');
  
  // Utiliser le hook API pour charger les données
  const { 
    entries,
    loading,
    error,
    refetch
  } = useCentraleRisqueComplete();

  // Transformer les données API vers le format attendu par les composants
  const creditData: CreditRiskEntry[] = entries ? CentraleRisqueAdapter.getCreditData(entries) : [];
  const leasingData: LeasingRiskEntry[] = entries ? CentraleRisqueAdapter.getLeasingData(entries) : [];
  const investmentData: InvestmentRiskEntry[] = entries ? CentraleRisqueAdapter.getInvestmentData(entries) : [];

  // Appliquer les filtres et la recherche
  const applyFilters = (data: CreditRiskEntry[] | LeasingRiskEntry[] | InvestmentRiskEntry[]) => {
    return data.filter(item => {
      // Filtre par terme de recherche
      if (searchTerm && !item.companyName.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      // Filtre par institution
      if (filters.institution && item.institution !== filters.institution) {
        return false;
      }
      
      // Filtre par statut
      if (filters.statut && item.statut !== filters.statut) {
        return false;
      }
      
      return true;
    });
  };

  const filteredCreditData = applyFilters(creditData) as CreditRiskEntry[];
  const filteredLeasingData = applyFilters(leasingData) as LeasingRiskEntry[];
  const filteredInvestmentData = applyFilters(investmentData) as InvestmentRiskEntry[];

  // Fonction pour mettre à jour les filtres
  const updateFilter = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === 'Tous' ? undefined : value
    }));
  };

  // Fonction pour réinitialiser les filtres
  const resetFilters = () => {
    setFilters({});
    setSearchTerm('');
  };

  // Extraire les options uniques pour les filtres
  const getUniqueOptions = (data: CreditRiskEntry[] | LeasingRiskEntry[] | InvestmentRiskEntry[], key: keyof CreditRiskEntry | keyof LeasingRiskEntry | keyof InvestmentRiskEntry): string[] => {
    const options = Array.from(new Set(data.map(item => String(item[key as keyof typeof item]))));
    return ['Tous', ...options];
  };

  // Fonction pour exporter les données
  const exportData = () => {
    let dataToExport;
    let filename;
    
    switch (activeTab) {
      case 'credit':
        dataToExport = filteredCreditData;
        filename = 'centrale-risque-credit.json';
        break;
      case 'leasing':
        dataToExport = filteredLeasingData;
        filename = 'centrale-risque-leasing.json';
        break;
      case 'investment':
        dataToExport = filteredInvestmentData;
        filename = 'centrale-risque-investment.json';
        break;
    }
    
    const jsonString = JSON.stringify(dataToExport, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Afficher un message d'erreur si nécessaire
  if (error) {
    return (
      <div className="container mx-auto p-4 sm:p-6">
        <h1 className="text-2xl font-bold mb-6">Centrale de Risque</h1>
        <div className="bg-red-50 p-4 rounded-md border border-red-200 text-red-700">
          Une erreur est survenue lors du chargement des données: {String(error)}
          <button 
            className="ml-4 underline" 
            onClick={() => refetch()}
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Centrale de Risque</h1>
        <div className="flex space-x-2">
          <Button onClick={() => setIsAddModalOpen(true)} variant="primary" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Ajouter une exposition
          </Button>
          <Button onClick={exportData} variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Exporter
          </Button>
        </div>
      </div>
      
      {/* Modal form for adding risk entries */}
      <AddRiskEntryForm 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onSuccess={() => {
          refetch();
          setIsAddModalOpen(false);
        }}
        riskType={activeTab}
      />

      <Tabs 
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as 'credit' | 'leasing' | 'investment')}
        className="mb-6"
      >
        <TabsList className="mb-4">
          <TabsTrigger 
            value="credit" 
            currentValue={activeTab}
            onValueChange={(value) => setActiveTab(value as 'credit' | 'leasing' | 'investment')}
            className="flex items-center gap-2"
          >
            <CreditCard className="h-4 w-4" />
            Crédit
          </TabsTrigger>
          <TabsTrigger 
            value="leasing" 
            currentValue={activeTab}
            onValueChange={(value) => setActiveTab(value as 'credit' | 'leasing' | 'investment')}
            className="flex items-center gap-2"
          >
            <Truck className="h-4 w-4" />
            Leasing
          </TabsTrigger>
          <TabsTrigger 
            value="investment" 
            currentValue={activeTab}
            onValueChange={(value) => setActiveTab(value as 'credit' | 'leasing' | 'investment')}
            className="flex items-center gap-2"
          >
            <TrendingUp className="h-4 w-4" />
            Investissement
          </TabsTrigger>
        </TabsList>

        {/* Filtres et contrôles */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="flex flex-wrap gap-4 mb-4">
            <div className="flex-1 min-w-[200px]">
              <input
                type="text"
                placeholder="Rechercher par nom de société..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="flex gap-2">
              {/* Filtre Institution */}
              <select
                value={filters.institution || 'Tous'}
                onChange={(e) => updateFilter('institution', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {getUniqueOptions(
                  activeTab === 'credit' ? creditData : activeTab === 'leasing' ? leasingData : investmentData,
                  'institution'
                ).map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>

              {/* Filtre Statut */}
              <select
                value={filters.statut || 'Tous'}
                onChange={(e) => updateFilter('statut', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {getUniqueOptions(
                  activeTab === 'credit' ? creditData : activeTab === 'leasing' ? leasingData : investmentData,
                  'statut'
                ).map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>

              <Button 
                onClick={resetFilters} 
                variant="outline" 
                className="flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                Réinitialiser
              </Button>
            </div>
          </div>
        </div>

        {/* Tables de données */}
        <TabsContent value="credit" currentValue={activeTab}>
          {loading ? (
            <RiskSkeleton />
          ) : (
            <CreditRiskTable 
              data={filteredCreditData}
              loading={loading}
            />
          )}
        </TabsContent>

        <TabsContent value="leasing" currentValue={activeTab}>
          {loading ? (
            <RiskSkeleton />
          ) : (
            <LeasingRiskTable 
              data={filteredLeasingData}
              loading={loading}
            />
          )}
        </TabsContent>

        <TabsContent value="investment" currentValue={activeTab}>
          {loading ? (
            <RiskSkeleton />
          ) : (
            <InvestmentRiskTable 
              data={filteredInvestmentData}
              loading={loading}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
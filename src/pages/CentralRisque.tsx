import { useState } from 'react';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../components/ui';
import { Button } from '../components/ui/Button';
import { Download, ChevronDown, CreditCard, Truck, TrendingUp, Filter, Plus } from 'lucide-react';
import { Pagination } from '../components/ui/Pagination';
import { usePagination } from '../hooks/usePagination';
import { useCentraleRisque } from '../hooks/useCentraleRisque';
import type { CreditRiskEntry, LeasingRiskEntry, InvestmentRiskEntry } from '../data/mockCentraleRisque';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/Tabs';
import { formatCurrency } from '../utils/formatters';
import { AddRiskEntryForm } from '../components/risk/AddRiskEntryForm';

// Type pour les filtres
interface FilterState {
  institution?: string;
  statut?: string;
  rating?: string;
  secteur?: string;
}

export default function CentralRisque() {
  // État pour gérer le type de données de risque affiché
  const [activeTab, setActiveTab] = useState<'credit' | 'leasing' | 'investment'>('credit');
  
  // État pour le modal d'ajout
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  // Utiliser les hooks pour charger les données
  const { 
    data: creditData, 
    loading: loadingCredit, 
    error: errorCredit,
    refresh: refreshCredit
  } = useCentraleRisque<CreditRiskEntry>('credit');
  
  const { 
    data: leasingData, 
    loading: loadingLeasing, 
    error: errorLeasing,
    refresh: refreshLeasing
  } = useCentraleRisque<LeasingRiskEntry>('leasing');
  
  const { 
    data: investmentData, 
    loading: loadingInvestment, 
    error: errorInvestment,
    refresh: refreshInvestment
  } = useCentraleRisque<InvestmentRiskEntry>('investment');
  
  // États pour la recherche et le filtrage
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<FilterState>({});
  const [showFilters, setShowFilters] = useState(false);
  
  // Utiliser la pagination
  const {
    currentPage: creditPage,
    totalPages: creditTotalPages,
    pageItems: creditPageItems,
    setPage: setCreditPage
  } = usePagination(creditData, 10);
  
  const {
    currentPage: leasingPage,
    totalPages: leasingTotalPages,
    pageItems: leasingPageItems,
    setPage: setLeasingPage
  } = usePagination(leasingData, 10);
  
  const {
    currentPage: investmentPage,
    totalPages: investmentTotalPages,
    pageItems: investmentPageItems,
    setPage: setInvestmentPage
  } = usePagination(investmentData, 10);

  // Fonction pour gérer le filtrage
  const handleFilterChange = (key: keyof FilterState, value: string) => {
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

  // Fonction pour exporter les données
  const exportData = () => {
    let dataToExport;
    let filename;
    
    switch (activeTab) {
      case 'credit':
        dataToExport = creditData;
        filename = 'centrale-risque-credit.json';
        break;
      case 'leasing':
        dataToExport = leasingData;
        filename = 'centrale-risque-leasing.json';
        break;
      case 'investment':
        dataToExport = investmentData;
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

  // Extraire les options uniques pour les filtres
  const getUniqueOptions = (data: CreditRiskEntry[] | LeasingRiskEntry[] | InvestmentRiskEntry[], key: keyof CreditRiskEntry | keyof LeasingRiskEntry | keyof InvestmentRiskEntry): string[] => {
    const options = Array.from(new Set(data.map(item => String(item[key as keyof typeof item]))));
    return ['Tous', ...options];
  };

  // Afficher un message d'erreur si nécessaire
  if (
    (activeTab === 'credit' && errorCredit) ||
    (activeTab === 'leasing' && errorLeasing) ||
    (activeTab === 'investment' && errorInvestment)
  ) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Centrale de Risque</h1>
        <div className="bg-red-50 p-4 rounded-md border border-red-200 text-red-700">
          Une erreur est survenue lors du chargement des données.
          <button 
            className="ml-4 underline" 
            onClick={() => {
              if (activeTab === 'credit') refreshCredit();
              if (activeTab === 'leasing') refreshLeasing();
              if (activeTab === 'investment') refreshInvestment();
            }}
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
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
          if (activeTab === 'credit') refreshCredit();
          if (activeTab === 'leasing') refreshLeasing();
          if (activeTab === 'investment') refreshInvestment();
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

        {/* Barre de recherche et filtres */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Rechercher une entreprise..."
              className="w-full p-2 border rounded-md"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filtres
            <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </Button>
        </div>

        {/* Panneau de filtres */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-md">
            {/* Filtres spécifiques pour chaque type de risque */}
            {activeTab === 'credit' && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1">Institution</label>
                  <select
                    className="w-full p-2 border rounded-md"
                    value={filters.institution || 'Tous'}
                    onChange={(e) => handleFilterChange('institution', e.target.value)}
                  >
                    {getUniqueOptions(creditData, 'institution').map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Statut</label>
                  <select
                    className="w-full p-2 border rounded-md"
                    value={filters.statut || 'Tous'}
                    onChange={(e) => handleFilterChange('statut', e.target.value)}
                  >
                    {getUniqueOptions(creditData, 'statut').map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Rating</label>
                  <select
                    className="w-full p-2 border rounded-md"
                    value={filters.rating || 'Tous'}
                    onChange={(e) => handleFilterChange('rating', e.target.value)}
                  >
                    {getUniqueOptions(creditData, 'rating').map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Secteur</label>
                  <select
                    className="w-full p-2 border rounded-md"
                    value={filters.secteur || 'Tous'}
                    onChange={(e) => handleFilterChange('secteur', e.target.value)}
                  >
                    {getUniqueOptions(creditData, 'sector').map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {/* Bouton pour réinitialiser les filtres */}
            <div className="col-span-1 md:col-span-4 flex justify-end">
              <Button variant="outline" onClick={resetFilters}>
                Réinitialiser les filtres
              </Button>
            </div>
          </div>
        )}

        {/* Contenu des onglets */}
        <TabsContent value="credit" currentValue={activeTab}>
          {loadingCredit ? (
            <div className="text-center py-8">Chargement des données...</div>
          ) : (
            <>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeader>Institution</TableHeader>
                    <TableHeader>Entreprise</TableHeader>
                    <TableHeader>Secteur</TableHeader>
                    <TableHeader>Encours</TableHeader>
                    <TableHeader>Statut</TableHeader>
                    <TableHeader>Rating</TableHeader>
                    <TableHeader>Incidents</TableHeader>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {creditPageItems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-4">
                        Aucune donnée trouvée
                      </TableCell>
                    </TableRow>
                  ) : (
                    creditPageItems.map((item: CreditRiskEntry) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.institution}</TableCell>
                        <TableCell>{item.companyName}</TableCell>
                        <TableCell>{item.sector}</TableCell>
                        <TableCell>{formatCurrency(item.encours)}</TableCell>
                        <TableCell>
                          <span 
                            className={`px-2 py-1 rounded-full text-xs ${
                              item.statut === 'Actif' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {item.statut}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span 
                            className={`px-2 py-1 rounded-full text-xs ${
                              item.rating === 'A' 
                                ? 'bg-green-100 text-green-800' 
                                : item.rating === 'B'
                                ? 'bg-blue-100 text-blue-800'
                                : item.rating === 'C'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {item.rating}
                          </span>
                        </TableCell>
                        <TableCell>{item.incidents}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              
              {creditTotalPages > 1 && (
                <div className="mt-4 flex justify-center">
                  <Pagination
                    currentPage={creditPage}
                    totalPages={creditTotalPages}
                    onPageChange={setCreditPage}
                  />
                </div>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="leasing" currentValue={activeTab}>
          {loadingLeasing ? (
            <div className="text-center py-8">Chargement des données...</div>
          ) : (
            <>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeader>Institution</TableHeader>
                    <TableHeader>Entreprise</TableHeader>
                    <TableHeader>Secteur</TableHeader>
                    <TableHeader>Équipement</TableHeader>
                    <TableHeader>Valeur</TableHeader>
                    <TableHeader>Statut</TableHeader>
                    <TableHeader>Rating</TableHeader>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {leasingPageItems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-4">
                        Aucune donnée trouvée
                      </TableCell>
                    </TableRow>
                  ) : (
                    leasingPageItems.map((item: LeasingRiskEntry) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.institution}</TableCell>
                        <TableCell>{item.companyName}</TableCell>
                        <TableCell>{item.sector}</TableCell>
                        <TableCell>{item.equipmentType}</TableCell>
                        <TableCell>{formatCurrency(item.valeurFinancement)}</TableCell>
                        <TableCell>
                          <span 
                            className={`px-2 py-1 rounded-full text-xs ${
                              item.statut === 'Actif' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {item.statut}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span 
                            className={`px-2 py-1 rounded-full text-xs ${
                              item.rating === 'A' 
                                ? 'bg-green-100 text-green-800' 
                                : item.rating === 'B'
                                ? 'bg-blue-100 text-blue-800'
                                : item.rating === 'C'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {item.rating}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              
              {leasingTotalPages > 1 && (
                <div className="mt-4 flex justify-center">
                  <Pagination
                    currentPage={leasingPage}
                    totalPages={leasingTotalPages}
                    onPageChange={setLeasingPage}
                  />
                </div>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="investment" currentValue={activeTab}>
          {loadingInvestment ? (
            <div className="text-center py-8">Chargement des données...</div>
          ) : (
            <>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeader>Institution</TableHeader>
                    <TableHeader>Entreprise</TableHeader>
                    <TableHeader>Secteur</TableHeader>
                    <TableHeader>Type</TableHeader>
                    <TableHeader>Montant investi</TableHeader>
                    <TableHeader>Valorisation</TableHeader>
                    <TableHeader>Statut</TableHeader>
                    <TableHeader>Rendement</TableHeader>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {investmentPageItems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-4">
                        Aucune donnée trouvée
                      </TableCell>
                    </TableRow>
                  ) : (
                    investmentPageItems.map((item: InvestmentRiskEntry) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.institution}</TableCell>
                        <TableCell>{item.companyName}</TableCell>
                        <TableCell>{item.sector}</TableCell>
                        <TableCell>{item.investmentType}</TableCell>
                        <TableCell>{formatCurrency(item.montantInvesti)}</TableCell>
                        <TableCell>{formatCurrency(item.valorisation)}</TableCell>
                        <TableCell>
                          <span 
                            className={`px-2 py-1 rounded-full text-xs ${
                              item.statut === 'Performant' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {item.statut}
                          </span>
                        </TableCell>
                        <TableCell>{(item.rendementActuel * 100).toFixed(2)}%</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              
              {investmentTotalPages > 1 && (
                <div className="mt-4 flex justify-center">
                  <Pagination
                    currentPage={investmentPage}
                    totalPages={investmentTotalPages}
                    onPageChange={setInvestmentPage}
                  />
                </div>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

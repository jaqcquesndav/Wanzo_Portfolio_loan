import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/Tabs';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/Card';
import { usePortfolios } from '../hooks/usePortfolios';
import { formatCurrency, formatPercentage } from '../utils/formatters';
import { CreditCard, TrendingUp, Truck } from 'lucide-react';
import { PortfolioWithType } from '../types/portfolio';

export default function ReportingDashboard() {
  // État pour suivre l'onglet actif
  const [activeTab, setActiveTab] = useState<'traditional' | 'leasing' | 'investment'>('traditional');
  
  // Charger les portefeuilles par type
  const { 
    portfolios: traditionalPortfolios, 
    loading: loadingTraditional 
  } = usePortfolios('traditional');
  
  const { 
    portfolios: leasingPortfolios, 
    loading: loadingLeasing 
  } = usePortfolios('leasing');
  
  const { 
    portfolios: investmentPortfolios, 
    loading: loadingInvestment 
  } = usePortfolios('investment');

  // Fonction pour générer un résumé des indicateurs par type de portefeuille
  const getPortfolioMetrics = (type: 'traditional' | 'leasing' | 'investment') => {
    const portfolios = type === 'traditional' 
      ? traditionalPortfolios 
      : type === 'leasing' 
        ? leasingPortfolios 
        : investmentPortfolios;
    
    // Calculer les totaux
    const totalValue = portfolios.reduce((sum, p) => sum + p.metrics.net_value, 0);
    const totalReturn = portfolios.reduce((sum, p) => sum + (p.metrics.average_return || 0), 0);
    const activeCount = portfolios.filter(p => p.status === 'active').length;
    
    return {
      totalValue,
      totalReturn,
      activeCount,
      totalCount: portfolios.length,
      averageReturn: totalReturn / (portfolios.length || 1),
    };
  };

  // État de chargement global
  const isLoading = loadingTraditional || loadingLeasing || loadingInvestment;

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 text-center">
        <h1 className="text-2xl font-bold mb-6">Tableau de bord du reporting</h1>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900"></div>
        </div>
        <p className="mt-4 text-gray-600">Chargement des données...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Tableau de bord du reporting</h1>
      
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'traditional' | 'leasing' | 'investment')} className="w-full">
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger 
            value="traditional" 
            currentValue={activeTab}
            onValueChange={(value) => setActiveTab(value as 'traditional' | 'leasing' | 'investment')}
            className="flex items-center gap-2"
          >
            <CreditCard className="h-4 w-4" />
            <span>Crédit</span>
          </TabsTrigger>
          <TabsTrigger 
            value="leasing" 
            currentValue={activeTab}
            onValueChange={(value) => setActiveTab(value as 'traditional' | 'leasing' | 'investment')}
            className="flex items-center gap-2"
          >
            <Truck className="h-4 w-4" />
            <span>Leasing</span>
          </TabsTrigger>
          <TabsTrigger 
            value="investment" 
            currentValue={activeTab}
            onValueChange={(value) => setActiveTab(value as 'traditional' | 'leasing' | 'investment')}
            className="flex items-center gap-2"
          >
            <TrendingUp className="h-4 w-4" />
            <span>Investissement</span>
          </TabsTrigger>
        </TabsList>
        
        {/* Contenu pour le crédit traditionnel */}
        <TabsContent value="traditional" currentValue={activeTab}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Carte des métriques */}
            <Card>
              <CardHeader>
                <CardTitle>Indicateurs clés</CardTitle>
                <CardDescription>Résumé des performances</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Valeur totale</p>
                    <p className="text-2xl font-bold">{formatCurrency(getPortfolioMetrics('traditional').totalValue)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Rendement moyen</p>
                    <p className="text-2xl font-bold">{formatPercentage(getPortfolioMetrics('traditional').averageReturn)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Portefeuilles actifs</p>
                    <p className="text-2xl font-bold">{getPortfolioMetrics('traditional').activeCount} / {getPortfolioMetrics('traditional').totalCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Carte des contrats de crédit */}
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Contrats de crédit</CardTitle>
                <CardDescription>Par entreprise</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {traditionalPortfolios.length === 0 ? (
                    <p className="text-gray-500">Aucun contrat disponible</p>
                  ) : (
                    traditionalPortfolios.slice(0, 5).map((portfolio) => (
                      <div key={portfolio.id} className="flex justify-between items-center border-b pb-2">
                        <div>
                          <p className="font-medium">{portfolio.name}</p>
                          <p className="text-sm text-gray-500">{portfolio.status}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{formatCurrency(portfolio.metrics.net_value)}</p>
                          <p className="text-sm text-gray-500">
                            {portfolio.metrics.average_return 
                              ? formatPercentage(portfolio.metrics.average_return)
                              : 'N/A'}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">Voir tous les contrats</Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        {/* Contenu pour le leasing */}
        <TabsContent value="leasing" currentValue={activeTab}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Carte des métriques */}
            <Card>
              <CardHeader>
                <CardTitle>Indicateurs clés</CardTitle>
                <CardDescription>Résumé des performances</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Valeur totale</p>
                    <p className="text-2xl font-bold">{formatCurrency(getPortfolioMetrics('leasing').totalValue)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Rendement moyen</p>
                    <p className="text-2xl font-bold">{formatPercentage(getPortfolioMetrics('leasing').averageReturn)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Portefeuilles actifs</p>
                    <p className="text-2xl font-bold">{getPortfolioMetrics('leasing').activeCount} / {getPortfolioMetrics('leasing').totalCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Carte des contrats de leasing */}
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Contrats de leasing</CardTitle>
                <CardDescription>Par entreprise</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {leasingPortfolios.length === 0 ? (
                    <p className="text-gray-500">Aucun contrat disponible</p>
                  ) : (
                    leasingPortfolios.slice(0, 5).map((portfolio) => (
                      <div key={portfolio.id} className="flex justify-between items-center border-b pb-2">
                        <div>
                          <p className="font-medium">{portfolio.name}</p>
                          <p className="text-sm text-gray-500">
                            {(portfolio as PortfolioWithType).equipment_catalog?.length || 0} équipements
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{formatCurrency(portfolio.metrics.net_value)}</p>
                          <p className="text-sm text-gray-500">
                            {portfolio.status === 'active' 
                              ? <span className="text-green-600">Actif</span> 
                              : <span className="text-gray-600">{portfolio.status}</span>}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">Voir tous les contrats</Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        {/* Contenu pour l'investissement */}
        <TabsContent value="investment" currentValue={activeTab}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Carte des métriques */}
            <Card>
              <CardHeader>
                <CardTitle>Indicateurs clés</CardTitle>
                <CardDescription>Résumé des performances</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Valeur totale</p>
                    <p className="text-2xl font-bold">{formatCurrency(getPortfolioMetrics('investment').totalValue)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Rendement moyen</p>
                    <p className="text-2xl font-bold">{formatPercentage(getPortfolioMetrics('investment').averageReturn)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Portefeuilles actifs</p>
                    <p className="text-2xl font-bold">{getPortfolioMetrics('investment').activeCount} / {getPortfolioMetrics('investment').totalCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Carte des investissements */}
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Investissements</CardTitle>
                <CardDescription>Actions et obligations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {investmentPortfolios.length === 0 ? (
                    <p className="text-gray-500">Aucun investissement disponible</p>
                  ) : (
                    investmentPortfolios.slice(0, 5).map((portfolio) => {
                      // Compter les actions et obligations
                      interface Asset {
                        type: string;
                        [key: string]: unknown;
                      }
                      
                      const assets = (portfolio as PortfolioWithType).assets as Asset[] || [];
                      const actions = assets.filter((a) => a.type === 'share').length;
                      const obligations = assets.filter((a) => a.type === 'bond').length;
                      
                      return (
                        <div key={portfolio.id} className="flex justify-between items-center border-b pb-2">
                          <div>
                            <p className="font-medium">{portfolio.name}</p>
                            <p className="text-sm text-gray-500">
                              {actions} actions, {obligations} obligations
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">{formatCurrency(portfolio.metrics.net_value)}</p>
                            <p className="text-sm text-gray-500">
                              {portfolio.metrics.average_return 
                                ? formatPercentage(portfolio.metrics.average_return)
                                : 'N/A'}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">Voir tous les investissements</Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

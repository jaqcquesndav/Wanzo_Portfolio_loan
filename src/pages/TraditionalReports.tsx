import { useState } from 'react';
import { AdvancedReportingTable } from '../components/reports/AdvancedReportingTable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/Tabs';
import { BarChart2, PieChart, LineChart, Map as MapIcon } from 'lucide-react';
import { usePortfolioContext } from '../contexts/usePortfolioContext';
import { Navigate } from 'react-router-dom';

// Données d'exemple pour le portefeuille traditionnel
const MOCK_TRADITIONAL_DATA = [
  {
    id: '1',
    nom: 'Crédit PME Alpha',
    entreprise: 'Société Commerciale Alpha',
    region: 'rdc',
    secteur: 'commerce',
    montant_investi: 250000000,
    date_entree: '2022-04-15',
    valorisation_actuelle: 275000000,
    rendement: 0.10,
    multiple: 1.1,
    duree: 2.3,
    statut_remboursement: 'En cours',
    taux_interet: 0.12,
    garantie: 'Hypothèque',
    conformite_ohada: true,
    conformite_cemac: true
  },
  {
    id: '2',
    nom: 'Crédit Équipement Beta',
    entreprise: 'Ferme Agricole Beta',
    region: 'cameroun',
    secteur: 'agriculture',
    montant_investi: 180000000,
    date_entree: '2021-08-22',
    valorisation_actuelle: 200000000,
    rendement: 0.11,
    multiple: 1.11,
    duree: 3.2,
    statut_remboursement: 'En cours',
    taux_interet: 0.115,
    garantie: 'Matériel agricole',
    conformite_ohada: true,
    conformite_cemac: true
  },
  {
    id: '3',
    nom: 'Prêt d\'expansion Gamma',
    entreprise: 'Clinique Médicale Gamma',
    region: 'gabon',
    secteur: 'sante',
    montant_investi: 320000000,
    date_entree: '2023-01-30',
    valorisation_actuelle: 330000000,
    rendement: 0.09,
    multiple: 1.03,
    duree: 1.5,
    statut_remboursement: 'En cours',
    taux_interet: 0.095,
    garantie: 'Équipement médical',
    conformite_ohada: true,
    conformite_cemac: false
  },
  {
    id: '4',
    nom: 'Crédit Expansion Delta',
    entreprise: 'Station Delta Énergies',
    region: 'congo',
    secteur: 'energie',
    montant_investi: 450000000,
    date_entree: '2020-10-15',
    valorisation_actuelle: 520000000,
    rendement: 0.08,
    multiple: 1.16,
    duree: 4.8,
    statut_remboursement: 'En cours',
    taux_interet: 0.085,
    garantie: 'Fonds de commerce',
    conformite_ohada: true,
    conformite_cemac: true
  },
  {
    id: '5',
    nom: 'Microcrédit Epsilon',
    entreprise: 'Institut Éducatif Epsilon',
    region: 'rdc',
    secteur: 'education',
    montant_investi: 85000000,
    date_entree: '2022-09-10',
    valorisation_actuelle: 90000000,
    rendement: 0.11,
    multiple: 1.06,
    duree: 2.3,
    statut_remboursement: 'En cours',
    taux_interet: 0.11,
    garantie: 'Caution solidaire',
    conformite_ohada: true,
    conformite_cemac: true
  },
  {
    id: '6',
    nom: 'Prêt Immobilier Zeta',
    entreprise: 'Promoteur Zeta Immobilier',
    region: 'cote_ivoire',
    secteur: 'immobilier',
    montant_investi: 700000000,
    date_entree: '2021-03-05',
    valorisation_actuelle: 780000000,
    rendement: 0.07,
    multiple: 1.11,
    duree: 4.2,
    statut_remboursement: 'En cours',
    taux_interet: 0.075,
    garantie: 'Hypothèque première rang',
    conformite_ohada: true,
    conformite_cemac: false
  },
  {
    id: '7',
    nom: 'Crédit Industriel Theta',
    entreprise: 'Exploitations Minières Theta',
    region: 'tchad',
    secteur: 'mines',
    montant_investi: 1200000000,
    date_entree: '2020-06-20',
    valorisation_actuelle: 1350000000,
    rendement: 0.09,
    multiple: 1.13,
    duree: 5.0,
    statut_remboursement: 'En cours',
    taux_interet: 0.095,
    garantie: 'Actifs d\'exploitation',
    conformite_ohada: true,
    conformite_cemac: true
  },
  {
    id: '8',
    nom: 'Crédit Véhicules Iota',
    entreprise: 'Transport Iota Express',
    region: 'senegal',
    secteur: 'transport',
    montant_investi: 170000000,
    date_entree: '2022-11-15',
    valorisation_actuelle: 175000000,
    rendement: 0.08,
    multiple: 1.03,
    duree: 2.6,
    statut_remboursement: 'En cours',
    taux_interet: 0.08,
    garantie: 'Nantissement de véhicules',
    conformite_ohada: true,
    conformite_cemac: false
  },
  {
    id: '9',
    nom: 'Crédit Tech Kappa',
    entreprise: 'Fintech Kappa Solutions',
    region: 'cameroun',
    secteur: 'fintech',
    montant_investi: 230000000,
    date_entree: '2023-03-10',
    valorisation_actuelle: 240000000,
    rendement: 0.12,
    multiple: 1.04,
    duree: 2.3,
    statut_remboursement: 'En cours',
    taux_interet: 0.125,
    garantie: 'Caution bancaire',
    conformite_ohada: true,
    conformite_cemac: true
  },
  {
    id: '10',
    nom: 'Crédit Rural Lambda',
    entreprise: 'Coopérative Lambda',
    region: 'rdc',
    secteur: 'agriculture',
    montant_investi: 380000000,
    date_entree: '2021-07-25',
    valorisation_actuelle: 420000000,
    rendement: 0.09,
    multiple: 1.11,
    duree: 3.9,
    statut_remboursement: 'En cours',
    taux_interet: 0.095,
    garantie: 'Fonds mutuel solidaire',
    conformite_ohada: true,
    conformite_cemac: true
  }
];

export default function TraditionalReports() {
  const [activeTab, setActiveTab] = useState('tableau');
  const { portfolioType } = usePortfolioContext();

  // Vérifier si le type de portefeuille est "traditional", sinon rediriger
  if (portfolioType !== 'traditional') {
    return <Navigate to={`/app/${portfolioType}/reports`} replace />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Reporting Crédit & Financement</h1>
          <p className="text-gray-500 dark:text-gray-400">Analyse détaillée des portefeuilles de crédit et financement</p>
        </div>
        <div className="flex gap-2">
          <select className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 text-sm bg-white dark:bg-gray-800 dark:text-gray-200">
            <option>Tous les types de crédits</option>
            <option>Crédit PME</option>
            <option>Crédit Équipement</option>
            <option>Financement Commercial</option>
            <option>Crédit Immobilier</option>
            <option>Microcrédit</option>
          </select>
          <select className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 text-sm bg-white dark:bg-gray-800 dark:text-gray-200">
            <option>2025 (Actuel)</option>
            <option>2024</option>
            <option>2023</option>
            <option>2022</option>
            <option>2021</option>
          </select>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
          <TabsTrigger 
            value="tableau" 
            currentValue={activeTab} 
            onValueChange={setActiveTab} 
            className="flex items-center gap-1"
          >
            <BarChart2 className="h-4 w-4" />
            <span className="hidden sm:inline">Tableau</span>
          </TabsTrigger>
          <TabsTrigger 
            value="graphiques" 
            currentValue={activeTab} 
            onValueChange={setActiveTab} 
            className="flex items-center gap-1"
          >
            <PieChart className="h-4 w-4" />
            <span className="hidden sm:inline">Graphiques</span>
          </TabsTrigger>
          <TabsTrigger 
            value="tendances" 
            currentValue={activeTab} 
            onValueChange={setActiveTab} 
            className="flex items-center gap-1"
          >
            <LineChart className="h-4 w-4" />
            <span className="hidden sm:inline">Tendances</span>
          </TabsTrigger>
          <TabsTrigger 
            value="geographique" 
            currentValue={activeTab} 
            onValueChange={setActiveTab} 
            className="flex items-center gap-1"
          >
            <MapIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Cartographie</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="tableau" currentValue={activeTab} className="mt-6">
          <AdvancedReportingTable 
            data={MOCK_TRADITIONAL_DATA}
            title="Portefeuille de Crédit et Financement"
          />
        </TabsContent>
        
        <TabsContent value="graphiques" currentValue={activeTab} className="mt-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 flex flex-col items-center justify-center min-h-[400px]">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold">Répartition du portefeuille de crédit</h2>
              <p className="text-gray-500 dark:text-gray-400">Visualisation par type de crédit et par région</p>
            </div>
            <div className="text-gray-400 flex flex-col items-center">
              <PieChart className="h-16 w-16 mb-4" />
              <p>Les graphiques interactifs seront disponibles dans la prochaine mise à jour</p>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="tendances" currentValue={activeTab} className="mt-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 flex flex-col items-center justify-center min-h-[400px]">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold">Évolution des performances de crédit</h2>
              <p className="text-gray-500 dark:text-gray-400">Tendances de remboursement et rendement sur la période</p>
            </div>
            <div className="text-gray-400 flex flex-col items-center">
              <LineChart className="h-16 w-16 mb-4" />
              <p>Les graphiques de tendance seront disponibles dans la prochaine mise à jour</p>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="geographique" currentValue={activeTab} className="mt-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 flex flex-col items-center justify-center min-h-[400px]">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold">Cartographie des crédits</h2>
              <p className="text-gray-500 dark:text-gray-400">Répartition géographique des financements</p>
            </div>
            <div className="text-gray-400 flex flex-col items-center">
              <MapIcon className="h-16 w-16 mb-4" />
              <p>La cartographie interactive sera disponible dans la prochaine mise à jour</p>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
        <h3 className="text-lg font-medium text-blue-800 dark:text-blue-300 mb-2">Conformité réglementaire</h3>
        <ul className="list-disc list-inside space-y-1 text-sm text-blue-700 dark:text-blue-400">
          <li>Les données présentées sont conformes aux exigences de l'Acte Uniforme OHADA relatif au droit comptable.</li>
          <li>Les taux d'intérêt appliqués respectent les directives de la CEMAC pour les institutions financières.</li>
          <li>Les rapports peuvent être utilisés pour les déclarations obligatoires auprès des autorités de régulation.</li>
          <li>Les indicateurs de performance sont calculés selon les standards bancaires internationaux adaptés au contexte africain.</li>
        </ul>
      </div>
    </div>
  );
}

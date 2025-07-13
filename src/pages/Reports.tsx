import { useState } from 'react';
import { AdvancedReportingTable } from '../components/reports/AdvancedReportingTable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/Tabs';
import { BarChart2, PieChart, LineChart, Map as MapIcon } from 'lucide-react';

// Données d'exemple pour le tableau de reporting
const MOCK_PORTFOLIO_DATA = [
  {
    id: '1',
    nom: 'Projet Alpha',
    entreprise: 'Alpha Technologies SA',
    region: 'rdc',
    secteur: 'telecom',
    montant_investi: 750000000,
    date_entree: '2022-03-15',
    valorisation_actuelle: 1125000000,
    rendement: 0.22,
    multiple: 1.5,
    duree: 3.2,
    conformite_ohada: true,
    conformite_cemac: true,
    impact_social: 'Élevé',
    impact_environnemental: 'Modéré'
  },
  {
    id: '2',
    nom: 'Projet Beta',
    entreprise: 'EcoGrow SARL',
    region: 'cameroun',
    secteur: 'agriculture',
    montant_investi: 450000000,
    date_entree: '2021-07-22',
    valorisation_actuelle: 675000000,
    rendement: 0.25,
    multiple: 1.5,
    duree: 3.9,
    conformite_ohada: true,
    conformite_cemac: true,
    impact_social: 'Très élevé',
    impact_environnemental: 'Positif'
  },
  {
    id: '3',
    nom: 'Projet Gamma',
    entreprise: 'PharmaSanté Inc.',
    region: 'gabon',
    secteur: 'sante',
    montant_investi: 600000000,
    date_entree: '2023-01-10',
    valorisation_actuelle: 720000000,
    rendement: 0.18,
    multiple: 1.2,
    duree: 2.4,
    conformite_ohada: true,
    conformite_cemac: false,
    impact_social: 'Élevé',
    impact_environnemental: 'Neutre'
  },
  {
    id: '4',
    nom: 'Projet Delta',
    entreprise: 'EnergySolar SA',
    region: 'congo',
    secteur: 'energie',
    montant_investi: 850000000,
    date_entree: '2020-11-05',
    valorisation_actuelle: 1275000000,
    rendement: 0.15,
    multiple: 1.5,
    duree: 4.6,
    conformite_ohada: true,
    conformite_cemac: true,
    impact_social: 'Modéré',
    impact_environnemental: 'Très positif'
  },
  {
    id: '5',
    nom: 'Projet Epsilon',
    entreprise: 'EduTech Solutions',
    region: 'rdc',
    secteur: 'education',
    montant_investi: 350000000,
    date_entree: '2022-08-18',
    valorisation_actuelle: 385000000,
    rendement: 0.09,
    multiple: 1.1,
    duree: 2.8,
    conformite_ohada: true,
    conformite_cemac: true,
    impact_social: 'Très élevé',
    impact_environnemental: 'Neutre'
  },
  {
    id: '6',
    nom: 'Projet Zeta',
    entreprise: 'Constructions Modernex',
    region: 'cote_ivoire',
    secteur: 'immobilier',
    montant_investi: 1200000000,
    date_entree: '2021-02-28',
    valorisation_actuelle: 1560000000,
    rendement: 0.12,
    multiple: 1.3,
    duree: 4.3,
    conformite_ohada: true,
    conformite_cemac: false,
    impact_social: 'Modéré',
    impact_environnemental: 'Modéré'
  },
  {
    id: '7',
    nom: 'Projet Theta',
    entreprise: 'MineX Corp',
    region: 'tchad',
    secteur: 'mines',
    montant_investi: 2500000000,
    date_entree: '2020-05-12',
    valorisation_actuelle: 3750000000,
    rendement: 0.19,
    multiple: 1.5,
    duree: 5.1,
    conformite_ohada: true,
    conformite_cemac: true,
    impact_social: 'Modéré',
    impact_environnemental: 'Négatif'
  },
  {
    id: '8',
    nom: 'Projet Iota',
    entreprise: 'TransLog Solutions',
    region: 'senegal',
    secteur: 'transport',
    montant_investi: 550000000,
    date_entree: '2022-11-30',
    valorisation_actuelle: 577500000,
    rendement: 0.05,
    multiple: 1.05,
    duree: 2.5,
    conformite_ohada: true,
    conformite_cemac: false,
    impact_social: 'Élevé',
    impact_environnemental: 'Modéré'
  },
  {
    id: '9',
    nom: 'Projet Kappa',
    entreprise: 'FinPay Technologies',
    region: 'cameroun',
    secteur: 'fintech',
    montant_investi: 400000000,
    date_entree: '2023-04-20',
    valorisation_actuelle: 520000000,
    rendement: 0.30,
    multiple: 1.3,
    duree: 2.2,
    conformite_ohada: true,
    conformite_cemac: true,
    impact_social: 'Élevé',
    impact_environnemental: 'Neutre'
  },
  {
    id: '10',
    nom: 'Projet Lambda',
    entreprise: 'AgroIndustries SA',
    region: 'rdc',
    secteur: 'agriculture',
    montant_investi: 900000000,
    date_entree: '2021-09-15',
    valorisation_actuelle: 1170000000,
    rendement: 0.14,
    multiple: 1.3,
    duree: 3.7,
    conformite_ohada: true,
    conformite_cemac: true,
    impact_social: 'Très élevé',
    impact_environnemental: 'Positif'
  }
];

export default function Reports() {
  const [activeTab, setActiveTab] = useState('tableau');

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Reporting & Analyses</h1>
          <p className="text-gray-500">Analyse détaillée des portefeuilles d'investissement</p>
        </div>
        <div className="flex gap-2">
          <select className="border border-gray-300 rounded-md px-3 py-1 text-sm bg-white">
            <option>Tous les portefeuilles</option>
            <option>PME - Kinshasa</option>
            <option>Startups technologiques</option>
            <option>Industries extractives</option>
            <option>Fonds d'impact</option>
          </select>
          <select className="border border-gray-300 rounded-md px-3 py-1 text-sm bg-white">
            <option>2025 (Actuel)</option>
            <option>2024</option>
            <option>2023</option>
            <option>2022</option>
            <option>2021</option>
          </select>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
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
            data={MOCK_PORTFOLIO_DATA}
            title="Portefeuille d'Investissements"
          />
        </TabsContent>
        
        <TabsContent value="graphiques" currentValue={activeTab} className="mt-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 flex flex-col items-center justify-center min-h-[400px]">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold">Répartition du portefeuille</h2>
              <p className="text-gray-500">Visualisation par secteur et par région</p>
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
              <h2 className="text-xl font-bold">Évolution temporelle</h2>
              <p className="text-gray-500">Tendances de performance sur la période</p>
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
              <h2 className="text-xl font-bold">Cartographie des investissements</h2>
              <p className="text-gray-500">Répartition géographique des projets</p>
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
          <li>La valorisation des actifs suit les directives de la CEMAC pour les institutions financières.</li>
          <li>Les rapports peuvent être utilisés pour les déclarations obligatoires auprès des autorités de régulation.</li>
          <li>Les métriques de performance sont calculées selon les standards internationaux et adaptées au contexte africain.</li>
        </ul>
      </div>
    </div>
  );
}
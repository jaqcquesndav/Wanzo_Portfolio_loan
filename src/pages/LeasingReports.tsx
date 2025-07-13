import { useState } from 'react';
import { AdvancedReportingTable } from '../components/reports/AdvancedReportingTable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/Tabs';
import { BarChart2, PieChart, LineChart, Map as MapIcon } from 'lucide-react';
import { usePortfolioContext } from '../contexts/usePortfolioContext';
import { Navigate } from 'react-router-dom';

// Données d'exemple pour le leasing
const MOCK_LEASING_DATA = [
  {
    id: '1',
    nom: 'Matériel Alpha',
    entreprise: 'Alpha Industries SA',
    region: 'rdc',
    secteur: 'manufacture',
    montant_investi: 450000000,
    date_entree: '2022-05-10',
    valorisation_actuelle: 400000000,
    rendement: 0.12,
    multiple: 0.89,
    duree: 3.0,
    conformite_ohada: true,
    conformite_cemac: true,
    type_equipement: 'Machines industrielles',
    statut_contrat: 'Actif',
    loyer_mensuel: 12500000,
    valeur_residuelle: 90000000
  },
  {
    id: '2',
    nom: 'Flotte Beta',
    entreprise: 'Beta Logistique SARL',
    region: 'cameroun',
    secteur: 'transport',
    montant_investi: 350000000,
    date_entree: '2021-09-15',
    valorisation_actuelle: 290000000,
    rendement: 0.14,
    multiple: 0.83,
    duree: 3.5,
    conformite_ohada: true,
    conformite_cemac: true,
    type_equipement: 'Véhicules utilitaires',
    statut_contrat: 'Actif',
    loyer_mensuel: 10000000,
    valeur_residuelle: 70000000
  },
  {
    id: '3',
    nom: 'Équipement Médical Gamma',
    entreprise: 'Centre Hospitalier Gamma',
    region: 'gabon',
    secteur: 'sante',
    montant_investi: 520000000,
    date_entree: '2023-02-05',
    valorisation_actuelle: 500000000,
    rendement: 0.11,
    multiple: 0.96,
    duree: 2.0,
    conformite_ohada: true,
    conformite_cemac: false,
    type_equipement: 'Matériel médical',
    statut_contrat: 'Actif',
    loyer_mensuel: 22000000,
    valeur_residuelle: 104000000
  },
  {
    id: '4',
    nom: 'Panneaux Solaires Delta',
    entreprise: 'Delta Énergie SA',
    region: 'congo',
    secteur: 'energie',
    montant_investi: 380000000,
    date_entree: '2020-11-20',
    valorisation_actuelle: 260000000,
    rendement: 0.13,
    multiple: 0.68,
    duree: 4.5,
    conformite_ohada: true,
    conformite_cemac: true,
    type_equipement: 'Équipement énergétique',
    statut_contrat: 'Actif',
    loyer_mensuel: 9500000,
    valeur_residuelle: 76000000
  },
  {
    id: '5',
    nom: 'Matériel Informatique Epsilon',
    entreprise: 'Institut Epsilon',
    region: 'rdc',
    secteur: 'education',
    montant_investi: 120000000,
    date_entree: '2022-07-30',
    valorisation_actuelle: 95000000,
    rendement: 0.15,
    multiple: 0.79,
    duree: 2.5,
    conformite_ohada: true,
    conformite_cemac: true,
    type_equipement: 'Équipement informatique',
    statut_contrat: 'Actif',
    loyer_mensuel: 4800000,
    valeur_residuelle: 24000000
  },
  {
    id: '6',
    nom: 'Grues de construction Zeta',
    entreprise: 'Zeta Construction',
    region: 'cote_ivoire',
    secteur: 'immobilier',
    montant_investi: 680000000,
    date_entree: '2021-04-12',
    valorisation_actuelle: 530000000,
    rendement: 0.11,
    multiple: 0.78,
    duree: 4.0,
    conformite_ohada: true,
    conformite_cemac: false,
    type_equipement: 'Équipement de construction',
    statut_contrat: 'Actif',
    loyer_mensuel: 17000000,
    valeur_residuelle: 136000000
  },
  {
    id: '7',
    nom: 'Équipement minier Theta',
    entreprise: 'Compagnie Minière Theta',
    region: 'tchad',
    secteur: 'mines',
    montant_investi: 950000000,
    date_entree: '2020-08-18',
    valorisation_actuelle: 680000000,
    rendement: 0.16,
    multiple: 0.72,
    duree: 4.8,
    conformite_ohada: true,
    conformite_cemac: true,
    type_equipement: 'Machines minières',
    statut_contrat: 'Actif',
    loyer_mensuel: 21000000,
    valeur_residuelle: 190000000
  },
  {
    id: '8',
    nom: 'Tracteurs agricoles Iota',
    entreprise: 'Coopérative Iota',
    region: 'senegal',
    secteur: 'agriculture',
    montant_investi: 280000000,
    date_entree: '2022-10-05',
    valorisation_actuelle: 255000000,
    rendement: 0.10,
    multiple: 0.91,
    duree: 2.6,
    conformite_ohada: true,
    conformite_cemac: false,
    type_equipement: 'Matériel agricole',
    statut_contrat: 'Actif',
    loyer_mensuel: 8400000,
    valeur_residuelle: 56000000
  },
  {
    id: '9',
    nom: 'Serveurs Kappa',
    entreprise: 'Kappa Tech Solutions',
    region: 'cameroun',
    secteur: 'telecom',
    montant_investi: 320000000,
    date_entree: '2023-01-15',
    valorisation_actuelle: 315000000,
    rendement: 0.13,
    multiple: 0.98,
    duree: 2.2,
    conformite_ohada: true,
    conformite_cemac: true,
    type_equipement: 'Infrastructure IT',
    statut_contrat: 'Actif',
    loyer_mensuel: 13500000,
    valeur_residuelle: 64000000
  },
  {
    id: '10',
    nom: 'Machines agricoles Lambda',
    entreprise: 'Fermes Lambda SA',
    region: 'rdc',
    secteur: 'agriculture',
    montant_investi: 420000000,
    date_entree: '2021-06-25',
    valorisation_actuelle: 320000000,
    rendement: 0.12,
    multiple: 0.76,
    duree: 3.8,
    conformite_ohada: true,
    conformite_cemac: true,
    type_equipement: 'Équipement agroalimentaire',
    statut_contrat: 'Actif',
    loyer_mensuel: 11000000,
    valeur_residuelle: 84000000
  }
];

export default function LeasingReports() {
  const [activeTab, setActiveTab] = useState('tableau');
  const { portfolioType } = usePortfolioContext();

  // Vérifier si le type de portefeuille est "leasing", sinon rediriger
  if (portfolioType !== 'leasing') {
    return <Navigate to={`/app/${portfolioType}/reports`} replace />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Reporting & Analyses Leasing</h1>
          <p className="text-gray-500">Analyse détaillée des contrats et équipements en leasing</p>
        </div>
        <div className="flex gap-2">
          <select className="border border-gray-300 rounded-md px-3 py-1 text-sm bg-white">
            <option>Tous les types d'équipements</option>
            <option>Machines industrielles</option>
            <option>Véhicules utilitaires</option>
            <option>Matériel médical</option>
            <option>Équipement informatique</option>
            <option>Matériel agricole</option>
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
            data={MOCK_LEASING_DATA}
            title="Portefeuille de Leasing et Équipements"
          />
        </TabsContent>
        
        <TabsContent value="graphiques" currentValue={activeTab} className="mt-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 flex flex-col items-center justify-center min-h-[400px]">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold">Répartition des équipements</h2>
              <p className="text-gray-500">Visualisation par type d'équipement et par région</p>
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
              <h2 className="text-xl font-bold">Évolution de la valorisation</h2>
              <p className="text-gray-500">Tendances de dépréciation et rendement sur la période</p>
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
              <h2 className="text-xl font-bold">Cartographie des équipements</h2>
              <p className="text-gray-500">Répartition géographique des contrats de leasing</p>
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
          <li>Les contrats de leasing sont conformes aux exigences de l'Acte Uniforme OHADA relatif au droit comptable.</li>
          <li>La valorisation des équipements suit les directives de la CEMAC pour les institutions financières.</li>
          <li>Les rapports peuvent être utilisés pour les déclarations obligatoires auprès des autorités de régulation.</li>
          <li>Les métriques de dépréciation sont calculées selon les standards internationaux adaptés au contexte africain.</li>
        </ul>
      </div>
    </div>
  );
}

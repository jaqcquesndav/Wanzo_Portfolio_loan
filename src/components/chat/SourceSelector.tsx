import { useState, useMemo } from 'react';
import { 
  CreditCard, 
  Briefcase, 
  BarChart4, 
  Package, 
  Search, 
  FileText, 
  Users, 
  AlertTriangle, 
  LayoutGrid
} from 'lucide-react';
import { Task } from '../../hooks/useChatStore';
import { useTraditionalPortfoliosQuery } from '../../hooks/queries';

// Définition des types de portefeuille
type PortfolioType = 'traditional';

// Définition des catégories de sources
type SourceCategory = 'portfolio' | 'prospection' | 'risk' | 'general';

// Interface pour les portefeuilles récupérés des hooks
interface PortfolioItem {
  id: string;
  name: string;
  type: PortfolioType;
}

// Configuration des tâches par catégorie
const sourcesConfig: Record<SourceCategory, { 
  title: string, 
  icon: JSX.Element, 
  tasks: Task[]
}> = {
  portfolio: {
    title: 'Portefeuilles',
    icon: <LayoutGrid className="h-5 w-5 text-blue-600" />,
    tasks: [
      {
        id: 'traditional-portfolio',
        name: 'Portefeuille traditionnel',
        description: 'Analyse des crédits, demandes de financement et garanties',
        icon: <CreditCard className="h-5 w-5 text-blue-600" />,
        context: ['credit', 'financing', 'guarantees']
      },
      {
        id: 'leasing-portfolio',
        name: 'Portefeuille de leasing',
        description: 'Gestion des contrats de leasing et équipements',
        icon: <Package className="h-5 w-5 text-amber-600" />,
        context: ['leasing', 'equipment', 'maintenance']
      },
      {
        id: 'investment-portfolio',
        name: 'Portefeuille d\'investissement',
        description: 'Suivi des actifs et valorisation des investissements',
        icon: <Briefcase className="h-5 w-5 text-purple-600" />,
        context: ['investment', 'assets', 'valuation']
      }
    ]
  },
  prospection: {
    title: 'Prospection',
    icon: <Search className="h-5 w-5 text-green-600" />,
    tasks: [
      {
        id: 'market-analysis',
        name: 'Analyse de marché',
        description: 'Étude des opportunités et tendances du marché',
        icon: <BarChart4 className="h-5 w-5 text-green-600" />,
        context: ['market', 'opportunities', 'trends']
      },
      {
        id: 'client-prospection',
        name: 'Prospection client',
        description: 'Identification et qualification des prospects',
        icon: <Users className="h-5 w-5 text-green-600" />,
        context: ['prospects', 'client-acquisition', 'leads']
      }
    ]
  },
  risk: {
    title: 'Centrale de risque',
    icon: <AlertTriangle className="h-5 w-5 text-red-600" />,
    tasks: [
      {
        id: 'risk-assessment',
        name: 'Évaluation des risques',
        description: 'Analyse des risques liés aux clients et transactions',
        icon: <AlertTriangle className="h-5 w-5 text-red-600" />,
        context: ['risk', 'assessment', 'credit-score']
      },
      {
        id: 'compliance',
        name: 'Conformité',
        description: 'Vérification de la conformité réglementaire',
        icon: <FileText className="h-5 w-5 text-red-600" />,
        context: ['compliance', 'regulation', 'audit']
      }
    ]
  },
  general: {
    title: 'Général',
    icon: <LayoutGrid className="h-5 w-5 text-gray-600" />,
    tasks: [
      {
        id: 'all-portfolio',
        name: 'Tous les portefeuilles',
        description: 'Vision globale sur l\'ensemble des portefeuilles',
        icon: <LayoutGrid className="h-5 w-5 text-gray-600" />,
        context: ['general', 'portfolio', 'overview']
      },
      {
        id: 'all-data',
        name: 'Toutes les données',
        description: 'Accès à l\'ensemble des données disponibles',
        icon: <BarChart4 className="h-5 w-5 text-gray-600" />,
        context: ['all-data', 'analytics', 'statistics']
      }
    ]
  }
};

interface SourceSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  currentPortfolioType: PortfolioType;
  selectedTask: Task | null;
  selectedPortfolioId?: string | null;
  onSelect: (task: Task, portfolioType?: PortfolioType, portfolioId?: string) => void;
}

export function SourceSelector({ 
  isOpen, 
  onClose, 
  currentPortfolioType,
  selectedTask, 
  selectedPortfolioId,
  onSelect 
}: SourceSelectorProps) {
  const [activeCategory, setActiveCategory] = useState<SourceCategory>('portfolio');
  const [selectedPortfolio, setSelectedPortfolio] = useState<string | null>(selectedPortfolioId || null);

  // ✅ Charger les données avec React Query (cache intelligent)
  const { data: portfolioData, isLoading: loading } = useTraditionalPortfoliosQuery();
  const traditionalPortfolios = portfolioData?.data || [];

  // Mémoriser les IDs des portefeuilles pour une comparaison stable
  const portfolioIds = useMemo(() => 
    (traditionalPortfolios || []).map(p => p.id).join(','),
    [traditionalPortfolios]
  );

  // Combiner tous les portefeuilles et les organiser par type
  // Utiliser useMemo avec une dépendance stable (string des IDs)
  const availablePortfolios = useMemo(() => {
    if (currentPortfolioType !== 'traditional') return [];
    return (traditionalPortfolios || []).map(p => ({ 
      id: p.id, 
      name: p.name, 
      type: 'traditional' as const 
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [portfolioIds, currentPortfolioType]);

  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            Sélection des sources
          </h2>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white text-xl"
          >
            &times;
          </button>
        </div>
        
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Choisissez le contexte de travail pour obtenir une assistance plus pertinente.
        </p>
        
        {/* Catégories */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {(Object.keys(sourcesConfig) as SourceCategory[]).map(category => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`
                p-4 rounded-lg border flex items-center space-x-3 transition-all
                ${activeCategory === category 
                  ? 'border-primary bg-primary/5 shadow-sm dark:border-primary dark:bg-primary/20' 
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:hover:border-gray-600 dark:hover:bg-gray-700'}
              `}
            >
              {sourcesConfig[category].icon}
              <span className="font-medium">{sourcesConfig[category].title}</span>
            </button>
          ))}
        </div>
        
        {/* Sélection du type de portfolio si catégorie "portfolio" */}
        {activeCategory === 'portfolio' && (
          <div className="mb-6">            
            {/* Liste des portefeuilles spécifiques */}
            <h3 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-3">
              Portefeuilles disponibles
            </h3>
            <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto pr-1">
              {availablePortfolios.map(portfolio => (
                <button
                  key={portfolio.id}
                  onClick={() => setSelectedPortfolio(portfolio.id)}
                  className={`
                    p-2 rounded-lg border flex items-center space-x-2 transition-all
                    ${selectedPortfolio === portfolio.id 
                      ? 'border-primary bg-primary/5 shadow-sm dark:border-primary dark:bg-primary/20' 
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:hover:border-gray-600 dark:hover:bg-gray-700'}
                  `}
                >
                  {portfolio.type === 'traditional' && <CreditCard className="h-4 w-4 text-blue-600" />}
                  <span className="text-sm truncate">{portfolio.name}</span>
                </button>
              ))}
              {availablePortfolios.length === 0 && (
                <div className="text-sm text-gray-500 p-2 text-center">
                  Aucun portefeuille de ce type disponible
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Liste des tâches */}
        <div className="space-y-4 mt-6">
          <h3 className="text-lg font-medium border-b pb-2 dark:border-gray-700">
            {sourcesConfig[activeCategory].title}
          </h3>
          
          <div className="space-y-3">
            {sourcesConfig[activeCategory].tasks.map(task => (
              <button
                key={task.id}
                onClick={() => {
                  if (activeCategory === 'portfolio') {
                    onSelect(task, currentPortfolioType, selectedPortfolio || undefined);
                  } else {
                    onSelect(task);
                  }
                  onClose();
                }}
                className={`
                  w-full p-4 rounded-lg text-left transition-colors border
                  ${selectedTask?.id === task.id
                    ? 'bg-primary/10 text-primary border-primary dark:bg-primary/20'
                    : 'hover:bg-gray-50 border-gray-100 dark:hover:bg-gray-700 dark:border-gray-700'}
                `}
              >
                <div className="flex items-center space-x-2">
                  {task.icon}
                  <span className="font-medium">{task.name}</span>
                  {selectedTask?.id === task.id && (
                    <span className="ml-2 text-xs bg-primary/20 text-primary rounded-full px-2 py-0.5">
                      Actif
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{task.description}</p>
              </button>
            ))}
          </div>
        </div>
        
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white mr-2"
          >
            Annuler
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
          >
            Confirmer
          </button>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { AI_MODELS } from '../../types/chat';
import { Sparkles, CreditCard, Briefcase, BarChart4, Package, Search } from 'lucide-react';

// Définition des catégories de modèles
type ModelCategory = 'credit' | 'leasing' | 'investment' | 'analytics' | 'prospection';

// Mapping des modèles par catégorie
const modelCategories: Record<ModelCategory, { title: string, icon: JSX.Element, models: typeof AI_MODELS }> = {
  credit: {
    title: 'Crédit & Finance Traditionnelle',
    icon: <CreditCard className="h-5 w-5 text-blue-600" />,
    models: AI_MODELS.filter(m => m.id === 'adha-credit')
  },
  prospection: {
    title: 'Prospection & Développement Client',
    icon: <Search className="h-5 w-5 text-green-600" />,
    models: AI_MODELS.filter(m => m.id === 'adha-prospection')
  },
  leasing: {
    title: 'Leasing & Gestion d\'Équipements',
    icon: <Package className="h-5 w-5 text-amber-600" />,
    models: AI_MODELS.filter(m => m.id === 'adha-leasing')
  },
  investment: {
    title: 'Investissement & Valorisation',
    icon: <Briefcase className="h-5 w-5 text-purple-600" />,
    models: AI_MODELS.filter(m => m.id === 'adha-invest')
  },
  analytics: {
    title: 'Analyses & Prévisions',
    icon: <BarChart4 className="h-5 w-5 text-red-600" />,
    models: AI_MODELS.filter(m => m.id === 'adha-analytics')
  }
};

interface ModelSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  selectedModel: typeof AI_MODELS[0];
  onSelect: (model: typeof AI_MODELS[0]) => void;
}

export function ModelSelector({ isOpen, onClose, selectedModel, onSelect }: ModelSelectorProps) {
  const [activeCategory, setActiveCategory] = useState<ModelCategory | null>(null);

  if (!isOpen) return null;
  
  // Détermine la catégorie active basée sur le modèle sélectionné
  const getCurrentCategory = (): ModelCategory => {
    if (selectedModel.id === 'adha-credit') return 'credit';
    if (selectedModel.id === 'adha-prospection') return 'prospection';
    if (selectedModel.id === 'adha-leasing') return 'leasing';
    if (selectedModel.id === 'adha-invest') return 'investment';
    if (selectedModel.id === 'adha-analytics') return 'analytics';
    return 'analytics'; // Valeur par défaut
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Sélectionner un modèle d'assistance</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-xl">&times;</button>
        </div>
        
        <p className="text-gray-600 mb-6">
          Choisissez un modèle adapté à votre secteur d'activité pour obtenir une assistance plus pertinente.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {(Object.keys(modelCategories) as ModelCategory[]).map(category => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`
                p-4 rounded-lg border flex items-center space-x-3 transition-all
                ${(activeCategory || getCurrentCategory()) === category 
                  ? 'border-primary bg-primary/5 shadow-sm' 
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}
              `}
            >
              {modelCategories[category].icon}
              <span className="font-medium">{modelCategories[category].title}</span>
            </button>
          ))}
        </div>
        
        <div className="space-y-4 mt-6">
          <h3 className="text-lg font-medium border-b pb-2">
            {activeCategory 
              ? modelCategories[activeCategory].title 
              : modelCategories[getCurrentCategory()].title}
          </h3>
          
          {(activeCategory 
            ? modelCategories[activeCategory].models 
            : modelCategories[getCurrentCategory()].models
          ).map(model => (
            <button
              key={model.id}
              onClick={() => {
                onSelect(model);
                onClose();
              }}
              className={`
                w-full p-4 rounded-lg text-left transition-colors border
                ${selectedModel.id === model.id
                  ? 'bg-primary/10 text-primary border-primary'
                  : 'hover:bg-gray-50 border-gray-100'
                }
              `}
            >
              <div className="flex items-center space-x-2">
                <Sparkles className="h-5 w-5" />
                <span className="font-medium">{model.name}</span>
                {selectedModel.id === model.id && (
                  <span className="ml-2 text-xs bg-primary/20 text-primary rounded-full px-2 py-0.5">Actif</span>
                )}
              </div>
              <p className="text-sm text-gray-600 mt-2">{model.description}</p>
              <div className="flex flex-wrap gap-1 mt-3">
                {model.capabilities.map(cap => (
                  <span
                    key={cap}
                    className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md text-xs"
                  >
                    {cap}
                  </span>
                ))}
              </div>
              <div className="mt-3 flex items-center text-xs text-gray-500">
                <span>Contexte: {Math.round(model.contextLength/1024)} K tokens</span>
              </div>
            </button>
          ))}
        </div>
        
        <div className="mt-6 pt-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 mr-2"
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
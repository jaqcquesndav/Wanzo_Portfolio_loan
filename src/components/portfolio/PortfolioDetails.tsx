import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus } from 'lucide-react';
import { Button } from '../ui/Button';
import { PortfolioMetrics } from './PortfolioMetrics';
// TODO: Create these components when leasing functionality is implemented
// import { LeasingEquipmentsList } from '../funding/LeasingEquipmentsList';
// import { LeasingEquipmentModal } from '../funding/LeasingEquipmentModal';
// import { LeasingFilters } from '../funding/LeasingFilters';
// import { useLeasingPortfolios } from '../../hooks/useLeasingPortfolios';
import { useNotification } from '../../contexts/useNotification';
// TODO: Create leasing types when functionality is implemented
// import type { Equipment } from '../../types/leasing';

export default function LeasingPortfolioDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  
  // TODO: Replace with actual leasing portfolios hook when implemented
  // const { portfolios } = useLeasingPortfolios();
  // const portfolio = portfolios.find(p => p.id === id);

  const [showEquipmentModal, setShowEquipmentModal] = useState(false);
  // const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);

  // Mock portfolio data for now
  const portfolio = {
    id: id || 'default',
    name: 'Portefeuille Leasing',
    type: 'traditional' as const,
    status: 'active' as const,
    target_amount: 1000000,
    target_return: 0.08,
    target_sectors: ['Equipment Leasing'],
    risk_profile: 'moderate' as const,
    products: [],
    metrics: {
      net_value: 950000,
      average_return: 0.075,
      risk_portfolio: 0.03,
      sharpe_ratio: 1.2,
      volatility: 0.15,
      alpha: 0.02,
      beta: 0.8,
      asset_allocation: [
        { type: 'Equipment', percentage: 80 },
        { type: 'Cash', percentage: 20 }
      ]
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    equipment_catalog: []
  };

  if (!portfolio) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900">Portefeuille non trouvé</h2>
        <Button
          variant="outline"
          onClick={() => navigate('/portfolios/leasing')}
          className="mt-4"
        >
          Retour à la liste
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/portfolios/leasing')}
            icon={<ArrowLeft className="h-5 w-5" />}
          >
            Retour
          </Button>
          <h1 className="text-2xl font-semibold">{portfolio.name}</h1>
        </div>
        <Button
          onClick={() => setShowEquipmentModal(true)}
          icon={<Plus className="h-5 w-5" />}
        >
          Ajouter un équipement
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-medium mb-4">Catalogue des équipements</h2>
            
            {/* TODO: Implement LeasingFilters component */}
            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Filtres de recherche - En cours de développement
              </p>
            </div>

            <div className="mt-6">
              {/* TODO: Implement LeasingEquipmentsList component */}
              <div className="p-8 text-center bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-gray-600 dark:text-gray-300">
                  Liste des équipements - En cours de développement
                </p>
              </div>
            </div>
          </div>
        </div>
        <div>
          <PortfolioMetrics portfolio={portfolio} />
        </div>
      </div>

      {showEquipmentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Ajouter un équipement</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Fonctionnalité en cours de développement
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowEquipmentModal(false)}
              >
                Fermer
              </Button>
              <Button
                onClick={() => {
                  showNotification('Fonctionnalité en cours de développement', 'info');
                  setShowEquipmentModal(false);
                }}
              >
                OK
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* TODO: Implement selectedEquipment modal when LeasingEquipmentModal is available */}
    </div>
  );
}

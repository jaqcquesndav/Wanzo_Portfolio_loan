import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { PortfolioMetrics } from '../components/portfolio/PortfolioMetrics';
import { LeasingEquipmentsList } from '../components/funding/LeasingEquipmentsList';
import { LeasingEquipmentModal } from '../components/funding/LeasingEquipmentModal';
import { LeasingFilters } from '../components/funding/LeasingFilters';
import { useLeasingPortfolios } from '../hooks/useLeasingPortfolios';
import { useNotification } from '../contexts/NotificationContext';
import type { Equipment } from '../types/leasing';

export default function LeasingPortfolioDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const { portfolios } = useLeasingPortfolios();
  const portfolio = portfolios.find(p => p.id === id);

  const [showEquipmentModal, setShowEquipmentModal] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    condition: '',
    priceRange: { min: 0, max: Infinity }
  });

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
            
            <LeasingFilters
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              filters={filters}
              onFilterChange={setFilters}
            />

            <div className="mt-6">
              <LeasingEquipmentsList
                equipments={portfolio.equipment_catalog || []}
                onViewDetails={(equipment) => setSelectedEquipment(equipment)}
              />
            </div>
          </div>
        </div>
        <div>
          <PortfolioMetrics portfolio={portfolio} />
        </div>
      </div>

      {showEquipmentModal && (
        <LeasingEquipmentModal
          onClose={() => setShowEquipmentModal(false)}
          onSubmit={async (data) => {
            try {
              // Logique d'ajout d'équipement
              showNotification('Équipement ajouté avec succès', 'success');
              setShowEquipmentModal(false);
            } catch (error) {
              showNotification('Erreur lors de l\'ajout de l\'équipement', 'error');
            }
          }}
        />
      )}

      {selectedEquipment && (
        <LeasingEquipmentModal
          equipment={selectedEquipment}
          onClose={() => setSelectedEquipment(null)}
        />
      )}
    </div>
  );
}

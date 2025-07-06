import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Filter } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Breadcrumb } from '../components/common/Breadcrumb';
import { EquipmentForm } from '../components/portfolio/leasing/EquipmentForm';
import { EquipmentCard } from '../components/portfolio/leasing/EquipmentCard';
import { EquipmentFilters } from '../components/portfolio/leasing/EquipmentFilters';
import { useLeasingPortfolio } from '../hooks/useLeasingPortfolio';
import { useNotification } from '../contexts/NotificationContext';
import type { Equipment } from '../types/leasing';
import type { EquipmentFormData } from '../components/portfolio/leasing/EquipmentForm';

export default function LeasingPortfolioDetails() {
  const { id, portfolioType = 'leasing' } = useParams();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const { portfolio, loading, addEquipment, updateEquipment, removeEquipment } = useLeasingPortfolio(id!);
  const [showEquipmentForm, setShowEquipmentForm] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    condition: '',
    availability: '',
    priceRange: '',
    manufacturer: ''
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!portfolio) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900">Portefeuille non trouvé</h2>
        <Button
          variant="outline"
          onClick={() => navigate(`/app/${portfolioType}/portfolios/leasing`)}
          className="mt-4"
        >
          Retour à la liste
        </Button>
      </div>
    );
  }


  // Accept EquipmentFormData & { images: string[] } to match EquipmentForm
  const handleCreateEquipment = async (data: EquipmentFormData & { images: string[] }) => {
    try {
      await addEquipment({ ...data, imageUrl: data.images[0] });
      showNotification('Équipement ajouté avec succès', 'success');
      setShowEquipmentForm(false);
    } catch {
      showNotification('Erreur lors de l\'ajout de l\'équipement', 'error');
    }
  };


  // Accept EquipmentFormData & { images: string[] } for update as well
  const handleUpdateEquipment = async (data: EquipmentFormData & { images: string[] }) => {
    try {
      if (!selectedEquipment) return;
      await updateEquipment({ ...selectedEquipment, ...data, imageUrl: data.images[0] });
      showNotification('Équipement mis à jour avec succès', 'success');
      setSelectedEquipment(null);
    } catch {
      showNotification('Erreur lors de la mise à jour de l\'équipement', 'error');
    }
  };

  const handleDeleteEquipment = async (equipmentId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet équipement ?')) {
      try {
        await removeEquipment(equipmentId);
        showNotification('Équipement supprimé avec succès', 'success');
      } catch {
        showNotification('Erreur lors de la suppression de l\'équipement', 'error');
      }
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const filterEquipment = (equipment: Equipment) => {
    const matchesSearch = searchTerm === '' || 
      equipment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      equipment.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      equipment.model.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = !filters.category || equipment.category === filters.category;
    const matchesCondition = !filters.condition || equipment.condition === filters.condition;
    const matchesAvailability = !filters.availability || 
      equipment.availability === (filters.availability === 'true');
    const matchesManufacturer = !filters.manufacturer || 
      equipment.manufacturer === filters.manufacturer;

    let matchesPriceRange = true;
    if (filters.priceRange) {
      const [min, max] = filters.priceRange.split('-').map(Number);
      if (max) {
        matchesPriceRange = equipment.price >= min && equipment.price <= max;
      } else {
        matchesPriceRange = equipment.price >= min;
      }
    }

    return matchesSearch && matchesCategory && matchesCondition && 
           matchesAvailability && matchesManufacturer && matchesPriceRange;
  };

  const filteredEquipment = portfolio.equipment_catalog.filter(filterEquipment);

  return (
    <div className="space-y-6 flex flex-col items-center justify-start">
      <Breadcrumb
        items={[
          { label: 'Portefeuilles', href: `/app/${portfolioType}/portfolios/leasing` },
          { label: portfolio.name }
        ]}
      />

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => navigate(`/app/${portfolioType}/portfolios/leasing`)}
            icon={<ArrowLeft className="h-5 w-5" />} 
          >
            Retour
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
              {portfolio.name}
            </h1>
            <p className="text-sm text-gray-500">
              Catalogue des équipements
            </p>
          </div>
        </div>
        <div className="flex space-x-4">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            icon={<Filter className="h-5 w-5" />}
          >
            {showFilters ? 'Masquer les filtres' : 'Afficher les filtres'}
          </Button>
          <Button
            onClick={() => setShowEquipmentForm(true)}
            icon={<Plus className="h-5 w-5" />}
          >
            Ajouter un équipement
          </Button>
        </div>
      </div>

      {showFilters && (
        <EquipmentFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onSearch={setSearchTerm}
          searchTerm={searchTerm}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEquipment.map(equipment => (
          <EquipmentCard
            key={equipment.id}
            equipment={equipment}
            onView={() => setSelectedEquipment(equipment)}
            onEdit={() => setSelectedEquipment(equipment)}
            onDelete={() => handleDeleteEquipment(equipment.id)}
          />
        ))}
      </div>

      {filteredEquipment.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
          <p className="text-gray-500 dark:text-gray-400">
            Aucun équipement ne correspond à vos critères
          </p>
        </div>
      )}

      {/* Modal d'ajout/modification d'équipement */}
      {(showEquipmentForm || selectedEquipment) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b dark:border-gray-700">
              <h2 className="text-xl font-semibold">
                {selectedEquipment ? 'Modifier l\'équipement' : 'Nouvel équipement'}
              </h2>
            </div>
            <div className="p-6">
              <EquipmentForm
                onSubmit={selectedEquipment ? handleUpdateEquipment : handleCreateEquipment}
                onCancel={() => {
                  setShowEquipmentForm(false);
                  setSelectedEquipment(null);
                }}
                initialData={selectedEquipment || undefined}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
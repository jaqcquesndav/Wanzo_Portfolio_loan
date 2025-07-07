import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Filter } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Breadcrumb } from '../components/common/Breadcrumb';
import { EquipmentForm } from '../components/portfolio/leasing/EquipmentForm';
// import { EquipmentCard } from '../components/portfolio/leasing/EquipmentCard';
import { EquipmentFilters } from '../components/portfolio/leasing/EquipmentFilters';
import { useLeasingPortfolio } from '../hooks/useLeasingPortfolio';
import { useNotification } from '../contexts/NotificationContext';
import type { Equipment } from '../types/leasing';
import type { EquipmentFormData } from '../components/portfolio/leasing/EquipmentForm';

export default function LeasingPortfolioDetails() {
  const { id, portfolioType = 'leasing' } = useParams();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const { portfolio, loading, addOrUpdate } = useLeasingPortfolio(id!);
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


  // Ajout, édition, suppression d'équipement via addOrUpdate (type safe)
  const handleCreateEquipment = async (data: EquipmentFormData & { images: string[] }) => {
    if (!portfolio || portfolio.type !== 'leasing') return;
    try {
      const newEquipment = {
        ...data,
        imageUrl: data.images[0],
        id: crypto.randomUUID(),
        specifications: data.specifications ?? {},
      };
      await addOrUpdate({ equipment_catalog: [...portfolio.equipment_catalog, newEquipment] });
      showNotification('Équipement ajouté avec succès', 'success');
      setShowEquipmentForm(false);
    } catch {
      showNotification('Erreur lors de l\'ajout de l\'équipement', 'error');
    }
  };

  const handleUpdateEquipment = async (data: EquipmentFormData & { images: string[] }) => {
    if (!portfolio || portfolio.type !== 'leasing' || !selectedEquipment) return;
    try {
      const updated = {
        ...selectedEquipment,
        ...data,
        imageUrl: data.images[0],
        specifications: data.specifications ?? selectedEquipment.specifications ?? {},
      };
      const updatedList = portfolio.equipment_catalog.map(eq => eq.id === updated.id ? updated : eq);
      await addOrUpdate({ equipment_catalog: updatedList });
      showNotification('Équipement mis à jour avec succès', 'success');
      setSelectedEquipment(null);
    } catch {
      showNotification('Erreur lors de la mise à jour de l\'équipement', 'error');
    }
  };

  const handleDeleteEquipment = async (equipmentId: string) => {
    if (!portfolio || portfolio.type !== 'leasing') return;
    if (confirm('Êtes-vous sûr de vouloir supprimer cet équipement ?')) {
      try {
        const updatedList = portfolio.equipment_catalog.filter(eq => eq.id !== equipmentId);
        await addOrUpdate({ equipment_catalog: updatedList });
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

  // Type guard pour accéder à equipment_catalog
  const filteredEquipment = (portfolio && portfolio.type === 'leasing' && Array.isArray(portfolio.equipment_catalog))
    ? portfolio.equipment_catalog.filter((equipment: Equipment) => filterEquipment(equipment))
    : [];

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

      <div className="overflow-x-auto rounded-lg shadow border border-gray-200 dark:border-gray-700 w-full">
        <table className="min-w-full bg-white dark:bg-gray-800">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
              <th className="px-4 py-2 text-left">Nom</th>
              <th className="px-4 py-2 text-left">Catégorie</th>
              <th className="px-4 py-2 text-left">Fabricant</th>
              <th className="px-4 py-2 text-left">Modèle</th>
              <th className="px-4 py-2 text-left">Année</th>
              <th className="px-4 py-2 text-left">Prix</th>
              <th className="px-4 py-2 text-left">État</th>
              <th className="px-4 py-2 text-left">Disponibilité</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEquipment.length > 0 ? (
              filteredEquipment.map((equipment: Equipment) => (
                <tr key={equipment.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                  <td className="px-4 py-2">{equipment.name}</td>
                  <td className="px-4 py-2">{equipment.category}</td>
                  <td className="px-4 py-2">{equipment.manufacturer}</td>
                  <td className="px-4 py-2">{equipment.model}</td>
                  <td className="px-4 py-2">{equipment.year}</td>
                  <td className="px-4 py-2">{equipment.price}</td>
                  <td className="px-4 py-2">{equipment.condition}</td>
                  <td className="px-4 py-2">{equipment.availability ? 'Oui' : 'Non'}</td>
                  <td className="px-4 py-2">
                    <Button size="sm" variant="outline" onClick={() => setSelectedEquipment(equipment)}>Voir</Button>
                    <Button size="sm" variant="ghost" onClick={() => setSelectedEquipment(equipment)}>Éditer</Button>
                    <Button size="sm" variant="danger" onClick={() => handleDeleteEquipment(equipment.id)}>Supprimer</Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={9} className="text-center py-8 text-gray-400">Aucun équipement à afficher</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

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
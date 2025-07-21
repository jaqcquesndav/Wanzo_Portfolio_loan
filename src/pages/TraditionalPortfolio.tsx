// src/pages/TraditionalPortfolio.tsx
import { useState } from 'react';
import type { DefaultPortfolioFormData } from '../components/portfolio/DefaultPortfolioForm';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Form';
import { PortfolioCard } from '../components/portfolio/PortfolioCard';
import { CreatePortfolioModal } from '../components/portfolio/CreatePortfolioModal';
import { PortfolioFilters } from '../components/portfolio/traditional/PortfolioFilters';
import { Pagination } from '../components/ui/Pagination';
import { useNotification } from '../contexts/NotificationContext';
import { useTraditionalPortfolios } from '../hooks/useTraditionalPortfolios';

const ITEMS_PER_PAGE = 9;

export default function TraditionalPortfolio() {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const {
    // portfolios,
    filters,
    setFilters,
    filteredPortfolios,
    createPortfolio
  } = useTraditionalPortfolios();

  // type already imported at top
  const handleCreatePortfolio = async (data: DefaultPortfolioFormData) => {
    try {
      // Ajoute les champs requis manquants pour TraditionalPortfolio
      const newPortfolio = await createPortfolio({
        ...data,
        manager_id: 'default-manager', // Remplace par la vraie valeur si besoin
        institution_id: 'default-institution', // Remplace par la vraie valeur si besoin
      });
      showNotification('Portefeuille créé avec succès', 'success');
      setShowCreateModal(false);
      navigate(`/app/traditional/${newPortfolio.id}`);
    } catch {
      showNotification('Erreur lors de la création du portefeuille', 'error');
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  const searchedPortfolios = filteredPortfolios.filter(portfolio =>
    portfolio.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    portfolio.target_sectors.some(sector => 
      sector.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const totalPages = Math.ceil(searchedPortfolios.length / ITEMS_PER_PAGE);
  const paginatedPortfolios = searchedPortfolios.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Finance Traditionnelle
        </h1>
        <Button
          onClick={() => setShowCreateModal(true)}
          icon={<Plus className="h-5 w-5" />}
        >
          Nouveau Portefeuille
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Rechercher un portefeuille..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          icon={<Filter className="h-4 w-4" />}
        >
          Filtres
        </Button>
      </div>

      {showFilters && (
        <PortfolioFilters
          filters={filters}
          onFilterChange={handleFilterChange}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginatedPortfolios.map(portfolio => (
          <PortfolioCard
            key={portfolio.id}
            portfolio={portfolio}
            onView={() => navigate(`/app/traditional/view/${portfolio.id}`)}  // Route correcte pour la vue de crédit
          />
        ))}
      </div>

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}

      {showCreateModal && (
        <CreatePortfolioModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreatePortfolio}
        />
      )}
    </div>
  );
}

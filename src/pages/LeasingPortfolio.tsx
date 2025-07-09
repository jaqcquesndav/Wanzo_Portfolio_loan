import { useState } from 'react';
import type { LeasingPortfolio } from '../types/leasing';
import type { LeasingPortfolioFormData } from '../components/portfolio/leasing/CreateLeasingPortfolioForm';
import { useNavigate } from 'react-router-dom';
import type { PortfolioModalData } from '../components/portfolio/CreatePortfolioModal';
import { Plus, Search, Filter } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Form';
import { PortfolioCard } from '../components/portfolio/PortfolioCard';
import { CreatePortfolioModal } from '../components/portfolio/CreatePortfolioModal';
import { PortfolioFilters } from '../components/portfolio/leasing/PortfolioFilters';
import { Pagination } from '../components/ui/Pagination';
import { useNotification } from '../contexts/NotificationContext';
import { useLeasingPortfolios } from '../hooks/useLeasingPortfolios';

const ITEMS_PER_PAGE = 9;

export default function LeasingPortfolio() {
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
  } = useLeasingPortfolios();

  // Accept the form data type from CreateLeasingPortfolioForm
  const handleCreatePortfolio = async (data: LeasingPortfolioFormData) => {
    // Map form data to the expected structure for createPortfolio
    const mappedData = {
      ...data,
      leasing_terms: {
        min_duration: data.leasing_terms.min_duration,
        max_duration: data.leasing_terms.max_duration,
        interest_rate_range: {
          min: data.leasing_terms.interest_rate_min,
          max: data.leasing_terms.interest_rate_max
        },
        maintenance_included: data.leasing_terms.maintenance_included,
        insurance_required: data.leasing_terms.insurance_required
      },
      metrics: {
        net_value: 0,
        average_return: 0,
        risk_portfolio: 0,
        sharpe_ratio: 0,
        volatility: 0,
        alpha: 0,
        beta: 0,
        asset_allocation: [],
        performance_curve: [],
        returns: [],
        benchmark: [],
        // Métriques leasing spécifiques
        asset_utilization_rate: 0,
        average_residual_value: 0,
        default_rate: 0,
        avg_contract_duration_months: 0,
        assets_under_management: 0,
        contract_renewal_rate: 0,
        total_rent_billed: 0,
        collection_rate: 0,
        // Métriques crédit (optionnelles)
        balance_AGE: undefined,
        taux_impayes: undefined,
        taux_couverture: undefined,
        nb_credits: undefined,
        total_credits: undefined,
        avg_credit: undefined,
        nb_clients: undefined,
        taux_rotation: undefined,
        taux_provision: undefined,
        taux_recouvrement: undefined,
        // Métriques investissement (optionnelles)
        nb_requests: undefined,
        nb_transactions: undefined,
        total_invested: undefined,
        total_exited: undefined,
        irr: undefined,
        multiple: undefined,
        avg_ticket: undefined,
        nb_companies: undefined
      },
      products: []
    };
    try {
      const newPortfolio = await createPortfolio(mappedData);
      showNotification('Portefeuille créé avec succès', 'success');
      setShowCreateModal(false);
      navigate(`/app/leasing/${newPortfolio.id}`);
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

  // Handler générique pour le modal (corrige le typage)
  const handleModalSubmit = async (data: PortfolioModalData) => {
    // Si c'est un portefeuille leasing, on utilise le handler leasing
    if ('leasing_terms' in data) {
      await handleCreatePortfolio(data as LeasingPortfolioFormData);
    } else {
      // Sinon, on ignore ou on peut ajouter d'autres types si besoin
      showNotification('Type de portefeuille non supporté', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Portefeuilles Leasing
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
            portfolio={{
              ...portfolio,
              products: [],
              metrics: {
                net_value: 0,
                average_return: 0,
                risk_portfolio: 0,
                sharpe_ratio: 0,
                volatility: 0,
                alpha: 0,
                beta: 0,
                asset_allocation: [],
              }
            }}
            onView={() => navigate(`/app/leasing/${portfolio.id}`)}
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
          onSubmit={handleModalSubmit}
        />
      )}
    </div>
  );
}
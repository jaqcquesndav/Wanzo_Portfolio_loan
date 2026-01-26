// src/pages/TraditionalPortfolio.tsx
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { PortfolioCard } from '../components/portfolio/PortfolioCard';
import { CreatePortfolioModal, type PortfolioModalData } from '../components/portfolio/CreatePortfolioModal';
import { PortfolioFilters } from '../components/portfolio/traditional/PortfolioFilters';
import { Pagination } from '../components/ui/Pagination';
import { useNotification } from '../contexts/useNotification';
// ✅ Utilisation des hooks React Query professionnels
import { useTraditionalPortfoliosQuery, useCreatePortfolioMutation } from '../hooks/queries';
import { ConnectionError } from '../components/common/ConnectionError';
import { WelcomeNewUser } from '../components/common/WelcomeNewUser';
import { PortfoliosSkeleton } from '../components/ui/PortfoliosSkeleton';
import { useAppContextStore } from '../stores/appContextStore';

const ITEMS_PER_PAGE = 9;

export default function TraditionalPortfolio() {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<Record<string, string>>({});

  // Récupérer les informations du contexte utilisateur
  const { institutionId, user } = useAppContextStore();

  // ✅ Utilisation de React Query - cache intelligent et pas de requêtes en boucle
  const { 
    data: portfolioData, 
    isLoading: loading, 
    error,
    refetch: refresh 
  } = useTraditionalPortfoliosQuery();
  
  // Mutation pour créer un portefeuille
  const createPortfolioMutation = useCreatePortfolioMutation();
  
  // Extraire les portfolios de la réponse
  const portfolios = portfolioData?.data || [];
  const backendFailed = !!error;
  
  // Filtrer les portefeuilles (mémorisé pour éviter les recalculs)
  const filteredPortfolios = useMemo(() => {
    return portfolios.filter(portfolio => {
      if (filters.status && portfolio.status !== filters.status) return false;
      if (filters.riskProfile && portfolio.risk_profile !== filters.riskProfile) return false;
      return true;
    });
  }, [portfolios, filters]);
  
  /**
   * Handler pour la création de portefeuille avec le nouveau format
   * Le backend requiert manager_id et institution_id comme UUIDs valides
   */
  const handleCreatePortfolio = async (data: PortfolioModalData) => {
    // Fonction pour vérifier si c'est un UUID valide (pas un Auth0 ID)
    const isValidUUID = (id: string | null | undefined): boolean => {
      if (!id) return false;
      // Auth0 IDs contiennent généralement '|' ou 'auth0'
      if (id.includes('|') || id.includes('auth0') || id.includes('google-oauth2')) {
        return false;
      }
      // UUID format basique ou autre format backend (ex: user-123, inst-456)
      return id.length > 0 && !id.includes('default');
    };

    // Vérifier que les IDs requis sont présents
    if (!user?.id) {
      showNotification('Erreur: utilisateur non connecté', 'error');
      console.error('❌ Création impossible: user.id manquant');
      return;
    }
    if (!institutionId) {
      showNotification('Erreur: institution non configurée', 'error');
      console.error('❌ Création impossible: institutionId manquant');
      return;
    }

    // Log détaillé des IDs disponibles
    console.log('🔍 Contexte utilisateur complet:', {
      'user.id': user.id,
      'user.institutionId': user.institutionId,
      'institutionId (store)': institutionId,
      'isAuth0Id(user.id)': user.id?.includes('|') || user.id?.includes('auth0'),
    });

    // Vérifier que ce ne sont pas des Auth0 IDs
    if (!isValidUUID(user.id)) {
      showNotification('Erreur: ID utilisateur invalide (Auth0 ID détecté au lieu d\'UUID)', 'error');
      console.error('❌ Création impossible: user.id est un Auth0 ID, pas un UUID:', user.id);
      console.error('💡 Le backend /users/me doit retourner un UUID dans user.id, pas l\'Auth0 ID');
      return;
    }
    if (!isValidUUID(institutionId)) {
      showNotification('Erreur: ID institution invalide', 'error');
      console.error('❌ Création impossible: institutionId invalide:', institutionId);
      return;
    }

    try {
      console.log('📋 Création avec manager_id:', user.id, 'institution_id:', institutionId);
      
      // ✅ Utilisation de la mutation React Query
      const newPortfolio = await createPortfolioMutation.mutateAsync({
        ...data,
        manager_id: user.id,
        institution_id: institutionId,
        // risk_profile par défaut si non fourni dans le formulaire
        risk_profile: (data as { risk_profile?: string }).risk_profile || 'moderate',
      });
      showNotification('Portefeuille créé avec succès', 'success');
      setShowCreateModal(false);
      navigate(`/app/traditional/${newPortfolio.id}`);
    } catch (err) {
      console.error("Erreur lors de la création:", err);
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
    (portfolio.target_sectors || []).some(sector => 
      sector.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const totalPages = Math.ceil(searchedPortfolios.length / ITEMS_PER_PAGE);
  const paginatedPortfolios = searchedPortfolios.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Afficher l'écran de bienvenue pour les nouveaux utilisateurs sans portefeuille
  if (!loading && !error && portfolios.length === 0) {
    return <WelcomeNewUser />;
  }

  // Afficher l'erreur de connexion
  if (error && backendFailed) {
    return <ConnectionError onRetry={refresh} />;
  }

  // Afficher un indicateur de chargement
  if (loading) {
    return <PortfoliosSkeleton />;
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Afficher différents états en fonction des conditions */}
      {!loading && error && backendFailed && (
        <ConnectionError onRetry={refresh} />
      )}

      {!loading && !error && portfolios.length === 0 && (
        <WelcomeNewUser />
      )}

      {!loading && !error && portfolios.length > 0 && (
        <>
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
                onView={() => navigate(`/app/traditional/${portfolio.id}`)}
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
        </>
      )}
    </div>
  );
}

import { useState } from 'react';
import type { FundingOffer } from '../types/funding';
import { Filter, Search } from 'lucide-react';
import { FundingOffersGrid } from '../components/funding/FundingOffersGrid';
import { FundingOffersTable } from '../components/funding/FundingOffersTable';
import { FundingFilters } from '../components/funding/FundingFilters';
import { ViewToggle } from '../components/funding/ViewToggle';
import { Pagination } from '../components/ui/Pagination';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Form';
import { useFundingOffers } from '../hooks/useFundingOffers';

const ITEMS_PER_PAGE = 6;

export default function AllFundingOffers() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  
  const { offers, isLoading } = useFundingOffers();

  const filteredOffers = offers.filter(offer => 
    offer.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    offer.provider.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredOffers.length / ITEMS_PER_PAGE);
  const paginatedOffers = filteredOffers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );


  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleViewDetails = (_offer: FundingOffer): void => {
    // Implémenter la logique d'affichage des détails
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleApply = (_offer: FundingOffer): void => {
    // Implémenter la logique de candidature
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
          Offres de Financement
        </h1>
        <div className="flex items-center space-x-4">
          <ViewToggle view={view} onViewChange={setView} />
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            icon={<Filter className="h-4 w-4" />}
          >
            {showFilters ? 'Masquer les filtres' : 'Afficher les filtres'}
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Rechercher une offre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {showFilters && (
          <div className="w-full lg:w-64 flex-shrink-0">
            <FundingFilters />
          </div>
        )}
        
        <div className="flex-1 space-y-6">
          {view === 'grid' ? (
            <FundingOffersGrid offers={paginatedOffers} />
          ) : (
            <FundingOffersTable
              offers={paginatedOffers}
              onViewDetails={handleViewDetails}
              onApply={handleApply}
            />
          )}
          
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </div>
      </div>
    </div>
  );
}
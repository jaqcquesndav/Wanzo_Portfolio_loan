import { useState } from 'react';
// import { Plus } from 'lucide-react';
import { CompanyFilters } from '../components/prospection/CompanyFilters';
// import { CompanyCard } from '../components/prospection/CompanyCard';
import { CompanyListPaginated } from '../components/prospection/CompanyListPaginated';
import { CompanyMap } from '../components/prospection/CompanyMap';
import { ViewToggle } from '../components/prospection/ViewToggle';
import { CompanyDetails } from '../components/prospection/CompanyDetails';
import { MeetingScheduler } from '../components/prospection/MeetingScheduler';
// import { NewCompanyModal } from '../components/prospection/NewCompanyModal';
// import { Button } from '../components/ui/Button';
import { useProspection } from '../hooks/useProspection';
import type { Company } from '../types/company';
import { mockCompanies } from '../data/mockCompanies';
import { mockCompanyDetails } from '../data/mockCompanyDetails';
import { MultiSegmentSpinner } from '../components/ui/MultiSegmentSpinner';

export default function Prospection() {
  // Suppression du mode card/grid, on ne garde que le tableau (list) et la map
  const [view, setView] = useState<'list' | 'map'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  // const [filters, setFilters] = useState({});
  
  // Utilisation du hook useProspection qui charge les données du localStorage
  const {
    companies,
    loading,
    selectedCompany,
    setSelectedCompany,
    showMeetingScheduler,
    setShowMeetingScheduler,
  } = useProspection(mockCompanies); // Fournir mockCompanies comme fallback

  // Merge enriched details if TechInnovate Sénégal is selected

  const handleViewDetails = (company: Company) => {
    if (company.name === 'TechInnovate Sénégal') {
      // Map enriched details to match Company type
      setSelectedCompany({
        ...company,
        ...mockCompanyDetails,
        sector: 'Technologies', // match mockCompanies
        status: 'active', // match CompanyStatus type
        financial_metrics: {
          revenue_growth: mockCompanyDetails.financial_metrics?.revenue_growth ?? company.financial_metrics.revenue_growth,
          profit_margin: company.financial_metrics.profit_margin,
          cash_flow: company.financial_metrics.cash_flow,
          debt_ratio: company.financial_metrics.debt_ratio,
          working_capital: company.financial_metrics.working_capital,
          credit_score: company.financial_metrics.credit_score,
          financial_rating: company.financial_metrics.financial_rating,
          ebitda: company.financial_metrics.ebitda,
        },
      });
    } else {
      setSelectedCompany(company);
    }
  };

  const filteredCompanies = companies.filter(company => {
    let matches = true;

    if (searchTerm) {
      matches = company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                company.sector.toLowerCase().includes(searchTerm.toLowerCase());
    }

    return matches;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <MultiSegmentSpinner size="medium" />
      </div>
    );
  }

  return (
    <div className="space-y-6 flex flex-col">
      <div className="flex flex-wrap justify-between items-center w-full">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Prospection
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Gérez et analysez vos opportunités d'investissement
          </p>
        </div>
        <div className="flex items-center space-x-4 mt-2 md:mt-0">
          {/* On ne propose plus que la vue liste et map */}
          <ViewToggle view={view} onViewChange={v => setView(v as 'list' | 'map')} />
        </div>
      </div>

      <div className="w-full">
        <CompanyFilters
          onSearch={setSearchTerm}
          onFilterChange={() => {}}
        />
      </div>

      {view === 'map' ? (
        <CompanyMap
          companies={filteredCompanies}
          onSelectCompany={handleViewDetails}
        />
      ) : (
        <CompanyListPaginated
          companies={filteredCompanies}
          onViewDetails={handleViewDetails}
        />
      )}

      {/* Modals */}
      {selectedCompany && (
        <CompanyDetails
          company={selectedCompany}
          onClose={() => setSelectedCompany(null)}
        />
      )}

      {showMeetingScheduler && selectedCompany && (
        <MeetingScheduler
          company={selectedCompany}
          onClose={() => {
            setShowMeetingScheduler(false);
            setSelectedCompany(null);
          }}
          onSchedule={async () => {}}
        />
      )}

      {/* Suppression du modal d'ajout d'entreprise */}
    </div>
  );
}
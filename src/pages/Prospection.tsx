import { useState } from 'react';
// import { Plus } from 'lucide-react';
import { CompanyFilters } from '../components/prospection/CompanyFilters';
// import { CompanyCard } from '../components/prospection/CompanyCard';
import { CompanyList } from '../components/prospection/CompanyList';
import { CompanyMap } from '../components/prospection/CompanyMap';
import { ViewToggle } from '../components/prospection/ViewToggle';
import { CompanyDetails } from '../components/prospection/CompanyDetails';
import { MeetingScheduler } from '../components/prospection/MeetingScheduler';
// import { NewCompanyModal } from '../components/prospection/NewCompanyModal';
// import { Button } from '../components/ui/Button';
import { useProspection } from '../hooks/useProspection';
import type { Company } from '../types/company';
import { mockCompanies } from '../data/mockCompanies';



export default function Prospection() {
  // Suppression du mode card/grid, on ne garde que le tableau (list) et la map
  const [view, setView] = useState<'list' | 'map'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  // const [filters, setFilters] = useState({});
  const {
  // companies,
  loading,
  selectedCompany,
  setSelectedCompany,
  showMeetingScheduler,
  setShowMeetingScheduler,
  // showNewCompanyModal,
  // setShowNewCompanyModal,
  handleContact,
  handleScheduleMeeting,
  // handleCreateCompany
} = useProspection(mockCompanies); // Passez mockCompanies comme données initiales

  const handleViewDetails = (company: Company) => {
    setSelectedCompany(company);
  };

  const handleScheduleMeetingClick = (company: Company) => {
    setSelectedCompany(company);
    setShowMeetingScheduler(true);
  };

  const filteredCompanies = mockCompanies.filter(company => {
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 flex flex-col items-center justify-start">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Prospection
        </h1>
        <div className="flex items-center space-x-4">
          {/* On ne propose plus que la vue liste et map */}
          <ViewToggle view={view} onViewChange={v => setView(v as 'list' | 'map')} />
        </div>
      </div>

      <CompanyFilters
        onSearch={setSearchTerm}
        onFilterChange={() => {}}
      />

      {view === 'map' ? (
        <CompanyMap
          companies={filteredCompanies}
          onSelectCompany={handleViewDetails}
        />
      ) : (
        <CompanyList
          companies={filteredCompanies}
          onViewDetails={handleViewDetails}
        />
      )}

      {/* Modals */}
      {selectedCompany && (
        <CompanyDetails
          company={selectedCompany}
          onClose={() => setSelectedCompany(null)}
          onContact={handleContact}
          onScheduleMeeting={handleScheduleMeetingClick}
        />
      )}

      {showMeetingScheduler && selectedCompany && (
        <MeetingScheduler
          company={selectedCompany}
          onClose={() => {
            setShowMeetingScheduler(false);
            setSelectedCompany(null);
          }}
          onSchedule={handleScheduleMeeting}
        />
      )}

      {/* Suppression du modal d'ajout d'entreprise */}
    </div>
  );
}
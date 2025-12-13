import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tab } from '../../../components/ui/Tab';
import { CreditRequestsTable } from './CreditRequestsTable';
import { CreditContractsList } from './credit-contract/CreditContractsList';
import { FileText, File, Calendar, RefreshCw } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { useCreditRequests } from '../../../hooks/useCreditRequests';
import { useCreditContracts } from '../../../hooks/useCreditContracts';
import { ScheduleManagementList } from './amortization/ScheduleManagementList';
import { mockCompanies } from '../../../data/mockCompanies';
import { getMockCompanyByMemberId } from '../../../data/mockCompanyDetails';
import { useNotification } from '../../../contexts/useNotification';
import { Company } from '../../../types/company';

interface CreditPortfolioProps {
  portfolioId: string;
}

type TabId = 'requests' | 'contracts' | 'amortization';

// dûfinition de notre propre interface TabProps pour ce composant
interface CustomTabProps {
  id: string;
  label: string;
  icon: string;
  isActive?: boolean;
  onClick?: () => void;
}

export function CreditPortfolio({ portfolioId }: CreditPortfolioProps) {
  const [activeTab, setActiveTab] = useState<TabId>('requests');
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [companyDetailModalOpen, setCompanyDetailModalOpen] = useState(false);
  const { showNotification } = useNotification();
  
  // Utiliser les hooks au niveau du composant
  const { 
    requests, 
    loading, 
    resetToMockData: resetRequests,
    getMemberName,
    getCreditProductName,
    changeRequestStatus
  } = useCreditRequests();
  const { resetToMockData: resetContracts } = useCreditContracts(portfolioId);
  
  // PRéparer les mappings pour les noms
  const companyNames = Object.fromEntries(requests.map(req => [req.memberId, getMemberName(req.memberId)]));
  const productNames = Object.fromEntries(requests.map(req => [req.productId, getCreditProductName(req.productId)]));
  
  console.log('CreditPortfolio - Using portfolioId:', portfolioId);
  
  const navigate = useNavigate();

  // Fonction pour gérer l'affichage des détails d'une entreprise — navigue vers la page de consultation
  const handleViewCompany = useCallback((companyId: string) => {
    // ✅ FIX: Try to resolve as memberId first (mem-001, mem-002, etc.)
    let companyFound = getMockCompanyByMemberId(companyId);
    
    // If not found, search in mockCompanies by name or id
    if (!companyFound) {
      companyFound = mockCompanies.find(c => c.name === companyId || c.id === companyId);
    }
    
    // Si l'entreprise est trouvée
    if (companyFound) {
      setSelectedCompany(companyFound);
      navigate(`/app/traditional/company/${encodeURIComponent(companyFound.id)}/view`, { state: { company: companyFound } });
      showNotification(`Détails de l'entreprise ${companyFound.name} affichés`, 'info');
      showNotification(`Détails de l'entreprise ${companyFound.name} affichés`, 'info');
    } else {
      // Créer une entreprise de base avec l'id fourni - avec tous les champs requis
      const companyIdFormatted = companyId.toLowerCase().replace(/\s+/g, '-');
      const basicCompany: Company = {
        id: companyIdFormatted,
        name: companyId,
        sector: 'Non spécifié',
        size: 'small',
        status: 'active',
        annual_revenue: 0,
        employee_count: 0,
        financial_metrics: {
          annual_revenue: 0,
          revenue_growth: 0,
          profit_margin: 0,
          cash_flow: 0,
          debt_ratio: 0,
          working_capital: 0,
          credit_score: 0,
          financial_rating: 'NR'
        },
        esg_metrics: {
          esg_rating: 'NR',
          carbon_footprint: 0,
          environmental_rating: 'NR',
          social_rating: 'NR',
          governance_rating: 'NR'
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      setSelectedCompany(basicCompany);
      navigate(`/app/traditional/company/${encodeURIComponent(basicCompany.id)}/view`, { state: { company: basicCompany } });
      showNotification(`Détails de l'entreprise ${companyId} affichés`, 'info');
    }
  }, [showNotification, navigate]);
  
  const tabs: CustomTabProps[] = [
    { id: 'requests', label: 'Demandes', icon: 'FileText' },
    { id: 'contracts', label: 'Contrats', icon: 'File' },
    { id: 'amortization', label: 'échéanciers', icon: 'Calendar' },
  ];
  
  const handleRefresh = useCallback(async () => {
    // Réinitialiser les données au format mock
    await resetRequests();
    await resetContracts();
    
    // Forcer un rechargement des composants en mettant à jour la clé de refresh
    setRefreshKey(prev => prev + 1);
  }, [resetRequests, resetContracts]);
  
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'FileText':
        return <FileText className="w-4 h-4 mr-2" />;
      case 'File':
        return <File className="w-4 h-4 mr-2" />;
      case 'Calendar':
        return <Calendar className="w-4 h-4 mr-2" />;
      default:
        return null;
    }
  };
  
  const renderTabContent = () => {
    // Utiliser refreshKey comme clé pour forcer le rechargement du composant
    switch (activeTab) {
      case 'requests':
        return <CreditRequestsTable 
          key={`requests-${refreshKey}`}
          requests={requests}
          loading={loading}
          companyNames={companyNames}
          productNames={productNames}
          onValidate={(id) => changeRequestStatus(id, 'approved')}
          onRefuse={(id) => changeRequestStatus(id, 'rejected')}
          onDisburse={(id) => changeRequestStatus(id, 'disbursed')}
          onView={(id) => console.log('Voir dûtails de la demande', id)}
          onViewCompany={handleViewCompany}
          onCreateContract={(id) => console.log('CRéer contrat', id)}
        />;
      case 'contracts':
        return <CreditContractsList key={`contracts-${refreshKey}`} portfolioId={portfolioId} onViewCompany={handleViewCompany} />;
      case 'amortization':
        return <ScheduleManagementList key={`amortization-${refreshKey}`} portfolioId={portfolioId} />;
      default:
        return null;
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center pb-2">
        <div className="flex overflow-x-auto space-x-1">
          {tabs.map((tab) => (
            <Tab
              key={tab.id}
              active={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id as TabId)}
            >
              <div className="flex items-center">
                {getIcon(tab.icon)}
                {tab.label}
              </div>
            </Tab>
          ))}
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh}
          className="ml-auto flex items-center bg-blue-50"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Réinitialiser les données
        </Button>
      </div>
      
      <div className="p-4 bg-white rounded-lg shadow">
        {renderTabContent()}
      </div>
      
      {/* CompanyDetails modal removed — navigation to CompanyViewPage used instead */}
    </div>
  );
}


import { useState, useCallback } from 'react';
import { Tab } from '../../../components/ui/Tab';
import { CreditRequestsList } from './credit-request/CreditRequestsList';
import { CreditContractsList } from './credit-contract/CreditContractsList';
import { AmortizationSchedulesList } from './amortization/AmortizationSchedulesList';
import { GuaranteeTypesList } from './guarantees/GuaranteeTypesList';
import { FileText, File, Calendar, Shield, RefreshCw } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { useCreditRequests } from '../../../hooks/useCreditRequests';
import { useCreditContracts } from '../../../hooks/useCreditContracts';

interface CreditPortfolioProps {
  portfolioId: string;
}

type TabId = 'requests' | 'contracts' | 'amortization' | 'guarantees';

// Définition de notre propre interface TabProps pour ce composant
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
  const { resetToMockData: resetRequests } = useCreditRequests();
  const { resetToMockData: resetContracts } = useCreditContracts(portfolioId);
  
  console.log('CreditPortfolio - Using portfolioId:', portfolioId);
  
  const tabs: CustomTabProps[] = [
    { id: 'requests', label: 'Demandes', icon: 'FileText' },
    { id: 'contracts', label: 'Contrats', icon: 'File' },
    { id: 'amortization', label: 'Échéanciers', icon: 'Calendar' },
    { id: 'guarantees', label: 'Garanties', icon: 'Shield' },
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
      case 'Shield':
        return <Shield className="w-4 h-4 mr-2" />;
      default:
        return null;
    }
  };
  
  const renderTabContent = () => {
    // Utiliser refreshKey comme clé pour forcer le rechargement du composant
    switch (activeTab) {
      case 'requests':
        return <CreditRequestsList key={`requests-${refreshKey}`} />;
      case 'contracts':
        return <CreditContractsList key={`contracts-${refreshKey}`} portfolioId={portfolioId} />;
      case 'amortization':
        return <AmortizationSchedulesList key={`amortization-${refreshKey}`} portfolioId={portfolioId} />;
      case 'guarantees':
        return <GuaranteeTypesList key={`guarantees-${refreshKey}`} portfolioId={portfolioId} />;
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
    </div>
  );
}

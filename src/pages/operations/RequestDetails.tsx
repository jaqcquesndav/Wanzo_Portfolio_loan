import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  X, Building, Calendar, DollarSign, Clock, Download, Play,
  FileText, Briefcase, Users, TrendingUp, AlertTriangle 
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Breadcrumb } from '../../components/common/Breadcrumb';
import { CompanyDetails } from '../../components/prospection/CompanyDetails';
import { WorkflowSelector } from '../../components/workflow/WorkflowSelector';
import { WorkflowBuilder } from '../../components/workflow/WorkflowBuilder';
import { useWorkflows } from '../../hooks/useWorkflows';
import { useNotification } from '../../contexts/NotificationContext';
import { formatCurrency, formatDate } from '../../utils/formatters';

// Mock data enrichi
const mockRequest = {
  id: 'REQ001',
  type: 'credit',
  amount: 50000000,
  company: {
    id: '1',
    name: 'Tech Solutions SARL',
    sector: 'Technologies',
    size: 'small',
    annual_revenue: 150000000,
    employee_count: 25,
    status: 'active',
    financial_metrics: {
      revenue_growth: 25.5,
      profit_margin: 15.2
    }
  },
  product: {
    id: 'PROD001',
    name: 'Crédit Équipement PME',
    type: 'credit',
    portfolio: {
      id: 'PORT001',
      name: 'Portefeuille PME',
      manager: 'Sophie Martin'
    }
  },
  submittedDate: '2024-03-15',
  status: 'pending',
  priority: 'high',
  duration: 24,
  interestRate: 8.5,
  purpose: 'Financement d\'équipements industriels',
  requestCount: 3,
  documents: [
    {
      id: 'doc1',
      name: 'Business Plan',
      type: 'pdf',
      size: '2.4 MB',
      uploadDate: '2024-03-15',
      status: 'validated',
      url: '#'
    },
    {
      id: 'doc2',
      name: 'États Financiers',
      type: 'xlsx',
      size: '1.8 MB',
      uploadDate: '2024-03-15',
      status: 'pending',
      url: '#'
    }
  ],
  additionalInfo: {
    useOfFunds: [
      { category: 'Équipement', amount: 35000000 },
      { category: 'Installation', amount: 10000000 },
      { category: 'Formation', amount: 5000000 }
    ],
    projectTimeline: '6 mois',
    expectedImpact: 'Augmentation de la capacité de production de 40%',
    jobsCreated: 15,
    marketAnalysis: 'Marché en croissance de 25% par an',
    competitiveAdvantage: 'Technologie brevetée et équipe expérimentée'
  },
  riskAnalysis: {
    score: 75,
    level: 'Modéré',
    factors: [
      { name: 'Risque marché', score: 70 },
      { name: 'Risque opérationnel', score: 80 },
      { name: 'Risque financier', score: 75 }
    ]
  }
};

export default function RequestDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const { workflows, saveWorkflow } = useWorkflows();
  const [showCompanyDetails, setShowCompanyDetails] = useState(false);
  const [showWorkflowSelector, setShowWorkflowSelector] = useState(false);
  const [showWorkflowBuilder, setShowWorkflowBuilder] = useState(false);
  const [selectedTab, setSelectedTab] = useState('overview');

  // Dans un cas réel, vous chargeriez les données depuis l'API
  const request = mockRequest;

  const handleStartWorkflow = () => {
    setShowWorkflowSelector(true);
  };

  const handleWorkflowSelect = async (workflowId: string | null) => {
    if (workflowId === 'new') {
      setShowWorkflowSelector(false);
      setShowWorkflowBuilder(true);
      return;
    }

    try {
      // Dans un cas réel, vous feriez un appel API ici
      await new Promise(resolve => setTimeout(resolve, 1000));
      showNotification('Workflow démarré avec succès', 'success');
      navigate(`/operations/validation/${request.id}?workflow=${workflowId}`);
    } catch (error) {
      showNotification('Erreur lors du démarrage du workflow', 'error');
    }
  };

  const handleCreateWorkflow = async (workflowData: any) => {
    try {
      const newWorkflow = await saveWorkflow({
        ...workflowData,
        type: request.type,
        productIds: [request.product.id]
      });
      showNotification('Workflow créé avec succès', 'success');
      navigate(`/operations/validation/${request.id}?workflow=${newWorkflow.id}`);
    } catch (error) {
      showNotification('Erreur lors de la création du workflow', 'error');
    }
  };

  const getDocumentStatusColor = (status: string) => {
    switch (status) {
      case 'validated':
        return 'success';
      case 'rejected':
        return 'error';
      default:
        return 'warning';
    }
  };

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: 'Opérations', href: '/operations' },
          { label: 'Demandes', href: '/operations/requests' },
          { label: `Demande ${request.id}` }
        ]}
      />

      {/* Rest of the component remains the same until the modals */}

      {showCompanyDetails && (
        <CompanyDetails
          company={request.company}
          onClose={() => setShowCompanyDetails(false)}
          onContact={() => {}}
          onScheduleMeeting={() => {}}
        />
      )}

      {showWorkflowSelector && (
        <WorkflowSelector
          workflows={workflows.filter(w => w.type === request.type)}
          productId={request.product.id}
          onSelect={handleWorkflowSelect}
          onClose={() => setShowWorkflowSelector(false)}
        />
      )}

      {showWorkflowBuilder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b dark:border-gray-700">
              <h2 className="text-xl font-semibold">Créer un nouveau workflow</h2>
            </div>
            <div className="p-6">
              <WorkflowBuilder
                onSubmit={handleCreateWorkflow}
                onCancel={() => setShowWorkflowBuilder(false)}
                availableProducts={[request.product]}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Search, Filter, Eye, Calendar } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Form';
import { Badge } from '../../components/ui/Badge';
import { WorkflowSelector } from '../../components/workflow/WorkflowSelector';
import { RequestDetailsModal } from '../../components/operations/RequestDetailsModal';
import { useWorkflows } from '../../hooks/useWorkflows';
import { useNotification } from '../../contexts/NotificationContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import type { OperationRequest, LeasingEquipmentRequest } from '../../types/operations';

// Mock data
const mockRequests: OperationRequest[] = [
  {
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
        profit_margin: 15.2,
        cash_flow: 45000000,
        debt_ratio: 0.3,
        working_capital: 35000000,
        credit_score: 85,
        financial_rating: 'A'
      },
      esg_metrics: {
        carbon_footprint: 12.5,
        environmental_rating: 'B',
        social_rating: 'A',
        governance_rating: 'B'
      },
      created_at: '2024-01-01',
      updated_at: '2024-03-15'
    },
    product: {
      id: 'PROD001',
      name: 'Crédit Équipement PME',
      portfolio: {
        id: 'PORT001',
        name: 'Portefeuille PME'
      }
    },
    submittedDate: '2024-03-15',
    status: 'pending',
    priority: 'high',
    details: {
      creditScore: 85,
      interestRate: 8.5,
      duration: 24
    }
  },
  {
    id: 'REQ002',
    type: 'leasing',
    amount: 25000000,
    company: {
      id: '2',
      name: 'Industrial Equipment SA',
      sector: 'Industrie',
      size: 'medium',
      annual_revenue: 350000000,
      employee_count: 75,
      status: 'active',
      financial_metrics: {
        revenue_growth: 18.3,
        profit_margin: 12.8,
        cash_flow: 85000000,
        debt_ratio: 0.4,
        working_capital: 65000000,
        credit_score: 78,
        financial_rating: 'B'
      },
      esg_metrics: {
        carbon_footprint: 8.2,
        environmental_rating: 'A',
        social_rating: 'B',
        governance_rating: 'B'
      },
      created_at: '2024-01-15',
      updated_at: '2024-03-15'
    },
    product: {
      id: 'PROD002',
      name: 'Leasing Industriel',
      portfolio: {
        id: 'PORT002',
        name: 'Portefeuille Leasing'
      }
    },
    submittedDate: '2024-03-14',
    status: 'pending',
    priority: 'medium',
    details: {
      leasingEquipment: [{
        equipment: {
          id: 'EQ001',
          name: 'Machine CNC',
          category: 'Équipement industriel',
          condition: 'new',
          price: 25000000,
          imageUrl: 'https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7?auto=format&fit=crop&w=800&q=80',
          specifications: {
            dimensions: '2m x 1.5m x 1.8m',
            weight: '850 kg',
            power: '7.5 kW'
          }
        },
        quantity: 1,
        duration: 36,
        maintenanceIncluded: true,
        insuranceIncluded: true
      }]
    }
  }
];

export default function Requests() {
  const navigate = useNavigate();
  const { workflows } = useWorkflows();
  const { showNotification } = useNotification();
  const [requests, setRequests] = useState(mockRequests);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<OperationRequest | null>(null);
  const [showWorkflowSelector, setShowWorkflowSelector] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<LeasingEquipmentRequest | null>(null);

  const handleViewDetails = (request: OperationRequest) => {
    setSelectedRequest(request);
  };

  const handleStartWorkflow = (request: OperationRequest, equipment?: LeasingEquipmentRequest) => {
    setSelectedRequest(request);
    setSelectedEquipment(equipment || null);
    setShowWorkflowSelector(true);
  };

  const handleRejectRequest = (request: OperationRequest) => {
    // Supprimer la demande de la liste
    setRequests(prev => prev.filter(r => r.id !== request.id));
    showNotification('Demande rejetée avec succès', 'success');
  };

  const handleWorkflowSelect = async (workflowId: string | null) => {
    if (!selectedRequest) return;

    try {
      if (workflowId === 'new') {
        navigate(`/operations/workflows/new?requestId=${selectedRequest.id}`);
      } else {
        await new Promise(resolve => setTimeout(resolve, 1000));
        showNotification('Workflow démarré avec succès', 'success');
        navigate(`/operations/validation/${selectedRequest.id}?workflow=${workflowId}`);
      }
    } catch (error) {
      showNotification('Erreur lors du démarrage du workflow', 'error');
    } finally {
      setShowWorkflowSelector(false);
      setSelectedRequest(null);
      setSelectedEquipment(null);
    }
  };

  const filteredRequests = requests.filter(request =>
    request.company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <FileText className="h-6 w-6 text-primary mr-2" />
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Demandes d'opérations
          </h1>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Rechercher une demande..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Filtres à implémenter */}
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Entreprise
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Produit
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Montant
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredRequests.map((request) => (
                <tr key={request.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {request.id}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {request.company.name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {request.company.sector}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {request.type}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {request.product.name}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {formatCurrency(request.amount)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(request.submittedDate)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <Badge variant={request.status === 'pending' ? 'warning' : 'primary'}>
                      {request.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetails(request)}
                        icon={<Eye className="h-4 w-4" />}
                      >
                        Détails
                      </Button>
                      {request.status === 'pending' && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleStartWorkflow(request)}
                          icon={<Calendar className="h-4 w-4" />}
                        >
                          Démarrer
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedRequest && (
        <RequestDetailsModal
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          onStartWorkflow={handleStartWorkflow}
          onReject={handleRejectRequest}
        />
      )}

      {showWorkflowSelector && selectedRequest && (
        <WorkflowSelector
          workflows={workflows.filter(w => w.type === selectedRequest.type)}
          productId={selectedRequest.product.id}
          onSelect={handleWorkflowSelect}
          onClose={() => {
            setShowWorkflowSelector(false);
            setSelectedRequest(null);
            setSelectedEquipment(null);
          }}
        />
      )}
    </div>
  );
}

export { Requests }

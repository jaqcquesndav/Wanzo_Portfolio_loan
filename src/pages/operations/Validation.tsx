import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Search, Filter, Eye, Calendar, Building } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input, Select } from '../../components/ui/Form';
import { Badge } from '../../components/ui/Badge';
import { OperationWorkflow } from '../../components/operations/OperationWorkflow';
import { CompanyDetails } from '../../components/prospection/CompanyDetails';
import { TokenValidationModal } from '../../components/operations/TokenValidationModal';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { useNotification } from '../../contexts/NotificationContext';
import { useWorkflows } from '../../hooks/useWorkflows';
import { useWorkflowStep } from '../../hooks/useWorkflowStep';
import { mockWorkflows } from '../../data/mockWorkflows';

// Mock data pour les opérations en cours
const mockOngoingOperations = [
  {
    id: 'OP001',
    type: 'credit',
    amount: 75000000,
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
    startDate: '2024-03-15',
    status: 'active',
    currentStep: 'credit_analysis',
    workflowId: 'WF001',
    workflow: mockWorkflows[0], // Utiliser le workflow de crédit des mock data
    generatedTokens: {},
    validatedTokens: ['document_review']
  },
  {
    id: 'OP002',
    type: 'leasing',
    amount: 45000000,
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
        profit_margin: 12.8
      }
    },
    startDate: '2024-03-14',
    status: 'active',
    currentStep: 'equipment_inspection',
    workflowId: 'WF002',
    workflow: mockWorkflows[1], // Utiliser le workflow de leasing des mock data
    generatedTokens: {},
    validatedTokens: ['supplier_validation'],
    leasingEquipment: {
      name: 'Machine CNC',
      price: 45000000,
      duration: 36,
      condition: 'new'
    }
  }
];

export default function Validation() {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const { workflows } = useWorkflows();
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedOperation, setSelectedOperation] = useState<any | null>(null);
  const [showCompanyDetails, setShowCompanyDetails] = useState(false);
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [tokenStep, setTokenStep] = useState<string | null>(null);
  const [generatedToken, setGeneratedToken] = useState<string | null>(null);

  // État des filtres
  const [filters, setFilters] = useState({
    type: 'all',
    sector: 'all',
    currentStep: 'all',
    dateRange: 'all'
  });

  const handleStepAction = async (stepId: string, requiresToken: boolean, generatesToken: boolean) => {
    if (!selectedOperation) return;

    if (requiresToken) {
      setTokenStep(stepId);
      setGeneratedToken(null);
      setShowTokenModal(true);
    } else if (generatesToken) {
      const token = Math.random().toString(36).substr(2, 6).toUpperCase();
      setTokenStep(stepId);
      setGeneratedToken(token);
      setShowTokenModal(true);
    }
  };

  const handleTokenValidation = async (token: string) => {
    if (!selectedOperation || !tokenStep) return;

    try {
      const { validateStep } = useWorkflowStep(selectedOperation.id, tokenStep);
      const result = await validateStep(token);

      if (result.success) {
        const updatedOperation = {
          ...selectedOperation,
          validatedTokens: [...selectedOperation.validatedTokens, tokenStep]
        };
        setSelectedOperation(updatedOperation);

        if (result.generatedToken) {
          showNotification(
            `Token généré: ${result.generatedToken} - Conservez-le pour la suite`,
            'info'
          );
        }
      }
    } catch (error) {
      showNotification('Token invalide', 'error');
    } finally {
      setShowTokenModal(false);
      setTokenStep(null);
    }
  };

  // Fonction de filtrage des opérations
  const filteredOperations = mockOngoingOperations.filter(operation => {
    // Filtre par recherche
    const matchesSearch = 
      operation.company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      operation.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      operation.type.toLowerCase().includes(searchTerm.toLowerCase());

    // Filtre par type
    const matchesType = filters.type === 'all' || operation.type === filters.type;

    // Filtre par secteur
    const matchesSector = filters.sector === 'all' || operation.company.sector === filters.sector;

    // Filtre par étape
    const matchesStep = filters.currentStep === 'all' || operation.currentStep === filters.currentStep;

    // Filtre par date
    let matchesDate = true;
    if (filters.dateRange !== 'all') {
      const operationDate = new Date(operation.startDate);
      const today = new Date();
      const thirtyDaysAgo = new Date(today.setDate(today.getDate() - 30));
      const ninetyDaysAgo = new Date(today.setDate(today.getDate() - 90));

      switch (filters.dateRange) {
        case '30days':
          matchesDate = operationDate >= thirtyDaysAgo;
          break;
        case '90days':
          matchesDate = operationDate >= ninetyDaysAgo;
          break;
      }
    }

    return matchesSearch && matchesType && matchesSector && matchesStep && matchesDate;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Opérations en cours
        </h1>
        <div className="flex items-center space-x-4">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            icon={<Filter className="h-4 w-4" />}
          >
            Filtres
          </Button>
        </div>
      </div>

      {showFilters && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Type d'opération
              </label>
              <Select
                value={filters.type}
                onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                className="w-full"
              >
                <option value="all">Tous les types</option>
                <option value="credit">Crédit</option>
                <option value="leasing">Leasing</option>
                <option value="investment">Investissement</option>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Secteur
              </label>
              <Select
                value={filters.sector}
                onChange={(e) => setFilters(prev => ({ ...prev, sector: e.target.value }))}
                className="w-full"
              >
                <option value="all">Tous les secteurs</option>
                <option value="Technologies">Technologies</option>
                <option value="Industrie">Industrie</option>
                <option value="Services">Services</option>
                <option value="Commerce">Commerce</option>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Étape en cours
              </label>
              <Select
                value={filters.currentStep}
                onChange={(e) => setFilters(prev => ({ ...prev, currentStep: e.target.value }))}
                className="w-full"
              >
                <option value="all">Toutes les étapes</option>
                <option value="credit_analysis">Analyse crédit</option>
                <option value="equipment_inspection">Inspection équipement</option>
                <option value="risk_assessment">Évaluation risques</option>
                <option value="contract_approval">Approbation contrat</option>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Période
              </label>
              <Select
                value={filters.dateRange}
                onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
                className="w-full"
              >
                <option value="all">Toutes les périodes</option>
                <option value="30days">30 derniers jours</option>
                <option value="90days">90 derniers jours</option>
              </Select>
            </div>
          </div>
        </div>
      )}

      {/* Liste des opérations */}
      <div className="grid grid-cols-1 gap-6">
        {filteredOperations.map((operation) => (
          <div
            key={operation.id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden"
          >
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <Badge variant={operation.status === 'active' ? 'success' : 'warning'}>
                    {operation.status}
                  </Badge>
                  <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">
                    {operation.company.name}
                  </h3>
                  <div className="mt-1 flex items-center text-sm text-gray-500">
                    <Calendar className="h-4 w-4 mr-1" />
                    {formatDate(operation.startDate)}
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(operation.amount)}
                  </p>
                  <Badge variant="primary" className="mt-1">
                    {operation.type}
                  </Badge>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCompanyDetails(true)}
                  icon={<Building className="h-4 w-4" />}
                >
                  Détails entreprise
                </Button>
                <Button
                  size="sm"
                  onClick={() => setSelectedOperation(operation)}
                  icon={<Eye className="h-4 w-4" />}
                >
                  Voir workflow
                </Button>
              </div>

              {/* Afficher le workflow si l'opération est sélectionnée */}
              {selectedOperation?.id === operation.id && (
                <div className="mt-6 border-t dark:border-gray-700 pt-6">
                  <OperationWorkflow
                    operation={operation}
                    workflow={operation.workflow}
                    onStepAction={handleStepAction}
                  />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modals */}
      {showCompanyDetails && selectedOperation && (
        <CompanyDetails
          company={selectedOperation.company}
          onClose={() => setShowCompanyDetails(false)}
          onContact={() => {}}
          onScheduleMeeting={() => {}}
        />
      )}

      {showTokenModal && tokenStep && (
        <TokenValidationModal
          stepLabel={tokenStep}
          onValidate={handleTokenValidation}
          onClose={() => {
            setShowTokenModal(false);
            setTokenStep(null);
            setGeneratedToken(null);
          }}
          generatedToken={generatedToken}
        />
      )}
    </div>
  );
}
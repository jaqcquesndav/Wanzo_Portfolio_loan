import React, { useState } from 'react';
import { FileBarChart, Eye } from 'lucide-react';
import { HistoryFilters } from '../../components/operations/history/HistoryFilters';
import { HistoryTable } from '../../components/operations/history/HistoryTable';
import { OperationWorkflow } from '../../components/operations/OperationWorkflow';
import { Button } from '../../components/ui/Button';
import type { OperationHistory } from '../../types/operations';

// Mock data avec workflows
const mockHistory: OperationHistory[] = [
  {
    id: 'OP001',
    type: 'credit',
    amount: 100000000,
    company: 'Tech Solutions SARL',
    date: '2024-03-10',
    status: 'completed',
    processor: 'John Doe',
    details: 'Crédit d\'investissement pour expansion',
    workflow: {
      id: 'WF001',
      steps: [
        { id: 'step1', label: 'Soumission', status: 'completed', description: 'Documents soumis le 10/03/2024' },
        { id: 'step2', label: 'Analyse crédit', status: 'completed', description: 'Score: 85/100' },
        { id: 'step3', label: 'Comité crédit', status: 'completed', description: 'Approuvé le 12/03/2024' },
        { id: 'step4', label: 'Décaissement', status: 'completed', description: 'Effectué le 15/03/2024' }
      ]
    }
  },
  {
    id: 'OP002',
    type: 'leasing',
    amount: 50000000,
    company: 'Industrial Equipment SA',
    date: '2024-03-05',
    status: 'completed',
    processor: 'Jane Smith',
    details: 'Leasing équipement industriel',
    workflow: {
      id: 'WF002',
      steps: [
        { id: 'step1', label: 'Demande', status: 'completed', description: 'Équipement sélectionné' },
        { id: 'step2', label: 'Inspection', status: 'completed', description: 'Équipement conforme' },
        { id: 'step3', label: 'Validation', status: 'completed', description: 'Contrat approuvé' },
        { id: 'step4', label: 'Livraison', status: 'completed', description: 'Livré le 10/03/2024' }
      ]
    }
  },
  {
    id: 'OP003',
    type: 'investment',
    amount: 200000000,
    company: 'Green Energy Startup',
    date: '2024-02-28',
    status: 'completed',
    processor: 'Robert Wilson',
    details: 'Investissement en capital série A',
    workflow: {
      id: 'WF003',
      steps: [
        { id: 'step1', label: 'Due Diligence', status: 'completed', description: 'Rapport favorable' },
        { id: 'step2', label: 'Valorisation', status: 'completed', description: 'Valorisation: 2M€' },
        { id: 'step3', label: 'Négociation', status: 'completed', description: 'Terms sheet signée' },
        { id: 'step4', label: 'Closing', status: 'completed', description: 'Transaction finalisée' }
      ]
    }
  }
];

export default function History() {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedOperation, setSelectedOperation] = useState<OperationHistory | null>(null);

  const filteredHistory = mockHistory.filter(operation => {
    const matchesSearch = 
      operation.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      operation.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      operation.details.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDateRange = 
      (!dateRange.start || operation.date >= dateRange.start) &&
      (!dateRange.end || operation.date <= dateRange.end);

    const matchesType = selectedType === 'all' || operation.type === selectedType;
    const matchesStatus = selectedStatus === 'all' || operation.status === selectedStatus;

    return matchesSearch && matchesDateRange && matchesType && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <FileBarChart className="h-6 w-6 text-primary mr-2" />
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Historique des opérations
          </h1>
        </div>
      </div>

      <HistoryFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        selectedType={selectedType}
        onTypeChange={setSelectedType}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters(!showFilters)}
      />

      <div className="overflow-hidden">
        <div className="overflow-x-auto">
          <HistoryTable 
            operations={filteredHistory}
            onViewWorkflow={setSelectedOperation}
          />
        </div>
      </div>

      {selectedOperation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b dark:border-gray-700">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-semibold">
                    Workflow - {selectedOperation.company}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {selectedOperation.type} - {selectedOperation.id}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedOperation(null)}
                >
                  Fermer
                </Button>
              </div>
            </div>
            <div className="p-6">
              {selectedOperation.workflow && (
                <OperationWorkflow
                  operation={{
                    id: selectedOperation.id,
                    currentStep: selectedOperation.workflow.steps[selectedOperation.workflow.steps.length - 1].id,
                    status: selectedOperation.status,
                    validatedTokens: selectedOperation.workflow.steps.map(step => step.id)
                  }}
                  workflow={selectedOperation.workflow}
                  onStepAction={() => {}}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
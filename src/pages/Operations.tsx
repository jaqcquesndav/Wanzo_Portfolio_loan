import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { OperationsHeader } from '../components/operations/views/OperationsHeader';
import { OperationsListView } from '../components/operations/views/OperationsListView';
import { OperationsPendingView } from '../components/operations/views/OperationsPendingView';
import { OperationsArchiveView } from '../components/operations/views/OperationsArchiveView';
import { OperationWorkflow } from '../components/operations/OperationWorkflow';
import { NewOperationModal } from '../components/operations/NewOperationModal';
import { useOperations } from '../components/operations/hooks/useOperations';
import { useNotification } from '../contexts/NotificationContext';
import type { Operation, OperationView } from '../types/operations';

const mockOperations: Operation[] = [
  {
    id: '1',
    type: 'credit',
    amount: 5000000,
    status: 'active',
    startDate: '2024-03-01',
    duration: 24,
    interestRate: 8.5,
    description: 'Crédit d\'investissement pour l\'expansion',
    created_at: '2024-03-01T10:00:00Z',
    updated_at: '2024-03-01T10:00:00Z'
  },
  {
    id: '2',
    type: 'bond',
    amount: 10000000,
    status: 'pending',
    startDate: '2024-03-15',
    duration: 36,
    interestRate: 7.5,
    description: 'Émission obligataire pour financement d\'équipements',
    created_at: '2024-03-15T10:00:00Z',
    updated_at: '2024-03-15T10:00:00Z',
    securityDetails: {
      unitPrice: 100000,
      quantity: 100,
      maturityDate: '2027-03-15',
      minInvestment: 500000
    }
  }
];

export default function Operations() {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [showNewOperationModal, setShowNewOperationModal] = useState(false);
  const {
    operations,
    selectedOperation,
    setSelectedOperation,
    view,
    setView,
    searchTerm,
    setSearchTerm,
    selectedType,
    setSelectedType,
    selectedStatus,
    setSelectedStatus,
    filteredOperations
  } = useOperations(mockOperations);

  const handleNewOperation = () => {
    setShowNewOperationModal(true);
  };

  const handleOperationClick = (operation: Operation) => {
    setSelectedOperation(operation);
    setView('workflow');
  };

  const handleViewChange = (newView: OperationView) => {
    setSelectedOperation(null);
    setView(newView);
  };

  const handleSelectOperationType = (type: string) => {
    setShowNewOperationModal(false);
    if (type === 'funding') {
      navigate('/funding-offers');
    }
  };

  const renderView = () => {
    if (selectedOperation) {
      return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-6">
            <OperationWorkflow operation={selectedOperation} />
          </div>
        </div>
      );
    }

    switch (view) {
      case 'pending':
        return (
          <OperationsPendingView
            operations={filteredOperations}
            onOperationClick={handleOperationClick}
          />
        );
      case 'archive':
        return (
          <OperationsArchiveView
            operations={filteredOperations}
            onOperationClick={handleOperationClick}
          />
        );
      default:
        return (
          <OperationsListView
            operations={filteredOperations}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            selectedType={selectedType}
            onTypeChange={setSelectedType}
            selectedStatus={selectedStatus}
            onStatusChange={setSelectedStatus}
            onOperationClick={handleOperationClick}
          />
        );
    }
  };

  return (
    <div className="space-y-6">
      <OperationsHeader
        view={view}
        onViewChange={handleViewChange}
        onNewOperation={handleNewOperation}
        selectedOperationId={selectedOperation?.id}
      />
      {renderView()}

      {showNewOperationModal && (
        <NewOperationModal
          onClose={() => setShowNewOperationModal(false)}
          onSelectType={handleSelectOperationType}
        />
      )}
    </div>
  );
}
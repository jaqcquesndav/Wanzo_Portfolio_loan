import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Form';
import { WorkflowManager } from '../../components/workflow/WorkflowManager';
import { useWorkflows } from '../../hooks/useWorkflows';
import { useNotification } from '../../contexts/NotificationContext';

export default function Workflows() {
  const navigate = useNavigate();
  const { workflows, saveWorkflow, deleteWorkflow } = useWorkflows();
  const { showNotification } = useNotification();
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const handleSaveWorkflow = async (workflowData: any) => {
    try {
      await saveWorkflow(workflowData);
      showNotification('Workflow sauvegardé avec succès', 'success');
    } catch (error) {
      showNotification('Erreur lors de la sauvegarde du workflow', 'error');
    }
  };

  const handleDeleteWorkflow = async (workflowId: string) => {
    try {
      await deleteWorkflow(workflowId);
      showNotification('Workflow supprimé avec succès', 'success');
    } catch (error) {
      showNotification('Erreur lors de la suppression du workflow', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Workflows
        </h1>
        <Button
          onClick={() => navigate('/operations/workflows/new')}
          icon={<Plus className="h-5 w-5" />}
        >
          Nouveau workflow
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Rechercher un workflow..."
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

      <WorkflowManager
        workflows={workflows}
        availableProducts={[
          { id: 'PROD001', name: 'Crédit PME' },
          { id: 'PROD002', name: 'Leasing Industriel' }
        ]}
        onSave={handleSaveWorkflow}
        onDelete={handleDeleteWorkflow}
      />
    </div>
  );
}
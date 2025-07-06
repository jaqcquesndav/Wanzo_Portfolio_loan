import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Breadcrumb } from '../../components/common/Breadcrumb';
import { WorkflowBuilder } from '../../components/workflow/WorkflowBuilder';
import { useWorkflows } from '../../hooks/useWorkflows';
import { useNotification } from '../../contexts/NotificationContext';

// Mock data for available products
const mockProducts = [
  { id: 'PROD001', name: 'Crédit Équipement PME' },
  { id: 'PROD002', name: 'Leasing Industriel' }
];

export default function WorkflowCreation() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const requestId = searchParams.get('requestId');
  const { saveWorkflow } = useWorkflows();
  const { showNotification } = useNotification();

  const handleSubmit = async (data: any) => {
    try {
      const workflow = await saveWorkflow(data);
      showNotification('Workflow créé avec succès', 'success');
      
      if (requestId) {
        navigate(`/operations/validation/${requestId}?workflow=${workflow.id}`);
      } else {
        navigate('/operations/workflows');
      }
    } catch (error) {
      showNotification('Erreur lors de la création du workflow', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: 'Opérations', href: '/operations' },
          { label: 'Workflows', href: '/operations/workflows' },
          { label: 'Nouveau workflow' }
        ]}
      />

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            icon={<ArrowLeft className="h-5 w-5" />}
          >
            Retour
          </Button>
          <h1 className="text-2xl font-semibold">
            Créer un nouveau workflow
          </h1>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <div className="p-6">
          <WorkflowBuilder
            onSubmit={handleSubmit}
            onCancel={() => navigate(-1)}
            availableProducts={mockProducts}
          />
        </div>
      </div>
    </div>
  );
}
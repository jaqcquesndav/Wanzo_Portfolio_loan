import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Check } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Breadcrumb } from '../../components/common/Breadcrumb';
import { OperationWorkflow } from '../../components/operations/OperationWorkflow';
import { TokenValidationModal } from '../../components/operations/TokenValidationModal';
import { useWorkflows } from '../../hooks/useWorkflows';
import { useNotification } from '../../contexts/NotificationContext';

export default function RequestValidation() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const workflowId = searchParams.get('workflow');
  const navigate = useNavigate();
  const { workflows } = useWorkflows();
  const { showNotification } = useNotification();
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [currentStep, setCurrentStep] = useState<string | null>(null);
  const [generatedToken, setGeneratedToken] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  // Mock operation data - replace with actual API call
  const [operation] = useState({
    id,
    currentStep: 'validation',
    status: 'pending',
    validatedTokens: []
  });

  const workflow = workflows.find(w => w.id === workflowId);

  const handleStepAction = (stepId: string, requiresToken: boolean, generatesToken: boolean) => {
    if (requiresToken) {
      setCurrentStep(stepId);
      setGeneratedToken(null);
      setShowTokenModal(true);
    } else if (generatesToken) {
      const token = Math.random().toString(36).substr(2, 6).toUpperCase();
      setCurrentStep(stepId);
      setGeneratedToken(token);
      setShowTokenModal(true);
    }
  };

  const handleTokenValidation = async (token: string) => {
    try {
      // Simuler la validation du token
      await new Promise(resolve => setTimeout(resolve, 1000));
      showNotification('Token validé avec succès', 'success');
      setShowTokenModal(false);
    } catch (error) {
      showNotification('Token invalide', 'error');
    }
  };

  const handleValidateWorkflow = async () => {
    try {
      setIsValidating(true);
      // Simuler l'appel API pour valider le workflow
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Transférer la demande vers les opérations en cours
      const updatedOperation = {
        ...operation,
        status: 'active',
        workflow: {
          ...workflow,
          steps: workflow?.steps.map(step => ({
            ...step,
            status: 'pending'
          }))
        }
      };

      // Dans un cas réel, vous feriez un appel API ici
      console.log('Operation mise à jour:', updatedOperation);

      showNotification('Workflow validé et opération transférée', 'success');
      navigate('/operations/validation');
    } catch (error) {
      showNotification('Erreur lors de la validation', 'error');
    } finally {
      setIsValidating(false);
    }
  };

  if (!workflow) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900">Workflow non trouvé</h2>
        <Button
          variant="outline"
          onClick={() => navigate('/operations/requests')}
          className="mt-4"
        >
          Retour aux demandes
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: 'Opérations', href: '/operations' },
          { label: 'Demandes', href: '/operations/requests' },
          { label: `Validation ${id}` }
        ]}
      />

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => navigate(`/operations/requests/${id}`)}
            icon={<ArrowLeft className="h-5 w-5" />}
          >
            Retour
          </Button>
          <h1 className="text-2xl font-semibold">
            Validation de la demande {id}
          </h1>
        </div>
        <Button
          onClick={handleValidateWorkflow}
          loading={isValidating}
          icon={<Check className="h-5 w-5" />}
        >
          Valider et transférer
        </Button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <OperationWorkflow
          operation={operation}
          workflow={workflow}
          onStepAction={handleStepAction}
        />
      </div>

      {showTokenModal && currentStep && (
        <TokenValidationModal
          stepLabel={workflow.steps.find(s => s.id === currentStep)?.label || ''}
          onValidate={handleTokenValidation}
          onClose={() => {
            setShowTokenModal(false);
            setCurrentStep(null);
            setGeneratedToken(null);
          }}
          generatedToken={generatedToken}
        />
      )}
    </div>
  );
}
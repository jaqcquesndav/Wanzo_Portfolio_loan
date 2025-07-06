import React, { useState, useEffect } from 'react';
import { Building, Users, TrendingUp, AlertTriangle, Lock, Key, Download, Upload, Clock, Check, RefreshCw, ArrowRight } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { useWorkflowStep } from '../../hooks/useWorkflowStep';
import type { Workflow, WorkflowStep } from '../../types/workflow';

interface OperationWorkflowProps {
  operation: {
    id: string;
    currentStep: string;
    status: string;
    validatedTokens: string[];
    type?: string;
    leasingEquipment?: any;
  };
  workflow: Workflow | undefined;
  onStepAction: (stepId: string, requiresToken: boolean, generatesToken: boolean) => void;
}

export function OperationWorkflow({ 
  operation, 
  workflow,
  onStepAction 
}: OperationWorkflowProps) {
  const [steps, setSteps] = useState<(WorkflowStep & { 
    status: 'completed' | 'current' | 'blocked' | 'pending' | 'waiting';
    startTime?: string;
    endTime?: string;
    duration?: number;
    progress?: number;
  })[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [refreshInterval, setRefreshInterval] = useState<number | null>(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Rafraîchir l'état des étapes toutes les 30 secondes
  useEffect(() => {
    const interval = setInterval(() => {
      refreshWorkflowStatus();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const refreshWorkflowStatus = async () => {
    try {
      setIsRefreshing(true);
      // Simuler un appel API
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mettre à jour les durées et progrès des étapes
      setSteps(prevSteps => prevSteps.map(step => {
        if (step.status === 'current') {
          const startTime = step.startTime || new Date().toISOString();
          const duration = step.duration || 7 * 24 * 60 * 60 * 1000; // 1 semaine par défaut
          const elapsed = new Date().getTime() - new Date(startTime).getTime();
          const progress = Math.min(100, (elapsed / duration) * 100);
          
          return {
            ...step,
            startTime,
            progress
          };
        }
        return step;
      }));

      setLastRefresh(new Date());
    } catch (error) {
      console.error('Error refreshing workflow status:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (workflow) {
      // Initialiser les étapes avec leur statut et durées
      const initialSteps = workflow.steps.map((step, index) => {
        const stepIndex = workflow.steps.findIndex(s => s.id === step.id);
        const currentIndex = workflow.steps.findIndex(s => s.id === operation.currentStep);

        let status: 'completed' | 'current' | 'blocked' | 'pending' | 'waiting';
        let startTime: string | undefined;
        let endTime: string | undefined;
        let progress: number | undefined;

        if (stepIndex < currentIndex) {
          status = 'completed';
          startTime = new Date(Date.now() - (currentIndex - stepIndex) * 7 * 24 * 60 * 60 * 1000).toISOString();
          endTime = new Date(Date.now() - (currentIndex - stepIndex - 1) * 7 * 24 * 60 * 60 * 1000).toISOString();
          progress = 100;
        } else if (step.id === operation.currentStep) {
          status = 'current';
          startTime = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(); // 2 jours de progrès
          progress = 30; // 30% de progrès
        } else if (step.requiresToken && !operation.validatedTokens.includes(step.id)) {
          status = 'blocked';
        } else if (step.assignedRole === 'client') {
          status = 'waiting';
        } else {
          status = 'pending';
        }

        return {
          ...step,
          status,
          startTime,
          endTime,
          duration: 7 * 24 * 60 * 60 * 1000, // 1 semaine par défaut
          progress
        };
      });

      setSteps(initialSteps);
      setCurrentStepIndex(workflow.steps.findIndex(s => s.id === operation.currentStep));
    }
  }, [workflow, operation.currentStep, operation.validatedTokens]);

  const handleStepAction = async (step: WorkflowStep) => {
    try {
      // Vérifier si l'étape nécessite une action du client
      if (step.assignedRole === 'client') {
        return;
      }

      // Appeler la fonction parent
      onStepAction(step.id, step.requiresToken || false, step.generatesToken || false);

      // Mettre à jour le statut de l'étape localement
      const newSteps = steps.map(s => {
        if (s.id === step.id) {
          return {
            ...s,
            status: 'current' as const,
            startTime: new Date().toISOString(),
            progress: 0
          };
        }
        if (s.id === operation.currentStep) {
          return {
            ...s,
            status: 'completed' as const,
            endTime: new Date().toISOString(),
            progress: 100
          };
        }
        return s;
      });

      setSteps(newSteps);
      setCurrentStepIndex(prev => prev + 1);

      // Si l'étape suivante nécessite une action du client, démarrer le rafraîchissement automatique
      const nextStep = steps[currentStepIndex + 1];
      if (nextStep?.assignedRole === 'client') {
        setRefreshInterval(30000);
      } else {
        setRefreshInterval(null);
      }
    } catch (error) {
      console.error('Error handling step action:', error);
    }
  };

  const canProceedToStep = (step: WorkflowStep) => {
    const stepIndex = steps.findIndex(s => s.id === step.id);
    
    if (step.assignedRole === 'client') return false;
    
    if (stepIndex <= currentStepIndex) return true;
    if (stepIndex === currentStepIndex + 1) {
      const previousSteps = steps.slice(0, stepIndex);
      return previousSteps.every(s => 
        (!s.requiresToken || operation.validatedTokens.includes(s.id)) &&
        s.assignedRole !== 'client'
      );
    }
    return false;
  };

  if (!workflow) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Aucun workflow défini pour cette opération</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium">Progression du workflow</h2>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>Dernière mise à jour: {lastRefresh.toLocaleTimeString()}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={refreshWorkflowStatus}
            loading={isRefreshing}
            icon={<RefreshCw className="h-4 w-4" />}
          >
            Rafraîchir
          </Button>
        </div>
      </div>

      {/* Progress bar globale */}
      <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className="absolute h-full bg-primary transition-all duration-500"
          style={{ 
            width: `${(currentStepIndex / (steps.length - 1)) * 100}%` 
          }}
        />
      </div>

      <div className="space-y-4">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={`relative flex items-start p-6 rounded-lg border ${
              step.status === 'current' ? 'bg-blue-50 border-blue-200 dark:bg-blue-900 dark:border-blue-700' :
              step.status === 'completed' ? 'bg-green-50 border-green-200 dark:bg-green-900 dark:border-green-700' :
              step.status === 'blocked' ? 'bg-red-50 border-red-200 dark:bg-red-900 dark:border-red-700' :
              step.status === 'waiting' ? 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900 dark:border-yellow-700' :
              'bg-gray-50 border-gray-200 dark:bg-gray-700 dark:border-gray-600'
            }`}
          >
            {/* Ligne de connexion entre les étapes */}
            {index < steps.length - 1 && (
              <div className="absolute left-11 top-16 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-600" />
            )}

            {/* Indicateur de statut */}
            <div className="flex-shrink-0 mr-6">
              <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                step.status === 'completed' ? 'bg-green-100 dark:bg-green-800' :
                step.status === 'current' ? 'bg-blue-100 dark:bg-blue-800' :
                step.status === 'blocked' ? 'bg-red-100 dark:bg-red-800' :
                step.status === 'waiting' ? 'bg-yellow-100 dark:bg-yellow-800' :
                'bg-gray-100 dark:bg-gray-800'
              }`}>
                {step.status === 'completed' && (
                  <Check className="h-6 w-6 text-green-600 dark:text-green-200" />
                )}
                {step.status === 'current' && (
                  <Clock className="h-6 w-6 text-blue-600 dark:text-blue-200" />
                )}
                {step.status === 'blocked' && (
                  <Lock className="h-6 w-6 text-red-600 dark:text-red-200" />
                )}
                {step.status === 'waiting' && (
                  <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-200" />
                )}
                {step.status === 'pending' && (
                  <div className="h-6 w-6 rounded-full border-2 border-gray-300 dark:border-gray-500" />
                )}
              </div>
            </div>
            
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-medium text-gray-900 dark:text-white flex items-center">
                    {index + 1}. {step.label}
                    {step.status === 'current' && (
                      <span className="ml-2 text-sm text-blue-600 dark:text-blue-400 animate-pulse">
                        En cours...
                      </span>
                    )}
                  </h3>
                  <div className="mt-1">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {step.description}
                    </p>
                    {step.assignedRole === 'client' && (
                      <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-1 flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        En attente d'action du client
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  {/* Badges et indicateurs */}
                  <div className="flex flex-col items-end space-y-2">
                    {step.assignedRole && (
                      <Badge variant={step.assignedRole === 'client' ? 'warning' : 'primary'}>
                        <Users className="h-3 w-3 mr-1" />
                        {step.assignedRole === 'client' ? 'Client' : 'Institution'}
                      </Badge>
                    )}

                    {step.requiresToken && (
                      <Badge variant="warning">
                        <Key className="h-3 w-3 mr-1" />
                        Token requis
                      </Badge>
                    )}

                    {step.generatesToken && (
                      <Badge variant="success">
                        <Key className="h-3 w-3 mr-1" />
                        Génère un token
                      </Badge>
                    )}
                  </div>

                  {/* Bouton d'action */}
                  {canProceedToStep(step) && step.status !== 'completed' && (
                    <Button
                      size="sm"
                      onClick={() => handleStepAction(step)}
                      disabled={step.assignedRole === 'client'}
                      icon={step.requiresToken ? <Key className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
                    >
                      {step.requiresToken ? 'Valider avec token' : 'Procéder'}
                    </Button>
                  )}
                </div>
              </div>

              {/* Barre de progression pour l'étape en cours */}
              {step.status === 'current' && step.progress !== undefined && (
                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-500">Progression</span>
                    <span className="font-medium">{Math.round(step.progress)}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 transition-all duration-500"
                      style={{ width: `${step.progress}%` }}
                    />
                  </div>
                  {step.startTime && (
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Début: {formatDate(step.startTime)}</span>
                      <span>Durée estimée: 7 jours</span>
                    </div>
                  )}
                </div>
              )}

              {/* Détails de l'étape */}
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Documents requis */}
                {step.attachments && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <h4 className="text-sm font-medium mb-2 flex items-center">
                      <Upload className="h-4 w-4 mr-2" />
                      Documents requis
                    </h4>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {step.attachments.description}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {step.attachments.allowedTypes?.map((type, i) => (
                          <span 
                            key={i}
                            className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                          >
                            {type}
                          </span>
                        ))}
                      </div>
                      <div className="flex space-x-2 mt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          icon={<Upload className="h-4 w-4" />}
                        >
                          Téléverser
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          icon={<Download className="h-4 w-4" />}
                        >
                          Télécharger
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Critères de validation */}
                {step.validationCriteria && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <h4 className="text-sm font-medium mb-2 flex items-center">
                      <Check className="h-4 w-4 mr-2" />
                      Critères de validation
                    </h4>
                    {step.validationCriteria.requiredDocuments && (
                      <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                        {step.validationCriteria.requiredDocuments.map((doc, i) => (
                          <li key={i} className="flex items-center">
                            <Check className="h-3 w-3 mr-2 text-green-500" />
                            {doc}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>

              {/* Configuration des paiements */}
              {step.paymentConfig && (
                <div className="mt-4 bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <h4 className="text-sm font-medium mb-2 flex items-center">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Configuration du paiement
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Type:</span>
                      <p className="font-medium">{step.paymentConfig.type}</p>
                    </div>
                    {step.paymentConfig.amount && (
                      <div>
                        <span className="text-gray-500">Montant:</span>
                        <p className="font-medium">{formatCurrency(step.paymentConfig.amount)}</p>
                      </div>
                    )}
                    {step.paymentConfig.schedule && (
                      <div>
                        <span className="text-gray-500">Fréquence:</span>
                        <p className="font-medium">{step.paymentConfig.schedule.frequency}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
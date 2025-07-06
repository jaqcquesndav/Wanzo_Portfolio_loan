import React, { useState } from 'react';
import { Plus, GripVertical, X, Settings } from 'lucide-react';
import { Button } from '../ui/Button';
import { FormField, Input, Select, TextArea } from '../ui/Form';
import type { Workflow, WorkflowStep, WorkflowStepType } from '../../types/workflow';

interface WorkflowBuilderProps {
  workflow?: Workflow;
  availableProducts: Array<{ id: string; name: string }>;
  onSubmit: (workflow: Workflow) => Promise<void>;
  onCancel: () => void;
}

const STEP_TYPES: Record<WorkflowStepType, string> = {
  // Étapes communes
  validation: 'Validation',
  document_review: 'Revue documentaire',
  financial_analysis: 'Analyse financière',
  risk_assessment: 'Évaluation des risques',
  committee_review: 'Comité de crédit',
  legal_review: 'Revue juridique',
  disbursement: 'Décaissement',
  // Étapes de paiement
  payment_initiation: 'Initiation du paiement',
  payment_validation: 'Validation du paiement',
  payment_execution: 'Exécution du paiement',
  payment_confirmation: 'Confirmation du paiement',
  repayment_collection: 'Collecte du remboursement',
  repayment_validation: 'Validation du remboursement',
  rent_collection: 'Collecte du loyer',
  rent_validation: 'Validation du loyer',
  transfer_initiation: 'Initiation du virement',
  transfer_validation: 'Validation du virement',
  transfer_execution: 'Exécution du virement',
  // Étapes spécifiques au leasing
  equipment_inspection: 'Inspection équipement',
  supplier_validation: 'Validation fournisseur',
  delivery: 'Livraison',
  maintenance_monitoring: 'Suivi maintenance',
  end_of_contract: 'Fin de contrat',
  transfer_ownership: 'Transfert propriété',
  // Étapes spécifiques à l'investissement
  due_diligence: 'Due Diligence',
  valuation: 'Valorisation',
  term_sheet: 'Term Sheet',
  board_participation: 'Participation CA',
  exit_preparation: 'Préparation sortie',
  exit_execution: 'Exécution sortie',
  // Étapes de suivi
  payment_monitoring: 'Suivi des paiements',
  portfolio_monitoring: 'Suivi portefeuille',
  reporting: 'Reporting'
};

const FILE_TYPES = {
  documents: ['.pdf', '.doc', '.docx'],
  images: ['.jpg', '.jpeg', '.png'],
  spreadsheets: ['.xls', '.xlsx'],
  all: ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png', '.xls', '.xlsx']
};

export function WorkflowBuilder({ workflow, availableProducts, onSubmit, onCancel }: WorkflowBuilderProps) {
  const [name, setName] = useState(workflow?.name || '');
  const [description, setDescription] = useState(workflow?.description || '');
  const [type, setType] = useState(workflow?.type || 'credit');
  const [steps, setSteps] = useState<WorkflowStep[]>(workflow?.steps || []);
  const [selectedProducts, setSelectedProducts] = useState<string[]>(workflow?.productIds || []);
  const [editingStep, setEditingStep] = useState<WorkflowStep | null>(null);

  const handleAddStep = () => {
    const newStep: WorkflowStep = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'validation',
      label: 'Nouvelle étape',
      description: '',
      order: steps.length,
      requiresToken: false,
      generatesToken: false
    };
    setSteps([...steps, newStep]);
    setEditingStep(newStep);
  };

  const handleUpdateStep = (stepId: string, updates: Partial<WorkflowStep>) => {
    setSteps(steps.map(step => 
      step.id === stepId ? { ...step, ...updates } : step
    ));
  };

  const handleRemoveStep = (stepId: string) => {
    setSteps(steps.filter(step => step.id !== stepId));
  };

  const handleMoveStep = (index: number, direction: 'up' | 'down') => {
    const newSteps = [...steps];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    [newSteps[index], newSteps[newIndex]] = [newSteps[newIndex], newSteps[index]];
    setSteps(newSteps);
  };

  const handleSubmit = async () => {
    if (!name || steps.length === 0) return;

    const workflowData: Workflow = {
      id: workflow?.id || Math.random().toString(36).substr(2, 9),
      name,
      description,
      type,
      steps: steps.map((step, index) => ({ ...step, order: index })),
      productIds: selectedProducts,
      active: true,
      created_at: workflow?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    await onSubmit(workflowData);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField label="Nom du workflow">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Workflow crédit PME"
          />
        </FormField>

        <FormField label="Type">
          <Select value={type} onChange={(e) => setType(e.target.value as 'credit' | 'leasing')}>
            <option value="credit">Crédit</option>
            <option value="leasing">Leasing</option>
            <option value="investment">Investissement</option>
          </Select>
        </FormField>
      </div>

      <FormField label="Description">
        <TextArea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="Description du workflow..."
        />
      </FormField>

      <FormField label="Produits associés">
        <div className="space-y-2">
          {availableProducts.map(product => (
            <label key={product.id} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={selectedProducts.includes(product.id)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedProducts([...selectedProducts, product.id]);
                  } else {
                    setSelectedProducts(selectedProducts.filter(id => id !== product.id));
                  }
                }}
                className="rounded border-gray-300"
              />
              <span>{product.name}</span>
            </label>
          ))}
        </div>
      </FormField>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Étapes du workflow</h3>
          <Button onClick={handleAddStep} icon={<Plus className="h-4 w-4" />}>
            Ajouter une étape
          </Button>
        </div>

        <div className="space-y-4">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-4"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="flex space-x-2 mr-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMoveStep(index, 'up')}
                      disabled={index === 0}
                      icon={<GripVertical className="h-4 w-4 rotate-90" />}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMoveStep(index, 'down')}
                      disabled={index === steps.length - 1}
                      icon={<GripVertical className="h-4 w-4 rotate-90" />}
                    />
                  </div>
                  <span className="text-lg font-medium">Étape {index + 1}</span>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingStep(step)}
                    icon={<Settings className="h-4 w-4" />}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveStep(step.id)}
                    icon={<X className="h-4 w-4" />}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="Type d'étape">
                  <Select
                    value={step.type}
                    onChange={(e) => handleUpdateStep(step.id, { type: e.target.value as WorkflowStepType })}
                  >
                    {Object.entries(STEP_TYPES).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </Select>
                </FormField>

                <FormField label="Libellé">
                  <Input
                    value={step.label}
                    onChange={(e) => handleUpdateStep(step.id, { label: e.target.value })}
                  />
                </FormField>
              </div>

              <FormField label="Description">
                <TextArea
                  value={step.description}
                  onChange={(e) => handleUpdateStep(step.id, { description: e.target.value })}
                  rows={2}
                />
              </FormField>

              <div className="mt-4 space-y-4">
                {/* Configuration des pièces jointes */}
                <div className="border-t dark:border-gray-700 pt-4">
                  <h4 className="text-sm font-medium mb-2">Configuration des pièces jointes</h4>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={step.attachments?.required || false}
                        onChange={(e) => handleUpdateStep(step.id, {
                          attachments: {
                            ...step.attachments,
                            required: e.target.checked
                          }
                        })}
                        className="rounded border-gray-300 mr-2"
                      />
                      <span>Pièces jointes requises</span>
                    </label>

                    {(step.attachments?.required || false) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                        <FormField label="Taille maximale (MB)">
                          <Input
                            type="number"
                            value={step.attachments?.maxSize || 10}
                            onChange={(e) => handleUpdateStep(step.id, {
                              attachments: {
                                ...step.attachments,
                                maxSize: parseInt(e.target.value)
                              }
                            })}
                          />
                        </FormField>

                        <FormField label="Types de fichiers autorisés">
                          <Select
                            value={step.attachments?.allowedTypes?.join(',') || 'all'}
                            onChange={(e) => handleUpdateStep(step.id, {
                              attachments: {
                                ...step.attachments,
                                allowedTypes: e.target.value === 'all' ? FILE_TYPES.all : e.target.value.split(',')
                              }
                            })}
                          >
                            <option value="all">Tous les types</option>
                            <option value={FILE_TYPES.documents.join(',')}>Documents</option>
                            <option value={FILE_TYPES.images.join(',')}>Images</option>
                            <option value={FILE_TYPES.spreadsheets.join(',')}>Tableurs</option>
                          </Select>
                        </FormField>

                        <FormField label="Description" className="col-span-2">
                          <TextArea
                            value={step.attachments?.description || ''}
                            onChange={(e) => handleUpdateStep(step.id, {
                              attachments: {
                                ...step.attachments,
                                description: e.target.value
                              }
                            })}
                            placeholder="Description des pièces jointes requises..."
                            rows={2}
                          />
                        </FormField>
                      </div>
                    )}
                  </div>
                </div>

                {/* Configuration des tokens et validation */}
                <div className="border-t dark:border-gray-700 pt-4">
                  <h4 className="text-sm font-medium mb-2">Configuration de la validation</h4>
                  <div className="space-x-4">
                    <label className="inline-flex items-center">
                      <input
                        type="checkbox"
                        checked={step.requiresToken}
                        onChange={(e) => handleUpdateStep(step.id, { requiresToken: e.target.checked })}
                        className="rounded border-gray-300"
                      />
                      <span className="ml-2">Nécessite un token</span>
                    </label>

                    <label className="inline-flex items-center">
                      <input
                        type="checkbox"
                        checked={step.generatesToken}
                        onChange={(e) => handleUpdateStep(step.id, { generatesToken: e.target.checked })}
                        className="rounded border-gray-300"
                      />
                      <span className="ml-2">Génère un token</span>
                    </label>
                  </div>
                </div>

                {/* Configuration des paiements si applicable */}
                {step.type.includes('payment') && (
                  <div className="border-t dark:border-gray-700 pt-4">
                    <h4 className="text-sm font-medium mb-2">Configuration du paiement</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField label="Type de paiement">
                        <Select
                          value={step.paymentConfig?.type || 'disbursement'}
                          onChange={(e) => handleUpdateStep(step.id, {
                            paymentConfig: {
                              ...step.paymentConfig,
                              type: e.target.value as 'disbursement' | 'repayment' | 'rent' | 'transfer'
                            }
                          })}
                        >
                          <option value="disbursement">Décaissement</option>
                          <option value="repayment">Remboursement</option>
                          <option value="rent">Loyer</option>
                          <option value="transfer">Virement</option>
                        </Select>
                      </FormField>

                      <FormField label="Devise">
                        <Select
                          value={step.paymentConfig?.currency || 'CDF'}
                          onChange={(e) => handleUpdateStep(step.id, {
                            paymentConfig: {
                              ...step.paymentConfig,
                              currency: e.target.value as 'CDF' | 'USD'
                            }
                          })}
                        >
                          <option value="CDF">CDF</option>
                          <option value="USD">USD</option>
                        </Select>
                      </FormField>

                      <FormField label="Fréquence">
                        <Select
                          value={step.paymentConfig?.schedule?.frequency || 'one-time'}
                          onChange={(e) => handleUpdateStep(step.id, {
                            paymentConfig: {
                              ...step.paymentConfig,
                              schedule: {
                                ...step.paymentConfig?.schedule,
                                frequency: e.target.value as 'one-time' | 'monthly' | 'quarterly' | 'annual'
                              }
                            }
                          })}
                        >
                          <option value="one-time">Unique</option>
                          <option value="monthly">Mensuel</option>
                          <option value="quarterly">Trimestriel</option>
                          <option value="annual">Annuel</option>
                        </Select>
                      </FormField>

                      <FormField label="Délai de grâce (jours)">
                        <Input
                          type="number"
                          value={step.paymentConfig?.schedule?.gracePeriod || 0}
                          onChange={(e) => handleUpdateStep(step.id, {
                            paymentConfig: {
                              ...step.paymentConfig,
                              schedule: {
                                ...step.paymentConfig?.schedule,
                                gracePeriod: parseInt(e.target.value)
                              }
                            }
                          })}
                        />
                      </FormField>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <Button variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button onClick={handleSubmit} disabled={!name || steps.length === 0}>
          Enregistrer le workflow
        </Button>
      </div>
    </div>
  );
}
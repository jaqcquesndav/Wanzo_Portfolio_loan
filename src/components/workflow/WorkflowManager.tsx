import React, { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Form';
import { Badge } from '../ui/Badge';
import { WorkflowBuilder } from './WorkflowBuilder';
import type { Workflow } from '../../types/workflow';

interface WorkflowManagerProps {
  workflows: Workflow[];
  availableProducts: Array<{ id: string; name: string }>;
  onSave: (workflow: Workflow) => Promise<void>;
  onDelete: (workflowId: string) => Promise<void>;
}

export function WorkflowManager({
  workflows,
  availableProducts,
  onSave,
  onDelete
}: WorkflowManagerProps) {
  const [showBuilder, setShowBuilder] = useState(false);
  const [editingWorkflow, setEditingWorkflow] = useState<Workflow | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredWorkflows = workflows.filter(workflow =>
    workflow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    workflow.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (workflow: Workflow) => {
    setEditingWorkflow(workflow);
    setShowBuilder(true);
  };

  const handleSave = async (workflow: Workflow) => {
    await onSave(workflow);
    setShowBuilder(false);
    setEditingWorkflow(null);
  };

  return (
    <div className="space-y-6">
      {showBuilder ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <WorkflowBuilder
            workflow={editingWorkflow || undefined}
            availableProducts={availableProducts}
            onSave={handleSave}
            onCancel={() => {
              setShowBuilder(false);
              setEditingWorkflow(null);
            }}
          />
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Rechercher un workflow..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              onClick={() => setShowBuilder(true)}
              icon={<Plus className="h-5 w-5" />}
            >
              Nouveau workflow
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWorkflows.map(workflow => (
              <div
                key={workflow.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <Badge variant={workflow.active ? 'success' : 'warning'}>
                      {workflow.active ? 'Actif' : 'Inactif'}
                    </Badge>
                    <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">
                      {workflow.name}
                    </h3>
                  </div>
                  <Badge variant="primary">{workflow.type}</Badge>
                </div>

                <p className="text-sm text-gray-500 mb-4">
                  {workflow.description}
                </p>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Étapes ({workflow.steps.length})
                    </h4>
                    <div className="space-y-2">
                      {workflow.steps.slice(0, 3).map((step, index) => (
                        <div
                          key={step.id}
                          className="text-sm text-gray-600 dark:text-gray-400 flex items-center"
                        >
                          <span className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xs mr-2">
                            {index + 1}
                          </span>
                          {step.label}
                        </div>
                      ))}
                      {workflow.steps.length > 3 && (
                        <div className="text-sm text-gray-500">
                          +{workflow.steps.length - 3} autres étapes
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Produits associés
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {workflow.productIds.map(productId => {
                        const product = availableProducts.find(p => p.id === productId);
                        return product ? (
                          <span
                            key={productId}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {product.name}
                          </span>
                        ) : null;
                      })}
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-4">
                  <Button
                    variant="outline"
                    onClick={() => handleEdit(workflow)}
                  >
                    Modifier
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => {
                      if (confirm('Êtes-vous sûr de vouloir supprimer ce workflow ?')) {
                        onDelete(workflow.id);
                      }
                    }}
                  >
                    Supprimer
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
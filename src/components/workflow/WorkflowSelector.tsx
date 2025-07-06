import React from 'react';
import { X, Plus } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import type { Workflow } from '../../types/workflow';

interface WorkflowSelectorProps {
  workflows: Workflow[];
  productId: string;
  onSelect: (workflowId: string | null) => void;
  onClose: () => void;
  onCreateNew?: () => void;
}

export function WorkflowSelector({ 
  workflows, 
  productId, 
  onSelect, 
  onClose,
  onCreateNew 
}: WorkflowSelectorProps) {
  const matchingWorkflows = workflows.filter(w => 
    w.active && w.productIds.includes(productId)
  );

  const handleCreateNew = () => {
    if (onCreateNew) {
      onCreateNew();
    } else {
      onSelect('new');
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full mx-4">
        <div className="flex justify-between items-center p-6 border-b dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Sélectionner un workflow
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            icon={<X className="h-5 w-5" />}
          />
        </div>

        <div className="p-6">
          {matchingWorkflows.length > 0 ? (
            <div className="space-y-4">
              <p className="text-sm text-gray-500">
                Sélectionnez un workflow existant ou créez-en un nouveau.
              </p>
              
              <div className="grid grid-cols-1 gap-4">
                {matchingWorkflows.map(workflow => (
                  <button
                    key={workflow.id}
                    onClick={() => {
                      onSelect(workflow.id);
                      onClose();
                    }}
                    className="text-left p-4 border rounded-lg hover:border-primary transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {workflow.name}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {workflow.description}
                        </p>
                      </div>
                      <Badge variant="primary">
                        {workflow.steps.length} étapes
                      </Badge>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">
                Aucun workflow n'est disponible pour ce type de produit.
              </p>
            </div>
          )}

          <div className="mt-6 flex justify-end space-x-4">
            <Button
              variant="outline"
              onClick={onClose}
            >
              Annuler
            </Button>
            <Button
              onClick={handleCreateNew}
              icon={<Plus className="h-4 w-4" />}
            >
              Créer un nouveau workflow
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
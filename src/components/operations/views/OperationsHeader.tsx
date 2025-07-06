import React from 'react';
import { FileText, Plus, Archive, Clock } from 'lucide-react';
import { Button } from '../../ui/Button';
import { Breadcrumb } from '../../common';
import type { OperationView } from '../../../types/operations';

interface OperationsHeaderProps {
  view: OperationView;
  onViewChange: (view: OperationView) => void;
  onNewOperation: () => void;
  selectedOperationId?: string;
}

export function OperationsHeader({
  view,
  onViewChange,
  onNewOperation,
  selectedOperationId
}: OperationsHeaderProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <Breadcrumb
            items={[
              { label: 'Opérations', href: '/operations' },
              ...(selectedOperationId ? [{ label: selectedOperationId }] : [])
            ]}
          />
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white flex items-center">
            <FileText className="h-6 w-6 text-primary mr-2" />
            Opérations
          </h1>
        </div>
        <Button
          onClick={onNewOperation}
          icon={<Plus className="h-5 w-5" />}
        >
          Nouvelle opération
        </Button>
      </div>

      {!selectedOperationId && (
        <div className="flex space-x-4">
          <Button
            variant={view === 'list' ? 'primary' : 'outline'}
            onClick={() => onViewChange('list')}
            icon={<FileText className="h-4 w-4" />}
          >
            Toutes
          </Button>
          <Button
            variant={view === 'pending' ? 'primary' : 'outline'}
            onClick={() => onViewChange('pending')}
            icon={<Clock className="h-4 w-4" />}
          >
            En attente
          </Button>
          <Button
            variant={view === 'archive' ? 'primary' : 'outline'}
            onClick={() => onViewChange('archive')}
            icon={<Archive className="h-4 w-4" />}
          >
            Archives
          </Button>
        </div>
      )}
    </div>
  );
}
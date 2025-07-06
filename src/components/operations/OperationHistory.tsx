import React from 'react';
import { Clock, ArrowRight } from 'lucide-react';
import { Badge } from '../ui/Badge';
import type { Operation } from '../../types/operations';
import { formatDate } from '../../utils/formatters';

interface HistoryEntry {
  id: string;
  operation: Operation;
  action: 'created' | 'updated' | 'status_changed';
  timestamp: string;
  details?: string;
}

interface OperationHistoryProps {
  history: HistoryEntry[];
}

export function OperationHistory({ history }: OperationHistoryProps) {
  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {history.map((entry, idx) => (
          <li key={entry.id}>
            <div className="relative pb-8">
              {idx !== history.length - 1 && (
                <span
                  className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                  aria-hidden="true"
                />
              )}
              <div className="relative flex space-x-3">
                <div>
                  <span className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                    <Clock className="h-5 w-5 text-gray-500" />
                  </span>
                </div>
                <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                  <div>
                    <p className="text-sm text-gray-500">
                      {entry.action === 'created' && 'Opération créée'}
                      {entry.action === 'updated' && 'Opération mise à jour'}
                      {entry.action === 'status_changed' && (
                        <span>
                          Statut changé <ArrowRight className="inline h-4 w-4" /> 
                          <Badge variant={entry.operation.status === 'active' ? 'success' : 'primary'}>
                            {entry.operation.status}
                          </Badge>
                        </span>
                      )}
                    </p>
                    {entry.details && (
                      <p className="mt-1 text-sm text-gray-600">{entry.details}</p>
                    )}
                  </div>
                  <div className="whitespace-nowrap text-right text-sm text-gray-500">
                    {formatDate(entry.timestamp)}
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
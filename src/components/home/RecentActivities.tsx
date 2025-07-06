import React from 'react';
import { Clock, ArrowRight } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { formatCurrency, formatDate } from '../../utils/formatters';

interface Activity {
  id: string;
  type: 'operation' | 'request';
  title: string;
  amount?: number;
  status: string;
  date: string;
}

const recentActivities: Activity[] = [
  {
    id: '1',
    type: 'operation',
    title: 'Investissement - Tech Solutions SARL',
    amount: 5000000,
    status: 'completed',
    date: '2024-03-15T10:30:00'
  },
  {
    id: '2',
    type: 'request',
    title: 'Demande de financement - Industrial Equipment SA',
    amount: 2500000,
    status: 'pending',
    date: '2024-03-14T15:45:00'
  }
];

export function RecentActivities() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
          <Clock className="h-5 w-5 mr-2" />
          Activités récentes
        </h2>
        <Button variant="outline" size="sm" icon={<ArrowRight className="h-4 w-4" />}>
          Voir tout
        </Button>
      </div>

      <div className="space-y-4">
        {recentActivities.map((activity) => (
          <div
            key={activity.id}
            className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
          >
            <div>
              <div className="flex items-center">
                <Badge variant={activity.status === 'completed' ? 'success' : 'warning'}>
                  {activity.status}
                </Badge>
                <span className="ml-2 text-sm font-medium text-gray-900 dark:text-white">
                  {activity.title}
                </span>
              </div>
              {activity.amount && (
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {formatCurrency(activity.amount)}
                </p>
              )}
            </div>
            <div className="text-right text-sm text-gray-500 dark:text-gray-400">
              {formatDate(activity.date)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
import React from 'react';
import { Badge } from '../ui/Badge';
import { ReportActions } from './ReportActions';
import { formatDate } from '../../utils/formatters';
import type { Report, ReportType } from '../../types/reports';

interface ReportsListProps {
  selectedType: ReportType | 'all';
  dateRange: { start: string; end: string };
}

const mockReports: Report[] = [
  {
    id: '1',
    title: 'Q1 2024 Financial Statement',
    type: 'financial',
    date: '2024-03-31',
    size: '2.4MB',
    status: 'final'
  },
  {
    id: '2',
    title: 'Investment Portfolio Analysis',
    type: 'investment',
    date: '2024-03-15',
    size: '1.8MB',
    status: 'draft'
  },
  {
    id: '3',
    title: 'Risk Assessment Report',
    type: 'risk',
    date: '2024-03-10',
    size: '3.1MB',
    status: 'final'
  }
];

export default function ReportsList({ selectedType, dateRange }: ReportsListProps) {
  const filteredReports = mockReports.filter(report => {
    if (selectedType !== 'all' && report.type !== selectedType) return false;
    if (dateRange.start && report.date < dateRange.start) return false;
    if (dateRange.end && report.date > dateRange.end) return false;
    return true;
  });

  return (
    <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Rapport
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Type
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Statut
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Taille
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {filteredReports.map((report) => (
            <tr key={report.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {report.title}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {formatDate(report.date)}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <Badge variant="primary">
                  {report.type}
                </Badge>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <Badge variant={report.status === 'final' ? 'success' : 'warning'}>
                  {report.status}
                </Badge>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {report.size}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right">
                <ReportActions report={report} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
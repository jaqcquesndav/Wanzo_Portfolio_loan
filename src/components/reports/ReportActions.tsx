import React, { useState } from 'react';
import { Eye, Download, FileText, FileSpreadsheet } from 'lucide-react';
import { Button } from '../ui/Button';
import { ReportViewer } from './ReportViewer';
import { useReportDownload } from './hooks/useReportDownload';
import type { Report } from '../../types/reports';

interface ReportActionsProps {
  report: Report;
}

export function ReportActions({ report }: ReportActionsProps) {
  const [showViewer, setShowViewer] = useState(false);
  const { downloadReport, isDownloading } = useReportDownload();

  const handlePreview = () => {
    setShowViewer(true);
  };

  const handleDownload = async (format: 'pdf' | 'csv' | 'xlsx') => {
    await downloadReport(report.id, format);
  };

  return (
    <>
      <div className="flex space-x-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={handlePreview}
          icon={<Eye className="h-4 w-4" />}
        >
          Voir
        </Button>
        
        <div className="relative group">
          <Button
            variant="ghost"
            size="sm"
            loading={isDownloading}
            icon={<Download className="h-4 w-4" />}
          >
            Télécharger
          </Button>
          
          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
            <div className="py-1">
              <button
                onClick={() => handleDownload('pdf')}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <FileText className="h-4 w-4 mr-2" />
                PDF
              </button>
              <button
                onClick={() => handleDownload('xlsx')}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Excel
              </button>
              <button
                onClick={() => handleDownload('csv')}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <FileText className="h-4 w-4 mr-2" />
                CSV
              </button>
            </div>
          </div>
        </div>
      </div>

      {showViewer && (
        <ReportViewer
          report={report}
          onClose={() => setShowViewer(false)}
        />
      )}
    </>
  );
}
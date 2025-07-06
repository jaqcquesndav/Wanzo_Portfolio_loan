import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '../ui/Button';
import { getReportPreviewUrl } from '../../services/api/reports.api';
import type { Report } from '../../types/reports';

interface ReportViewerProps {
  report: Report;
  onClose: () => void;
}

export function ReportViewer({ report, onClose }: ReportViewerProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPreviewUrl = async () => {
      try {
        const url = await getReportPreviewUrl(report.id);
        setPreviewUrl(url);
      } catch (err) {
        setError('Erreur lors du chargement de l\'aperçu');
      }
    };

    loadPreviewUrl();
  }, [report.id]);

  const getViewerComponent = () => {
    if (error) {
      return (
        <div className="flex items-center justify-center h-full">
          <p className="text-red-500">{error}</p>
        </div>
      );
    }

    if (!previewUrl) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      );
    }

    if (report.type === 'financial') {
      return (
        <iframe
          src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(previewUrl)}`}
          className="w-full h-full border-0"
          title="Excel Viewer"
        />
      );
    }

    return (
      <iframe
        src={`${previewUrl}#toolbar=0`}
        className="w-full h-full border-0"
        title="PDF Viewer"
      />
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-5xl h-[80vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">
            {report.title}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            icon={<X className="h-5 w-5" />}
          />
        </div>
        
        <div className="flex-1 overflow-hidden">
          {getViewerComponent()}
        </div>
      </div>
    </div>
  );
}
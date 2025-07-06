import { useState } from 'react';
import { useNotification } from '../../../contexts/NotificationContext';
import { downloadReport as downloadReportApi } from '../../../services/api/reports.api';

export function useReportDownload() {
  const [isDownloading, setIsDownloading] = useState(false);
  const { showNotification } = useNotification();

  const downloadReport = async (reportId: string, format: 'pdf' | 'csv' | 'xlsx') => {
    setIsDownloading(true);
    try {
      await downloadReportApi(reportId, format);
      showNotification('Téléchargement réussi', 'success');
    } catch (error) {
      showNotification('Erreur lors du téléchargement', 'error');
    } finally {
      setIsDownloading(false);
    }
  };

  return {
    downloadReport,
    isDownloading
  };
}
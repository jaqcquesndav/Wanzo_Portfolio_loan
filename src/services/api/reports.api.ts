import { API_CONFIG } from '../../config/api';
import { apiClient } from './base.api';
import type { Report } from '../../types/reports';

export async function downloadReport(reportId: string, format: 'pdf' | 'csv' | 'xlsx'): Promise<void> {
  try {
    const response = await fetch(
      `${API_CONFIG.baseUrl}/reports/${reportId}/download?format=${format}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      }
    );

    if (!response.ok) {
      throw new Error('Erreur lors du téléchargement');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report-${reportId}.${format}`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (error) {
    console.error('Erreur lors du téléchargement:', error);
    throw error;
  }
}

export async function getReportPreviewUrl(reportId: string): Promise<string> {
  const response = await apiClient.get<{ url: string }>(`/reports/${reportId}/preview`);
  return response.url;
}

export async function getReport(reportId: string): Promise<Report> {
  return apiClient.get<Report>(`/reports/${reportId}`);
}
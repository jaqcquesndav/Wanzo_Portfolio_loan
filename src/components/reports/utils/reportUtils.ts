export async function downloadReport(reportId: string, format: 'pdf' | 'csv' | 'xlsx'): Promise<void> {
  try {
    // Dans un environnement réel, ceci serait un appel à votre API
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/reports/${reportId}/download?format=${format}`,
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
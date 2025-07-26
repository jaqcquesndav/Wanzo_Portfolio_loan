// src/utils/export.ts
import { utils, writeFile } from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { PaymentOrderData } from '../components/payment/PaymentOrderModal';

interface ExportToPDFProps {
  title: string;
  headers: string[];
  data: (string | number | null | undefined)[][];
  filename: string;
}

export const exportToExcel = (data: Record<string, unknown>[], fileName: string): void => {
  const ws = utils.json_to_sheet(data);
  const wb = utils.book_new();
  utils.book_append_sheet(wb, ws, 'Data');
  writeFile(wb, `${fileName}.xlsx`);
};

export const exportToPDF = ({ title, headers, data, filename }: ExportToPDFProps): void => {
  // Créer un nouveau document PDF au format A4
  const doc = new jsPDF({
    orientation: data[0]?.length > 4 ? 'landscape' : 'portrait', 
    unit: 'mm',
    format: 'a4'
  });
  
  // Variables pour la mise en page
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  
  // En-tête avec date et titre
  const currentDate = new Date().toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
  
  // Couleurs professionnelles
  const primaryColor: [number, number, number] = [25, 124, 168]; // Bleu Wanzo
  const secondaryColor: [number, number, number] = [80, 80, 80]; // Gris foncé
  const lightGrayColor: [number, number, number] = [150, 150, 150]; // Gris clair
  
  // Logo ou titre de l'institution
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('WANZO FINANCE', margin, margin);
  
  // Date à droite
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.text(`Généré le: ${currentDate}`, pageWidth - margin, margin, { align: 'right' });
  
  // Ligne de séparation
  doc.setLineWidth(0.5);
  doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.line(margin, margin + 5, pageWidth - margin, margin + 5);
  
  // Titre du document
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.text(title, pageWidth / 2, margin + 15, { align: 'center' });

  // Ensure data is an array of strings for autoTable
  const bodyData = data.map(row => 
    row.map(cell => (cell === null || cell === undefined ? '' : String(cell)))
  );

  // Configuration améliorée pour autoTable
  autoTable(doc, {
    head: [headers],
    body: bodyData,
    startY: margin + 25,
    margin: { top: margin, bottom: margin, left: margin, right: margin },
    theme: 'grid',
    styles: {
      fontSize: 9,
      cellPadding: 3,
      lineColor: [220, 220, 220],
      lineWidth: 0.1,
      font: 'helvetica',
      overflow: 'linebreak'
    },
    headStyles: { 
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center'
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245]
    },
    columnStyles: {},
    pageBreak: 'auto',
    rowPageBreak: 'avoid',
    showHead: 'everyPage',
    showFoot: 'everyPage',
    didDrawPage: () => {
      // Pied de page
      const footerY = pageHeight - 10;
      doc.setFontSize(8);
      doc.setTextColor(lightGrayColor[0], lightGrayColor[1], lightGrayColor[2]);
      doc.text(`${filename} - Wanzo Finance - Document généré automatiquement`, pageWidth / 2, footerY, { align: 'center' });
      
      // Pagination
      doc.text(`Page ${doc.getNumberOfPages()}`, pageWidth - margin, footerY, { align: 'right' });
    }
  });

  // Enregistrer le PDF
  doc.save(`${filename}.pdf`);
};

/**
 * Exporte un ordre de paiement au format PDF
 */
export const exportPaymentOrderToPDF = (data: PaymentOrderData) => {
  // TODO: Implement specialized PDF export for payment orders
  console.log('Export payment order to PDF', data);
  
  // Simuler un téléchargement après 1 seconde
  setTimeout(() => {
    alert(`Le PDF "${data.orderNumber}" serait téléchargé ici dans la version finale.`);
  }, 1000);
};

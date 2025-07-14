// src/utils/export.ts
import { utils, writeFile } from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

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
  const doc = new jsPDF();
  
  doc.text(title, 14, 15);

  // Ensure data is an array of strings for autoTable
  const bodyData = data.map(row => 
    row.map(cell => (cell === null || cell === undefined ? '' : String(cell)))
  );

  autoTable(doc, {
    head: [headers],
    body: bodyData,
    startY: 20,
    theme: 'grid',
    headStyles: { fillColor: [22, 160, 133] },
  });

  doc.save(filename);
};

/**
 * Exporte un ordre de paiement au format PDF
 */
// Importer le type depuis le composant PaymentOrderModal pour assurer la cohérence
import { PaymentOrderData } from '../components/payment/PaymentOrderModal';

// Type pour les ordres de paiement à exporter, étend PaymentOrderData
type PaymentOrderExport = PaymentOrderData;

export const exportPaymentOrderToPDF = (data: PaymentOrderExport) => {
  // TODO: Implement specialized PDF export for payment orders
  console.log('Export payment order to PDF', data);
  
  // Cette fonction sera implémentée avec une bibliothèque comme jsPDF ou PDF.js
  // pour générer un PDF bien formaté qui ressemble exactement au design du modal
  
  // Exemple de logique:
  // 1. Créer un nouveau document PDF
  // 2. Ajouter l'en-tête Wanzo et le titre "ORDRE DE PAIEMENT"
  // 3. Ajouter les informations du gestionnaire
  // 4. Ajouter les informations du bénéficiaire
  // 5. Ajouter les montants, motifs et références
  // 6. Ajouter les avertissements et zones de signature
  // 7. Générer le QR code et l'ajouter
  // 8. Enregistrer ou ouvrir le PDF
  
  // Simuler un téléchargement après 1 seconde
  setTimeout(() => {
    alert(`Le PDF "${data.orderNumber}" serait téléchargé ici dans la version finale.`);
  }, 1000);
};

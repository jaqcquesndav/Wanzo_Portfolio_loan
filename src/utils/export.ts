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

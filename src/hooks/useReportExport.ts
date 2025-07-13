// src/hooks/useReportExport.ts
import { useCallback } from 'react';
import { utils, writeFile } from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface UseReportExportProps<T> {
  data: T[];
  columns: { header: string; accessorKey: string; format?: string }[];
  filename: string;
  title: string;
}

export const useReportExport = <T>({ 
  data, 
  columns, 
  filename, 
  title 
}: UseReportExportProps<T>) => {

  // Helper function for value formatting
  const formatValue = useCallback((value: unknown, format?: string): unknown => {
    if (value === null || value === undefined) return '';
    
    switch (format) {
      case 'currency':
        return typeof value === 'number' 
          ? new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(value)
          : value;
          
      case 'percentage':
        return typeof value === 'number'
          ? `${value.toFixed(2)}%`
          : value;
          
      case 'date':
        if (value instanceof Date || typeof value === 'string') {
          try {
            const date = value instanceof Date ? value : new Date(value);
            return date.toLocaleDateString('fr-FR');
          } catch {
            return value;
          }
        }
        return value;
        
      case 'number':
        return typeof value === 'number'
          ? value.toLocaleString('fr-FR')
          : value;
          
      case 'boolean':
        return value === true ? 'Oui' : value === false ? 'Non' : value;
        
      default:
        return value;
    }
  }, []);

  // Export to Excel
  const exportToExcel = useCallback((exportData: T[], exportColumns: typeof columns, exportFilename: string) => {
    // Format the data for Excel
    const formattedData = exportData.map(row => {
      const newRow: Record<string, unknown> = {};
      exportColumns.forEach(column => {
        const key = column.accessorKey as keyof T;
        const value = row[key];
        newRow[column.header] = formatValue(value, column.format);
      });
      return newRow;
    });

    // Create and save the Excel file
    const ws = utils.json_to_sheet(formattedData);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, 'Data');
    writeFile(wb, `${exportFilename}.xlsx`);
  }, [formatValue]);

  // Export to PDF
  const exportToPDF = useCallback((exportData: T[], exportColumns: typeof columns, exportTitle: string, exportFilename: string) => {
    // Create PDF document
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(16);
    doc.text(exportTitle, 14, 20);
    
    // Format the data for PDF
    const headers = exportColumns.map(col => col.header);
    const rows = exportData.map(row => {
      return exportColumns.map(column => {
        const key = column.accessorKey as keyof T;
        const value = row[key];
        const formattedValue = formatValue(value, column.format);
        // Convert to string to ensure compatibility with jspdf-autotable
        return String(formattedValue ?? '');
      });
    });
    
    // Create the table
    autoTable(doc, {
      head: [headers],
      body: rows,
      startY: 30,
    });
    
    // Save the PDF file
    doc.save(`${exportFilename}.pdf`);
  }, [formatValue]);

  // Export to CSV
  const exportToCSV = useCallback((exportData: T[], exportColumns: typeof columns, exportFilename: string) => {
    // Prepare headers and rows
    const headers = exportColumns.map(col => col.header);
    const csvRows = [headers.join(',')];
    
    // Process each data row
    for (const row of exportData) {
      const values = exportColumns.map(column => {
        const key = column.accessorKey as keyof T;
        const value = row[key];
        const formattedValue = formatValue(value, column.format);
        
        // Escape commas in string values
        return typeof formattedValue === 'string' && formattedValue.includes(',') 
          ? `"${formattedValue}"`
          : formattedValue;
      });
      csvRows.push(values.join(','));
    }
    
    // Create and download the CSV file
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${exportFilename}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }, [formatValue]);
  
  // Main export handler function
  const handleExport = useCallback((format: 'excel' | 'pdf' | 'csv') => {
    if (!data || data.length === 0) {
      console.warn('No data to export');
      return;
    }

    switch (format) {
      case 'excel':
        exportToExcel(data, columns, filename);
        break;
      case 'pdf':
        exportToPDF(data, columns, title, filename);
        break;
      case 'csv':
        exportToCSV(data, columns, filename);
        break;
      default:
        console.warn(`Unsupported export format: ${format}`);
    }
  }, [data, columns, filename, title, exportToExcel, exportToPDF, exportToCSV]);

  return { handleExport };
};

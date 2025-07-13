// src/types/export.d.ts
declare module '*/utils/export' {
  export function exportToExcel(data: Record<string, unknown>[], fileName: string): void;
  
  export interface PDFExportOptions {
    title: string;
    headers: string[];
    data: (string | number | null | undefined)[][];
    filename: string;
  }
  
  export function exportToPDF(options: PDFExportOptions): void;
}

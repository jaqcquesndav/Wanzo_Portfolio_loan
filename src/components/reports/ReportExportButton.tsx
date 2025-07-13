// src/components/reports/ReportExportButton.tsx
import React from 'react';
import { Button } from '../ui/Button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/DropdownMenu';
import { FileSpreadsheet, FileText, FileType2, Printer } from 'lucide-react';

interface ReportExportButtonProps {
  onExport: (format: 'excel' | 'pdf' | 'csv') => void;
  className?: string;
  disabled?: boolean;
}

export const ReportExportButton: React.FC<ReportExportButtonProps> = ({ 
  onExport, 
  className,
  disabled = false 
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className={className}
          disabled={disabled}
        >
          <Printer className="mr-2 h-4 w-4" />
          Exporter
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem 
          onClick={() => onExport('excel')}
          className="cursor-pointer flex items-center"
          disabled={disabled}
        >
          <FileSpreadsheet className="mr-2 h-4 w-4 text-green-600" />
          Excel (.xlsx)
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => onExport('pdf')}
          className="cursor-pointer flex items-center"
          disabled={disabled}
        >
          <FileText className="mr-2 h-4 w-4 text-red-600" />
          PDF (.pdf)
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => onExport('csv')}
          className="cursor-pointer flex items-center"
          disabled={disabled}
        >
          <FileType2 className="mr-2 h-4 w-4 text-blue-600" />
          CSV (.csv)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

import { Table, TableHead, TableBody, TableRow, TableCell, TableHeader } from './Table';

interface TableLoadingProps {
  rows?: number;
  columns?: number;
  headers?: string[];
  className?: string;
  showSpinner?: boolean;
}

export function TableLoading({ 
  rows = 5, 
  columns = 3, 
  headers = [], 
  className = '',
  showSpinner = true 
}: TableLoadingProps) {
  return (
    <div className="w-full">
      <Table className={className}>
        {headers.length > 0 && (
          <TableHead>
            <TableRow>
              {headers.map((header, index) => (
                <TableHeader key={index}>
                  {header}
                </TableHeader>
              ))}
            </TableRow>
          </TableHead>
        )}
        <TableBody>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <TableRow key={rowIndex}>
              {Array.from({ length: headers.length || columns }).map((_, colIndex) => (
                <TableCell key={colIndex}>
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                  </div>
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      {showSpinner && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
            Chargement des données...
          </span>
        </div>
      )}
    </div>
  );
}

export default TableLoading;

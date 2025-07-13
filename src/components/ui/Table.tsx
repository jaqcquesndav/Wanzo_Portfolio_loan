

interface TableProps {
  children: React.ReactNode;
  className?: string;
}

export function Table({ children, className = '' }: TableProps) {
  return (
    <table className={`min-w-full divide-y divide-gray-200 ${className}`}>
      {children}
    </table>
  );
}

export function TableHead({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return (
    <thead className={`bg-gray-50 ${className}`}>
      {children}
    </thead>
  );
}

export function TableBody({ children }: { children: React.ReactNode }) {
  return (
    <tbody className="bg-white divide-y divide-gray-200">
      {children}
    </tbody>
  );
}




type TableRowProps = {
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLTableRowElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLTableRowElement>) => void;
  tabIndex?: number;
  ariaLabel?: string;
  style?: React.CSSProperties;
  className?: string;
};

export function TableRow({ children, onClick, onKeyDown, tabIndex, ariaLabel, style, className = '' }: TableRowProps) {
  return (
    <tr
      className={`${onClick ? 'hover:bg-gray-50 cursor-pointer' : ''} ${className}`}
      onClick={onClick}
      onKeyDown={onKeyDown}
      tabIndex={tabIndex}
      aria-label={ariaLabel}
      style={style}
    >
      {children}
    </tr>
  );
}

export function TableHeader({ children, align = 'left', className = '' }: { children: React.ReactNode; align?: 'left' | 'right' | 'center', className?: string }) {
  return (
    <th className={`px-6 py-3 text-${align} text-xs font-medium text-gray-500 uppercase tracking-wider ${className}`}>
      {children}
    </th>
  );
}

export function TableCell({ children, align = 'left', className = '', colSpan }: { children: React.ReactNode; align?: 'left' | 'right' | 'center', className?: string, colSpan?: number }) {
  return (
    <td className={`px-6 py-4 whitespace-nowrap text-${align} ${className}`} colSpan={colSpan}>
      {children}
    </td>
  );
}
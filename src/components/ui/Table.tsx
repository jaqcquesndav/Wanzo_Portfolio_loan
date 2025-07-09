

interface TableProps {
  children: React.ReactNode;
  className?: string;
}

export function Table({ children, className = '' }: TableProps) {
  return (
    <div className={`bg-white shadow overflow-hidden sm:rounded-lg ${className}`}>
      <table className="min-w-full divide-y divide-gray-200">
        {children}
      </table>
    </div>
  );
}

export function TableHead({ children }: { children: React.ReactNode }) {
  return (
    <thead className="bg-gray-50">
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
};

export function TableRow({ children, onClick, onKeyDown, tabIndex, ariaLabel, style }: TableRowProps) {
  return (
    <tr
      className={`${onClick ? 'hover:bg-gray-50 cursor-pointer' : ''}`}
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

export function TableHeader({ children, align = 'left' }: { children: React.ReactNode; align?: 'left' | 'right' | 'center' }) {
  return (
    <th className={`px-6 py-3 text-${align} text-xs font-medium text-gray-500 uppercase tracking-wider`}>
      {children}
    </th>
  );
}

export function TableCell({ children, align = 'left' }: { children: React.ReactNode; align?: 'left' | 'right' | 'center' }) {
  return (
    <td className={`px-6 py-4 whitespace-nowrap text-${align}`}>
      {children}
    </td>
  );
}
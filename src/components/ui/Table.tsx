import React from 'react';

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

export function TableRow({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <tr 
      className={`${onClick ? 'hover:bg-gray-50 cursor-pointer' : ''}`}
      onClick={onClick}
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
import React from 'react';
import { Link } from 'react-router-dom';

export interface BreadcrumbItem {
  label: string;
  to?: string;
}

export const Breadcrumbs: React.FC<{ items: BreadcrumbItem[] }> = ({ items }) => (
  <nav className="text-sm mb-4" aria-label="breadcrumb">
    <ol className="flex space-x-2">
      {items.map((item, idx) => (
        <li key={idx} className="flex items-center">
          {item.to ? (
            <Link to={item.to} className="text-blue-600 hover:underline">
              {item.label}
            </Link>
          ) : (
            <span className="text-gray-500">{item.label}</span>
          )}
          {idx < items.length - 1 && <span className="mx-2">/</span>}
        </li>
      ))}
    </ol>
  </nav>
);

import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="flex" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-4">
        <li>
          {/* Use /app/:portfolioType/dashboard if possible */}
          <Link to={items[0]?.href?.includes('/app/') ? items[0].href.split('/').slice(0, 3).join('/') + '/dashboard' : '/dashboard'} className="text-gray-400 hover:text-gray-500">
            <Home className="h-5 w-5" />
          </Link>
        </li>
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            <ChevronRight className="h-5 w-5 text-gray-400" />
            {item.href ? (
              <Link
                to={item.href}
                className="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700"
              >
                {item.label}
              </Link>
            ) : (
              <span className="ml-4 text-sm font-medium text-gray-700">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
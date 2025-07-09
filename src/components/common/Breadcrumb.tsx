// import React from 'react'; // (not needed in modern React)
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}


interface BreadcrumbProps {
  items: BreadcrumbItem[];
  portfolioType?: string;
}

export function Breadcrumb({ items, portfolioType }: BreadcrumbProps) {
  // Génère le lien dashboard correct selon le portfolioType
  let dashboardHref = '/dashboard';
  if (portfolioType) {
    dashboardHref = `/app/${portfolioType}`;
  } else if (items[0]?.href?.includes('/app/')) {
    // fallback: extrait le portfolioType du href
    const parts = items[0].href.split('/');
    if (parts[2]) {
      dashboardHref = `/app/${parts[2]}`;
    }
  }
  return (
    <nav className="flex" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-4">
        <li>
          <Link to={dashboardHref} className="text-gray-400 hover:text-gray-500">
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
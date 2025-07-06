// import React from 'react';
import { NavLink, useParams } from 'react-router-dom';
import { X, BarChart2 } from 'lucide-react';
import { SidebarPortfolios } from './SidebarPortfolios';
import { Button } from '../ui/Button';
import { navigation } from '../../config/navigation';
import { usePortfolioContext } from '../../contexts/usePortfolioContext';
// import { ROLE_PERMISSIONS } from '../../constants/auth';
interface DynamicSidebarProps {
  onClose?: () => void;
}

// TODO: Replace with real user/institution/permissions from Auth0 token or context
const demoUser = {
  id: 'demo-user',
  role: 'user',
  email: 'demo@user.com',
};
const demoInstitution = {
  id: 'demo-inst',
  name: 'Institution Démo',
};

export function DynamicSidebar({ onClose }: DynamicSidebarProps) {
  // Replace with real user/institution from Auth0 or context
  const user = demoUser;
  const institution = demoInstitution;
  const { portfolioType } = useParams();
  const { portfolioType: contextPortfolioType, currentPortfolioId } = usePortfolioContext();

  if (!user) return null;
  // Prend le type de portefeuille de l'URL ou du contexte
  const currentPortfolio = portfolioType || contextPortfolioType;

  // Permissions logic can be re-implemented here if needed
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const hasPermission = (..._args: unknown[]) => { return true; } // always allow for now

  return (
    <div className="h-full flex flex-col bg-primary dark:bg-primary">
      {/* Header */}
      <div className="p-4 border-b border-primary-dark">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <BarChart2 className="h-8 w-8 text-white" />
            <div className="ml-2">
              <h1 className="text-lg font-semibold text-white">
                FinanceFlow
              </h1>
              {institution && (
                <p className="text-sm text-primary-light">
                  {institution.name}
                </p>
              )}
            </div>
          </div>
          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              icon={<X className="h-5 w-5 text-white" />}
              className="lg:hidden hover:bg-primary-dark"
            />
          )}
        </div>
      </div>

      {/* Navigation PRINCIPAL en haut */}
      <nav className="p-4 pb-2">
        {Object.entries(navigation).filter(([key]) => key === 'main').map(([key, section]) => {
          let filteredItems = section.items.slice();
          filteredItems = filteredItems.filter(item => {
            if (item.href === '/central-risque' || item.href === '/prospection') {
              return true;
            }
            if (item.href.startsWith('/portfolios/')) {
              const typeInHref = item.href.split('/')[2];
              return typeInHref === currentPortfolio;
            }
            return true;
          });
          filteredItems = filteredItems.filter(item => {
            if ('permissions' in item && Array.isArray(item.permissions)) {
              return hasPermission(item.permissions);
            }
            return hasPermission();
          });
          if (filteredItems.length === 0) return null;
          return (
            <div key={key}>
              <h3 className="px-3 text-xs font-semibold text-primary-light uppercase tracking-wider">
                {section.label}
              </h3>
              <div className="mt-2 space-y-1">
                {filteredItems.map(item => {
                  let to: string = item.href;
                  if (item.href.startsWith('/portfolios/')) {
                    const type = item.href.split('/')[2];
                    if (type === currentPortfolio) {
                      if (currentPortfolioId) {
                        to = `/app/${type}/${currentPortfolioId}`;
                      } else {
                        to = `/app/${type}`;
                      }
                    }
                  }
                  return (
                    <NavLink
                      key={item.name}
                      to={to}
                      onClick={onClose}
                      className={({ isActive }) => `
                        flex items-center px-3 py-2 text-sm font-medium rounded-md
                        transition-colors duration-200
                        will-change-auto
                        ${isActive
                          ? 'bg-primary-dark text-white'
                          : 'text-primary-light hover:bg-primary-dark hover:text-white'
                        }
                      `}
                      style={{ transition: 'background-color 0.2s, color 0.2s' }}
                    >
                      <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                      <span className="truncate">{item.name}</span>
                    </NavLink>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* Menu Portefeuille moderne avec drag & drop, bouton +, et menu contextuel */}
      <div className="p-4 pb-2">
        <SidebarPortfolios />
      </div>

      {/* Navigation autres menus (hors PRINCIPAL) + ADMINISTRATION/AIDE toujours visibles */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-6">
        {Object.entries(navigation)
          .filter(([key]) => key !== 'main')
          .map(([key, section]) => {
            // ADMINISTRATION and AIDE menus must always be visible, regardless of portfolio type
            // Central de risque and Prospection must always be visible, regardless of portfolio type
            let filteredItems = section.items.slice();
            filteredItems = filteredItems.filter(item => {
              // Always show Central de risque, Prospection, ADMINISTRATION, and AIDE
              if (
                item.href === '/central-risque' ||
                item.href === '/prospection' ||
                key.toLowerCase().includes('administration') ||
                key.toLowerCase().includes('aide') ||
                key.toLowerCase().includes('help')
              ) {
                return true;
              }
              // Portfolio-specific menus (if any) can be filtered by type
              if (item.href.startsWith('/portfolios/')) {
                const typeInHref = item.href.split('/')[2];
                return typeInHref === currentPortfolio;
              }
              return true;
            });
            filteredItems = filteredItems.filter(item => {
              // Only pass permissions array if it exists and is an array
              if ('permissions' in item && Array.isArray(item.permissions)) {
                return hasPermission(item.permissions);
              }
              return hasPermission();
            });
            if (filteredItems.length === 0) return null;
            return (
              <div key={key}>
                <h3 className="px-3 text-xs font-semibold text-primary-light uppercase tracking-wider">
                  {section.label}
                </h3>
                <div className="mt-2 space-y-1">
                  {filteredItems.map(item => {
                    let to: string = item.href;
                    // Modern, type-safe navigation: if href is a portfolio root, link to current portfolio details if available
                    if (item.href.startsWith('/portfolios/')) {
                      const type = item.href.split('/')[2];
                      if (type === currentPortfolio) {
                        if (currentPortfolioId) {
                          to = `/app/${type}/${currentPortfolioId}`;
                        } else {
                          to = `/app/${type}`;
                        }
                      }
                    }
                    return (
                      <NavLink
                        key={item.name}
                        to={to}
                        onClick={onClose}
                        className={({ isActive }) => `
                          flex items-center px-3 py-2 text-sm font-medium rounded-md
                          transition-colors duration-200
                          will-change-auto
                          ${isActive
                            ? 'bg-primary-dark text-white'
                            : 'text-primary-light hover:bg-primary-dark hover:text-white'
                          }
                        `}
                        style={{ transition: 'background-color 0.2s, color 0.2s' }}
                      >
                        <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                        <span className="truncate">{item.name}</span>
                      </NavLink>
                    );
                  })}
                </div>
              </div>
            );
          })}
      </nav>
    </div>
  );
}
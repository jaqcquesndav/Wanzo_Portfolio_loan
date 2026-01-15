import { NavLink, useParams, useLocation } from 'react-router-dom';
import { X, BarChart2, Briefcase } from 'lucide-react';
import { SidebarPortfolios } from './SidebarPortfolios';
import { Button } from '../ui/Button';
import { navigation } from '../../config/navigation';
import { usePortfolioContext } from '../../contexts/usePortfolioContext';
import { usePrefetchOnHover } from '../../hooks/useRoutePrefetch';

interface DynamicSidebarProps {
  onClose?: () => void;
  collapsed?: boolean;
}

// TODO: Replace with real user/institution/permissions from Auth0 token or context
const demoUser = {
  id: 'demo-user',
  role: 'user',
  email: 'demo@user.com',
};

export function DynamicSidebar({ onClose, collapsed = false }: DynamicSidebarProps) {
  const user = demoUser;
  const { portfolioType } = useParams();
  const { portfolioType: contextPortfolioType, currentPortfolioId } = usePortfolioContext();
  const location = useLocation();
  
  const currentPortfolio = portfolioType || contextPortfolioType;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const hasPermission = (..._args: unknown[]) => true;

  // Vérifie si un item de navigation est actif
  const isNavItemActive = (itemHref: string, to: string) => {
    const currentPath = location.pathname;
    if (itemHref === '/dashboard' && currentPath === `/app/${currentPortfolio}`) return true;
    if (to === currentPath) return true;
    if (currentPath.startsWith(to + '/')) return true;
    return false;
  };

  // Génère l'URL de destination pour un item
  const getItemPath = (href: string): string => {
    if (href === '/dashboard' && currentPortfolio) {
      return `/app/${currentPortfolio}`;
    }
    if (['/prospection', '/central-risque', '/reports'].includes(href) && currentPortfolio) {
      return `/app/${currentPortfolio}${href}`;
    }
    if (href.startsWith('/portfolios/')) {
      const type = href.split('/')[2];
      if (type === currentPortfolio) {
        return currentPortfolioId 
          ? `/app/${type}/${type}/${currentPortfolioId}`
          : `/app/${type}`;
      }
    }
    return href;
  };

  // Filtre les items selon le portefeuille et les permissions
  const filterItems = (items: typeof navigation.main.items, sectionKey: string) => {
    return items.filter(item => {
      if (['/central-risque', '/prospection'].includes(item.href)) return true;
      if (['administration', 'aide', 'help'].some(k => sectionKey.toLowerCase().includes(k))) return true;
      if (item.href.startsWith('/portfolios/')) {
        return item.href.split('/')[2] === currentPortfolio;
      }
      return true;
    }).filter(item => {
      if ('permissions' in item && Array.isArray(item.permissions)) {
        return hasPermission(item.permissions);
      }
      return true;
    });
  };

  // Hook pour précharger les pages au survol
  const prefetchOnHover = usePrefetchOnHover();

  // Composant NavItem réutilisable
  const NavItem = ({ item, to, isActive }: { 
    item: typeof navigation.main.items[0]; 
    to: string; 
    isActive: boolean;
  }) => (
    <NavLink
      to={to}
      onClick={() => {
        if (currentPortfolio) localStorage.setItem('portfolioType', currentPortfolio);
        onClose?.();
      }}
      onMouseEnter={() => prefetchOnHover(to)}
      title={collapsed ? item.name : undefined}
      className={`
        flex items-center ${collapsed ? 'justify-center px-2' : 'px-3'} 
        py-2 text-sm font-medium rounded-md transition-colors
        ${isActive
          ? 'bg-primary-dark/80 text-white'
          : 'text-primary-light hover:bg-primary-dark/50 hover:text-white'
        }
      `}
    >
      <item.icon className={`h-5 w-5 flex-shrink-0 ${collapsed ? '' : 'mr-3'}`} />
      {!collapsed && <span className="truncate">{item.name}</span>}
    </NavLink>
  );

  // Titre de section ou séparateur en mode collapsed
  const SectionTitle = ({ title }: { title: string }) => (
    collapsed 
      ? <div className="border-t border-primary-light/20 my-2 mx-2" />
      : <h3 className="px-3 text-xs font-semibold text-primary-light/70 uppercase tracking-wider mb-1">{title}</h3>
  );

  if (!user) return null;

  return (
    <div 
      className={`
        h-full flex flex-col bg-primary dark:bg-gray-800 
        border-r-2 border-primary-dark
        overflow-hidden overflow-y-auto
        ${collapsed ? 'w-16' : 'w-60'}
      `}
      style={{
        transition: 'width 0.2s ease-out',
        willChange: 'width',
        contain: 'layout',
      }}
    >
      {/* Header */}
      <div className={`flex-shrink-0 border-b border-primary-dark/30 ${collapsed ? 'p-2' : 'px-4 py-3'}`}>
        <div className="flex items-center justify-between">
          <NavLink 
            to={`/app/${currentPortfolio || 'traditional'}`} 
            onClick={() => {
              if (currentPortfolio) localStorage.setItem('portfolioType', currentPortfolio);
              onClose?.();
            }}
            className={`flex items-center ${collapsed ? 'justify-center w-full' : ''}`}
            title={collapsed ? 'Wanzo' : undefined}
          >
            <BarChart2 className={`text-white ${collapsed ? 'h-7 w-7' : 'h-6 w-6'}`} />
            {!collapsed && (
              <span className="ml-2 text-lg font-semibold text-white">Wanzo</span>
            )}
          </NavLink>
          
          {onClose && !collapsed && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              icon={<X className="h-4 w-4 text-white" />}
              className="lg:hidden hover:bg-primary-dark/50"
            />
          )}
        </div>
      </div>

      {/* Navigation principale */}
      <nav className={`flex-shrink-0 ${collapsed ? 'p-2' : 'p-3'}`}>
        {Object.entries(navigation)
          .filter(([key]) => key === 'main')
          .map(([key, section]) => {
            const items = filterItems(section.items, key);
            if (items.length === 0) return null;
            
            return (
              <div key={key}>
                <SectionTitle title={section.label} />
                <div className="space-y-0.5">
                  {items.map(item => {
                    const to = getItemPath(item.href);
                    return (
                      <NavItem 
                        key={item.name} 
                        item={item} 
                        to={to} 
                        isActive={isNavItemActive(item.href, to)} 
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
      </nav>

      {/* Portefeuilles */}
      <div className={`flex-shrink-0 ${collapsed ? 'p-2' : 'px-3 pb-2'}`}>
        {collapsed ? (
          <NavLink
            to={`/app/${currentPortfolio || 'traditional'}`}
            className="flex items-center justify-center p-2 rounded-md text-primary-light hover:bg-primary-dark/50 hover:text-white transition-colors"
            title="Portefeuilles"
          >
            <Briefcase className="h-5 w-5" />
          </NavLink>
        ) : (
          <SidebarPortfolios />
        )}
      </div>

      {/* Navigation secondaire (scrollable) */}
      <nav className={`flex-1 overflow-y-auto ${collapsed ? 'p-2' : 'p-3'} space-y-3`}>
        {Object.entries(navigation)
          .filter(([key]) => key !== 'main')
          .map(([key, section]) => {
            const items = filterItems(section.items, key);
            if (items.length === 0) return null;
            
            return (
              <div key={key}>
                <SectionTitle title={section.label} />
                <div className="space-y-0.5">
                  {items.map(item => {
                    const to = getItemPath(item.href);
                    const isActive = location.pathname === to || location.pathname.startsWith(to + '/');
                    return (
                      <NavItem 
                        key={item.name} 
                        item={item} 
                        to={to} 
                        isActive={isActive} 
                      />
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
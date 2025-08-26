import { NavLink, useParams, useLocation } from 'react-router-dom';
import { X, BarChart2 } from 'lucide-react';
import { useRef, useEffect, useState } from 'react';
import { SidebarPortfolios } from './SidebarPortfolios';
import { Button } from '../ui/Button';
import { navigation } from '../../config/navigation';
import { usePortfolioContext } from '../../contexts/usePortfolioContext';

interface DynamicSidebarProps {
  onClose?: () => void;
  onWidthChange?: (width: number) => void;
  initialWidth?: number;
}

// TODO: Replace with real user/institution/permissions from Auth0 token or context
const demoUser = {
  id: 'demo-user',
  role: 'user',
  email: 'demo@user.com',
};

export function DynamicSidebar({ onClose, onWidthChange, initialWidth = 250 }: DynamicSidebarProps) {
  // Replace with real user/institution from Auth0 or context
  const user = demoUser;
  // const institution = demoInstitution; // Remove institution from sidebar
  const { portfolioType } = useParams();
  const { portfolioType: contextPortfolioType, currentPortfolioId } = usePortfolioContext();
  const location = useLocation();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const resizerRef = useRef<HTMLDivElement>(null);
  
  // État pour suivre si le sidebar est en mode compact (icônes seulement)
  const [isCompact, setIsCompact] = useState(initialWidth ? initialWidth < 180 : false);

  useEffect(() => {
    const sidebar = sidebarRef.current;
    const resizer = resizerRef.current;
    
    if (!sidebar || !resizer) return;
    
    // Apply initial width if provided
    if (initialWidth && initialWidth >= 72 && initialWidth <= 350) {
      sidebar.style.width = `${initialWidth}px`;
      
      // Initialiser le mode compact si nécessaire
      const isInitiallyCompact = initialWidth < 200;
      setIsCompact(isInitiallyCompact);
      sidebar.classList.toggle('compact-sidebar', isInitiallyCompact);
    }
    
    let startX = 0;
    let startWidth = 0;
    
    // Ensure cleanup happens if component unmounts during resize
    const cleanupResizing = () => {
      document.body.style.removeProperty('cursor');
      document.body.classList.remove('resize-cursor');
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
    
    const onMouseDown = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      startX = e.clientX;
      startWidth = parseInt(document.defaultView?.getComputedStyle(sidebar).width || '0', 10);
      document.body.style.cursor = 'ew-resize';
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    };
    
    const onMouseMove = (e: MouseEvent) => {
      if (!sidebar) return;
      
      const width = startWidth + e.clientX - startX;
      
      // Limites de redimensionnement: minimum 64px (icônes), maximum 320px
      if (width >= 72 && width <= 350) {
        sidebar.style.width = `${width}px`;
        
        // Déterminer si nous sommes en mode compact (icônes seulement)
        const newCompactState = width < 200;
        if (newCompactState !== isCompact) {
          setIsCompact(newCompactState);
          sidebar.classList.toggle('compact-sidebar', newCompactState);
        }
        
        // Notify parent component of width change
        if (onWidthChange) {
          onWidthChange(width);
        }
      }
    };
    
    const onMouseUp = () => {
      cleanupResizing();
    };
    
    resizer.addEventListener('mousedown', onMouseDown);
    
    return () => {
      resizer.removeEventListener('mousedown', onMouseDown);
      cleanupResizing();
    };
  }, [initialWidth, onWidthChange, isCompact, setIsCompact]);

  if (!user) return null;
  // Prend le type de portefeuille de l'URL ou du contexte
  const currentPortfolio = portfolioType || contextPortfolioType;

  // Permissions logic can be re-implemented here if needed
  // Function to determine if a navigation item is active
  const isNavItemActive = (itemHref: string, to: string) => {
    const currentPath = location.pathname;
    
    // Special case for dashboard - consider active if on main app route
    if (itemHref === '/dashboard' && currentPath === `/app/${currentPortfolio}`) {
      return true;
    }
    
    // For other routes, check if current path starts with the 'to' path
    if (to === currentPath) {
      return true;
    }
    
    // Check if we're on a sub-route of the nav item
    if (currentPath.startsWith(to + '/')) {
      return true;
    }
    
    return false;
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const hasPermission = (..._args: unknown[]) => { return true; } // always allow for now

  return (
    <div 
      ref={sidebarRef}
      className="h-full flex flex-col bg-primary dark:bg-gray-800 overflow-hidden relative min-w-[72px] max-w-[350px] transition-all duration-200 border-r border-primary-dark dark:border-gray-700"
    >
      {/* Resizer handle */}
      <div 
        ref={resizerRef}
        className="absolute top-0 right-0 h-full w-3 cursor-ew-resize z-50 hover:bg-primary-dark/30 transition-colors sidebar-resizer"
        title="Redimensionner le panneau latéral"
      >
        {/* Visual indicator for the resizer */}
        <div className="h-full w-[1px] bg-primary-dark/50 absolute left-1/2 transform -translate-x-1/2 resizer-indicator"></div>
      </div>
      
      {/* Toggle button for compact mode - positioned at the bottom */}
      <div 
        className="absolute bottom-4 right-[-6px] z-50 bg-primary-dark hover:bg-primary rounded-full p-4 cursor-pointer shadow-lg border border-primary-dark/30 sidebar-toggle-btn"
        onClick={() => {
          const sidebar = sidebarRef.current;
          if (!sidebar) return;
          
          const newWidth = isCompact ? 250 : 72;
          const newCompactState = !isCompact;
          
          sidebar.style.width = `${newWidth}px`;
          setIsCompact(newCompactState);
          sidebar.classList.toggle('compact-sidebar', newCompactState);
          
          if (onWidthChange) {
            onWidthChange(newWidth);
          }
        }}
        title={isCompact ? "Développer" : "Réduire"}
      >
        {isCompact ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M15 10a.75.75 0 01-.75.75H7.612l2.158 1.96a.75.75 0 11-1.04 1.08l-3.5-3.25a.75.75 0 010-1.08l3.5-3.25a.75.75 0 111.04 1.08L7.612 9.25h6.638A.75.75 0 0115 10z" clipRule="evenodd" />
          </svg>
        )}
      </div>
      
      {/* Header */}
      <div className="p-4 border-b border-primary-dark dark:border-gray-700">
        <div className="flex items-center justify-between">
          <NavLink 
            to={`/app/${currentPortfolio || 'traditional'}`} 
            onClick={() => {
              if (currentPortfolio) {
                localStorage.setItem('portfolioType', currentPortfolio);
              }
              if (onClose) onClose();
            }}
            className="flex items-center"
          >
            <BarChart2 className="h-7 w-7 text-white dark:text-gray-200" />
            <div className="ml-3 sidebar-brand-text">
              <h1 className="text-lg font-semibold text-white dark:text-gray-200">
                Wanzo
              </h1>
            </div>
          </NavLink>
          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              icon={<X className="h-4 w-4 text-white dark:text-gray-200" />}
              className="lg:hidden hover:bg-primary-dark/60 dark:hover:bg-gray-700"
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
              <h3 className="px-3 text-sm font-semibold text-primary-light dark:text-gray-400 uppercase tracking-wider sidebar-label mb-2">
                {section.label}
              </h3>
              <div className="mt-2 space-y-1">
                {filteredItems.map(item => {
                  let to: string = item.href;
                  // Pour le Dashboard, utiliser directement le type de portefeuille actuel
                  if (item.href === '/dashboard' && currentPortfolio) {
                    to = `/app/${currentPortfolio}`;
                  }
                  // Pour la Prospection, Central de risque et Reporting, utiliser le type de portefeuille actuel
                  else if ((item.href === '/prospection' || item.href === '/central-risque' || item.href === '/reports') && currentPortfolio) {
                    to = `/app/${currentPortfolio}${item.href}`;
                  }
                  // Pour les liens de portefeuille
                  else if (item.href.startsWith('/portfolios/')) {
                    const type = item.href.split('/')[2];
                    if (type === currentPortfolio) {
                      if (currentPortfolioId) {
                        to = `/app/${type}/${type}/${currentPortfolioId}`;
                      } else {
                        to = `/app/${type}`;
                      }
                    }
                  }
                  const isActive = isNavItemActive(item.href, to);
                  return (
                    <NavLink
                      key={item.name}
                      to={to}
                      onClick={() => {
                        // Toujours stocker le type de portefeuille actuel
                        if (currentPortfolio) {
                          localStorage.setItem('portfolioType', currentPortfolio);
                        }
                        if (onClose) onClose();
                      }}
                      className={`
                        flex items-center px-4 py-2.5 text-base font-medium rounded-md
                        transition-colors duration-200
                        will-change-auto
                        ${isActive
                          ? 'bg-primary-dark/80 dark:bg-gray-700 text-white shadow-sm'
                          : 'text-primary-light dark:text-gray-300 hover:bg-primary-dark/60 dark:hover:bg-gray-700 hover:text-white'
                        }
                      `}
                      style={{ transition: 'background-color 0.2s, color 0.2s' }}
                    >
                      <item.icon className="mr-3 h-6 w-6 flex-shrink-0" />
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
                <h3 className="px-3 text-sm font-semibold text-primary-light uppercase tracking-wider sidebar-label mb-2">
                  {section.label}
                </h3>
                <div className="mt-2 space-y-1">
                  {filteredItems.map(item => {
                    let to: string = item.href;
                    // Pour le Dashboard, utiliser directement le type de portefeuille actuel
                    if (item.href === '/dashboard' && currentPortfolio) {
                      to = `/app/${currentPortfolio}`;
                    }
                    // Pour la Prospection, Central de risque et Reporting, utiliser le type de portefeuille actuel
                    else if ((item.href === '/prospection' || item.href === '/central-risque' || item.href === '/reports') && currentPortfolio) {
                      to = `/app/${currentPortfolio}${item.href}`;
                    }
                    // Modern, type-safe navigation: if href is a portfolio root, link to current portfolio details if available
                    else if (item.href.startsWith('/portfolios/')) {
                      const type = item.href.split('/')[2];
                      if (type === currentPortfolio) {
                        if (currentPortfolioId) {
                          to = `/app/${type}/${type}/${currentPortfolioId}`;
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
                          flex items-center px-4 py-2.5 text-base font-medium rounded-md
                          transition-colors duration-200
                          will-change-auto
                          ${isActive
                            ? 'bg-primary-dark text-white'
                            : 'text-primary-light hover:bg-primary-dark hover:text-white'
                          }
                        `}
                        style={{ transition: 'background-color 0.2s, color 0.2s' }}
                      >
                        <item.icon className="mr-3 h-6 w-6 flex-shrink-0" />
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
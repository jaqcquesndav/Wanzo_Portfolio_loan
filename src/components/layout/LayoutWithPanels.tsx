import { useState, useEffect } from 'react';
import { Outlet, useParams, useNavigate } from 'react-router-dom';
import { DynamicHeader } from './DynamicHeader';
import { DynamicSidebar } from './DynamicSidebar';
import { SecondaryPanel } from './SecondaryPanel';
import { ChatPanel } from '../chat/ChatPanel';
import { usePanelContext } from '../../contexts/PanelContext';
import { usePortfolioContext } from '../../contexts/usePortfolioContext';

export function LayoutWithPanels() {
  const { portfolioType: contextPortfolioType } = usePortfolioContext();
  const { portfolioType } = useParams();
  const navigate = useNavigate();
  
  // Panel context
  const { 
    secondaryPanel, 
    panelPosition, 
    closePanel,
    isAnimating 
  } = usePanelContext();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  // Redirection si pas de portefeuille
  useEffect(() => {
    if (!portfolioType && !contextPortfolioType) {
      navigate('/', { replace: true });
    }
  }, [portfolioType, contextPortfolioType, navigate]);

  // Gérer le redimensionnement
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) setSidebarOpen(false);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Rendu du panel secondaire selon son type
  const renderSecondaryPanelContent = () => {
    switch (secondaryPanel.type) {
      case 'chat':
        return <ChatPanel onClose={closePanel} />;
      default:
        return null;
    }
  };

  // État du layout
  const isHorizontalLayout = panelPosition === 'right';
  const hasPanelOpen = secondaryPanel.type !== null;
  const isFullscreen = secondaryPanel.isFullscreen;
  
  // Réduire le sidebar quand le chat panel est ouvert (desktop + panel à droite)
  const sidebarCollapsed = hasPanelOpen && !isMobile && isHorizontalLayout;

  // Mode plein écran : uniquement le panel
  if (isFullscreen && hasPanelOpen) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
        <SecondaryPanel>
          {renderSecondaryPanelContent()}
        </SecondaryPanel>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Header fixe */}
      <header className="fixed top-0 left-0 right-0 z-40">
        <DynamicHeader onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      </header>

      {/* Layout principal */}
      <div className="flex pt-16 h-screen">
        {/* Mobile: Sidebar en drawer */}
        {isMobile && (
          <>
            <aside 
              className={`
                fixed inset-y-0 left-0 z-30 mt-16
                transform transition-transform duration-300 ease-in-out
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
              `}
            >
              <DynamicSidebar onClose={() => setSidebarOpen(false)} />
            </aside>
            
            {sidebarOpen && (
              <div 
                className="fixed inset-0 bg-black/50 z-20"
                onClick={() => setSidebarOpen(false)}
              />
            )}
          </>
        )}

        {/* Desktop: Layout flex */}
        {!isMobile && (
          <div className="flex w-full h-[calc(100vh-4rem)]">
            {/* Sidebar avec largeur explicite */}
            <aside 
              className={`
                flex-shrink-0 h-full 
                transition-[width] duration-200 ease-out
                ${isAnimating ? 'duration-300' : ''}
                ${sidebarCollapsed ? 'w-16' : 'w-60'}
              `}
            >
              <DynamicSidebar collapsed={sidebarCollapsed} />
            </aside>

            {/* Zone principale + Panel */}
            <div className={`flex-1 flex min-w-0 overflow-hidden ${isHorizontalLayout ? 'flex-row' : 'flex-col'}`}>
              {/* Contenu principal */}
              <main className="flex-1 min-w-0 overflow-auto bg-gray-50 dark:bg-gray-900">
                <div className="w-full h-full p-3 md:p-4 lg:p-6">
                  <Outlet />
                </div>
              </main>

              {/* Panel secondaire */}
              {hasPanelOpen && (
                <SecondaryPanel>
                  {renderSecondaryPanelContent()}
                </SecondaryPanel>
              )}
            </div>
          </div>
        )}

        {/* Mobile: Contenu principal + Panel */}
        {isMobile && (
          <div className={`flex-1 flex min-w-0 h-[calc(100vh-4rem)] ${isHorizontalLayout ? 'flex-row' : 'flex-col'}`}>
            <main className="flex-1 min-w-0 overflow-auto">
              <div className="w-full p-2">
                <Outlet />
              </div>
            </main>
            
            {hasPanelOpen && (
              <SecondaryPanel>
                {renderSecondaryPanelContent()}
              </SecondaryPanel>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default LayoutWithPanels;
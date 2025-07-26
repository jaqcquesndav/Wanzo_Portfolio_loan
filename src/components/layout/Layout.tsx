import { useState, useEffect } from 'react';
import { Outlet, useParams, useNavigate } from 'react-router-dom';
import { DynamicHeader } from './DynamicHeader';
import { DynamicSidebar } from './DynamicSidebar';
import { usePortfolioContext } from '../../contexts/usePortfolioContext';

// Default sidebar width, matching DynamicSidebar default
const DEFAULT_SIDEBAR_WIDTH = 250; 

export default function Layout() {
  const { portfolioType: contextPortfolioType } = usePortfolioContext();
  const { portfolioType } = useParams();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  // Track sidebar width for desktop version - load from localStorage if available
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const savedWidth = localStorage.getItem('sidebarWidth');
    return savedWidth ? parseInt(savedWidth, 10) : DEFAULT_SIDEBAR_WIDTH;
  });

  // Redirection automatique si le portefeuille n'est pas sélectionné
  useEffect(() => {
    if (!portfolioType && !contextPortfolioType) {
      navigate('/', { replace: true });
    }
  }, [portfolioType, contextPortfolioType, navigate]);

  // Gérer le redimensionnement de la fenêtre
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) setSidebarOpen(false);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle sidebar width change
  const handleSidebarWidthChange = (width: number) => {
    setSidebarWidth(width);
    localStorage.setItem('sidebarWidth', width.toString());
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Header fixe */}
      <header className="fixed top-0 left-0 right-0 z-40">
        <DynamicHeader onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      </header>

      {/* Layout principal */}
      <div className="flex pt-16">
        {/* Sidebar - Version mobile */}
        {isMobile && (
          <aside 
            className={`fixed inset-y-0 left-0 transform transition-transform duration-300 ease-in-out z-30 w-60 mt-16 ${
              sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
          >
            <DynamicSidebar onClose={() => setSidebarOpen(false)} />
          </aside>
        )}

        {/* Layout Desktop avec flex */}
        {!isMobile && (
          <div className="flex w-full transition-all duration-150 relative">
            {/* Sidebar Desktop */}
            <aside 
              className="sticky top-16 h-[calc(100vh-4rem)] flex-shrink-0"
              style={{ 
                width: `${sidebarWidth}px`,
                transition: 'width 0.25s ease-out' 
              }}
            >
              <DynamicSidebar 
                initialWidth={sidebarWidth}
                onWidthChange={handleSidebarWidthChange}
              />
            </aside>

            {/* Contenu principal - s'adapte à la largeur du sidebar */}
            <main
              className="flex-1 min-h-screen flex flex-col items-stretch justify-start"
              style={{ transition: 'margin-left 0.25s ease-out' }}
            >
              <div className="w-full p-1 sm:p-2 md:p-3 lg:p-4 overflow-x-hidden">
                <Outlet />
              </div>
            </main>
          </div>
        )}

        {/* Version mobile du contenu principal */}
        {isMobile && (
          <>
            {/* Overlay pour mobile */}
            {sidebarOpen && (
              <div 
                className="fixed inset-0 bg-black bg-opacity-50 z-20"
                onClick={() => setSidebarOpen(false)}
              />
            )}
            
            <main
              className="flex-1 min-h-screen transition-all duration-300 flex flex-col items-stretch justify-start"
            >
              <div className="w-full p-1 sm:p-2 md:p-3 lg:p-4 overflow-x-hidden">
                <Outlet />
              </div>
            </main>
          </>
        )}
      </div>
    </div>
  );
}
import { useState, useEffect } from 'react';
import { Outlet, useParams, useNavigate } from 'react-router-dom';
import { DynamicHeader } from './DynamicHeader';
import { DynamicSidebar } from './DynamicSidebar';
import { usePortfolioContext } from '../../contexts/usePortfolioContext';

export default function Layout() {
  const { portfolioType: contextPortfolioType } = usePortfolioContext();
  const { portfolioType } = useParams();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

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
            className={`fixed inset-y-0 left-0 transform transition-transform duration-300 ease-in-out z-30 w-64 mt-16 ${
              sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
          >
            <DynamicSidebar onClose={() => setSidebarOpen(false)} />
          </aside>
        )}

        {/* Sidebar - Version desktop */}
        {!isMobile && (
          <aside className="sticky top-16 h-[calc(100vh-4rem)] w-64 flex-shrink-0">
            <DynamicSidebar />
          </aside>
        )}

        {/* Overlay pour mobile */}
        {sidebarOpen && isMobile && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-20"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Contenu principal */}
        <main
          className={`flex-1 min-h-screen transition-all duration-300 flex flex-col items-center justify-start`}
        >
          <div className="w-full max-w-5xl p-4 sm:p-6 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
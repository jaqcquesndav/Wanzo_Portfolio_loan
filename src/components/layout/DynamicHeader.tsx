import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Search, Bell, MessageSquare, Menu } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Form';
import { ProfileMenu } from './ProfileMenu';
import { NotificationsPopover } from '../notifications/NotificationsPopover';
import { AIChat } from '../chat/AIChat';
import { ResetMockDataButton } from '../ResetMockDataButton';
import { CurrencyDisplay } from './CurrencyDisplay';

interface DynamicHeaderProps {
  onMenuClick: () => void;
}

export function DynamicHeader({ onMenuClick }: DynamicHeaderProps) {
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showChat, setShowChat] = useState(false);

  const isProspectionPage = location.pathname.startsWith('/prospection');

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Menu et Logo */}
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={onMenuClick}
              icon={<Menu className="h-6 w-6" />}
              className="mr-4 lg:hidden"
              aria-label="Menu"
            />
          </div>

          {/* Recherche globale */}
          <div className="flex-1 flex items-center max-w-2xl ml-4">
            {isProspectionPage ? (
              <div className="w-full">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Rechercher des entreprises, secteurs, opportunités..."
                    className="pl-10 w-full"
                  />
                </div>
              </div>
            ) : null}
          </div>

          {/* Actions rapides */}
          <div className="flex items-center space-x-4">
            {/* Affichage de la devise et du taux de change */}
            <CurrencyDisplay />
            
            {/* Bouton de chat toujours visible */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowChat(!showChat)}
              className="relative group"
            >
              <MessageSquare className="h-5 w-5 text-gray-600 dark:text-gray-300 group-hover:text-primary" />
              <span className="sr-only">Assistant IA</span>
              {/* Badge "Nouveau" */}
              <span className="absolute -top-1 -right-1 h-2 w-2 bg-primary rounded-full" />
              {/* Tooltip */}
              <span className="absolute hidden group-hover:block bottom-full mb-2 left-1/2 transform -translate-x-1/2 px-2 py-1 text-xs text-white bg-gray-900 rounded whitespace-nowrap">
                Assistant IA
              </span>
            </Button>

            {/* Only show for admin or manager roles, not 'portfolio_manager' (which doesn't exist) */}
            {/* Calendrier supprimé selon demande */}
            {/*
            {(user?.role === 'admin' || user?.role === 'manager') && (
              <Button
                variant="ghost"
                size="sm"
                icon={<Calendar className="h-5 w-5" />} 
                aria-label="Rendez-vous"
              />
            )}
            */}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowNotifications(!showNotifications)}
              icon={<Bell className="h-5 w-5" />} 
              aria-label="Notifications"
            />
            
            {showNotifications && (
              <NotificationsPopover onClose={() => setShowNotifications(false)} />
            )}
            
            {/* Bouton de réinitialisation des données (environnement de développement) */}
            <div className="mr-2">
              <ResetMockDataButton />
            </div>

            {/* Profil utilisateur (photo + nom + menu) */}
            <ProfileMenu />
          </div>
        </div>
      </div>

      {/* Chat flottant */}
      {showChat && <AIChat onClose={() => setShowChat(false)} />}
    </header>
  );
}
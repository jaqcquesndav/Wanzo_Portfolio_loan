import React, { useState } from 'react';
import { Bell, BarChart2 } from 'lucide-react';
import { Button } from '../ui/Button';
// import { ProfileMenu } from './ProfileMenu';
import { ChatButton } from '../chat/ChatButton';
import { NotificationsPopover } from '../notifications/NotificationsPopover';
import { ConnectivityStatus } from './ConnectivityStatus';

interface NavbarProps {
  children?: React.ReactNode;
}

export function Navbar({ children }: NavbarProps) {
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Left side - Menu button and Logo */}
          <div className="flex items-center">
            {children}
            <div className="flex items-center">
              <BarChart2 className="h-8 w-8 text-primary dark:text-primary-light" />
              <span className="ml-2 text-xl font-semibold text-gray-900 dark:text-white truncate max-w-[120px] sm:max-w-none">
                Kiota Suit Portefeuille
              </span>
            </div>
          </div>
          
          {/* Right side - Actions */}
          <div className="flex items-center space-x-1 sm:space-x-4">
            <div className="hidden sm:block">
              <ChatButton />
            </div>
            
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowNotifications(!showNotifications)}
                icon={<Bell className="h-5 w-5" />}
                aria-label="Notifications"
                className="!px-2 sm:!px-3"
              />
              {showNotifications && (
                <NotificationsPopover onClose={() => setShowNotifications(false)} />
              )}
            </div>

            <div className="hidden sm:block mx-2">
              <ConnectivityStatus minimal />
            </div>

            {/* <ProfileMenu /> */}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
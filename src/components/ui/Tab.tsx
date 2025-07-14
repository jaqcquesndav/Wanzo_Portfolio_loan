import * as React from 'react';

interface TabProps {
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
}

export function Tab({ children, active = false, onClick }: TabProps) {
  return (
    <button
      onClick={onClick}
      className={`
        py-2 px-4 text-sm font-medium border-b-2 focus:outline-none
        ${active
          ? 'border-primary text-primary dark:border-primary-light dark:text-primary-light'
          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-600'
        }
      `}
    >
      {children}
    </button>
  );
}

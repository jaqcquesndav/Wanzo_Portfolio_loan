import { useRef, useState, useEffect } from 'react';
import { MoreVertical } from 'lucide-react';

interface PortfolioActionsDropdownProps {
  onAction: (action: string) => void;
  actions: { key: string; label: string }[];
  buttonClassName?: string;
}

export function PortfolioActionsDropdown({ onAction, actions, buttonClassName }: PortfolioActionsDropdownProps) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fermer le dropdown si clic à l'extérieur
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        btnRef.current &&
        !btnRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  return (
    <div className="relative inline-block text-left">
      <button
        ref={btnRef}
        onClick={e => { e.stopPropagation(); setOpen(v => !v); }}
        className={`ml-2 text-primary-light hover:text-white opacity-80 hover:opacity-100 p-1 rounded-full focus:outline-none ${buttonClassName || ''}`}
        aria-haspopup="true"
        aria-expanded={open}
        aria-label="Actions portefeuille"
        tabIndex={0}
      >
        <MoreVertical className="h-4 w-4" />
      </button>
      {open && (
        <div
          ref={dropdownRef}
          className="fixed z-50 w-48 bg-white shadow-xl ring-1 ring-black ring-opacity-10 rounded-lg animate-fade-in"
          style={(() => {
            if (!btnRef.current) return { top: 0, left: 0, visibility: 'hidden' };
            const rect = btnRef.current.getBoundingClientRect();
            return {
              top: rect.bottom + 6,
              left: rect.right - 192, // 192px = width
            };
          })()}
        >
          <div className="py-2">
            {actions.map(action => (
              <button
                key={action.key}
                onClick={e => { e.stopPropagation(); setOpen(false); onAction(action.key); }}
                className="block w-full text-left px-4 py-2 text-sm rounded transition-colors duration-150 text-gray-700 hover:bg-primary hover:text-white focus:bg-primary focus:text-white"
                tabIndex={0}
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

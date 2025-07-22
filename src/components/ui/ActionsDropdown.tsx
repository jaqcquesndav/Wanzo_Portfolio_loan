import { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { MoreVertical } from 'lucide-react';

export interface DropdownAction {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}

interface ActionsDropdownProps {
  actions: DropdownAction[];
}

export const ActionsDropdown: React.FC<ActionsDropdownProps> = ({ actions }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      // Ne ferme pas si on clique sur le dropdown lui-même ou son bouton
      if (ref.current && 
          !ref.current.contains(event.target as Node) && 
          dropdownRef.current && 
          !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    if (open) {
      // Utiliser mousedown pour capturer l'événement plus tôt
      document.addEventListener('mousedown', handleClickOutside);
      // Empêcher la fermeture par le scroll
      document.body.style.overflow = 'hidden';
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = '';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <div className="relative inline-block text-left" ref={ref}>
      <button
        type="button"
        className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
        onClick={(e) => {
          e.stopPropagation(); // Prevent propagation to parent elements
          setOpen((v) => !v);
        }}
        aria-haspopup="true"
        aria-expanded={open}
      >
        <MoreVertical className="h-5 w-5 text-gray-500" />
      </button>
      {open && typeof window !== 'undefined' && ReactDOM.createPortal(
        <div
          ref={dropdownRef}
          className="origin-top-right fixed z-[9999] w-40 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5"
          style={(() => {
            if (!ref.current) return { top: 0, left: 0, visibility: 'hidden' };
            const rect = ref.current.getBoundingClientRect();
            const spaceBelow = window.innerHeight - rect.bottom;
            
            // Si espace insuffisant en dessous, positionner au-dessus
            const top = spaceBelow < 150 ? 
              rect.top + window.scrollY - 150 : // Positionner au-dessus
              rect.bottom + window.scrollY;     // Positionner en dessous
            
            return {
              top,
              left: rect.right + window.scrollX - 160, // 160px = width
              visibility: 'visible',
              minHeight: '100px', // Hauteur minimale pour faciliter le clic
            };
          })()}
          onClick={(e) => e.stopPropagation()} // Empêcher la propagation à l'ensemble du document
        >
          <div className="py-1">
            {actions.map((action, idx) => (
              <button
                key={idx}
                className={`w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none ${action.disabled ? 'opacity-50 cursor-not-allowed' : ''} ${action.className || ''}`}
                onClick={(e) => {
                  e.stopPropagation(); // Prevent propagation to parent elements
                  e.preventDefault(); // Empêcher tout comportement par défaut
                  if (!action.disabled) {
                    // Utiliser setTimeout pour éviter les problèmes de fermeture prématurée
                    setTimeout(() => {
                      action.onClick();
                      setOpen(false);
                    }, 10);
                  }
                }}
                disabled={action.disabled}
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

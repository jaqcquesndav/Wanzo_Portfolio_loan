import { useState, useRef, useEffect } from 'react';
import { MoreVertical } from 'lucide-react';

interface DropdownAction {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

interface ActionsDropdownProps {
  actions: DropdownAction[];
}

export const ActionsDropdown: React.FC<ActionsDropdownProps> = ({ actions }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  return (
    <div className="relative inline-block text-left" ref={ref}>
      <button
        type="button"
        className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="true"
        aria-expanded={open}
      >
        <MoreVertical className="h-5 w-5 text-gray-500" />
      </button>
      {open && (
        <div className="origin-top-right absolute right-0 mt-2 w-40 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-50">
          <div className="py-1">
            {actions.map((action, idx) => (
              <button
                key={idx}
                className={`w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none ${action.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={() => {
                  if (!action.disabled) {
                    action.onClick();
                    setOpen(false);
                  }
                }}
                disabled={action.disabled}
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

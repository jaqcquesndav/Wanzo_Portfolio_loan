import React from 'react';
import { createPortal } from 'react-dom';
import { CreditContract } from '../../../../types/credit';

interface ActionMenuProps {
  contract: CreditContract;
  dropdownPosition: { top: number; left: number };
  portalRoot: HTMLElement;
  onClose: () => void;
  onNavigate: (path: string) => void;
  onViewSchedule: () => void;
  onGeneratePDF: () => void;
  onChangeStatus: (newStatus: 'active' | 'closed' | 'defaulted' | 'suspended' | 'in_litigation') => void;
  onDelete: () => void;
}

export const ActionMenu: React.FC<ActionMenuProps> = ({
  contract,
  dropdownPosition,
  portalRoot,
  onClose,
  onNavigate,
  onViewSchedule,
  onGeneratePDF,
  onChangeStatus,
  onDelete,
}) => {
  const portfolioId = 'default'; // This should be passed as a prop if it's dynamic

  return createPortal(
    <div
      className="table-action-dropdown"
      style={{
        top: `${dropdownPosition.top}px`,
        left: `${dropdownPosition.left}px`,
      }}
      onClick={(e) => {
        e.stopPropagation();
        onClose();
      }}
    >
      <div className="py-1" role="menu" aria-orientation="vertical">
        <button
          className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          role="menuitem"
          onClick={() => onNavigate(`/app/traditional/portfolio/${portfolioId}/contracts/${contract.id}`)}
        >
          <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          Voir les détails
        </button>

        <button
          className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          role="menuitem"
          onClick={onViewSchedule}
        >
          <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Voir l'échéancier
        </button>
        
        <button
          className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          role="menuitem"
          onClick={onGeneratePDF}
        >
          <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          Exporter PDF
        </button>
        
        {contract.status === 'active' && (
          <>
            <div className="border-t border-gray-100 my-1"></div>
            <button
              className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              role="menuitem"
              onClick={() => onChangeStatus('suspended')}
            >
              <svg className="mr-2 h-4 w-4 text-yellow-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Suspendre
            </button>
            <button
              className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              role="menuitem"
              onClick={() => onChangeStatus('closed')}
            >
              <svg className="mr-2 h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              Clôturer
            </button>
            <button
              className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-100"
              role="menuitem"
              onClick={() => onChangeStatus('defaulted')}
            >
              <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Marquer en défaut
            </button>
            <button
              className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-100"
              role="menuitem"
              onClick={() => onChangeStatus('in_litigation')}
            >
              <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
              </svg>
              Mettre en contentieux
            </button>
          </>
        )}
        
        {contract.status === 'suspended' && (
          <>
            <div className="border-t border-gray-100 my-1"></div>
            <button
              className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              role="menuitem"
              onClick={() => onChangeStatus('active')}
            >
              <svg className="mr-2 h-4 w-4 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Réactiver
            </button>
          </>
        )}
        
        <div className="border-t border-gray-100 my-1"></div>
        <button
          className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-100"
          role="menuitem"
          onClick={onDelete}
        >
          <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Supprimer
        </button>
      </div>
    </div>,
    portalRoot
  );
};

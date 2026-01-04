import React from 'react';
import { ActionsDropdown } from '../../../ui/ActionsDropdown';
import { Guarantee } from '../../../../types/guarantee';

interface ActionMenuProps {
  guarantee: Guarantee;
  onView: (id: string) => void;
  onRelease: (guarantee: Guarantee) => void;
  onSeize: (guarantee: Guarantee) => void;
  onDelete: (guarantee: Guarantee) => void;
}

export const ActionMenu: React.FC<ActionMenuProps> = ({
  guarantee,
  onView,
  onRelease,
  onSeize,
  onDelete
}) => {
  const actions = [
    { 
      label: 'Voir dûtails', 
      onClick: () => onView(guarantee.id)
    },
    guarantee.status === 'active' ? { 
      label: 'Mainlevée', 
      onClick: () => onRelease(guarantee)
    } : null,
    guarantee.status === 'active' ? { 
      label: 'Saisir', 
      onClick: () => onSeize(guarantee)
    } : null,
    { 
      label: 'Supprimer', 
      onClick: () => onDelete(guarantee)
    },
    guarantee.details?.document_url ? { 
      label: 'Télécharger document', 
      onClick: () => window.open(guarantee.details?.document_url, '_blank') 
    } : null,
  ].filter(Boolean) as { label: string; onClick: () => void }[];

  return (
    <ActionsDropdown actions={actions} />
  );
};


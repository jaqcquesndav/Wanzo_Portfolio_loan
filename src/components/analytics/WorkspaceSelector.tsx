import React from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import { Select } from '../ui/Form';
import { Button } from '../ui/Button';
import type { Workspace } from '../../types/analytics';

interface WorkspaceSelectorProps {
  workspaces: Workspace[];
  activeWorkspace: Workspace | null;
  onSelect: (workspace: Workspace) => void;
  onEdit: (workspace: Workspace) => void;
  onDelete: (workspaceId: string) => void;
}

export function WorkspaceSelector({ 
  workspaces, 
  activeWorkspace, 
  onSelect,
  onEdit,
  onDelete
}: WorkspaceSelectorProps) {
  return (
    <div className="flex items-center space-x-2">
      <Select
        value={activeWorkspace?.id || ''}
        onChange={(e) => {
          const selected = workspaces.find(w => w.id === e.target.value);
          if (selected) onSelect(selected);
        }}
        className="w-48"
      >
        {workspaces.map(workspace => (
          <option key={workspace.id} value={workspace.id}>
            {workspace.name}
          </option>
        ))}
      </Select>

      {activeWorkspace && (
        <>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(activeWorkspace)}
            icon={<Edit2 className="h-4 w-4" />}
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (confirm('Êtes-vous sûr de vouloir supprimer ce workspace ?')) {
                onDelete(activeWorkspace.id);
              }
            }}
            icon={<Trash2 className="h-4 w-4 text-red-500" />}
          />
        </>
      )}
    </div>
  );
}
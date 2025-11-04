import { useState, useEffect } from 'react';
import type { Workspace } from '../types/analytics';
import { mockWorkspaces } from '../data/mockAnalytics';

export function useWorkspaces() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(null);
  const [showWorkspaceModal, setShowWorkspaceModal] = useState(false);
  const [editingWorkspace, setEditingWorkspace] = useState<Workspace | null>(null);

  useEffect(() => {
    const savedWorkspaces = localStorage.getItem('analytics_workspaces');
    const initialWorkspaces = savedWorkspaces ? JSON.parse(savedWorkspaces) : mockWorkspaces;
    
    setWorkspaces(initialWorkspaces);
    setActiveWorkspace(initialWorkspaces[0]);
  }, []);

  const saveWorkspace = async (workspace: Workspace) => {
    const updated = workspaces.map(w => 
      w.id === workspace.id ? workspace : w
    );
    setWorkspaces(updated);
    localStorage.setItem('analytics_workspaces', JSON.stringify(updated));
  };

  const createWorkspace = (data: { name: string; description?: string }) => {
    const newWorkspace: Workspace = {
      id: Math.random().toString(36).substr(2, 9),
      name: data.name,
      description: data.description,
      widgets: [],
      layout: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const updated = [...workspaces, newWorkspace];
    setWorkspaces(updated);
    setActiveWorkspace(newWorkspace);
    localStorage.setItem('analytics_workspaces', JSON.stringify(updated));
    setShowWorkspaceModal(false);
  };

  const updateWorkspace = (data: { name: string; description?: string }) => {
    if (!editingWorkspace) return;

    const updated = workspaces.map(w => 
      w.id === editingWorkspace.id 
        ? { ...w, ...data, updated_at: new Date().toISOString() }
        : w
    );
    
    setWorkspaces(updated);
    localStorage.setItem('analytics_workspaces', JSON.stringify(updated));
    setEditingWorkspace(null);
    setShowWorkspaceModal(false);
  };

  const deleteWorkspace = (workspaceId: string) => {
    const updated = workspaces.filter(w => w.id !== workspaceId);
    setWorkspaces(updated);
    if (activeWorkspace?.id === workspaceId) {
      setActiveWorkspace(updated[0] || null);
    }
    localStorage.setItem('analytics_workspaces', JSON.stringify(updated));
  };

  return {
    workspaces,
    activeWorkspace,
    showWorkspaceModal,
    editingWorkspace,
    setActiveWorkspace,
    setShowWorkspaceModal,
    setEditingWorkspace,
    saveWorkspace,
    createWorkspace,
    updateWorkspace,
    deleteWorkspace
  };
}

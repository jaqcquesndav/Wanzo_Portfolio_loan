import React, { useState } from 'react';
import { GridLayout } from './GridLayout';
import { WidgetRenderer } from './WidgetRenderer';
import { Button } from '../ui/Button';
import { FormField, Select } from '../ui/Form';
import type { Workspace, Widget } from '../../types/analytics';

interface AnalyticsWorkspaceProps {
  workspace: Workspace;
  onUpdate: (workspace: Workspace) => void;
}

export function AnalyticsWorkspace({ workspace, onUpdate }: AnalyticsWorkspaceProps) {
  const [background, setBackground] = useState('white');
  const [gridType, setGridType] = useState('lines');
  const [title, setTitle] = useState(workspace.name || '');

  const handleWidgetUpdate = (widgetId: string, updates: Partial<Widget>) => {
    const updatedWidgets = workspace.widgets.map(w => 
      w.id === widgetId ? { ...w, ...updates } : w
    );
    onUpdate({ ...workspace, widgets: updatedWidgets });
  };

  const handleWidgetDelete = (widgetId: string) => {
    const updatedWidgets = workspace.widgets.filter(w => w.id !== widgetId);
    onUpdate({ ...workspace, widgets: updatedWidgets });
  };

  const handleLayoutChange = (layout: any) => {
    onUpdate({ ...workspace, layout });
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    onUpdate({ ...workspace, name: newTitle });
  };

  return (
    <div className="space-y-6">
      {/* Configuration du workspace */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormField label="Titre du workspace">
            <input
              type="text"
              value={title}
              onChange={handleTitleChange}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="Mon espace de travail"
            />
          </FormField>

          <FormField label="Couleur de fond">
            <Select
              value={background}
              onChange={(e) => setBackground(e.target.value)}
            >
              <option value="white">Blanc</option>
              <option value="gray-50">Gris clair</option>
              <option value="blue-50">Bleu clair</option>
              <option value="green-50">Vert clair</option>
            </Select>
          </FormField>

          <FormField label="Type de grille">
            <Select
              value={gridType}
              onChange={(e) => setGridType(e.target.value)}
            >
              <option value="lines">Lignes</option>
              <option value="dots">Points</option>
              <option value="none">Aucun</option>
            </Select>
          </FormField>
        </div>
      </div>

      {/* Grille des widgets */}
      <div className={`bg-${background} dark:bg-gray-800 rounded-lg shadow-sm p-6 min-h-[600px] relative`}>
        {/* Grille de fond */}
        {gridType !== 'none' && (
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: gridType === 'lines' 
                ? 'linear-gradient(to right, #e5e7eb 1px, transparent 1px), linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)'
                : 'radial-gradient(circle, #e5e7eb 1px, transparent 1px)',
              backgroundSize: '20px 20px'
            }}
          />
        )}

        <GridLayout
          layout={workspace.layout}
          onLayoutChange={handleLayoutChange}
        >
          {workspace.widgets.map(widget => (
            <div key={widget.id}>
              <WidgetRenderer
                widget={widget}
                onUpdate={(updates) => handleWidgetUpdate(widget.id, updates)}
                onDelete={() => handleWidgetDelete(widget.id)}
              />
            </div>
          ))}
        </GridLayout>
      </div>
    </div>
  );
}
/**
 * Composant de sélection des widgets pour customiser le dashboard
 * Version flottante et draggable
 */

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { SettingsIcon, EyeOffIcon, RotateCcwIcon, CheckIcon, GripVerticalIcon, XIcon, MinusIcon, MaximizeIcon } from 'lucide-react';
import type { WidgetConfig, WidgetType } from '../../types/dashboard/customization';

interface WidgetSelectorProps {
  widgets: WidgetConfig[];
  onToggleWidget: (widgetId: WidgetType, visible: boolean) => void;
  onResetToDefault: () => void;
  className?: string;
}

interface Position {
  x: number;
  y: number;
}

export const WidgetSelector: React.FC<WidgetSelectorProps> = ({
  widgets,
  onToggleWidget,
  onResetToDefault,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState<Position>(() => {
    // Charger la position depuis localStorage
    const saved = localStorage.getItem('widgetSelector_position');
    return saved ? JSON.parse(saved) : { x: 20, y: 20 };
  });
  const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 });

  // Sauvegarder la position dans localStorage
  useEffect(() => {
    localStorage.setItem('widgetSelector_position', JSON.stringify(position));
  }, [position]);
  
  const panelRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  // Gestion du drag
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!panelRef.current) return;
    
    const rect = panelRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    setIsDragging(true);
  };

  // Event listeners pour le drag
  useEffect(() => {
    const handleMouseMoveLocal = (e: MouseEvent) => {
      if (!isDragging) return;
      
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;
      
      // Limites de l'écran
      const maxX = window.innerWidth - 400; // largeur du panel
      const maxY = window.innerHeight - 500; // hauteur approximative
      
      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY))
      });
    };

    const handleMouseUpLocal = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMoveLocal);
      document.addEventListener('mouseup', handleMouseUpLocal);
      document.body.style.userSelect = 'none';
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMoveLocal);
        document.removeEventListener('mouseup', handleMouseUpLocal);
        document.body.style.userSelect = '';
      };
    }
  }, [isDragging, dragOffset]);

  // Fermer avec Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  // Repositionner le panneau si la fenêtre est redimensionnée
  useEffect(() => {
    const handleResize = () => {
      const maxX = window.innerWidth - 400;
      const maxY = window.innerHeight - 500;
      
      setPosition(prev => ({
        x: Math.max(0, Math.min(prev.x, maxX)),
        y: Math.max(0, Math.min(prev.y, maxY))
      }));
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Grouper les widgets par catégorie
  const groupedWidgets = widgets.reduce((acc, widget) => {
    if (!acc[widget.category]) {
      acc[widget.category] = [];
    }
    acc[widget.category].push(widget);
    return acc;
  }, {} as Record<string, WidgetConfig[]>);

  const categoryLabels = {
    kpi: 'Indicateurs KPI',
    analysis: 'Analyses',
    compliance: 'Conformité',
    activity: 'Activités'
  };

  const visibleCount = widgets.filter(w => w.isVisible).length;

  return (
    <>
      {/* Bouton de déclenchement */}
      <div className={`relative ${className}`}>
        <Button
          variant="outline"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <SettingsIcon className="h-4 w-4" />
          <span>Personnaliser</span>
          <Badge variant="secondary" className="ml-1 bg-blue-100 text-blue-800">
            {visibleCount}
          </Badge>
        </Button>
      </div>

      {/* Panneau flottant draggable */}
      {isOpen && (
        <>
          {/* Overlay pour fermer en cliquant à l'extérieur */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-20 z-40 animate-in fade-in duration-200"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Panneau flottant */}
          <div
            ref={panelRef}
            className={`fixed z-50 bg-white rounded-lg shadow-2xl border border-gray-200 min-w-96 max-w-md transition-all duration-200 animate-in slide-in-from-top-4 ${
              isDragging ? 'shadow-xl scale-[1.02]' : ''
            }`}
            style={{
              left: `${position.x}px`,
              top: `${position.y}px`,
              cursor: isDragging ? 'grabbing' : 'default'
            }}
          >
            {/* En-tête draggable */}
            <div
              ref={headerRef}
              className={`flex items-center justify-between p-4 bg-gray-50 rounded-t-lg cursor-grab active:cursor-grabbing border-b border-gray-200 transition-colors ${
                isDragging ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-100'
              }`}
              onMouseDown={handleMouseDown}
            >
              <div className="flex items-center gap-2">
                <GripVerticalIcon className={`h-4 w-4 transition-colors ${
                  isDragging ? 'text-blue-500' : 'text-gray-400'
                }`} />
                <h3 className="text-lg font-semibold text-gray-900">
                  Widgets du Dashboard
                </h3>
              </div>
              
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-1 rounded hover:bg-gray-200 transition-colors"
                  title={isMinimized ? "Agrandir" : "Réduire"}
                >
                  {isMinimized ? (
                    <MaximizeIcon className="h-4 w-4 text-gray-600" />
                  ) : (
                    <MinusIcon className="h-4 w-4 text-gray-600" />
                  )}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded hover:bg-gray-200 transition-colors"
                  title="Fermer"
                >
                  <XIcon className="h-4 w-4 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Contenu du panneau */}
            {!isMinimized ? (
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-gray-600">
                    Sélectionnez les widgets à afficher
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onResetToDefault}
                    className="flex items-center gap-1 text-xs"
                  >
                    <RotateCcwIcon className="h-3 w-3" />
                    Reset
                  </Button>
                </div>

                <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                  {Object.entries(groupedWidgets).map(([category, categoryWidgets]) => (
                    <div key={category}>
                      <h4 className="text-sm font-medium text-gray-700 mb-2 border-b border-gray-100 pb-1">
                        {categoryLabels[category as keyof typeof categoryLabels]}
                      </h4>
                      <div className="space-y-2">
                        {categoryWidgets.map((widget) => (
                          <div
                            key={widget.id}
                            className="flex items-center justify-between p-3 rounded-md hover:bg-gray-50 transition-colors border border-gray-100"
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm font-medium text-gray-900">
                                  {widget.title}
                                </span>
                                <Badge 
                                  variant="secondary" 
                                  className={`text-xs ${
                                    widget.size === 'small' ? 'bg-green-100 text-green-700' :
                                    widget.size === 'medium' ? 'bg-blue-100 text-blue-700' :
                                    widget.size === 'large' ? 'bg-purple-100 text-purple-700' :
                                    'bg-gray-100 text-gray-700'
                                  }`}
                                >
                                  {widget.size}
                                </Badge>
                              </div>
                              <p className="text-xs text-gray-600 truncate">
                                {widget.description}
                              </p>
                            </div>
                            <button
                              onClick={() => onToggleWidget(widget.id, !widget.isVisible)}
                              className={`ml-3 flex items-center justify-center w-10 h-10 rounded-full transition-all ${
                                widget.isVisible
                                  ? 'bg-green-100 text-green-600 hover:bg-green-200'
                                  : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                              }`}
                            >
                              {widget.isVisible ? (
                                <CheckIcon className="h-5 w-5" />
                              ) : (
                                <EyeOffIcon className="h-5 w-5" />
                              )}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 text-center">
                  <p className="text-xs text-gray-500">
                    {visibleCount} widget(s) affiché(s) sur {widgets.length}
                  </p>
                </div>
              </div>
            ) : (
              // Vue minimisée avec résumé
              <div className="p-3 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>Widgets actifs:</span>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    {visibleCount}/{widgets.length}
                  </Badge>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
};

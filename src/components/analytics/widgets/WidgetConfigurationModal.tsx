import React, { useRef, useState } from 'react';
import { X, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '../../ui/Button';
import { WidgetConfiguration } from './WidgetConfiguration';
import type { Widget, WidgetType } from '../../../types/analytics';

interface WidgetConfigurationModalProps {
  type: WidgetType;
  config: Widget['config'];
  onConfigChange: (config: Widget['config']) => void;
  onClose: () => void;
  onDelete?: () => void;
}

export function WidgetConfigurationModal({
  type,
  config,
  onConfigChange,
  onClose,
  onDelete
}: WidgetConfigurationModalProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [size, setSize] = useState({ width: 600, height: 500 });
  const [position, setPosition] = useState({ x: window.innerWidth / 2 - 300, y: window.innerHeight / 2 - 250 });
  const modalRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startPos = useRef({ x: 0, y: 0 });
  const startSize = useRef({ width: 0, height: 0 });

  const handleMouseDown = (e: React.MouseEvent, mode: 'move' | 'resize') => {
    if (isFullscreen) return;
    
    isDragging.current = true;
    startPos.current = { x: e.clientX, y: e.clientY };
    
    if (mode === 'resize') {
      startSize.current = { width: size.width, height: size.height };
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;

      if (mode === 'move') {
        setPosition({
          x: Math.max(0, Math.min(window.innerWidth - size.width, position.x + e.clientX - startPos.current.x)),
          y: Math.max(0, Math.min(window.innerHeight - size.height, position.y + e.clientY - startPos.current.y))
        });
      } else {
        setSize({
          width: Math.max(400, Math.min(1200, startSize.current.width + e.clientX - startPos.current.x)),
          height: Math.max(300, Math.min(800, startSize.current.height + e.clientY - startPos.current.y))
        });
      }
    };

    const handleMouseUp = () => {
      isDragging.current = false;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        ref={modalRef}
        style={{
          width: isFullscreen ? '100%' : size.width,
          height: isFullscreen ? '100%' : size.height,
          top: isFullscreen ? 0 : position.y,
          left: isFullscreen ? 0 : position.x,
          transform: 'none'
        }}
        className={`fixed bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden transition-all duration-200`}
      >
        {/* Barre de titre avec poignée de déplacement */}
        <div
          className="flex items-center justify-between p-4 border-b dark:border-gray-700 cursor-move"
          onMouseDown={(e) => handleMouseDown(e, 'move')}
        >
          <h2 className="text-lg font-semibold">Configuration du widget</h2>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleFullscreen}
              icon={isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              icon={<X className="h-4 w-4" />}
            />
          </div>
        </div>

        {/* Contenu */}
        <div className="p-6 overflow-y-auto" style={{ height: 'calc(100% - 120px)' }}>
          <WidgetConfiguration
            type={type}
            config={config}
            onConfigChange={onConfigChange}
            onClose={onClose}
          />
        </div>

        {/* Actions */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
          <div className="flex justify-between items-center">
            {onDelete && (
              <Button
                variant="danger"
                onClick={onDelete}
              >
                Supprimer le widget
              </Button>
            )}
            <div className="flex space-x-4">
              <Button variant="outline" onClick={onClose}>
                Annuler
              </Button>
              <Button onClick={onClose}>
                Appliquer
              </Button>
            </div>
          </div>
        </div>

        {/* Poignée de redimensionnement */}
        {!isFullscreen && (
          <div
            className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
            onMouseDown={(e) => handleMouseDown(e, 'resize')}
          >
            <div className="absolute bottom-2 right-2 w-2 h-2 bg-gray-400 rounded-full" />
          </div>
        )}
      </div>
    </div>
  );
}
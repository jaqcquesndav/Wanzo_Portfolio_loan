import React, { useRef, useCallback, useEffect, useState } from 'react';
import { GripVertical, GripHorizontal } from 'lucide-react';
import { usePanelContext, PanelPosition } from '../../contexts/PanelContext';

interface PanelResizerProps {
  position: PanelPosition;
  onResize: (delta: number) => void;
  className?: string;
}

export function PanelResizer({ position, onResize, className = '' }: PanelResizerProps) {
  const resizerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const startPosRef = useRef(0);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    startPosRef.current = position === 'right' ? e.clientX : e.clientY;
    document.body.style.cursor = position === 'right' ? 'ew-resize' : 'ns-resize';
    document.body.style.userSelect = 'none';
  }, [position]);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const currentPos = position === 'right' ? e.clientX : e.clientY;
      const delta = startPosRef.current - currentPos;
      startPosRef.current = currentPos;
      onResize(delta);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, position, onResize]);

  const isHorizontal = position === 'right';

  return (
    <div
      ref={resizerRef}
      className={`
        ${isHorizontal ? 'w-1 h-full cursor-ew-resize hover:w-1.5' : 'h-1 w-full cursor-ns-resize hover:h-1.5'}
        bg-gray-200 dark:bg-gray-700 
        hover:bg-primary/50 
        transition-all duration-150
        flex items-center justify-center
        group
        ${isDragging ? 'bg-primary/70' : ''}
        ${className}
      `}
      onMouseDown={handleMouseDown}
    >
      {/* Grip indicator */}
      <div className={`
        opacity-0 group-hover:opacity-100 transition-opacity
        ${isDragging ? 'opacity-100' : ''}
      `}>
        {isHorizontal ? (
          <GripVertical className="h-4 w-4 text-gray-400" />
        ) : (
          <GripHorizontal className="h-4 w-4 text-gray-400" />
        )}
      </div>
    </div>
  );
}

interface SecondaryPanelProps {
  children: React.ReactNode;
  title?: string;
  onClose?: () => void;
}

export function SecondaryPanel({ children }: SecondaryPanelProps) {
  const { 
    secondaryPanel, 
    panelPosition, 
    resizePanel,
    isAnimating
  } = usePanelContext();

  const { type, isFullscreen, width, height } = secondaryPanel;

  // Ne rien afficher si aucun panel n'est ouvert
  if (!type) return null;

  // Mode plein écran
  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-white dark:bg-gray-900">
        {children}
      </div>
    );
  }

  const handleResize = (delta: number) => {
    const currentDimension = panelPosition === 'right' ? width : height;
    resizePanel(currentDimension + delta);
  };

  const isRightPanel = panelPosition === 'right';

  return (
    <div 
      className={`
        flex-shrink-0 bg-white dark:bg-gray-900 
        ${isRightPanel ? 'border-l-2 border-gray-300 dark:border-gray-600 h-full flex' : 'border-t-2 border-gray-300 dark:border-gray-600 w-full'}
        ${isAnimating ? 'transition-all duration-300 ease-out' : ''}
      `}
      style={{
        width: isRightPanel ? `${width}px` : '100%',
        height: isRightPanel ? '100%' : `${height}px`,
      }}
    >
      {/* Resizer à gauche pour le panel droit, en haut pour le panel bas */}
      {isRightPanel && (
        <PanelResizer position="right" onResize={handleResize} />
      )}
      
      <div className={`flex-1 flex flex-col overflow-hidden ${!isRightPanel ? 'h-full' : ''}`}>
        {!isRightPanel && (
          <PanelResizer position="bottom" onResize={handleResize} />
        )}
        <div className="flex-1 overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
}

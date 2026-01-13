import React, { useRef, useCallback, useEffect, useState } from 'react';
import { usePanelContext, PanelPosition } from '../../contexts/PanelContext';

interface PanelResizerProps {
  position: PanelPosition;
  onResizeStart?: () => void;
  onResizeMove?: (delta: number) => void;
  onResizeEnd?: (finalDimension: number) => void;
  currentDimension: number;
  minDimension: number;
  maxDimension: number;
  className?: string;
}

export function PanelResizer({ 
  position, 
  onResizeStart,
  onResizeMove,
  onResizeEnd, 
  currentDimension,
  minDimension,
  maxDimension,
  className = '' 
}: PanelResizerProps) {
  const resizerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const startPosRef = useRef(0);
  const dimensionRef = useRef(currentDimension);
  
  // Sync dimension ref when prop changes (and not dragging)
  useEffect(() => {
    if (!isDragging) {
      dimensionRef.current = currentDimension;
    }
  }, [currentDimension, isDragging]);

  const startDrag = useCallback((clientX: number, clientY: number) => {
    setIsDragging(true);
    startPosRef.current = position === 'right' ? clientX : clientY;
    dimensionRef.current = currentDimension;
    document.body.style.cursor = position === 'right' ? 'ew-resize' : 'ns-resize';
    document.body.style.userSelect = 'none';
    document.body.classList.add('resizing');
    onResizeStart?.();
  }, [position, currentDimension, onResizeStart]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    startDrag(e.clientX, e.clientY);
  }, [startDrag]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const touch = e.touches[0];
    startDrag(touch.clientX, touch.clientY);
  }, [startDrag]);

  useEffect(() => {
    if (!isDragging) return;
    
    const resizerElement = resizerRef.current?.parentElement;

    const handleMove = (clientX: number, clientY: number) => {
      const currentPos = position === 'right' ? clientX : clientY;
      const delta = startPosRef.current - currentPos;
      startPosRef.current = currentPos;
      
      // Calculate new dimension with constraints
      const newDimension = Math.min(Math.max(dimensionRef.current + delta, minDimension), maxDimension);
      dimensionRef.current = newDimension;
      
      // Direct DOM manipulation for smooth resize - bypass React
      if (resizerElement) {
        if (position === 'right') {
          resizerElement.style.width = `${newDimension}px`;
        } else {
          resizerElement.style.height = `${newDimension}px`;
        }
      }
      
      onResizeMove?.(delta);
    };

    const handleMouseMove = (e: MouseEvent) => handleMove(e.clientX, e.clientY);
    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      handleMove(e.touches[0].clientX, e.touches[0].clientY);
    };

    const handleEnd = () => {
      setIsDragging(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      document.body.classList.remove('resizing');
      
      // Only update React state at the end
      onResizeEnd?.(dimensionRef.current);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleEnd);
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleEnd);
    document.addEventListener('touchcancel', handleEnd);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleEnd);
      document.removeEventListener('touchcancel', handleEnd);
    };
  }, [isDragging, position, minDimension, maxDimension, onResizeMove, onResizeEnd]);

  const isHorizontal = position === 'right';

  return (
    <div
      ref={resizerRef}
      className={`
        ${isHorizontal ? 'w-3 h-full cursor-ew-resize' : 'h-3 w-full cursor-ns-resize'}
        bg-transparent
        hover:bg-primary/20
        flex items-center justify-center
        group
        select-none
        relative
        ${isDragging ? 'bg-primary/30' : ''}
        ${className}
      `}
      style={{ touchAction: 'none' }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      {/* Invisible larger hit area for easier grabbing */}
      <div 
        className={`
          absolute
          ${isHorizontal ? 'w-5 h-full -left-1' : 'h-5 w-full -top-1'}
        `}
      />
      {/* Visible grip indicator - dots pattern */}
      <div 
        className={`
          flex ${isHorizontal ? 'flex-col' : 'flex-row'} gap-1
          opacity-40 group-hover:opacity-100
          ${isDragging ? 'opacity-100' : ''}
        `}
      >
        {[...Array(3)].map((_, i) => (
          <div 
            key={i}
            className={`
              w-1 h-1 rounded-full
              bg-gray-400 dark:bg-gray-500
              group-hover:bg-primary
              ${isDragging ? 'bg-primary' : ''}
            `}
          />
        ))}
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
  
  const [isResizing, setIsResizing] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const { type, isFullscreen, width, height, minWidth, maxWidth, minHeight, maxHeight } = secondaryPanel;

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

  const isRightPanel = panelPosition === 'right';
  const currentDimension = isRightPanel ? width : height;
  const minDimension = isRightPanel ? minWidth : minHeight;
  const maxDimension = isRightPanel ? maxWidth : maxHeight;
  
  const handleResizeStart = () => {
    setIsResizing(true);
    // Disable transitions on panel during resize
    if (panelRef.current) {
      panelRef.current.style.transition = 'none';
    }
  };
  
  const handleResizeEnd = (finalDimension: number) => {
    setIsResizing(false);
    // Re-enable transitions
    if (panelRef.current) {
      panelRef.current.style.transition = '';
    }
    // Update React state only at the end
    resizePanel(finalDimension);
  };

  return (
    <div 
      ref={panelRef}
      className={`
        flex-shrink-0 bg-white dark:bg-gray-900 
        ${isRightPanel ? 'border-l border-gray-200 dark:border-gray-700 h-full flex' : 'border-t border-gray-200 dark:border-gray-700 w-full'}
      `}
      style={{
        width: isRightPanel ? `${width}px` : '100%',
        height: isRightPanel ? '100%' : `${height}px`,
        transition: isAnimating && !isResizing ? 'width 0.2s ease-out, height 0.2s ease-out' : 'none',
        contain: 'strict',
      }}
    >
      {/* Resizer à gauche pour le panel droit, en haut pour le panel bas */}
      {isRightPanel && (
        <PanelResizer 
          position="right"
          currentDimension={currentDimension}
          minDimension={minDimension}
          maxDimension={maxDimension}
          onResizeStart={handleResizeStart}
          onResizeEnd={handleResizeEnd}
        />
      )}
      
      <div className={`flex-1 flex flex-col overflow-hidden ${!isRightPanel ? 'h-full' : ''}`}>
        {!isRightPanel && (
          <PanelResizer 
            position="bottom"
            currentDimension={currentDimension}
            minDimension={minDimension}
            maxDimension={maxDimension}
            onResizeStart={handleResizeStart}
            onResizeEnd={handleResizeEnd}
          />
        )}
        <div className="flex-1 overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
}

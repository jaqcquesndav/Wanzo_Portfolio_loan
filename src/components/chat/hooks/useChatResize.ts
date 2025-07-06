import { useState, useRef, useEffect } from 'react';

interface WindowSize {
  width: number;
  height: number;
}

interface Position {
  x: number;
  y: number;
}

const MIN_WIDTH = 320;
const MIN_HEIGHT = 400;
const DEFAULT_WIDTH = 320;
const DEFAULT_HEIGHT = 480;
const HEADER_HEIGHT = 64;
const MARGIN = 16;

export function useChatResize(chatRef: React.RefObject<HTMLDivElement>) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [windowSize, setWindowSize] = useState<WindowSize>({
    width: DEFAULT_WIDTH,
    height: DEFAULT_HEIGHT
  });
  const [position, setPosition] = useState<Position>({
    x: MARGIN,
    y: MARGIN + HEADER_HEIGHT
  });

  const startPos = useRef({ x: 0, y: 0 });
  const startSize = useRef({ width: 0, height: 0 });

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isFullscreen) return;
    
    setIsDragging(true);
    startPos.current = { x: e.clientX, y: e.clientY };
    startSize.current = { width: windowSize.width, height: windowSize.height };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;

    const deltaX = e.clientX - startPos.current.x;
    const deltaY = e.clientY - startPos.current.y;

    // Calculer les nouvelles dimensions en respectant les limites
    const newWidth = Math.max(MIN_WIDTH, startSize.current.width + deltaX);
    const newHeight = Math.max(MIN_HEIGHT, startSize.current.height + deltaY);

    // Vérifier les limites de l'écran
    const maxWidth = window.innerWidth - position.x - MARGIN;
    const maxHeight = window.innerHeight - position.y - MARGIN;

    setWindowSize({
      width: Math.min(newWidth, maxWidth),
      height: Math.min(newHeight, maxHeight)
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  // Ajuster la position et la taille lors du redimensionnement de la fenêtre
  useEffect(() => {
    const handleResize = () => {
      if (!isFullscreen) {
        const maxWidth = window.innerWidth - MARGIN * 2;
        const maxHeight = window.innerHeight - HEADER_HEIGHT - MARGIN * 2;

        setWindowSize(prev => ({
          width: Math.min(prev.width, maxWidth),
          height: Math.min(prev.height, maxHeight)
        }));

        setPosition(prev => ({
          x: Math.min(prev.x, window.innerWidth - windowSize.width - MARGIN),
          y: Math.min(prev.y, window.innerHeight - windowSize.height - MARGIN)
        }));
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isFullscreen, windowSize]);

  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  return {
    isFullscreen,
    toggleFullscreen,
    isDragging,
    handleMouseDown,
    windowSize,
    setWindowSize,
    position
  };
}
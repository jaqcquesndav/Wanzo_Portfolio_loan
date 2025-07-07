import React, { useRef, useState, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';
import { cn } from '../../utils/cn';

interface Tab {
  key: string;
  label: string;
}

interface TabsOverflowProps {
  tabs: Tab[];
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
}

export function TabsOverflow({ tabs, value, onValueChange, className }: TabsOverflowProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleTabs, setVisibleTabs] = useState<Tab[]>(tabs);
  const [overflowTabs, setOverflowTabs] = useState<Tab[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current) return;
      const containerWidth = containerRef.current.offsetWidth;
      let total = 0;
      const vis: Tab[] = [];
      const over: Tab[] = [];
      for (const tab of tabs) {
        // Estimate width: 90px per tab (short label), 120px for selected
        const est = tab.key === value ? 120 : 90;
        if (total + est < containerWidth - 50) {
          vis.push(tab);
          total += est;
        } else {
          over.push(tab);
        }
      }
      setVisibleTabs(vis);
      setOverflowTabs(over);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [tabs, value]);

  return (
    <div
      ref={containerRef}
      className={cn('flex border-b border-gray-200 relative overflow-x-auto scrollbar-none', className)}
      style={{ minHeight: 48 }}
    >
      {visibleTabs.map(tab => (
        <button
          key={tab.key}
          onClick={() => onValueChange(tab.key)}
          className={cn(
            'px-4 py-2 text-sm font-medium border-b-2 whitespace-nowrap',
            value === tab.key
              ? 'text-primary border-primary'
              : 'text-gray-500 border-transparent hover:text-gray-700',
            'focus:outline-none'
          )}
          style={{ wordBreak: 'keep-all', whiteSpace: 'nowrap', maxWidth: 200, overflow: 'visible', textOverflow: 'clip' }}
        >
          <span style={{ display: 'inline-block', minWidth: 0 }}>{tab.label}</span>
        </button>
      ))}
      {overflowTabs.length > 0 && (
        <div className="relative">
          <button
            className="flex items-center px-2 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 focus:outline-none"
            onClick={() => setShowDropdown(v => !v)}
            aria-label="Plus d'onglets"
          >
            <ChevronRight className="h-5 w-5" />
            <span className="ml-1">...</span>
          </button>
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded shadow-lg z-10">
              {overflowTabs.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => { setShowDropdown(false); onValueChange(tab.key); }}
                  className={cn(
                    'block w-full text-left px-4 py-2 text-sm',
                    value === tab.key ? 'bg-primary text-white' : 'hover:bg-gray-100'
                  )}
                  style={{ wordBreak: 'keep-all', whiteSpace: 'nowrap', maxWidth: 200, overflow: 'visible', textOverflow: 'clip' }}
                >
                  <span style={{ display: 'inline-block', minWidth: 0 }}>{tab.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

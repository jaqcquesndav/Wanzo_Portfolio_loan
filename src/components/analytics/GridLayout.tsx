import React from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

interface GridLayoutProps {
  children: React.ReactNode;
  layout: any;
  onLayoutChange: (layout: any) => void;
}

export function GridLayout({ children, layout, onLayoutChange }: GridLayoutProps) {
  const layouts = {
    lg: layout,
    md: layout,
    sm: layout
  };

  return (
    <ResponsiveGridLayout
      className="layout"
      layouts={layouts}
      breakpoints={{ lg: 1200, md: 996, sm: 768 }}
      cols={{ lg: 12, md: 8, sm: 4 }}
      rowHeight={100}
      onLayoutChange={(_, layouts) => onLayoutChange(layouts.lg)}
      isDraggable
      isResizable
    >
      {children}
    </ResponsiveGridLayout>
  );
}
// src/components/layout/PageLayout.tsx
import React from 'react';
import { Header } from './Header';
import { Breadcrumb } from '../common/Breadcrumb';

interface PageLayoutProps {
  title: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  breadcrumbs?: Array<{ label: string; href?: string }>;
}

export function PageLayout({
  title,
  children,
  actions,
  breadcrumbs
}: PageLayoutProps) {
  return (
    <div className="space-y-6">
      <Header title={title} actions={actions} />
      {breadcrumbs && <Breadcrumb items={breadcrumbs} />}
      {children}
    </div>
  );
}

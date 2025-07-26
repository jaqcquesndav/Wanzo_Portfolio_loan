// src/components/layout/PageLayout.tsx
import React from 'react';
import { PageHeader } from '../ui/PageHeader';
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
    <div className="container mx-auto p-6 space-y-6">
      <PageHeader title={title} actions={actions} />
      {breadcrumbs && <Breadcrumb items={breadcrumbs} />}
      {children}
    </div>
  );
}

import type { LucideIcon } from 'lucide-react';

export type DocumentationSection =
  | 'getting-started'
  | 'introduction'
  | 'installation'
  | 'first-steps'
  | 'operations'
  | 'operations-overview'
  | 'funding-requests'
  | 'securities'
  | 'portfolio'
  | 'portfolio-overview'
  | 'investments'
  | 'performance'
  | 'reports'
  | 'reports-overview'
  | 'financial-reports'
  | 'custom-reports'
  | 'security'
  | 'authentication'
  | 'permissions'
  | 'data-protection'
  | 'administration'
  | 'user-management'
  | 'system-settings'
  | 'notifications'
  | 'users'
  | 'user-roles'
  | 'profile-settings'
  | 'help'
  | 'faq'
  | 'support'
  | 'troubleshooting';

export interface DocumentationSubsection {
  id: DocumentationSection;
  label: string;
}

export interface DocumentationSectionDefinition {
  id: DocumentationSection;
  label: string;
  icon: LucideIcon;
  subsections?: DocumentationSubsection[];
}

export type DocumentationContentType = 
  | { type: 'heading'; level: number; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'list'; items: string[] }
  | { type: 'code'; language: string; code: string }
  | { type: 'image'; src: string; alt: string };

export interface DocumentationContent {
  title: string;
  content: DocumentationContentType[];
}
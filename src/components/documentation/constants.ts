import {
  BookOpen, FileText, DollarSign, BarChart2,
  Shield, Settings, HelpCircle, Users
} from 'lucide-react';
import type { DocumentationSectionDefinition, DocumentationContent } from './types';

export const DOCUMENTATION_SECTIONS: DocumentationSectionDefinition[] = [
  {
    id: 'getting-started',
    label: 'Démarrage',
    icon: BookOpen,
    subsections: [
      { id: 'introduction', label: 'Introduction' },
      { id: 'installation', label: 'Installation' },
      { id: 'first-steps', label: 'Premiers pas' }
    ]
  },
  {
    id: 'operations',
    label: 'Opérations',
    icon: FileText,
    subsections: [
      { id: 'operations-overview', label: 'Vue d\'ensemble' },
      { id: 'funding-requests', label: 'Demandes de financement' },
      { id: 'securities', label: 'Titres financiers' }
    ]
  },
  {
    id: 'portfolio',
    label: 'Portefeuille',
    icon: DollarSign,
    subsections: [
      { id: 'portfolio-overview', label: 'Vue d\'ensemble' },
      { id: 'investments', label: 'Investissements' },
      { id: 'performance', label: 'Performance' }
    ]
  },
  {
    id: 'reports',
    label: 'Rapports',
    icon: BarChart2, // Changed from ChartBar to BarChart2
    subsections: [
      { id: 'reports-overview', label: 'Vue d\'ensemble' },
      { id: 'financial-reports', label: 'Rapports financiers' },
      { id: 'custom-reports', label: 'Rapports personnalisés' }
    ]
  },
  // ... rest of the sections remain unchanged
];
export const DOCUMENTATION_CONTENT: DocumentationSectionDefinition[] = [
  {
    id: 'getting-started',
    label: 'Démarrage',
    icon: BookOpen,
    subsections: [
      { id: 'introduction', label: 'Introduction' },
      { id: 'installation', label: 'Installation' },
      { id: 'first-steps', label: 'Premiers pas' }
    ]
  },
  {
    id: 'operations',
    label: 'Opérations',
    icon: FileText,
    subsections: [
      { id: 'operations-overview', label: 'Vue d\'ensemble' },
      { id: 'funding-requests', label: 'Demandes de financement' },
      { id: 'securities', label: 'Titres financiers' }
    ]
  },
  {
    id: 'portfolio',
    label: 'Portefeuille',
    icon: DollarSign,
    subsections: [
      { id: 'portfolio-overview', label: 'Vue d\'ensemble' },
      { id: 'investments', label: 'Investissements' },
      { id: 'performance', label: 'Performance' }
    ]
  },
  {
    id: 'reports',
    label: 'Rapports',
    icon: BarChart2, // Changed from ChartBar to BarChart2
    subsections: [
      { id: 'reports-overview', label: 'Vue d\'ensemble' },
      { id: 'financial-reports', label: 'Rapports financiers' },
      { id: 'custom-reports', label: 'Rapports personnalisés' }
    ]
  },
  // ... rest of the sections remain unchanged
];

// Rest of the file remains unchanged

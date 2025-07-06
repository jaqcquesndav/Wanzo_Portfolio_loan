import { useState } from 'react';
import type { DocumentationSection } from '../types';

export function useDocumentation() {
  const [activeSection, setActiveSection] = useState<DocumentationSection>('getting-started');

  return {
    activeSection,
    setActiveSection
  };
}
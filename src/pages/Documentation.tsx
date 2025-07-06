import React from 'react';
import { Book } from 'lucide-react';
import { DocumentationSidebar } from '../components/documentation/DocumentationSidebar';
import { DocumentationContent } from '../components/documentation/DocumentationContent';
import { useDocumentation } from '../components/documentation/hooks/useDocumentation';

export default function Documentation() {
  const { activeSection, setActiveSection } = useDocumentation();

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Book className="h-6 w-6 text-primary mr-2" />
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Documentation</h1>
      </div>
      
      <div className="flex gap-6">
        <DocumentationSidebar
          activeSection={activeSection}
          onSectionChange={setActiveSection}
        />
        <DocumentationContent section={activeSection} />
      </div>
    </div>
  );
}
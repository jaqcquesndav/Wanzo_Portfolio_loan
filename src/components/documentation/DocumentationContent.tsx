import React from 'react';
import { DOCUMENTATION_CONTENT } from './constants';
import type { DocumentationSection, DocumentationContentType } from './types';

interface DocumentationContentProps {
  section: DocumentationSection;
}

function renderContent(content: DocumentationContentType) {
  switch (content.type) {
    case 'heading':
      const HeadingTag = `h${content.level}` as keyof JSX.IntrinsicElements;
      return <HeadingTag className="font-bold mb-4">{content.text}</HeadingTag>;
    
    case 'paragraph':
      return <p className="mb-4 text-gray-700 dark:text-gray-300">{content.text}</p>;
    
    case 'list':
      return (
        <ul className="list-disc list-inside mb-4 space-y-2">
          {content.items.map((item, index) => (
            <li key={index} className="text-gray-700 dark:text-gray-300">{item}</li>
          ))}
        </ul>
      );
    
    case 'code':
      return (
        <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg mb-4 overflow-x-auto">
          <code className="text-sm">{content.code}</code>
        </pre>
      );
    
    case 'image':
      return (
        <img 
          src={content.src} 
          alt={content.alt} 
          className="rounded-lg mb-4 max-w-full h-auto"
        />
      );
    
    default:
      return null;
  }
}

export function DocumentationContent({ section }: DocumentationContentProps) {
  const content = DOCUMENTATION_CONTENT[section];

  if (!content) {
    return (
      <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <p className="text-gray-500 dark:text-gray-400">
          Section en cours de rédaction...
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          {content.title}
        </h2>
        
        <div className="prose dark:prose-invert max-w-none">
          {content.content.map((item, index) => (
            <React.Fragment key={index}>
              {renderContent(item)}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
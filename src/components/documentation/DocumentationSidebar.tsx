import React from 'react';
import { DOCUMENTATION_SECTIONS } from './constants';
import type { DocumentationSection } from './types';

interface DocumentationSidebarProps {
  activeSection: DocumentationSection;
  onSectionChange: (section: DocumentationSection) => void;
}

export function DocumentationSidebar({ activeSection, onSectionChange }: DocumentationSidebarProps) {
  return (
    <nav className="w-64 flex-shrink-0">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <ul className="space-y-1">
          {DOCUMENTATION_SECTIONS.map(section => (
            <li key={section.id}>
              <button
                onClick={() => onSectionChange(section.id)}
                className={`
                  w-full text-left px-3 py-2 rounded-md text-sm font-medium
                  ${activeSection === section.id
                    ? 'bg-primary-light dark:bg-primary-dark text-primary'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }
                `}
              >
                <section.icon className="h-4 w-4 inline-block mr-2" />
                {section.label}
              </button>
              
              {section.subsections && (
                <ul className="ml-6 mt-1 space-y-1">
                  {section.subsections.map(subsection => (
                    <li key={subsection.id}>
                      <button
                        onClick={() => onSectionChange(subsection.id)}
                        className={`
                          w-full text-left px-3 py-1 rounded-md text-sm
                          ${activeSection === subsection.id
                            ? 'text-primary font-medium'
                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                          }
                        `}
                      >
                        {subsection.label}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
import React from 'react';
import { HelpCircle } from 'lucide-react';

export default function Help() {
  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <HelpCircle className="h-6 w-6 text-primary mr-2" />
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Help Center</h1>
      </div>
      
      {/* Contenu à implémenter */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <p className="text-gray-500 dark:text-gray-400">Help center coming soon...</p>
      </div>
    </div>
  );
}
import React, { useState } from 'react';
import { X, Copy, Download } from 'lucide-react';
import { Button } from '../../ui/Button';
import type { Workspace } from '../../../types/analytics';

interface ShareWorkspaceModalProps {
  workspace: Workspace;
  onClose: () => void;
}

export function ShareWorkspaceModal({ workspace, onClose }: ShareWorkspaceModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    const link = `${window.location.origin}/analytics/share/${workspace.id}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExport = (format: 'json' | 'pdf') => {
    if (format === 'json') {
      const data = JSON.stringify(workspace, null, 2);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `workspace-${workspace.id}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      // Implement PDF export
      console.log('PDF export not implemented');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full mx-4">
        <div className="flex justify-between items-center p-6 border-b dark:border-gray-700">
          <h2 className="text-xl font-semibold">Share Workspace</h2>
          <Button variant="ghost" size="sm" onClick={onClose} icon={<X className="h-5 w-5" />} />
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-sm font-medium mb-2">Share Link</h3>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={`${window.location.origin}/analytics/share/${workspace.id}`}
                readOnly
                className="flex-1 p-2 border rounded"
              />
              <Button
                variant="outline"
                onClick={handleCopyLink}
                icon={<Copy className="h-4 w-4" />}
              >
                {copied ? 'Copied!' : 'Copy'}
              </Button>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium mb-2">Export</h3>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => handleExport('json')}
                icon={<Download className="h-4 w-4" />}
              >
                Export JSON
              </Button>
              <Button
                variant="outline"
                onClick={() => handleExport('pdf')}
                icon={<Download className="h-4 w-4" />}
              >
                Export PDF
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
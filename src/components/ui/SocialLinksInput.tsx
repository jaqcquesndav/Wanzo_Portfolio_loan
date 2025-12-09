import React, { useState } from 'react';
import { Plus, Trash2, ExternalLink } from 'lucide-react';
import { Button } from './Button';

interface SocialLink {
  platform: string;
  url: string;
  label: string;
}

interface SocialLinksInputProps {
  links: SocialLink[];
  onChange: (links: SocialLink[]) => void;
  isEditing: boolean;
  disabled?: boolean;
}

const SOCIAL_PLATFORMS = [
  { id: 'linkedin', label: 'LinkedIn', icon: '🔗', placeholder: 'https://linkedin.com/company/...' },
  { id: 'twitter', label: 'Twitter/X', icon: '𝕏', placeholder: 'https://twitter.com/...' },
  { id: 'facebook', label: 'Facebook', icon: 'f', placeholder: 'https://facebook.com/...' },
  { id: 'instagram', label: 'Instagram', icon: '📷', placeholder: 'https://instagram.com/...' },
  { id: 'website', label: 'Site Web', icon: '🌐', placeholder: 'https://example.com' },
  { id: 'github', label: 'GitHub', icon: '⚙️', placeholder: 'https://github.com/...' },
  { id: 'youtube', label: 'YouTube', icon: '▶️', placeholder: 'https://youtube.com/...' },
];

export const SocialLinksInput: React.FC<SocialLinksInputProps> = ({
  links,
  onChange,
  isEditing,
  disabled = false
}) => {
  const [newLink, setNewLink] = useState<SocialLink>({ platform: 'linkedin', url: '', label: '' });
  const [showAddForm, setShowAddForm] = useState(false);

  const handleAddLink = () => {
    if (newLink.url.trim()) {
      const platform = SOCIAL_PLATFORMS.find(p => p.id === newLink.platform);
      onChange([
        ...links,
        {
          platform: newLink.platform,
          url: newLink.url,
          label: newLink.label || platform?.label || ''
        }
      ]);
      setNewLink({ platform: 'linkedin', url: '', label: '' });
      setShowAddForm(false);
    }
  };

  const handleRemoveLink = (index: number) => {
    onChange(links.filter((_, i) => i !== index));
  };

  const handleUpdateLink = (index: number, field: keyof SocialLink, value: string) => {
    const updated = [...links];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const getPlatformLabel = (platformId: string) => {
    return SOCIAL_PLATFORMS.find(p => p.id === platformId)?.label || platformId;
  };

  if (!isEditing) {
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Réseaux Sociaux & Liens</h3>
        {links.length === 0 ? (
          <p className="text-sm text-gray-500 italic">Aucun lien social configuré</p>
        ) : (
          <div className="space-y-2">
            {links.map((link, index) => (
              <a
                key={index}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 group"
              >
                <span className="text-lg">{SOCIAL_PLATFORMS.find(p => p.id === link.platform)?.icon}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{link.label || getPlatformLabel(link.platform)}</p>
                  <p className="text-xs text-gray-500 truncate">{link.url}</p>
                </div>
                <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400" />
              </a>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Editing mode
  return (
    <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Réseaux Sociaux & Liens</h3>

      {/* Existing links */}
      <div className="space-y-2">
        {links.map((link, index) => (
          <div key={index} className="flex items-end gap-2 p-3 bg-white dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600">
            <div className="flex-1 space-y-2">
              <select
                value={link.platform}
                onChange={(e) => handleUpdateLink(index, 'platform', e.target.value)}
                disabled={disabled}
                className="w-full px-2 py-1 text-sm border rounded-md dark:bg-gray-600 dark:text-white dark:border-gray-500"
              >
                {SOCIAL_PLATFORMS.map(p => (
                  <option key={p.id} value={p.id}>{p.label}</option>
                ))}
              </select>
              <input
                type="url"
                value={link.url}
                onChange={(e) => handleUpdateLink(index, 'url', e.target.value)}
                placeholder="URL"
                disabled={disabled}
                className="w-full px-2 py-1 text-sm border rounded-md dark:bg-gray-600 dark:text-white dark:border-gray-500"
              />
              <input
                type="text"
                value={link.label}
                onChange={(e) => handleUpdateLink(index, 'label', e.target.value)}
                placeholder="Label (optionnel)"
                disabled={disabled}
                className="w-full px-2 py-1 text-sm border rounded-md dark:bg-gray-600 dark:text-white dark:border-gray-500"
              />
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleRemoveLink(index)}
              disabled={disabled}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>

      {/* Add new link form */}
      {showAddForm ? (
        <div className="p-3 bg-white dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600 space-y-2">
          <select
            value={newLink.platform}
            onChange={(e) => setNewLink({ ...newLink, platform: e.target.value })}
            disabled={disabled}
            className="w-full px-2 py-1 text-sm border rounded-md dark:bg-gray-600 dark:text-white dark:border-gray-500"
          >
            {SOCIAL_PLATFORMS.map(p => (
              <option key={p.id} value={p.id}>{p.label}</option>
            ))}
          </select>
          <input
            type="url"
            value={newLink.url}
            onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
            placeholder="URL"
            disabled={disabled}
            autoFocus
            className="w-full px-2 py-1 text-sm border rounded-md dark:bg-gray-600 dark:text-white dark:border-gray-500"
          />
          <input
            type="text"
            value={newLink.label}
            onChange={(e) => setNewLink({ ...newLink, label: e.target.value })}
            placeholder="Label (optionnel)"
            disabled={disabled}
            className="w-full px-2 py-1 text-sm border rounded-md dark:bg-gray-600 dark:text-white dark:border-gray-500"
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={handleAddLink} disabled={disabled}>
              Ajouter
            </Button>
            <Button size="sm" variant="outline" onClick={() => setShowAddForm(false)}>
              Annuler
            </Button>
          </div>
        </div>
      ) : (
        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowAddForm(true)}
          disabled={disabled}
          className="w-full"
        >
          <Plus className="w-4 h-4 mr-2" />
          Ajouter un lien
        </Button>
      )}
    </div>
  );
};

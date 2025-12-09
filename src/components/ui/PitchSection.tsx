import React, { useState, useEffect } from 'react';
import { Button } from './Button';

interface PitchData {
  elevator_pitch: string;
  value_proposition: string;
  target_market: string;
  competitive_advantage: string;
  pitch_deck_url?: string;
  demo_video_url?: string;
}

interface PitchSectionProps {
  pitch: PitchData;
  onChange: (pitch: PitchData) => void;
  isEditing: boolean;
  disabled?: boolean;
}

export const PitchSection: React.FC<PitchSectionProps> = ({
  pitch,
  onChange,
  isEditing,
  disabled = false
}) => {
  const [localPitch, setLocalPitch] = useState(pitch);
  const [showForm, setShowForm] = useState(isEditing);

  useEffect(() => {
    setLocalPitch(pitch);
  }, [pitch]);

  useEffect(() => {
    setShowForm(isEditing);
  }, [isEditing]);

  const handleChange = (field: keyof PitchData, value: string) => {
    setLocalPitch({ ...localPitch, [field]: value });
  };

  const handleSave = () => {
    onChange(localPitch);
    setShowForm(false);
  };

  if (!isEditing && !showForm) {
    // Display mode
    return (
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Elevator Pitch</h3>
          <p className="text-gray-900 dark:text-white">
            {localPitch.elevator_pitch || '-'}
          </p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Proposition de Valeur</h3>
          <p className="text-gray-900 dark:text-white">
            {localPitch.value_proposition || '-'}
          </p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Marché Cible</h3>
          <p className="text-gray-900 dark:text-white">
            {localPitch.target_market || '-'}
          </p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Avantage Concurrentiel</h3>
          <p className="text-gray-900 dark:text-white">
            {localPitch.competitive_advantage || '-'}
          </p>
        </div>

        {localPitch.pitch_deck_url && (
          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Pitch Deck</h3>
            <a
              href={localPitch.pitch_deck_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Voir le pitch deck
            </a>
          </div>
        )}

        {localPitch.demo_video_url && (
          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Vidéo de Démonstration</h3>
            <a
              href={localPitch.demo_video_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Voir la vidéo
            </a>
          </div>
        )}

        {isEditing && (
          <Button onClick={() => setShowForm(true)} variant="outline" size="sm">
            Éditer
          </Button>
        )}
      </div>
    );
  }

  // Editing mode
  return (
    <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <h3 className="text-base font-semibold text-gray-900 dark:text-white">Présentation & Pitch</h3>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Elevator Pitch</label>
        <textarea
          placeholder="Présentez votre entreprise en 2-3 phrases..."
          value={localPitch.elevator_pitch}
          onChange={(e) => handleChange('elevator_pitch', e.target.value)}
          disabled={disabled}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Proposition de Valeur</label>
        <textarea
          placeholder="Qu'est-ce qui rend votre solution unique?"
          value={localPitch.value_proposition}
          onChange={(e) => handleChange('value_proposition', e.target.value)}
          disabled={disabled}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Marché Cible</label>
        <textarea
          placeholder="Décrivez votre marché cible..."
          value={localPitch.target_market}
          onChange={(e) => handleChange('target_market', e.target.value)}
          disabled={disabled}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Avantage Concurrentiel</label>
        <textarea
          placeholder="Quels sont vos avantages par rapport aux concurrents?"
          value={localPitch.competitive_advantage}
          onChange={(e) => handleChange('competitive_advantage', e.target.value)}
          disabled={disabled}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">URL du Pitch Deck</label>
        <input
          type="url"
          placeholder="https://..."
          value={localPitch.pitch_deck_url || ''}
          onChange={(e) => handleChange('pitch_deck_url', e.target.value)}
          disabled={disabled}
          className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">URL de la Vidéo de Démonstration</label>
        <input
          type="url"
          placeholder="https://..."
          value={localPitch.demo_video_url || ''}
          onChange={(e) => handleChange('demo_video_url', e.target.value)}
          disabled={disabled}
          className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div className="flex gap-2 pt-4">
        <Button onClick={handleSave} disabled={disabled}>
          Valider
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            setLocalPitch(pitch);
            setShowForm(false);
          }}
        >
          Annuler
        </Button>
      </div>
    </div>
  );
};

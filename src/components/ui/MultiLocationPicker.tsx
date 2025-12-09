import React, { useState } from 'react';
import { Plus, Trash2, MapPin } from 'lucide-react';
import { Button } from './Button';
import { LocationPicker, Coordinates } from './LocationPicker';

interface MultiLocationPickerProps {
  locations: Coordinates[];
  onChange: (locations: Coordinates[]) => void;
  isEditing: boolean;
  disabled?: boolean;
  labels?: string[]; // Labels for different location types
  types?: ('siege' | 'exploitation' | 'production' | 'vente')[];
}

export const MultiLocationPicker: React.FC<MultiLocationPickerProps> = ({
  locations,
  onChange,
  isEditing,
  disabled = false,
  labels = ['Localisation 1', 'Localisation 2', 'Localisation 3'],
  types = ['siege', 'exploitation', 'production']
}) => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const handleAddLocation = () => {
    onChange([...locations, { latitude: 0, longitude: 0 }]);
    setEditingIndex(locations.length);
  };

  const handleUpdateLocation = (index: number, location: Coordinates) => {
    const updated = [...locations];
    updated[index] = location;
    onChange(updated);
    setEditingIndex(null);
  };

  const handleRemoveLocation = (index: number) => {
    onChange(locations.filter((_, i) => i !== index));
  };

  const getLocationLabel = (index: number, type?: string) => {
    if (type === 'siege') return 'Siège social';
    if (type === 'exploitation') return 'Siège d\'exploitation';
    if (type === 'production') return 'Unité de production';
    if (type === 'vente') return 'Point de vente';
    return labels[index] || `Localisation ${index + 1}`;
  };

  if (!isEditing) {
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Localisations</h3>
        {locations.length === 0 ? (
          <p className="text-sm text-gray-500 italic">Aucune localisation définie</p>
        ) : (
          <div className="space-y-2">
            {locations.map((loc, idx) => (
              <div key={idx} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 flex items-start gap-3">
                <MapPin className="w-4 h-4 text-blue-600 mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {getLocationLabel(idx, types[idx])}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {loc.address || `${loc.latitude.toFixed(4)}, ${loc.longitude.toFixed(4)}`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Editing mode
  return (
    <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Localisations</h3>

      {/* List of locations */}
      <div className="space-y-3">
        {locations.map((location, idx) => (
          <div key={idx} className="p-3 bg-white dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600">
            {editingIndex === idx ? (
              // Editing mode for this location
              <LocationPicker
                location={location}
                onChange={(loc) => handleUpdateLocation(idx, loc)}
                isEditing={true}
                label={getLocationLabel(idx, types[idx])}
                disabled={disabled}
              />
            ) : (
              // Display mode for this location
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {getLocationLabel(idx, types[idx])}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {location.address || `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditingIndex(idx)}
                    disabled={disabled}
                  >
                    Éditer
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRemoveLocation(idx)}
                    disabled={disabled}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add new location button */}
      <Button
        size="sm"
        variant="outline"
        onClick={handleAddLocation}
        disabled={disabled || locations.length >= 10}
        className="w-full"
      >
        <Plus className="w-4 h-4 mr-2" />
        Ajouter une localisation
      </Button>
    </div>
  );
};

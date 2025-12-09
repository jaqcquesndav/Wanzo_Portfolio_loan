import React, { useState, useEffect } from 'react';
import { MapPin, Search } from 'lucide-react';
import { Button } from './Button';

export interface Coordinates {
  latitude: number;
  longitude: number;
  address?: string;
}

interface LocationPickerProps {
  location: Coordinates | null;
  onChange: (location: Coordinates) => void;
  isEditing: boolean;
  disabled?: boolean;
  label?: string;
  required?: boolean;
}

export const LocationPicker: React.FC<LocationPickerProps> = ({
  location,
  onChange,
  isEditing,
  disabled = false,
  label = 'Localisation',
  required = false
}) => {
  const [address, setAddress] = useState(location?.address || '');
  const [lat, setLat] = useState<string>(location?.latitude?.toString() || '');
  const [lng, setLng] = useState<string>(location?.longitude?.toString() || '');
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isEditing) {
      setShowForm(false);
    }
  }, [isEditing]);

  const handleSave = () => {
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);

    if (isNaN(latitude) || isNaN(longitude)) {
      setError('Les coordonnées doivent être des nombres valides');
      return;
    }

    if (latitude < -90 || latitude > 90) {
      setError('La latitude doit être entre -90 et 90');
      return;
    }

    if (longitude < -180 || longitude > 180) {
      setError('La longitude doit être entre -180 et 180');
      return;
    }

    onChange({
      latitude,
      longitude,
      address: address.trim() || undefined
    });

    setError(null);
    setShowForm(false);
  };

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLat(position.coords.latitude.toString());
          setLng(position.coords.longitude.toString());
          setError(null);
        },
        () => {
          setError('Impossible de récupérer votre position');
        }
      );
    } else {
      setError('La géolocalisation n\'est pas supportée');
    }
  };

  const handleReverseGeocode = async () => {
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);

    if (isNaN(latitude) || isNaN(longitude)) {
      setError('Veuillez d\'abord entrer les coordonnées');
      return;
    }

    try {
      // Utiliser Nominatim (OpenStreetMap) pour reverse geocoding
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
      );
      const data = await response.json();
      setAddress(data.address?.city || data.display_name || '');
      setError(null);
    } catch {
      setError('Erreur lors de la recherche de l\'adresse');
    }
  };

  if (!isEditing) {
    return (
      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {location ? (
          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-blue-600 mt-1 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {location.address || `${location.latitude}, ${location.longitude}`}
                </p>
                <p className="text-xs text-gray-500">
                  {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md text-gray-500 italic">
            Aucune localisation définie
          </div>
        )}
      </div>
    );
  }

  // Editing mode
  if (!showForm) {
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setShowForm(true);
            if (location) {
              setLat(location.latitude.toString());
              setLng(location.longitude.toString());
              setAddress(location.address || '');
            }
          }}
          disabled={disabled}
          className="w-full flex items-center justify-center gap-2"
        >
          <MapPin className="w-4 h-4" />
          {location ? 'Modifier la localisation' : 'Ajouter une localisation'}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</h4>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Adresse</label>
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="ex: Kinshasa, RDC"
          disabled={disabled}
          className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Latitude</label>
          <input
            type="number"
            value={lat}
            onChange={(e) => setLat(e.target.value)}
            placeholder="-4.3276"
            step="0.0001"
            disabled={disabled}
            className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Longitude</label>
          <input
            type="number"
            value={lng}
            onChange={(e) => setLng(e.target.value)}
            placeholder="15.3136"
            step="0.0001"
            disabled={disabled}
            className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}

      <div className="grid grid-cols-2 gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={handleGetCurrentLocation}
          disabled={disabled}
          className="flex items-center justify-center gap-1"
        >
          <Search className="w-4 h-4" />
          Ma position
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={handleReverseGeocode}
          disabled={disabled || !lat || !lng}
          className="flex items-center justify-center gap-1"
        >
          <Search className="w-4 h-4" />
          Rechercher
        </Button>
      </div>

      <div className="flex gap-2">
        <Button
          size="sm"
          onClick={handleSave}
          disabled={disabled || !lat || !lng}
        >
          Valider
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowForm(false)}
        >
          Annuler
        </Button>
      </div>
    </div>
  );
};

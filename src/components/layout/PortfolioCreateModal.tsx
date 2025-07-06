import React, { useState } from 'react';
import { X } from 'lucide-react';

interface PortfolioCreateModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (name: string) => void;
  portfolioType: string;
}

export function PortfolioCreateModal({ open, onClose, onCreate, portfolioType }: PortfolioCreateModalProps) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Le nom du portefeuille est requis.');
      return;
    }
    setError('');
    onCreate(name.trim());
    setName('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-700"
          onClick={onClose}
          aria-label="Fermer"
        >
          <X className="h-5 w-5" />
        </button>
        <h2 className="text-xl font-bold mb-4">Nouveau portefeuille {portfolioType ? `(${portfolioType})` : ''}</h2>
        <form onSubmit={handleSubmit}>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nom du portefeuille
            <input
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary-light focus:ring-opacity-50"
              value={name}
              onChange={e => setName(e.target.value)}
              autoFocus
            />
          </label>
          {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
          <div className="flex justify-end mt-4">
            <button
              type="button"
              className="mr-2 px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-700"
              onClick={onClose}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded bg-primary text-white hover:bg-primary-dark"
            >
              Créer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

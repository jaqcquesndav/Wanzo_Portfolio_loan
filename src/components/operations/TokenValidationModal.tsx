import React, { useState } from 'react';
import { X, Key, AlertTriangle } from 'lucide-react';
import { Button } from '../ui/Button';
import { FormField, Input } from '../ui/Form';

interface TokenValidationModalProps {
  stepLabel: string;
  onValidate: (token: string) => Promise<void>;
  onClose: () => void;
  loading?: boolean;
  generatedToken?: string;
}

export function TokenValidationModal({ 
  stepLabel, 
  onValidate, 
  onClose, 
  loading,
  generatedToken 
}: TokenValidationModalProps) {
  const [token, setToken] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await onValidate(token);
    } catch (err) {
      setError('Token invalide');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full mx-4">
        <div className="flex justify-between items-center p-6 border-b dark:border-gray-700">
          <div className="flex items-center">
            <Key className="h-6 w-6 text-primary mr-2" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {generatedToken ? 'Token généré' : 'Validation requise'}
            </h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            icon={<X className="h-5 w-5" />}
          />
        </div>

        <div className="p-6 space-y-4">
          {generatedToken ? (
            <>
              <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  Un token a été généré pour l'étape "{stepLabel}". Veuillez le conserver
                  précieusement, il sera nécessaire pour la validation d'une étape ultérieure.
                </p>
              </div>
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Token généré:
                </p>
                <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg font-mono text-lg text-center">
                  {generatedToken}
                </div>
              </div>
            </>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Pour procéder avec l'étape "{stepLabel}", veuillez entrer le token
                de validation qui vous a été fourni précédemment.
              </p>

              <FormField label="Token de validation" error={error}>
                <Input
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Entrez le token..."
                  required
                />
              </FormField>

              {error && (
                <div className="bg-red-50 dark:bg-red-900 p-4 rounded-lg flex items-start">
                  <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5 mr-2" />
                  <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                </div>
              )}

              <div className="flex justify-end space-x-4">
                <Button type="button" variant="outline" onClick={onClose}>
                  Annuler
                </Button>
                <Button type="submit" loading={loading}>
                  Valider
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
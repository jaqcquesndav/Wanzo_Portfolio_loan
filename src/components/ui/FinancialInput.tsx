import React from 'react';
import { EditableField } from './EditableField';

interface FinancialInputData {
  [key: string]: string | number | undefined;
}

interface FinancialInputProps {
  data: FinancialInputData;
  onChange: (data: FinancialInputData) => void;
  isEditing: boolean;
  disabled?: boolean;
  fields?: string[];
}

/**
 * Composant générique pour l'input de données financières
 * À adapter selon les champs spécifiques souhaités
 */
export const FinancialInput: React.FC<FinancialInputProps> = ({
  data,
  onChange,
  isEditing,
  disabled = false,
  fields = ['capital_social', 'taux_interet', 'frais_montage']
}) => {
  const handleChange = (field: string, value: string) => {
    onChange({ ...data, [field]: value });
  };

  if (!isEditing) {
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Données financières</h3>
        {Object.entries(data || {}).map(([key, value]) => (
          <div key={key}>
            <p className="text-sm text-gray-600 dark:text-gray-400">{key}</p>
            <p className="text-gray-900 dark:text-white font-semibold">{value || '-'}</p>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Données financières</h3>

      {fields.map((field) => (
        <EditableField
          key={field}
          label={field.replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase())}
          value={data?.[field]?.toString() || ''}
          onChange={(value) => handleChange(field, value)}
          type="number"
          isEditing={true}
          disabled={disabled}
        />
      ))}
    </div>
  );
};

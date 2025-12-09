import React, { useState, useEffect } from 'react';
import { Check, X } from 'lucide-react';
import { Button } from './Button';

interface EditableFieldProps {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  isEditing: boolean;
  disabled?: boolean;
  placeholder?: string;
  type?: 'text' | 'number' | 'email' | 'tel' | 'date' | 'textarea';
  required?: boolean;
  error?: string;
  helperText?: string;
  readOnly?: boolean;
  multiline?: boolean;
  rows?: number;
  className?: string;
}

export const EditableField: React.FC<EditableFieldProps> = ({
  label,
  value,
  onChange,
  isEditing,
  disabled = false,
  placeholder,
  type = 'text',
  required = false,
  error,
  helperText,
  readOnly = false,
  multiline = false,
  rows = 3,
  className = ''
}) => {
  const [tempValue, setTempValue] = useState<string | number>(value);

  useEffect(() => {
    setTempValue(value);
  }, [value, isEditing]);

  const handleSave = () => {
    onChange(String(tempValue));
  };

  const handleCancel = () => {
    setTempValue(value);
  };

  if (readOnly) {
    return (
      <div className={`space-y-1 ${className}`}>
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <div className="px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-md text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700">
          {multiline ? (
            <p className="whitespace-pre-wrap">{value || '-'}</p>
          ) : (
            <span>{value || '-'}</span>
          )}
        </div>
      </div>
    );
  }

  if (!isEditing) {
    return (
      <div className={`space-y-1 ${className}`}>
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <div className="px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-md text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700">
          {multiline ? (
            <p className="whitespace-pre-wrap text-sm">{value || '-'}</p>
          ) : (
            <span className="text-sm">{value || '-'}</span>
          )}
        </div>
      </div>
    );
  }

  // Editing mode
  return (
    <div className={`space-y-1 ${className}`}>
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      {multiline ? (
        <textarea
          value={tempValue}
          onChange={(e) => setTempValue(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          disabled={disabled}
          className={`w-full px-3 py-2 rounded-md border dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
            error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
          } focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-100 dark:disabled:bg-gray-600`}
        />
      ) : (
        <input
          type={type}
          value={tempValue}
          onChange={(e) => setTempValue(type === 'number' ? e.target.value : e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full px-3 py-2 rounded-md border dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
            error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
          } focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-100 dark:disabled:bg-gray-600`}
        />
      )}

      {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
      {helperText && !error && <p className="text-xs text-gray-500 dark:text-gray-400">{helperText}</p>}

      <div className="flex gap-2 pt-2">
        <Button
          size="sm"
          onClick={handleSave}
          className="flex items-center gap-1"
        >
          <Check className="w-4 h-4" />
          Valider
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={handleCancel}
          className="flex items-center gap-1"
        >
          <X className="w-4 h-4" />
          Annuler
        </Button>
      </div>
    </div>
  );
};

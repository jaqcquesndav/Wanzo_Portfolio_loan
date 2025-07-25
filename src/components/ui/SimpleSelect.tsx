// components/ui/SimpleSelect.tsx
import React from 'react';

interface SimpleSelectProps<T extends string = string> {
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
  className?: string;
  placeholder?: string;
}

export function SimpleSelect<T extends string = string>({
  value,
  options,
  onChange,
  className,
  placeholder = 'Sélectionner...'
}: SimpleSelectProps<T>) {
  return (
    <select 
      value={value}
      onChange={(e) => onChange(e.target.value as T)}
      className={`h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ${className || ''}`}
    >
      {placeholder && <option value="" disabled>{placeholder}</option>}
      {options.map(option => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

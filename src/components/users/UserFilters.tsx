import React from 'react';
import { Search } from 'lucide-react';
import { FormField, Input, Select } from '../ui/Form';
import type { UserRole } from '../../types/users';

interface UserFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedRole: UserRole | 'all';
  onRoleChange: (role: UserRole | 'all') => void;
}

export function UserFilters({
  searchTerm,
  onSearchChange,
  selectedRole,
  onRoleChange
}: UserFiltersProps) {
  return (
    <div className="bg-white p-4 rounded-lg shadow space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="Rechercher">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Rechercher par nom ou email..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </FormField>

        <FormField label="Rôle">
          <Select
            value={selectedRole}
            onChange={(e) => onRoleChange(e.target.value as UserRole | 'all')}
          >
            <option value="all">Tous les rôles</option>
            <option value="admin">Administrateur</option>
            <option value="manager">Manager</option>
            <option value="user">Utilisateur</option>
          </Select>
        </FormField>
      </div>
    </div>
  );
}
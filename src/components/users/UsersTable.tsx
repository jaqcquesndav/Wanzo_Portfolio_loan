// src/components/users/UsersTable.tsx
import { useState, useCallback } from 'react';
import { Users, UserPlus, Search, Filter } from 'lucide-react';
import { DataTable } from '../ui/DataTable';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useUsersApi } from '../../hooks/useUsersApi';
import type { User, UserRole } from '../../types/user';

interface UsersTableProps {
  onUserSelect?: (user: User) => void;
  onUserCreate?: () => void;
  onUserEdit?: (user: User) => void;
  onUserDelete?: (user: User) => void;
}

export function UsersTable({ 
  onUserCreate, 
  onUserEdit, 
  onUserDelete 
}: UsersTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters] = useState<{
    role?: UserRole;
    status?: string;
  }>({});

  const {
    users,
    loading,
    error,
    pagination,
    loadUsers
  } = useUsersApi();

  // Charger les utilisateurs avec filtres
  const handleLoadUsers = useCallback(() => {
    loadUsers({
      search: searchTerm,
      ...filters,
      page: pagination.page,
      limit: pagination.limit
    });
  }, [loadUsers, searchTerm, filters, pagination.page, pagination.limit]);

  // Gérer la recherche avec debounce
  const handleSearch = useCallback((value: string) => {
    setSearchTerm(value);
    // TODO: Implémenter debounce
    setTimeout(() => {
      loadUsers({
        search: value,
        ...filters,
        page: 1,
        limit: pagination.limit
      });
    }, 300);
  }, [loadUsers, filters, pagination.limit]);

  // Définition des colonnes
  const columns = [
    {
      key: 'name',
      header: 'Nom complet',
      render: (_: unknown, user: User) => (
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
            <span className="text-sm font-medium text-primary">
              {(user.givenName || user.name || 'U').charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <span className="font-medium">
              {user.givenName && user.familyName ? `${user.givenName} ${user.familyName}` : user.name || 'Utilisateur'}
            </span>
          </div>
        </div>
      )
    },
    {
      key: 'email',
      header: 'Email',
      render: (value: unknown) => (
        <span className="text-gray-600 dark:text-gray-400">{String(value)}</span>
      )
    },
    {
      key: 'role',
      header: 'Rôle',
      render: (value: unknown) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
          {String(value || 'User')}
        </span>
      )
    },
    {
      key: 'userType',
      header: 'Type',
      render: (value: unknown) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
          {value === 'sme' ? 'PME' : value === 'financial_institution' ? 'Institution Financière' : 'N/A'}
        </span>
      )
    },
    {
      key: 'emailVerified',
      header: 'Statut',
      render: (value: unknown) => {
        const isVerified = Boolean(value);
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            isVerified 
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
          }`}>
            {isVerified ? 'Vérifié' : 'En attente'}
          </span>
        );
      }
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (_: unknown, user: User) => (
        <div className="flex items-center space-x-2">
          {onUserEdit && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onUserEdit(user)}
            >
              Modifier
            </Button>
          )}
          {onUserDelete && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onUserDelete(user)}
              className="text-red-600 hover:text-red-700"
            >
              Supprimer
            </Button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-4">
      {/* Barre de recherche et actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex-1 max-w-md relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Rechercher des utilisateurs..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {/* TODO: Ouvrir modal de filtres */}}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filtrer
          </Button>
          
          {onUserCreate && (
            <Button
              onClick={onUserCreate}
              size="sm"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Ajouter
            </Button>
          )}
        </div>
      </div>

      {/* Table des données */}
      <DataTable<User>
        data={users}
        columns={columns}
        loading={loading}
        error={error}
        onRetry={handleLoadUsers}
        emptyState={{
          icon: Users,
          title: 'Aucun utilisateur trouvé',
          description: searchTerm 
            ? `Aucun utilisateur ne correspond à "${searchTerm}"`
            : 'Aucun utilisateur n\'est configuré dans le système',
          action: onUserCreate ? {
            label: 'Ajouter un utilisateur',
            onClick: onUserCreate
          } : undefined
        }}
        showRowNumbers
        className="mt-4"
      />

      {/* Pagination */}
      {!loading && !error && users.length > 0 && (
        <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">
              Affichage de {((pagination.page - 1) * pagination.limit) + 1} à{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} sur{' '}
              {pagination.total} utilisateurs
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page <= 1}
              onClick={() => loadUsers({
                search: searchTerm,
                ...filters,
                page: pagination.page - 1,
                limit: pagination.limit
              })}
            >
              Précédent
            </Button>
            
            <span className="text-sm text-gray-500">
              Page {pagination.page} sur {pagination.totalPages}
            </span>
            
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => loadUsers({
                search: searchTerm,
                ...filters,
                page: pagination.page + 1,
                limit: pagination.limit
              })}
            >
              Suivant
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
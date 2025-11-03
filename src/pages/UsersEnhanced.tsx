// src/pages/UsersEnhanced.tsx
import { useState, useCallback } from 'react';
import { Users as UsersIcon, UserPlus, Shield, Building } from 'lucide-react';
import { DataTable } from '../components/ui/DataTable';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { CreateUserModal } from '../components/users/CreateUserModal';
import { UserForm } from '../components/users/UserForm';
import type { User, UserRole } from '../types/user';
import { useAuth } from '../contexts/useAuth';
import { useUsersApiEnhanced } from '../hooks/useUsersApiEnhanced';

export default function UsersEnhanced() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole | 'all'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  
  const { user: currentUser } = useAuth();
  
  // Hook API amélioré
  const {
    users,
    loading,
    error,
    pagination,
    loadUsers,
    updateUser,
    deleteUser,
    retry
  } = useUsersApiEnhanced();
  
  // Permissions (simplifié pour la démo)
  const canCreateUsers = true;
  const canEditUsers = true;
  const canDeleteUsers = true;

  // Gérer la recherche avec debounce
  const handleSearch = useCallback((value: string) => {
    setSearchTerm(value);
    
    // Debounce simple
    const timer = setTimeout(() => {
      loadUsers({
        search: value,
        role: selectedRole !== 'all' ? selectedRole : undefined,
        page: 1,
        limit: pagination.limit
      });
    }, 300);

    return () => clearTimeout(timer);
  }, [loadUsers, selectedRole, pagination.limit]);

  // Gérer le changement de rôle
  const handleRoleChange = useCallback((role: UserRole | 'all') => {
    setSelectedRole(role);
    loadUsers({
      search: searchTerm,
      role: role !== 'all' ? role : undefined,
      page: 1,
      limit: pagination.limit
    });
  }, [loadUsers, searchTerm, pagination.limit]);

  // Gérer la pagination
  const handlePageChange = useCallback((page: number) => {
    loadUsers({
      search: searchTerm,
      role: selectedRole !== 'all' ? selectedRole : undefined,
      page,
      limit: pagination.limit
    });
  }, [loadUsers, searchTerm, selectedRole, pagination.limit]);

  // Gérer la mise à jour d'utilisateur
  const handleUpdateUser = useCallback(async (userId: string, updates: Partial<User>) => {
    try {
      await updateUser(userId, updates);
      setEditingUser(null);
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
    }
  }, [updateUser]);

  // Gérer la suppression d'utilisateur
  const handleDeleteUser = useCallback(async (userId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      try {
        await deleteUser(userId);
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
  }, [deleteUser]);

  // Définition des colonnes pour la table
  const columns = [
    {
      key: 'givenName' as keyof User,
      header: 'Nom',
      render: (_value: unknown, user: User) => (
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
            <span className="text-sm font-medium text-primary">
              {user.givenName?.charAt(0).toUpperCase() || user.name?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
          <div>
            <div className="font-medium text-gray-900 dark:text-white">
              {user.givenName || user.name} {user.familyName}
            </div>
            <div className="text-sm text-gray-500">{user.email}</div>
          </div>
        </div>
      )
    },
    {
      key: 'role' as keyof User,
      header: 'Rôle',
      render: (_value: unknown, user: User) => (
        <Badge variant="secondary">{user.role || 'User'}</Badge>
      )
    },
    {
      key: 'idStatus' as keyof User,
      header: 'Statut',
      render: (_value: unknown, user: User) => {
        const status = user.idStatus || 'pending';
        const variants = {
          verified: 'success' as const,
          pending: 'warning' as const,
          rejected: 'danger' as const
        };
        return (
          <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
            {status}
          </Badge>
        );
      }
    },
    {
      key: 'actions' as keyof User,
      header: 'Actions',
      render: (_value: unknown, user: User) => (
        <div className="flex items-center space-x-2">
          {canEditUsers && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setEditingUser(user)}
            >
              Modifier
            </Button>
          )}
          {canDeleteUsers && user.id !== currentUser?.id && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleDeleteUser(user.id)}
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
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <UsersIcon className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Gestion des Utilisateurs
            </h1>
            <p className="text-gray-500">
              Gérez les utilisateurs et leurs permissions
            </p>
          </div>
        </div>
        
        {canCreateUsers && (
          <Button onClick={() => setShowCreateModal(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Ajouter un utilisateur
          </Button>
        )}
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center">
            <UsersIcon className="h-8 w-8 text-blue-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total utilisateurs</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {pagination.total}
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center">
            <Shield className="h-8 w-8 text-green-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Utilisateurs vérifiés</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {users.filter(u => u.idStatus === 'verified').length}
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center">
            <Building className="h-8 w-8 text-purple-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Administrateurs</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {users.filter(u => u.role === 'Admin').length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filtres et recherche */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Rechercher des utilisateurs..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
          
          <select
            value={selectedRole}
            onChange={(e) => handleRoleChange(e.target.value as UserRole | 'all')}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">Tous les rôles</option>
            <option value="Admin">Administrateur</option>
            <option value="Portfolio_Manager">Gestionnaire de portefeuille</option>
            <option value="Auditor">Auditeur</option>
            <option value="User">Utilisateur</option>
          </select>
        </div>
      </Card>

      {/* Table des données */}
      <Card>
        <DataTable
          data={users}
          columns={columns}
          loading={loading}
          error={error}
          onRetry={retry}
          emptyState={{
            icon: UsersIcon,
            title: 'Aucun utilisateur trouvé',
            description: searchTerm 
              ? `Aucun utilisateur ne correspond à "${searchTerm}"`
              : 'Aucun utilisateur n\'est configuré dans le système',
            action: canCreateUsers ? {
              label: 'Ajouter un utilisateur',
              onClick: () => setShowCreateModal(true)
            } : undefined
          }}
          showRowNumbers
        />

        {/* Pagination */}
        {!loading && !error && users.length > 0 && (
          <div className="px-6 py-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Affichage de {((pagination.page - 1) * pagination.limit) + 1} à{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} sur{' '}
                {pagination.total} utilisateurs
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page <= 1}
                  onClick={() => handlePageChange(pagination.page - 1)}
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
                  onClick={() => handlePageChange(pagination.page + 1)}
                >
                  Suivant
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Modals */}
      {showCreateModal && (
        <CreateUserModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            // Le hook se charge déjà du refresh
          }}
          currentUserIsAdmin={currentUser?.role === 'Admin' || false}
        />
      )}

      {editingUser && (
        <UserForm
          user={editingUser}
          onSubmit={async (updates: Partial<User>) => {
            await handleUpdateUser(editingUser.id, updates);
          }}
          onCancel={() => setEditingUser(null)}
          currentUserIsAdmin={currentUser?.role === 'Admin' || false}
        />
      )}
    </div>
  );
}
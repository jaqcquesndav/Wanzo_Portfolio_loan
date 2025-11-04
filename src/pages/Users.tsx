import { useState, useEffect } from 'react';
import { Users as UsersIcon, UserPlus, Shield, Building } from 'lucide-react';
import { UsersList } from '../components/users/UsersList';
import { UserFilters } from '../components/users/UserFilters';
import { CreateUserModal } from '../components/users/CreateUserModal';
import { UserForm } from '../components/users/UserForm';
import { Button } from '../components/ui/Button';
import { Pagination } from '../components/ui/Pagination';
import { UsersSkeleton } from '../components/ui/UsersSkeleton';
import { User, UserRole } from '../types/users';
import { useNotification } from '../contexts/useNotification';
import { useAuth } from '../contexts/useAuth';
import { useUsersApi } from '../hooks/useUsersApi';

const ITEMS_PER_PAGE = 9;

export default function Users() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole | 'all'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [view] = useState<'grid' | 'table'>('table');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  
  const { showNotification } = useNotification();
  const { user: currentUser } = useAuth();
  
  // Utiliser le hook API pour gérer les utilisateurs
  const {
    users,
    loading,
    error,
    pagination,
    loadUsers,
    updateUser,
    deleteUser
  } = useUsersApi();
  
  // Pendant le développement, considérons l'utilisateur connecté comme Admin
  const currentUserIsAdmin = true;
  const financialInstitutionId = 'fin-001';

  // Charger les utilisateurs avec filtres
  useEffect(() => {
    const filters: {
      role?: UserRole;
      search?: string;
      page?: number;
      limit?: number;
    } = {
      page: currentPage,
      limit: ITEMS_PER_PAGE
    };
    
    if (selectedRole !== 'all') {
      filters.role = selectedRole;
    }
    
    if (searchTerm.trim()) {
      filters.search = searchTerm.trim();
    }
    
    loadUsers(filters);
  }, [currentPage, selectedRole, searchTerm, loadUsers]);

  const filteredUsers = users.filter(user => {
    // Recherche sur nom complet, prénom, nom, ou email
    const fullName = `${user.givenName || ''} ${user.familyName || ''}`.trim();
    const matchesSearch = 
      (user.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (fullName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.email.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Filtre par rôle, 'all' montre tous les rôles
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    
    return matchesSearch && matchesRole;
  });

  const totalPages = pagination.totalPages || Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const paginatedUsers = filteredUsers;

  const handleEditUser = (user: User) => {
    setEditingUser(user);
  };

  const handleUpdateUser = async (userData: Partial<User>) => {
    if (!editingUser) return;
    
    try {
      await updateUser(editingUser.id, userData);
      setEditingUser(null);
    } catch (err) {
      console.error('Erreur lors de la mise à jour:', err);
    }
  };

  const handleDelete = async (userId: string) => {
    // Vérifier si l'utilisateur est Admin et n'est pas en train de se supprimer lui-même
    if (!currentUserIsAdmin) {
      showNotification('Vous n\'avez pas les droits pour supprimer un utilisateur', 'error');
      return;
    }
    
    if (userId === currentUser?.id) {
      showNotification('Vous ne pouvez pas supprimer votre propre compte', 'error');
      return;
    }
    
    try {
      await deleteUser(userId);
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
    }
  };

  // Affichage du chargement pendant le chargement initial
  if (loading && users.length === 0) {
    return <UsersSkeleton />;
  }

  // Affichage des erreurs
  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">Erreur lors du chargement des utilisateurs</div>
        <Button onClick={() => loadUsers()}>Réessayer</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <UsersIcon className="h-6 w-6 text-primary mr-2" />
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Gestion des utilisateurs
          </h1>
        </div>
        <div className="flex items-center space-x-4">
          <Button
            onClick={() => setShowCreateModal(true)}
            icon={<UserPlus className="h-5 w-5" />}
            isLoading={loading}
          >
            Nouvel utilisateur
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 flex items-center flex-1">
          <Shield className="h-10 w-10 text-green-500 mr-3" />
          <div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Administrateurs</div>
            <div className="text-2xl font-semibold">
              {users.filter(u => u.role === 'Admin').length}
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 flex items-center flex-1">
          <Building className="h-10 w-10 text-blue-500 mr-3" />
          <div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Gestionnaires de Portefeuille</div>
            <div className="text-2xl font-semibold">
              {users.filter(u => u.role === 'Portfolio_Manager').length}
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 flex items-center flex-1">
          <UsersIcon className="h-10 w-10 text-purple-500 mr-3" />
          <div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Total des utilisateurs</div>
            <div className="text-2xl font-semibold">{users.length}</div>
          </div>
        </div>
      </div>

      <UserFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedRole={selectedRole}
        onRoleChange={setSelectedRole}
      />

      <UsersList
        users={paginatedUsers}
        onEdit={handleEditUser}
        onDelete={handleDelete}
        view={view}
        currentUserIsAdmin={currentUserIsAdmin}
      />

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}

      {showCreateModal && (
        <CreateUserModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            showNotification('Utilisateur créé avec succès', 'success');
            // Recharger la liste des utilisateurs après création
            loadUsers();
          }}
          currentUserIsAdmin={currentUserIsAdmin}
          financialInstitutionId={financialInstitutionId}
        />
      )}

      {editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b dark:border-gray-700">
              <h2 className="text-xl font-semibold dark:text-white">Modifier l'utilisateur</h2>
            </div>
            <div className="p-6">
              <UserForm
                user={editingUser}
                onSubmit={handleUpdateUser}
                onCancel={() => setEditingUser(null)}
                currentUserIsAdmin={currentUserIsAdmin}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
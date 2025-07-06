import React, { useState } from 'react';
import { Users as UsersIcon, UserPlus, Grid, List } from 'lucide-react';
import { UsersList } from '../components/users/UsersList';
import { UserFilters } from '../components/users/UserFilters';
import { CreateUserModal } from '../components/users/CreateUserModal';
import { UserForm } from '../components/users/UserForm';
import { Button } from '../components/ui/Button';
import { Pagination } from '../components/ui/Pagination';
import { ViewToggle } from '../components/funding/ViewToggle';
import type { User, UserRole } from '../types/users';
import { useNotification } from '../contexts/NotificationContext';

const ITEMS_PER_PAGE = 9;

const mockUsers: User[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'admin',
    phone: '+1234567890',
    created_at: '2024-01-15'
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'manager',
    created_at: '2024-02-01'
  }
];

export default function Users() {
  const [users] = useState<User[]>(mockUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole | 'all'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [view, setView] = useState<'grid' | 'table'>('table');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  
  const { showNotification } = useNotification();

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleCreateUser = async (data: any) => {
    try {
      // API call would go here
      showNotification('Utilisateur créé avec succès', 'success');
      setShowCreateModal(false);
    } catch (error) {
      showNotification('Erreur lors de la création', 'error');
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
  };

  const handleUpdateUser = async (data: any) => {
    try {
      // API call would go here
      showNotification('Utilisateur mis à jour avec succès', 'success');
      setEditingUser(null);
    } catch (error) {
      showNotification('Erreur lors de la mise à jour', 'error');
    }
  };

  const handleDelete = async (userId: string) => {
    try {
      // API call would go here
      showNotification('Utilisateur supprimé avec succès', 'success');
    } catch (error) {
      showNotification('Erreur lors de la suppression', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <UsersIcon className="h-6 w-6 text-primary mr-2" />
          <h1 className="text-2xl font-semibold text-gray-900">
            Gestion des utilisateurs
          </h1>
        </div>
        <div className="flex items-center space-x-4">
          <ViewToggle view={view} onViewChange={setView} />
          <Button
            onClick={() => setShowCreateModal(true)}
            icon={<UserPlus className="h-5 w-5" />}
          >
            Nouvel utilisateur
          </Button>
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
          }}
        />
      )}

      {editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full mx-4">
            <div className="p-6 border-b dark:border-gray-700">
              <h2 className="text-xl font-semibold">Modifier l'utilisateur</h2>
            </div>
            <div className="p-6">
              <UserForm
                user={editingUser}
                onSubmit={handleUpdateUser}
                onCancel={() => setEditingUser(null)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
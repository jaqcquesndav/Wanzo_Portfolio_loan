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
import { useNotification } from '../contexts/NotificationContext';
import { useAuth } from '../contexts/useAuth';
import { useLoading } from '../hooks/useLoading';

const ITEMS_PER_PAGE = 9;

// Données utilisateur simulées avec la nouvelle structure
const mockUsers: User[] = [
  {
    id: '1',
    email: 'john@example.com',
    emailVerified: true,
    name: 'John Doe',
    givenName: 'John',
    familyName: 'Doe',
    role: 'Admin',
    phone: '+1234567890',
    address: '123 Main St, City',
    idNumber: 'AB123456',
    idType: 'passport',
    idStatus: 'verified',
    userType: 'financial_institution',
    financialInstitutionId: 'fin-001',
    isCompanyOwner: true,
    createdAt: '2024-01-15',
    updatedAt: '2024-06-01',
    language: 'fr',
    permissions: ['manage_users', 'view_reports', 'edit_settings'],
    tokenBalance: 100
  },
  {
    id: '2',
    email: 'jane@example.com',
    name: 'Jane Smith',
    givenName: 'Jane',
    familyName: 'Smith',
    role: 'Portfolio_Manager',
    phone: '+3456789012',
    userType: 'financial_institution',
    financialInstitutionId: 'fin-001',
    isCompanyOwner: false,
    createdAt: '2024-02-01',
    language: 'en'
  },
  {
    id: '3',
    email: 'robert@example.com',
    name: 'Robert Brown',
    givenName: 'Robert',
    familyName: 'Brown',
    role: 'Auditor',
    phone: '+5678901234',
    userType: 'financial_institution',
    financialInstitutionId: 'fin-001',
    isCompanyOwner: false,
    createdAt: '2024-03-15',
    language: 'fr'
  },
  {
    id: '4',
    email: 'maria@example.com',
    name: 'Maria Garcia',
    givenName: 'Maria',
    familyName: 'Garcia',
    role: 'User',
    phone: '+6789012345',
    userType: 'sme',
    companyId: 'comp-001',
    isCompanyOwner: true,
    createdAt: '2024-04-10',
    language: 'fr'
  }
];

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole | 'all'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [view] = useState<'grid' | 'table'>('table');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  
  const { showNotification } = useNotification();
  const { user: currentUser } = useAuth();
  const { isLoading, withLoading } = useLoading();
  
  // Pendant le développement, considérons l'utilisateur connecté comme Admin
  const currentUserIsAdmin = true;
  const financialInstitutionId = 'fin-001';

  // Charger les utilisateurs au montage du composant
  useEffect(() => {
    const loadUsers = async () => {
      // Simuler un appel API
      await new Promise(resolve => setTimeout(resolve, 1000));
      setUsers(mockUsers);
    };

    withLoading(loadUsers);
  }, [withLoading]);

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

  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleEditUser = (user: User) => {
    setEditingUser(user);
  };

  const handleUpdateUser = async (userData: Partial<User>) => {
    try {
      await withLoading(async () => {
        // API call would go here
        console.log('Mise à jour de l\'utilisateur avec les données :', userData);
        // Simuler délai API
        await new Promise(resolve => setTimeout(resolve, 500));
      });
      showNotification('Utilisateur mis à jour avec succès', 'success');
      setEditingUser(null);
    } catch (err) {
      showNotification('Erreur lors de la mise à jour', 'error');
      console.error(err);
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
      await withLoading(async () => {
        // API call would go here
        await new Promise(resolve => setTimeout(resolve, 500));
      });
      showNotification('Utilisateur supprimé avec succès', 'success');
    } catch (err) {
      showNotification('Erreur lors de la suppression', 'error');
      console.error(err);
    }
  };

  // Affichage du chargement pendant le chargement initial
  if (isLoading && users.length === 0) {
    return <UsersSkeleton />;
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
            isLoading={isLoading}
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
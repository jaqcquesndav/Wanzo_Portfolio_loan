// @ts-expect-error -- React is used for JSX
import React from 'react';
import { Mail, Phone, Edit, Trash2, UserCog, ShieldCheck, Briefcase, Globe } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { User } from '../../types/users';
import { formatDate } from '../../utils/formatters';
import { PaginatedTable } from '../ui/PaginatedTable';
import { useTablePagination } from '../../hooks/useTablePagination';

interface UsersListProps {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (userId: string) => void;
  view: 'grid' | 'table';
  currentUserIsAdmin: boolean;
}

// Helper function pour obtenir la couleur du badge selon le rôle
const getRoleBadgeVariant = (role?: string) => {
  switch (role) {
    case 'Admin':
      return 'success';
    case 'Portfolio_Manager':
      return 'primary';
    case 'Auditor':
      return 'warning';
    default:
      return 'secondary';
  }
};

// Helper function pour obtenir l'icône selon le rôle
const getRoleIcon = (role?: string) => {
  switch (role) {
    case 'Admin':
      return <ShieldCheck className="h-4 w-4 mr-1" />;
    case 'Portfolio_Manager':
      return <Briefcase className="h-4 w-4 mr-1" />;
    case 'Auditor':
      return <UserCog className="h-4 w-4 mr-1" />;
    default:
      return <Globe className="h-4 w-4 mr-1" />;
  }
};

export function UsersList({ 
  users, 
  onEdit, 
  onDelete, 
  view,
  currentUserIsAdmin
}: UsersListProps) {
  const { paginatedData, currentPage, totalPages, nextPage, prevPage } = useTablePagination(
    users,
    10
  );
  
  if (view === 'grid') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginatedData.map((user) => (
          <div key={user.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  {user.name || `${user.givenName || ''} ${user.familyName || ''}`}
                </h3>
                <div className="flex items-center mt-1">
                  <Badge variant={getRoleBadgeVariant(user.role)}>
                    <span className="flex items-center">
                      {getRoleIcon(user.role)}
                      {user.role || 'User'}
                    </span>
                  </Badge>
                  {user.isCompanyOwner && (
                    <Badge variant="primary" className="ml-2">
                      Propriétaire
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(user)}
                  icon={<Edit className="h-4 w-4" />}
                />
                {currentUserIsAdmin && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(user.id)}
                    icon={<Trash2 className="h-4 w-4 text-red-500" />}
                  />
                )}
              </div>
            </div>
            
            <div className="mt-4 space-y-2">
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <Mail className="h-4 w-4 mr-2" />
                {user.email}
                {user.emailVerified && (
                  <Badge variant="success" className="ml-2 text-xs">
                    Vérifié
                  </Badge>
                )}
              </div>
              {user.phone && (
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <Phone className="h-4 w-4 mr-2" />
                  {user.phone}
                </div>
              )}
            </div>
            
            <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              Membre depuis {formatDate(user.createdAt)}
            </div>
          </div>
        ))}
        <div className="col-span-full mt-4">
          {totalPages > 1 && (
            <div className="flex justify-center">
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={prevPage}
                  disabled={currentPage === 1}
                >
                  Précédent
                </Button>
                <span className="flex items-center px-3 py-1 text-sm">
                  Page {currentPage} sur {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={nextPage}
                  disabled={currentPage === totalPages}
                >
                  Suivant
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  const columns = [
    {
      header: 'Utilisateur',
      accessor: (user: User) => (
        <>
          <div className="text-sm font-medium text-gray-900 dark:text-white">
            {user.name || `${user.givenName || ''} ${user.familyName || ''}`}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
        </>
      )
    },
    {
      header: 'Rôle',
      accessor: (user: User) => (
        <Badge variant={getRoleBadgeVariant(user.role)}>
          <span className="flex items-center">
            {getRoleIcon(user.role)}
            {user.role || 'User'}
          </span>
        </Badge>
      )
    },
    {
      header: 'Type',
      accessor: (user: User) => (
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {user.userType === 'financial_institution' ? 'Institution' : 
           user.userType === 'sme' ? 'PME' : '-'}
          {user.isCompanyOwner && (
            <Badge variant="primary" className="ml-2">
              Propriétaire
            </Badge>
          )}
        </span>
      )
    },
    {
      header: 'Contact',
      accessor: (user: User) => (
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {user.phone || '-'}
        </span>
      )
    },
    {
      header: 'Date d\'inscription',
      accessor: (user: User) => (
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {formatDate(user.createdAt)}
        </span>
      )
    },
    {
      header: 'Actions',
      accessor: (user: User) => (
        <div className="flex justify-end space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(user)}
            icon={<Edit className="h-4 w-4" />}
          >
            Modifier
          </Button>
          {currentUserIsAdmin && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(user.id)}
              icon={<Trash2 className="h-4 w-4" />}
            >
              Supprimer
            </Button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden">
      <PaginatedTable
        data={paginatedData}
        columns={columns}
        keyField="id"
        itemsPerPage={10}
      />
      {totalPages > 1 && (
        <div className="flex justify-center mt-4">
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={prevPage}
              disabled={currentPage === 1}
            >
              Précédent
            </Button>
            <span className="flex items-center px-3 py-1 text-sm">
              Page {currentPage} sur {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={nextPage}
              disabled={currentPage === totalPages}
            >
              Suivant
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
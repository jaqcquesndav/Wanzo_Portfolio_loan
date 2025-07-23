import React from 'react';
import { Mail, Phone, Edit, Trash2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import type { User } from '../../types/users';
import { formatDate } from '../../utils/formatters';
import { PaginatedTable } from '../ui/PaginatedTable';
import { useTablePagination } from '../../hooks/useTablePagination';

interface UsersListProps {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (userId: string) => void;
  view: 'grid' | 'table';
}

export function UsersList({ users, onEdit, onDelete, view }: UsersListProps) {
  const { paginatedData, currentPage, totalPages, nextPage, prevPage } = useTablePagination(
    users,
    10
  );
  
  if (view === 'grid') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginatedData.map((user) => (
          <div key={user.id} className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">{user.name}</h3>
                <Badge variant={user.role === 'admin' ? 'success' : 'primary'}>
                  {user.role}
                </Badge>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(user)}
                  icon={<Edit className="h-4 w-4" />}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(user.id)}
                  icon={<Trash2 className="h-4 w-4 text-red-500" />}
                />
              </div>
            </div>
            
            <div className="mt-4 space-y-2">
              <div className="flex items-center text-sm text-gray-500">
                <Mail className="h-4 w-4 mr-2" />
                {user.email}
              </div>
              {user.phone && (
                <div className="flex items-center text-sm text-gray-500">
                  <Phone className="h-4 w-4 mr-2" />
                  {user.phone}
                </div>
              )}
            </div>
            
            <div className="mt-4 text-sm text-gray-500">
              Membre depuis {formatDate(user.created_at)}
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
          <div className="text-sm font-medium text-gray-900">{user.name}</div>
          <div className="text-sm text-gray-500">{user.email}</div>
        </>
      )
    },
    {
      header: 'Rôle',
      accessor: (user: User) => (
        <Badge variant={user.role === 'admin' ? 'success' : 'primary'}>
          {user.role}
        </Badge>
      )
    },
    {
      header: 'Contact',
      accessor: (user: User) => (
        <span className="text-sm text-gray-500">
          {user.phone || '-'}
        </span>
      )
    },
    {
      header: 'Date d\'inscription',
      accessor: (user: User) => (
        <span className="text-sm text-gray-500">
          {formatDate(user.created_at)}
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
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(user.id)}
            icon={<Trash2 className="h-4 w-4" />}
          >
            Supprimer
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="bg-white shadow-sm rounded-lg overflow-hidden">
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
import { useState, useEffect } from 'react';
import { GuaranteeType } from '../../../../types/credit';
import { Button } from '../../../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/Card';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../../../../components/ui/Table';
import { PlusIcon, PencilIcon, TrashIcon } from 'lucide-react';
import { TableSkeleton } from '../../../../components/ui/TableSkeleton';
import { GuaranteeTypeForm } from './GuaranteeTypeForm';
import { ConfirmDialog } from '../../../../components/ui/ConfirmDialog';

// Mock data
const mockGuaranteeTypes: GuaranteeType[] = [
  {
    id: 'gt-001',
    name: 'Hypothèque',
    description: 'Garantie immobilière sur un bien appartenant à l\'emprunteur',
    createdAt: '2024-12-10T10:00:00Z',
    updatedAt: '2025-01-15T14:30:00Z'
  },
  {
    id: 'gt-002',
    name: 'Nantissement',
    description: 'Garantie sur des biens mobiliers ou des titres',
    createdAt: '2024-12-12T11:15:00Z'
  },
  {
    id: 'gt-003',
    name: 'Caution personnelle',
    description: 'Engagement d\'une personne physique à rembourser le cRédit en cas de dûfaillance',
    createdAt: '2024-12-15T09:30:00Z',
    updatedAt: '2025-02-01T16:45:00Z'
  },
  {
    id: 'gt-004',
    name: 'Caution solidaire',
    description: 'Engagement d\'une personne morale à rembourser le cRédit en cas de dûfaillance',
    createdAt: '2025-01-05T14:20:00Z'
  },
  {
    id: 'gt-005',
    name: 'dûpôt à terme',
    description: 'Blocage d\'un montant sur un compte en garantie du cRédit',
    createdAt: '2025-01-10T10:45:00Z',
    updatedAt: '2025-03-15T11:30:00Z'
  }
];

interface GuaranteeTypesListProps {
  portfolioId: string;
}

export function GuaranteeTypesList({ portfolioId }: GuaranteeTypesListProps) {
  const [guaranteeTypes, setGuaranteeTypes] = useState<GuaranteeType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<GuaranteeType | null>(null);

  useEffect(() => {
    // Simuler un chargement des données
    const loadData = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 800));
      setGuaranteeTypes(mockGuaranteeTypes);
      setLoading(false);
    };

    loadData();
  }, [portfolioId]);

  const handleCreate = () => {
    setSelectedType(null);
    setIsFormOpen(true);
  };

  const handleEdit = (type: GuaranteeType) => {
    setSelectedType(type);
    setIsFormOpen(true);
  };

  const handleDelete = (type: GuaranteeType) => {
    setSelectedType(type);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (selectedType) {
      setGuaranteeTypes(prevTypes => prevTypes.filter(t => t.id !== selectedType.id));
      setIsDeleteDialogOpen(false);
      setSelectedType(null);
    }
  };

  const handleSubmit = (guaranteeType: Omit<GuaranteeType, 'id' | 'createdAt'>) => {
    if (selectedType) {
      // Mise à jour
      setGuaranteeTypes(prevTypes =>
        prevTypes.map(t =>
          t.id === selectedType.id
            ? { ...t, ...guaranteeType, updatedAt: new Date().toISOString() }
            : t
        )
      );
    } else {
      // CRéation
      const newType: GuaranteeType = {
        ...guaranteeType,
        id: `gt-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      setGuaranteeTypes(prevTypes => [...prevTypes, newType]);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Types de garantie</CardTitle>
        <Button onClick={handleCreate} size="sm">
          <PlusIcon className="h-4 w-4 mr-2" />
          Nouveau type
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <TableSkeleton columns={4} rows={5} />
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableHeader>Nom</TableHeader>
                <TableHeader>Description</TableHeader>
                <TableHeader>Date de cRéation</TableHeader>
                <TableHeader className="text-right">Actions</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {guaranteeTypes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                    Aucun type de garantie trouvé
                  </TableCell>
                </TableRow>
              ) : (
                guaranteeTypes.map((type) => (
                  <TableRow key={type.id}>
                    <TableCell className="font-medium">{type.name}</TableCell>
                    <TableCell>{type.description || '-'}</TableCell>
                    <TableCell>{new Date(type.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(type)}
                        title="Modifier"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(type)}
                        title="Supprimer"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>

      {/* Modal de cRéation/modification */}
      <GuaranteeTypeForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSubmit}
        initialData={selectedType || undefined}
      />

      {/* Dialog de confirmation de suppression */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title="Supprimer le type de garantie"
        description={`Êtes-vous sûr de vouloir supprimer le type de garantie "${selectedType?.name}" ? Cette action ne peut pas être annulée.`}
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
      />
    </Card>
  );
}


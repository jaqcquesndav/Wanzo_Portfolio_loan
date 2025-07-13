import { useNavigate } from 'react-router-dom';
import type { Equipment } from '../../../types/leasing';
import { ActionsDropdown } from '../../ui/ActionsDropdown';
import { LeasingTable, type Column } from '../../ui/LeasingTable';
import { formatters } from '../../../utils/tableFormatters';

interface EquipmentsTableProps {
  equipments: Equipment[];
  loading?: boolean;
  onRowClick?: (equipment: Equipment) => void;
}

export function EquipmentsTable({ equipments, loading, onRowClick }: EquipmentsTableProps) {
  const navigate = useNavigate();
  
  const handleRowClick = (equipment: Equipment) => {
    if (onRowClick) {
      onRowClick(equipment);
    } else {
      navigate(`/app/leasing/equipments/${equipment.id}`);
    }
  };

  const getEquipmentConditionBadge = (condition: string) => {
    const conditionMap: Record<string, { label: string, variant: 'success' | 'warning' | 'default' }> = {
      'new': { label: 'Neuf', variant: 'success' },
      'used': { label: 'Occasion', variant: 'warning' },
      'refurbished': { label: 'Reconditionné', variant: 'default' },
    };
    
    const config = conditionMap[condition] || { label: condition, variant: 'default' };
    return formatters.badge(condition, config.variant, config.label);
  };

  const columns: Array<Column<Equipment>> = [
    {
      header: 'Nom',
      accessorKey: 'name',
    },
    {
      header: 'Catégorie',
      accessorKey: 'category',
    },
    {
      header: 'État',
      accessorKey: 'condition',
      cell: (equipment: Equipment) => getEquipmentConditionBadge(equipment.condition)
    },
    {
      header: 'Disponibilité',
      accessorKey: 'availability',
      cell: (equipment: Equipment) => 
        equipment.availability 
          ? formatters.badge('available', 'success', 'Disponible') 
          : formatters.badge('unavailable', 'error', 'Indisponible')
    },
    {
      header: 'Actions',
      accessorKey: (equipment: Equipment) => (
        <div className="actions-dropdown inline-block">
          <ActionsDropdown
            actions={[
              { label: 'Détail', onClick: () => navigate(`/app/leasing/equipments/${equipment.id}`) },
              { label: 'Réserver', onClick: () => navigate(`/app/leasing/reservations/new?equipment=${equipment.id}`) },
              { label: 'Maintenance', onClick: () => navigate(`/app/leasing/maintenance/new?equipment=${equipment.id}`) }
            ]}
          />
        </div>
      ),
      align: 'center'
    }
  ];

  const filterOptions = [
    {
      id: 'category',
      label: 'Catégorie',
      options: Array.from(new Set(equipments.map(eq => eq.category)))
        .map(category => ({ value: category, label: category }))
    },
    {
      id: 'condition',
      label: 'État',
      options: [
        { value: 'new', label: 'Neuf' },
        { value: 'used', label: 'Occasion' },
        { value: 'refurbished', label: 'Reconditionné' }
      ]
    },
    {
      id: 'availability',
      label: 'Disponibilité',
      options: [
        { value: 'true', label: 'Disponible' },
        { value: 'false', label: 'Indisponible' }
      ]
    }
  ];

  return (
    <LeasingTable
      data={equipments}
      columns={columns}
      loading={loading}
      onRowClick={handleRowClick}
      keyExtractor={(item) => item.id}
      filterOptions={filterOptions}
      searchPlaceholder="Rechercher un équipement..."
      noDataMessage="Aucun équipement à afficher"
    />
  );
}



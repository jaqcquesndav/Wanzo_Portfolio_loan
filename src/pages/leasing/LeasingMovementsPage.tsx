import { mockLeasingMovements } from '../../data/mockLeasing';
import { PaginatedTable } from '../../components/ui/PaginatedTable';
import { EquipmentMovement } from '../../types/leasing-asset';
import { Column } from '../../components/ui/TableTypes';

export default function LeasingMovementsPage() {
  // Définir les colonnes du tableau
  const columns: Column<EquipmentMovement>[] = [
    { header: 'Équipement', accessor: 'equipment_id' as keyof EquipmentMovement },
    { header: 'Type', accessor: 'type' as keyof EquipmentMovement },
    { 
      header: 'Date', 
      accessor: (mov: EquipmentMovement) => new Date(mov.date).toLocaleString() 
    },
    { 
      header: 'De', 
      accessor: (mov: EquipmentMovement) => mov.from_location || '-' 
    },
    { 
      header: 'Vers', 
      accessor: (mov: EquipmentMovement) => mov.to_location || '-' 
    },
    { 
      header: 'Utilisateur', 
      accessor: (mov: EquipmentMovement) => mov.user_id || '-' 
    },
    { 
      header: 'Notes', 
      accessor: (mov: EquipmentMovement) => mov.notes || '-' 
    }
  ];

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Mouvements d'équipements</h2>
      
      <PaginatedTable
        data={mockLeasingMovements}
        columns={columns}
        keyField="id"
        itemsPerPage={10}
      />
    </div>
  );
}

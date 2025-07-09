// Removed unused React import
import type { Equipment } from '../../../types/leasing';
// import { ActionsDropdown } from '../../ui/ActionsDropdown';



interface EquipmentsTableProps {
  equipments: Equipment[];
  loading?: boolean;
  onRowClick?: (equipment: Equipment) => void;
}

export function EquipmentsTable({ equipments }: EquipmentsTableProps) {

  // Debug log to check what is received
  console.log('DEBUG EquipmentsTable:', { equipments });
  return (
    <div className="p-4">
      <div className="text-sm text-gray-500 mb-2">Equipments reçus: {equipments?.length ?? 0}</div>
      {/* TODO: Restore full table UI after confirming data flow */}
    </div>
  );
}



import { mockLeasingReservations } from '../../data/mockLeasing';
import { PaginatedTable } from '../../components/ui/PaginatedTable';
import { Reservation } from '../../types/leasing-asset';
import { Column } from '../../components/ui/TableTypes';

export default function LeasingReservationsPage() {
  // Définir les colonnes du tableau
  const columns: Column<Reservation>[] = [
    { header: 'Équipement', accessor: 'equipment_id' as keyof Reservation },
    { header: 'Utilisateur', accessor: 'user_id' as keyof Reservation },
    { 
      header: 'Début', 
      accessor: (res: Reservation) => new Date(res.start_date).toLocaleString() 
    },
    { 
      header: 'Fin', 
      accessor: (res: Reservation) => new Date(res.end_date).toLocaleString() 
    },
    { header: 'Statut', accessor: 'status' as keyof Reservation },
    { header: 'Notes', accessor: 'notes' as keyof Reservation }
  ];

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Réservations d'équipements</h2>
      
      <PaginatedTable
        data={mockLeasingReservations}
        columns={columns}
        keyField="id"
        itemsPerPage={10}
      />
    </div>
  );
}

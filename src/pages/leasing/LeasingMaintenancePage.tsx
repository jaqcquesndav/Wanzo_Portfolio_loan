import { mockLeasingMaintenances } from '../../data/mockLeasing';
import { PaginatedTable } from '../../components/ui/PaginatedTable';
import { Maintenance } from '../../types/leasing-asset';
import { Column } from '../../components/ui/TableTypes';

export default function LeasingMaintenancePage() {
  // Définir les colonnes du tableau
  const columns: Column<Maintenance>[] = [
    { header: 'Équipement', accessor: 'equipment_id' as keyof Maintenance },
    { header: 'Type', accessor: 'type' as keyof Maintenance },
    { header: 'Description', accessor: 'description' as keyof Maintenance },
    { 
      header: 'Date prévue', 
      accessor: (mnt: Maintenance) => new Date(mnt.scheduled_date).toLocaleString() 
    },
    { header: 'Statut', accessor: 'status' as keyof Maintenance },
    { header: 'Fournisseur', accessor: 'provider' as keyof Maintenance },
    { 
      header: 'Coût', 
      accessor: (mnt: Maintenance) => mnt.cost ? mnt.cost + ' €' : '-'
    }
  ];

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Maintenances programmées</h2>
      
      <PaginatedTable
        data={mockLeasingMaintenances}
        columns={columns}
        keyField="id"
        itemsPerPage={10}
      />
    </div>
  );
}

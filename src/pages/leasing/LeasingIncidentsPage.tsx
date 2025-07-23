import { mockLeasingIncidents } from '../../data/mockLeasing';
import { PaginatedTable } from '../../components/ui/PaginatedTable';
import { Incident } from '../../types/leasing-asset';
import { Column } from '../../components/ui/TableTypes';

export default function LeasingIncidentsPage() {
  // Définir les colonnes du tableau
  const columns: Column<Incident>[] = [
    { header: 'Équipement', accessor: 'equipment_id' as keyof Incident },
    { header: 'Signalé par', accessor: 'reported_by' as keyof Incident },
    { 
      header: 'Date', 
      accessor: (inc: Incident) => new Date(inc.date_reported).toLocaleString() 
    },
    { header: 'Description', accessor: 'description' as keyof Incident },
    { header: 'Statut', accessor: 'status' as keyof Incident },
    { 
      header: 'Résolution', 
      accessor: (inc: Incident) => inc.resolution_notes || '-'
    }
  ];

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Incidents signalés</h2>
      
      <PaginatedTable
        data={mockLeasingIncidents}
        columns={columns}
        keyField="id"
        itemsPerPage={10}
      />
    </div>
  );
}

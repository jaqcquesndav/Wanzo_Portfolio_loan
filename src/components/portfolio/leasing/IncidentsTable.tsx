import { useMemo } from 'react';
import type { Incident } from '../../../types/leasing-asset';
import { ActionsDropdown } from '../../ui/ActionsDropdown';
import { LeasingTable, type Column } from '../../ui/LeasingTable';
import { formatters } from '../../../utils/tableFormatters';
import { generateTransactionId } from '../../../utils/formatters';

interface IncidentsTableProps {
  incidents: Incident[];
  loading?: boolean;
  onRowClick?: (incident: Incident) => void;
}

export function IncidentsTable({ incidents, loading = false, onRowClick }: IncidentsTableProps) {
  // Map des statuts d'incident avec leurs variantes et labels
  const statusMap = useMemo(() => ({
    'open': { label: 'Ouvert', variant: 'error' as const },
    'in_progress': { label: 'En cours', variant: 'warning' as const },
    'resolved': { label: 'Résolu', variant: 'success' as const },
    'closed': { label: 'Fermé', variant: 'info' as const }
  }), []);
  
  // Compter les incidents par statut
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {
      open: 0,
      in_progress: 0,
      resolved: 0,
      closed: 0
    };
    
    incidents.forEach(incident => {
      if (counts[incident.status] !== undefined) {
        counts[incident.status]++;
      }
    });
    
    return counts;
  }, [incidents]);

  // Configuration des colonnes
  const columns = useMemo<Column<Incident>[]>(() => [
    {
      header: 'Référence',
      accessorKey: 'id',
      cell: (incident) => {
        const incidentId = generateTransactionId('INC', parseInt(incident.id.replace('inc-', '')));
        return <span className="font-mono">{incidentId}</span>;
      }
    },
    {
      header: 'Équipement',
      accessorKey: 'equipment_id'
    },
    {
      header: 'Signalé par',
      accessorKey: 'reported_by'
    },
    {
      header: 'Date de signalement',
      accessorKey: 'date_reported',
      cell: (incident) => formatters.date(incident.date_reported)
    },
    {
      header: 'Description',
      accessorKey: 'description',
      cell: (incident) => (
        <div className="max-w-xs truncate" title={incident.description}>
          {incident.description}
        </div>
      )
    },
    {
      header: 'Statut',
      accessorKey: 'status',
      cell: (incident) => {
        const status = incident.status;
        const config = statusMap[status] || { label: status, variant: 'default' as const };
        return formatters.badge(status, config.variant, config.label);
      }
    },
    {
      header: 'Actions',
      // Pour les actions, nous utilisons accessorKey comme une fonction qui retourne une ReactNode vide
      accessorKey: (() => '') as unknown as keyof Incident,
      cell: (incident) => (
        <div className="actions-dropdown inline-block">
          <ActionsDropdown
            actions={[
              { 
                label: 'Voir détails', 
                onClick: () => onRowClick && onRowClick(incident)
              },
              { 
                label: incident.status === 'open' ? 'Prendre en charge' : 'Mettre à jour',
                onClick: () => console.log('TODO: Update incident status', incident.id) 
              },
              { 
                label: 'Planifier maintenance',
                onClick: () => console.log('TODO: Schedule maintenance for', incident.id),
                disabled: incident.status === 'closed' || incident.status === 'resolved'
              }
            ]}
          />
        </div>
      ),
      align: 'center' as const
    }
  ], [onRowClick, statusMap]);

  // Options de filtrage
  const filterOptions = [
    {
      id: 'status',
      label: 'Statut',
      options: [
        { value: 'open', label: 'Ouvert' },
        { value: 'in_progress', label: 'En cours' },
        { value: 'resolved', label: 'Résolu' },
        { value: 'closed', label: 'Fermé' }
      ]
    }
  ];

  // Données pour le résumé
  const summaryData = [
    { 
      label: 'Total incidents', 
      value: incidents.length
    },
    { 
      label: 'Ouverts', 
      value: statusCounts.open
    },
    {
      label: 'En cours',
      value: statusCounts.in_progress
    }
  ];

  return (
    <LeasingTable
      data={incidents}
      columns={columns}
      loading={loading}
      onRowClick={onRowClick}
      keyExtractor={(item) => item.id}
      filterOptions={filterOptions}
      searchPlaceholder="Rechercher un incident..."
      noDataMessage="Aucun incident à afficher"
      summaryData={summaryData}
    />
  );
}

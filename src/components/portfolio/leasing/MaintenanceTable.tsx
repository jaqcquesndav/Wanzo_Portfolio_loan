import { useMemo } from 'react';
import type { Maintenance } from '../../../types/leasing-asset';
import { ActionsDropdown } from '../../ui/ActionsDropdown';
import { LeasingTable, type Column } from '../../ui/LeasingTable';
import { formatters } from '../../../utils/tableFormatters';
import { formatCurrency, generateTransactionId } from '../../../utils/formatters';

interface MaintenanceTableProps {
  maintenance: Maintenance[];
  loading?: boolean;
  onRowClick?: (maintenance: Maintenance) => void;
}

export function MaintenanceTable({ maintenance, loading = false, onRowClick }: MaintenanceTableProps) {
  // Map des statuts de maintenance avec leurs variantes et labels
  const statusMap = useMemo(() => ({
    'scheduled': { label: 'Planifiée', variant: 'info' as const },
    'in_progress': { label: 'En cours', variant: 'warning' as const },
    'completed': { label: 'Terminée', variant: 'success' as const },
    'cancelled': { label: 'Annulée', variant: 'default' as const }
  }), []);
  
  // Map des types de maintenance avec leurs variantes et labels
  const typeMap = useMemo(() => ({
    'preventive': { label: 'Préventive', variant: 'info' as const },
    'curative': { label: 'Curative', variant: 'warning' as const }
  }), []);
  
  // Compter les maintenances par statut
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {
      scheduled: 0,
      in_progress: 0,
      completed: 0,
      cancelled: 0
    };
    
    maintenance.forEach(item => {
      if (counts[item.status] !== undefined) {
        counts[item.status]++;
      }
    });
    
    return counts;
  }, [maintenance]);

  // Calculer le coût total des maintenances
  const totalCost = useMemo(() => {
    return maintenance.reduce((sum, m) => sum + (m.cost || 0), 0);
  }, [maintenance]);

  // Configuration des colonnes
  const columns = useMemo<Column<Maintenance>[]>(() => [
    {
      header: 'Référence',
      accessorKey: 'id',
      cell: (item) => {
        const maintenanceId = generateTransactionId('MAINT', parseInt(item.id.replace('maint-', '')));
        return <span className="font-mono">{maintenanceId}</span>;
      }
    },
    {
      header: 'Équipement',
      accessorKey: 'equipment_id'
    },
    {
      header: 'Type',
      accessorKey: 'type',
      cell: (item) => {
        const type = item.type;
        const config = typeMap[type] || { label: type, variant: 'default' as const };
        return formatters.badge(type, config.variant, config.label);
      }
    },
    {
      header: 'Description',
      accessorKey: 'description',
      cell: (item) => (
        <div className="max-w-xs truncate" title={item.description}>
          {item.description}
        </div>
      )
    },
    {
      header: 'Date planifiée',
      accessorKey: 'scheduled_date',
      cell: (item) => formatters.date(item.scheduled_date)
    },
    {
      header: 'Date réalisation',
      accessorKey: 'completed_date',
      cell: (item) => item.completed_date ? formatters.date(item.completed_date) : '-'
    },
    {
      header: 'Prestataire',
      accessorKey: 'provider',
      cell: (item) => item.provider || '-'
    },
    {
      header: 'Coût',
      accessorKey: 'cost',
      cell: (item) => item.cost ? formatCurrency(item.cost, undefined, 'USD') : '-',
      align: 'right' as const
    },
    {
      header: 'Statut',
      accessorKey: 'status',
      cell: (item) => {
        const status = item.status;
        const config = statusMap[status] || { label: status, variant: 'default' as const };
        return formatters.badge(status, config.variant, config.label);
      }
    },
    {
      header: 'Actions',
      accessorKey: (() => '') as unknown as keyof Maintenance,
      cell: (item) => (
        <div className="actions-dropdown inline-block">
          <ActionsDropdown
            actions={[
              { 
                label: 'Voir détails', 
                onClick: () => onRowClick && onRowClick(item)
              },
              { 
                label: item.status === 'scheduled' ? 'Démarrer' : 'Mettre à jour',
                onClick: () => console.log('TODO: Update maintenance status', item.id),
                disabled: item.status === 'completed' || item.status === 'cancelled'
              },
              { 
                label: 'Marquer comme terminée',
                onClick: () => console.log('TODO: Complete maintenance', item.id),
                disabled: item.status !== 'in_progress'
              }
            ]}
          />
        </div>
      ),
      align: 'center' as const
    }
  ], [onRowClick, statusMap, typeMap]);

  // Options de filtrage
  const filterOptions = [
    {
      id: 'type',
      label: 'Type',
      options: [
        { value: 'preventive', label: 'Préventive' },
        { value: 'curative', label: 'Curative' }
      ]
    },
    {
      id: 'status',
      label: 'Statut',
      options: [
        { value: 'scheduled', label: 'Planifiée' },
        { value: 'in_progress', label: 'En cours' },
        { value: 'completed', label: 'Terminée' },
        { value: 'cancelled', label: 'Annulée' }
      ]
    }
  ];

  // Données pour le résumé
  const summaryData = [
    { 
      label: 'Total maintenances', 
      value: maintenance.length
    },
    { 
      label: 'Planifiées', 
      value: statusCounts.scheduled 
    },
    {
      label: 'En cours',
      value: statusCounts.in_progress
    },
    {
      label: 'Coût total',
      value: formatCurrency(totalCost, undefined, 'USD')
    }
  ];

  return (
    <LeasingTable
      data={maintenance}
      columns={columns}
      loading={loading}
      onRowClick={onRowClick}
      keyExtractor={(item) => item.id}
      filterOptions={filterOptions}
      searchPlaceholder="Rechercher une maintenance..."
      noDataMessage="Aucune maintenance à afficher"
      summaryData={summaryData}
    />
  );
}

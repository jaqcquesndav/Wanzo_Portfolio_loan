import { useMemo } from 'react';
import type { LeasingContract } from '../../../types/leasing';
import { ActionsDropdown } from '../../ui/ActionsDropdown';
import { LeasingTable, type Column } from '../../ui/LeasingTable';
import { formatters } from '../../../utils/tableFormatters';
import { formatCurrency, generateTransactionId } from '../../../utils/formatters';

interface ContractsTableProps {
  contracts: LeasingContract[];
  loading?: boolean;
  onRowClick?: (contract: LeasingContract) => void;
}

export function ContractsTable({ contracts, loading = false, onRowClick }: ContractsTableProps) {
  // Calculer le montant total des contrats
  const totalAmount = useMemo(() => {
    return contracts.reduce((sum, contract) => {
      // Calculer la valeur totale du contrat (mensualité * durée)
      const startDate = new Date(contract.start_date);
      const endDate = new Date(contract.end_date);
      const months = (endDate.getFullYear() - startDate.getFullYear()) * 12 + 
                    (endDate.getMonth() - startDate.getMonth());
      return sum + (contract.monthly_payment * months);
    }, 0);
  }, [contracts]);

  // Configuration des colonnes
  const columns = useMemo<Column<LeasingContract>[]>(() => [
    {
      header: 'Référence',
      accessorKey: 'id',
      cell: (contract) => {
        const contractId = generateTransactionId('CONT', parseInt(contract.id.replace('cont-', '')));
        return <span className="font-mono">{contractId}</span>;
      }
    },
    {
      header: 'Client',
      accessorKey: 'client_id'
    },
    {
      header: 'Équipement',
      accessorKey: 'equipment_id'
    },
    {
      header: 'Début',
      accessorKey: 'start_date',
      cell: (contract) => formatters.date(contract.start_date)
    },
    {
      header: 'Fin',
      accessorKey: 'end_date',
      cell: (contract) => formatters.date(contract.end_date)
    },
    {
      header: 'Mensualité',
      accessorKey: 'monthly_payment',
      cell: (contract) => formatCurrency(contract.monthly_payment),
      align: 'right' as const
    },
    {
      header: 'Taux',
      accessorKey: 'interest_rate',
      cell: (contract) => `${contract.interest_rate}%`,
      align: 'right' as const
    },
    {
      header: 'Maintenance',
      accessorKey: 'maintenance_included',
      cell: (contract) => contract.maintenance_included 
        ? formatters.badge('included', 'success', 'Incluse')
        : formatters.badge('excluded', 'default', 'Non incluse')
    },
    {
      header: 'Assurance',
      accessorKey: 'insurance_included',
      cell: (contract) => contract.insurance_included
        ? formatters.badge('included', 'success', 'Incluse')
        : formatters.badge('excluded', 'default', 'Non incluse')
    },
    {
      header: 'Actions',
      accessorKey: (() => '') as unknown as keyof LeasingContract,
      cell: (contract) => (
        <div className="actions-dropdown inline-block">
          <ActionsDropdown
            actions={[
              { 
                label: 'Voir détails', 
                onClick: () => onRowClick && onRowClick(contract)
              },
              { 
                label: 'Générer facture', 
                onClick: () => console.log('TODO: Générer facture pour', contract.id) 
              },
              { 
                label: 'Modifier contrat', 
                onClick: () => console.log('TODO: Modifier contrat', contract.id) 
              }
            ]}
          />
        </div>
      ),
      align: 'center' as const
    }
  ], [onRowClick]);

  // Options de filtrage
  const filterOptions = [
    {
      id: 'maintenance_included',
      label: 'Maintenance',
      options: [
        { value: 'true', label: 'Incluse' },
        { value: 'false', label: 'Non incluse' }
      ]
    },
    {
      id: 'insurance_included',
      label: 'Assurance',
      options: [
        { value: 'true', label: 'Incluse' },
        { value: 'false', label: 'Non incluse' }
      ]
    }
  ];

  // Calculer la durée moyenne des contrats
  const averageDurationMonths = useMemo(() => {
    if (contracts.length === 0) return 0;
    
    const totalMonths = contracts.reduce((sum, contract) => {
      const startDate = new Date(contract.start_date);
      const endDate = new Date(contract.end_date);
      const months = (endDate.getFullYear() - startDate.getFullYear()) * 12 + 
                    (endDate.getMonth() - startDate.getMonth());
      return sum + months;
    }, 0);
    
    return Math.round(totalMonths / contracts.length);
  }, [contracts]);

  // Données pour le résumé
  const summaryData = [
    { 
      label: 'Nombre de contrats', 
      value: contracts.length
    },
    { 
      label: 'Valeur totale', 
      value: formatCurrency(totalAmount)
    },
    {
      label: 'Durée moyenne',
      value: `${averageDurationMonths} mois`
    }
  ];

  return (
    <LeasingTable
      data={contracts}
      columns={columns}
      loading={loading}
      onRowClick={onRowClick}
      keyExtractor={(item) => item.id}
      filterOptions={filterOptions}
      searchPlaceholder="Rechercher un contrat..."
      noDataMessage="Aucun contrat à afficher"
      showFilters={true}
      summaryData={summaryData}
    />
  );
}

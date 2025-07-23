import { useMemo } from 'react';
import type { LeasingContract } from '../../../types/leasing';
import { ActionsDropdown } from '../../ui/ActionsDropdown';
import { LeasingTable, type Column } from '../../ui/LeasingTable';
import { formatters } from '../../../utils/tableFormatters';
import { useFormatCurrency } from '../../../hooks/useFormatCurrency';

interface ContractsTableProps {
  contracts: LeasingContract[];
  loading?: boolean;
  onRowClick?: (contract: LeasingContract) => void;
  onViewCompany?: (companyId: string) => void;
  onGenerateInvoice?: (contract: LeasingContract) => void;
  onActivate?: (contract: LeasingContract) => void;
  onTerminate?: (contract: LeasingContract) => void;
  orderEquipment?: (contract: LeasingContract) => void;
}

export function ContractsTable({ 
  contracts, 
  loading = false, 
  onRowClick, 
  onViewCompany,
  onGenerateInvoice,
  onActivate,
  onTerminate,
  orderEquipment
}: ContractsTableProps) {
  const { formatCurrency } = useFormatCurrency();
  
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
        return <span className="font-mono">{contract.id}</span>;
      }
    },
    {
      header: 'Client',
      accessorKey: 'client_name',
      cell: (contract) => (
        <span 
          className="hover:text-blue-600 hover:underline cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            if (onViewCompany) {
              onViewCompany(contract.client_id);
            }
          }}
        >
          {contract.client_name}
        </span>
      )
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
      cell: (contract) => formatCurrency(contract.monthly_payment, undefined, 'USD'),
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
      header: 'Status',
      accessorKey: 'status',
      cell: (contract) => {
        const statusMap = {
          'draft': { label: 'Brouillon', variant: 'default' as const },
          'pending': { label: 'En attente', variant: 'warning' as const },
          'active': { label: 'Actif', variant: 'success' as const },
          'completed': { label: 'Terminé', variant: 'info' as const },
          'terminated': { label: 'Résilié', variant: 'error' as const }
        };
        const status = contract.status;
        const config = statusMap[status] || { label: status, variant: 'default' as const };
        return formatters.badge(status, config.variant, config.label);
      }
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
                label: 'Commander équipement', 
                onClick: () => orderEquipment && orderEquipment(contract),
                disabled: contract.status !== 'pending' && contract.status !== 'draft',
                className: 'text-blue-600 hover:text-blue-700',
                tooltip: 'Commander l\'équipement et initier le paiement'
              },
              { 
                label: 'Générer facture', 
                onClick: () => onGenerateInvoice && onGenerateInvoice(contract),
                disabled: contract.status !== 'active'
              },
              { 
                label: 'Activer contrat', 
                onClick: () => onActivate && onActivate(contract),
                disabled: contract.status !== 'pending' && contract.status !== 'draft'
              },
              { 
                label: 'Résilier contrat', 
                onClick: () => onTerminate && onTerminate(contract),
                disabled: contract.status !== 'active',
                className: 'text-red-600 hover:text-red-700'
              }
            ]}
          />
        </div>
      ),
      align: 'center' as const
    }
  ], [onRowClick, onViewCompany, onGenerateInvoice, onActivate, onTerminate, orderEquipment, formatCurrency]);

  // Options de filtrage
  const filterOptions = [
    {
      id: 'status',
      label: 'Statut',
      options: [
        { value: 'draft', label: 'Brouillon' },
        { value: 'pending', label: 'En attente' },
        { value: 'active', label: 'Actif' },
        { value: 'completed', label: 'Terminé' },
        { value: 'terminated', label: 'Résilié' }
      ]
    },
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
      value: formatCurrency(totalAmount, undefined, 'USD')
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

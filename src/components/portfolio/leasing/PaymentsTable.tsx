import { useMemo } from 'react';
import type { LeasingPayment } from '../../../types/leasing-payment';
import { ActionsDropdown } from '../../ui/ActionsDropdown';
import { LeasingTable, type Column } from '../../ui/LeasingTable';
import { formatters } from '../../../utils/tableFormatters';
import { generateTransactionId } from '../../../utils/formatters';
import { useFormatCurrency } from '../../../hooks/useFormatCurrency';

interface PaymentsTableProps {
  payments: LeasingPayment[];
  loading?: boolean;
  onRowClick?: (payment: LeasingPayment) => void;
}

export function PaymentsTable({ payments, loading = false, onRowClick }: PaymentsTableProps) {
  const { formatCurrency } = useFormatCurrency();
  
  // Map des statuts de paiement avec leurs variantes et labels
  const statusMap = useMemo(() => ({
    'paid': { label: 'Payé', variant: 'success' as const },
    'pending': { label: 'En attente', variant: 'warning' as const },
    'failed': { label: 'Échoué', variant: 'error' as const },
    'cancelled': { label: 'Annulé', variant: 'default' as const },
  }), []);
  
  // Map des types de paiement avec leurs variantes et labels
  const typeMap = useMemo(() => ({
    'rent': { label: 'Loyer', variant: 'info' as const },
    'deposit': { label: 'Dépôt', variant: 'success' as const },
    'fee': { label: 'Frais', variant: 'warning' as const },
    'other': { label: 'Autre', variant: 'default' as const },
  }), []);
  
  // Calculer le montant total des paiements
  const totalAmount = useMemo(() => {
    return payments
      .filter(p => p.status === 'paid')
      .reduce((sum, p) => sum + p.amount, 0);
  }, [payments]);

  // Configuration des colonnes
  const columns = useMemo<Column<LeasingPayment>[]>(() => [
    {
      header: 'Référence',
      accessorKey: 'id',
      cell: (payment) => {
        const paymentId = generateTransactionId('PAY', parseInt(payment.id.replace('pay-', '')));
        return <span className="font-mono">{paymentId}</span>;
      }
    },
    {
      header: 'Contrat',
      accessorKey: 'contract_id'
    },
    {
      header: 'Date',
      accessorKey: 'date',
      cell: (payment) => formatters.date(payment.date)
    },
    {
      header: 'Type',
      accessorKey: 'type',
      cell: (payment) => {
        const type = payment.type;
        const config = typeMap[type] || { label: type, variant: 'default' as const };
        return formatters.badge(type, config.variant, config.label);
      }
    },
    {
      header: 'Montant',
      accessorKey: 'amount',
      cell: (payment) => formatCurrency(payment.amount),
      align: 'right' as const
    },
    {
      header: 'Statut',
      accessorKey: 'status',
      cell: (payment) => {
        const status = payment.status;
        const config = statusMap[status] || { label: status, variant: 'default' as const };
        return formatters.badge(status, config.variant, config.label);
      }
    },
    {
      header: 'Actions',
      accessorKey: (() => '') as unknown as keyof LeasingPayment,
      cell: (payment) => (
        <div className="actions-dropdown inline-block">
          <ActionsDropdown
            actions={[

              { 
                label: 'Télécharger reçu', 
                onClick: () => console.log('TODO: Download receipt for', payment.id),
                disabled: payment.status !== 'paid'
              },
              { 
                label: payment.status === 'pending' ? 'Marquer comme payé' : 'Modifier statut',
                onClick: () => console.log('TODO: Update payment status for', payment.id),
                disabled: ['cancelled', 'failed'].includes(payment.status)
              }
            ]}
          />
        </div>
      ),
      align: 'center' as const
    }
  ], [statusMap, typeMap, formatCurrency]);

  // Options de filtrage
  const filterOptions = [
    {
      id: 'type',
      label: 'Type',
      options: [
        { value: 'rent', label: 'Loyer' },
        { value: 'deposit', label: 'Dépôt' },
        { value: 'fee', label: 'Frais' },
        { value: 'other', label: 'Autre' }
      ]
    },
    {
      id: 'status',
      label: 'Statut',
      options: [
        { value: 'paid', label: 'Payé' },
        { value: 'pending', label: 'En attente' },
        { value: 'failed', label: 'Échoué' },
        { value: 'cancelled', label: 'Annulé' }
      ]
    }
  ];

  // Données pour le résumé
  const summaryData = [
    { 
      label: 'Total des paiements', 
      value: formatCurrency(totalAmount)
    },
    { 
      label: 'Nombre de transactions', 
      value: payments.length 
    }
  ];

  return (
    <LeasingTable
      data={payments}
      columns={columns}
      loading={loading}
      onRowClick={onRowClick}
      keyExtractor={(item) => item.id}
      filterOptions={filterOptions}
      searchPlaceholder="Rechercher un paiement..."
      noDataMessage="Aucun paiement à afficher"
      showFilters={true}
      summaryData={summaryData}
    />
  );
}


import { useMemo } from 'react';
import type { LeasingRequest } from '../../../types/leasing-request';
import type { Equipment } from '../../../types/leasing';
import { ActionsDropdown } from '../../ui/ActionsDropdown';
import { Button } from '../../ui/Button';
import { LeasingTable, type Column } from '../../ui/LeasingTable';
import { formatters } from '../../../utils/tableFormatters';
import { formatCurrency } from '../../../utils/formatters';

interface LeasingRequestsTableProps {
  requests: LeasingRequest[];
  equipments: Equipment[];
  onViewDetails?: (request: LeasingRequest) => void;
  onApprove?: (request: LeasingRequest) => void;
  onReject?: (request: LeasingRequest) => void;
  onDownloadTechnicalSheet?: (request: LeasingRequest) => void;
  onViewCompany?: (companyId: string) => void; // Nouvelle prop pour afficher les détails de l'entreprise
  loading?: boolean;
}

export function LeasingRequestsTable({
  requests,
  equipments,
  onViewDetails,
  onApprove,
  onReject,
  onDownloadTechnicalSheet,
  onViewCompany,
  loading = false
}: LeasingRequestsTableProps) {
  // Map des statuts de demande avec leurs variantes et labels
  const statusMap = useMemo(() => ({
    'pending': { label: 'En attente', variant: 'warning' as const },
    'approved': { label: 'Approuvée', variant: 'success' as const },
    'rejected': { label: 'Rejetée', variant: 'error' as const }
  }), []);
  
  // Map des types de contrat avec leurs variantes et labels
  const contractTypeMap = useMemo(() => ({
    'standard': { label: 'Standard', variant: 'default' as const },
    'premium': { label: 'Premium', variant: 'success' as const },
    'flex': { label: 'Flex', variant: 'info' as const }
  }), []);
  
  // Compter les demandes par statut
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {
      pending: 0,
      approved: 0,
      rejected: 0
    };
    
    requests.forEach(request => {
      if (counts[request.status] !== undefined) {
        counts[request.status]++;
      }
    });
    
    return counts;
  }, [requests]);

  // Configuration des colonnes
  const columns = useMemo<Column<LeasingRequest>[]>(() => {
    // Définition locale de la fonction getEquipmentDetails
    const getEquipmentDetails = (equipmentId: string) => {
      return equipments.find(eq => eq.id === equipmentId);
    };
    
    return [
      {
        header: 'Référence',
        accessorKey: 'id',
        cell: (request: LeasingRequest) => {
          return <span className="font-mono">{request.id}</span>;
        }
      },
      {
        header: 'Client',
        accessorKey: 'client_name',
        cell: (request: LeasingRequest) => (
          <span 
            className="hover:text-blue-600 hover:underline cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              if (onViewCompany) {
                onViewCompany(request.client_id);
              }
            }}
          >
            {request.client_name}
          </span>
        )
      },
      {
        header: 'Équipement',
        accessorKey: 'equipment_id',
        cell: (request: LeasingRequest) => {
          const equipment = getEquipmentDetails(request.equipment_id);
          return equipment 
            ? <span title={equipment.description}>{equipment.name}</span>
            : request.equipment_id;
        }
      },
    {
      header: 'Type de contrat',
      accessorKey: 'contract_type',
      cell: (request: LeasingRequest) => {
        const type = request.contract_type;
        const config = contractTypeMap[type as keyof typeof contractTypeMap] || { label: type, variant: 'default' as const };
        return formatters.badge(type, config.variant, config.label);
      }
    },
    {
      header: 'Budget mensuel',
      accessorKey: 'monthly_budget',
      cell: (request: LeasingRequest) => formatCurrency(request.monthly_budget),
      align: 'right' as const
    },
    {
      header: 'Durée',
      accessorKey: 'requested_duration',
      cell: (request: LeasingRequest) => `${request.requested_duration} mois`,
    },
    {
      header: 'Date de demande',
      accessorKey: 'request_date',
      cell: (request: LeasingRequest) => formatters.date(request.request_date)
    },
    {
      header: 'Statut',
      accessorKey: 'status',
      cell: (request: LeasingRequest) => {
        const status = request.status;
        const config = statusMap[status as keyof typeof statusMap] || { label: status, variant: 'default' as const };
        return formatters.badge(status, config.variant, config.label);
      }
    },
    {
      header: 'Paiement',
      // Utiliser une propriété existante mais ne pas l'afficher, juste pour la structure
      accessorKey: 'id',
      cell: (request: LeasingRequest) => (
        <div className="flex justify-center">
          {request.status === 'pending' && (
            <Button 
              size="sm"
              variant="outline"
              onClick={() => onApprove && onApprove(request)}
              className="bg-green-50 hover:bg-green-100 border-green-500 text-green-600 hover:text-green-700"
            >
              Paiement
            </Button>
          )}
          {request.status !== 'pending' && (
            <span className="text-gray-400">—</span>
          )}
        </div>
      )
    },
    {
      header: 'Actions',
      accessorKey: 'id',  // Utiliser une propriété existante pour éviter les erreurs de type
      cell: (request: LeasingRequest) => (
        <div className="actions-dropdown inline-block">
          <ActionsDropdown
            actions={[
              { 
                label: 'Voir détails', 
                onClick: () => onViewDetails && onViewDetails(request)
              },
              { 
                label: 'Rejeter', 
                onClick: () => onReject && onReject(request),
                disabled: request.status !== 'pending',
                className: 'text-red-600 hover:text-red-700'
              },
              {
                label: 'Fiche technique',
                onClick: () => onDownloadTechnicalSheet && onDownloadTechnicalSheet(request),
                disabled: !request.technical_sheet_url
              }
            ]}
          />
        </div>
      ),
      align: 'center' as const
    }
    ];
  }, [onViewDetails, onApprove, onReject, onDownloadTechnicalSheet, equipments, statusMap, contractTypeMap, onViewCompany]);

  // Options de filtrage
  const filterOptions = [
    {
      id: 'status',
      label: 'Statut',
      options: [
        { value: 'pending', label: 'En attente' },
        { value: 'approved', label: 'Approuvée' },
        { value: 'rejected', label: 'Rejetée' }
      ]
    },
    {
      id: 'contract_type',
      label: 'Type de contrat',
      options: [
        { value: 'standard', label: 'Standard' },
        { value: 'premium', label: 'Premium' },
        { value: 'flex', label: 'Flex' }
      ]
    }
  ];

  // Données pour le résumé
  const summaryData = [
    { 
      label: 'Total demandes', 
      value: requests.length
    },
    { 
      label: 'En attente', 
      value: statusCounts.pending
    },
    {
      label: 'Approuvées',
      value: statusCounts.approved
    },
    {
      label: 'Rejetées',
      value: statusCounts.rejected
    }
  ];

  return (
    <LeasingTable
      data={requests}
      columns={columns}
      loading={loading}
      keyExtractor={(item) => item.id}
      filterOptions={filterOptions}
      searchPlaceholder="Rechercher une demande..."
      noDataMessage="Aucune demande à afficher"
      showFilters={true}
      summaryData={summaryData}
    />
  );
}

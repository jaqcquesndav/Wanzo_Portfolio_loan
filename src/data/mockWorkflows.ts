import type { Workflow } from '../types/workflow';

export const mockWorkflows: Workflow[] = [
  {
    id: 'WF001',
    name: 'Workflow Crédit Standard',
    description: 'Workflow standard pour les demandes de crédit',
    type: 'credit',
    steps: [
      {
        id: 'submission',
        type: 'validation',
        label: 'Soumission',
        description: 'Validation du dossier de demande',
        order: 0,
        attachments: {
          required: true,
          maxSize: 10,
          allowedTypes: ['.pdf', '.doc', '.docx'],
          description: 'Business plan et états financiers'
        },
        validationCriteria: {
          requiredDocuments: [
            'Business Plan',
            'États financiers des 3 derniers exercices',
            'Attestation fiscale',
            'RCCM'
          ]
        }
      },
      {
        id: 'financial_analysis',
        type: 'financial_analysis',
        label: 'Analyse financière',
        description: 'Analyse approfondie de la situation financière',
        order: 1,
        requiresToken: true,
        monitoringConfig: {
          frequency: 'weekly',
          metrics: ['solvency_ratio', 'debt_ratio', 'profitability'],
          alerts: [
            {
              type: 'solvency',
              threshold: 1.5,
              condition: 'below'
            }
          ]
        }
      },
      {
        id: 'risk_assessment',
        type: 'risk_assessment',
        label: 'Évaluation des risques',
        description: 'Analyse des risques liés au crédit',
        order: 2,
        attachments: {
          required: true,
          maxSize: 5,
          allowedTypes: ['.pdf', '.xlsx'],
          description: 'Rapport d\'analyse des risques'
        }
      },
      {
        id: 'committee_review',
        type: 'committee_review',
        label: 'Comité de crédit',
        description: 'Présentation au comité de crédit',
        order: 3,
        requiresToken: true,
        generatesToken: true
      },
      {
        id: 'disbursement',
        type: 'payment_execution',
        label: 'Décaissement',
        description: 'Mise à disposition des fonds',
        order: 4,
        requiresToken: true,
        paymentConfig: {
          type: 'disbursement',
          currency: 'CDF',
          schedule: {
            frequency: 'one-time',
            gracePeriod: 0
          },
          validationRules: {
            requiredApprovers: 2,
            allowedMethods: ['bank_transfer']
          }
        }
      }
    ],
    productIds: ['PROD001', 'PROD002'],
    active: true,
    created_at: '2024-03-01T10:00:00Z',
    updated_at: '2024-03-15T14:30:00Z'
  },
  {
    id: 'WF002',
    name: 'Workflow Leasing',
    description: 'Workflow pour les demandes de leasing',
    type: 'leasing',
    steps: [
      {
        id: 'equipment_validation',
        type: 'validation',
        label: 'Validation équipement',
        description: 'Validation des spécifications de l\'équipement',
        order: 0,
        attachments: {
          required: true,
          maxSize: 10,
          allowedTypes: ['.pdf', '.jpg', '.png'],
          description: 'Photos et spécifications de l\'équipement'
        }
      },
      {
        id: 'supplier_validation',
        type: 'validation',
        label: 'Validation fournisseur',
        description: 'Vérification et validation du fournisseur',
        order: 1,
        requiresToken: true,
        attachments: {
          required: true,
          maxSize: 5,
          allowedTypes: ['.pdf'],
          description: 'Documents du fournisseur'
        }
      },
      {
        id: 'equipment_inspection',
        type: 'equipment_inspection',
        label: 'Inspection équipement',
        description: 'Inspection physique de l\'équipement',
        order: 2,
        monitoringConfig: {
          frequency: 'weekly',
          metrics: ['condition', 'compliance'],
          alerts: [
            {
              type: 'condition',
              threshold: 0.8,
              condition: 'below'
            }
          ]
        }
      },
      {
        id: 'contract_approval',
        type: 'legal_review',
        label: 'Approbation contrat',
        description: 'Validation du contrat de leasing',
        order: 3,
        requiresToken: true,
        generatesToken: true
      },
      {
        id: 'payment_execution',
        type: 'payment_execution',
        label: 'Paiement fournisseur',
        description: 'Paiement au fournisseur',
        order: 4,
        requiresToken: true,
        paymentConfig: {
          type: 'transfer',
          currency: 'USD',
          schedule: {
            frequency: 'one-time',
            gracePeriod: 0
          }
        }
      },
      {
        id: 'delivery',
        type: 'delivery',
        label: 'Livraison',
        description: 'Livraison et installation de l\'équipement',
        order: 5,
        attachments: {
          required: true,
          maxSize: 10,
          allowedTypes: ['.pdf', '.jpg', '.png'],
          description: 'PV de livraison et photos'
        }
      }
    ],
    productIds: ['PROD003'],
    active: true,
    created_at: '2024-03-01T10:00:00Z',
    updated_at: '2024-03-15T14:30:00Z'
  },
  {
    id: 'WF003',
    name: 'Workflow Investissement',
    description: 'Workflow pour les investissements en capital',
    type: 'investment',
    steps: [
      {
        id: 'due_diligence',
        type: 'due_diligence',
        label: 'Due Diligence',
        description: 'Audit complet de l\'entreprise',
        order: 0,
        attachments: {
          required: true,
          maxSize: 20,
          allowedTypes: ['.pdf', '.xlsx'],
          description: 'Rapports d\'audit et analyses'
        }
      },
      {
        id: 'valuation',
        type: 'valuation',
        label: 'Valorisation',
        description: 'Évaluation de l\'entreprise',
        order: 1,
        requiresToken: true,
        monitoringConfig: {
          frequency: 'monthly',
          metrics: ['enterprise_value', 'multiples', 'growth_rate'],
          alerts: [
            {
              type: 'valuation',
              threshold: -10,
              condition: 'below'
            }
          ]
        }
      },
      {
        id: 'investment_committee',
        type: 'committee_review',
        label: 'Comité d\'investissement',
        description: 'Présentation au comité d\'investissement',
        order: 2,
        requiresToken: true,
        generatesToken: true
      },
      {
        id: 'term_sheet',
        type: 'legal_review',
        label: 'Term Sheet',
        description: 'Négociation et signature du term sheet',
        order: 3,
        attachments: {
          required: true,
          maxSize: 5,
          allowedTypes: ['.pdf'],
          description: 'Term sheet signé'
        }
      },
      {
        id: 'closing',
        type: 'payment_execution',
        label: 'Closing',
        description: 'Finalisation de l\'investissement',
        order: 4,
        requiresToken: true,
        paymentConfig: {
          type: 'transfer',
          currency: 'USD',
          schedule: {
            frequency: 'one-time',
            gracePeriod: 0
          },
          validationRules: {
            requiredApprovers: 3,
            allowedMethods: ['bank_transfer']
          }
        }
      }
    ],
    productIds: ['PROD004'],
    active: true,
    created_at: '2024-03-01T10:00:00Z',
    updated_at: '2024-03-15T14:30:00Z'
  }
];
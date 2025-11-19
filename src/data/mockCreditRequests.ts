import { CreditRequest } from '../types/credit';

export const mockCreditRequests: CreditRequest[] = [
  {
    id: 'req-001',
    memberId: 'mem-001',
    productId: 'prod-001',
    receptionDate: '2023-07-15',
    requestAmount: 50000,
    periodicity: 'monthly',
    interestRate: 8.5,
    reason: 'Expansion des activités commerciales et ouverture d\'une nouvelle boutique',
    scheduleType: 'constant',
    schedulesCount: 12,
    deferredPaymentsCount: 0,
    financingPurpose: 'Achat de stocks et aménagement de local',
    creditManagerId: 'mgr-001',
    isGroup: false,
    documents: [
      {
        id: 'doc-001',
        name: 'Plan d\'affaires.pdf',
        type: 'business_plan',
        url: '/documents/plan-affaires-mem001.pdf',
        size: 2457600,
        mimeType: 'application/pdf',
        uploadedAt: '2023-07-15T09:00:00Z',
        description: 'Plan d\'affaires détaillé pour l\'expansion'
      },
      {
        id: 'doc-002',
        name: 'Bilans financiers 2022-2023.pdf',
        type: 'financial_statements',
        url: '/documents/bilans-mem001.pdf',
        size: 1843200,
        mimeType: 'application/pdf',
        uploadedAt: '2023-07-15T09:15:00Z'
      },
      {
        id: 'doc-003',
        name: 'Pièce d\'identité.jpg',
        type: 'identity_document',
        url: '/documents/id-mem001.jpg',
        size: 524288,
        mimeType: 'image/jpeg',
        uploadedAt: '2023-07-15T09:20:00Z'
      }
    ],
    status: 'pending',
    createdAt: '2023-07-15T09:30:45Z',
    updatedAt: '2023-07-15T09:30:45Z'
  },
  {
    id: 'req-002',
    memberId: 'mem-002',
    productId: 'prod-002',
    receptionDate: '2023-06-22',
    requestAmount: 75000,
    periodicity: 'monthly',
    interestRate: 7.25,
    reason: 'Acquisition d\'\u00e9quipements de construction pour de nouveaux contrats',
    scheduleType: 'constant',
    schedulesCount: 24,
    deferredPaymentsCount: 0,
    financingPurpose: 'Achat d\'\u00e9quipements de construction',
    creditManagerId: 'mgr-002',
    isGroup: false,
    documents: [
      {
        id: 'doc-004',
        name: 'Devis équipements.pdf',
        type: 'project_file',
        url: '/documents/devis-equipements-mem002.pdf',
        size: 1024000,
        mimeType: 'application/pdf',
        uploadedAt: '2023-06-22T13:00:00Z',
        description: 'Devis des équipements à acheter'
      },
      {
        id: 'doc-005',
        name: 'Relevés bancaires 6 mois.pdf',
        type: 'bank_statements',
        url: '/documents/releves-mem002.pdf',
        size: 3145728,
        mimeType: 'application/pdf',
        uploadedAt: '2023-06-22T13:30:00Z'
      }
    ],
    status: 'analysis',
    createdAt: '2023-06-22T14:15:30Z',
    updatedAt: '2023-07-01T10:25:15Z'
  },
  {
    id: 'req-003',
    memberId: 'mem-003',
    productId: 'prod-003',
    receptionDate: '2023-05-10',
    requestAmount: 120000,
    periodicity: 'monthly',
    interestRate: 6.75,
    reason: 'D\u00e9veloppement d\'un nouveau produit technologique',
    scheduleType: 'degressive',
    schedulesCount: 36,
    deferredPaymentsCount: 3,
    gracePeriod: 2,
    financingPurpose: 'R&D et prototypage',
    creditManagerId: 'mgr-003',
    isGroup: false,
    documents: [
      {
        id: 'doc-006',
        name: 'Dossier projet technologique.pdf',
        type: 'project_file',
        url: '/documents/projet-tech-mem003.pdf',
        size: 5242880,
        mimeType: 'application/pdf',
        uploadedAt: '2023-05-10T10:00:00Z',
        description: 'Dossier complet du projet R&D'
      },
      {
        id: 'doc-007',
        name: 'États financiers.xlsx',
        type: 'financial_statements',
        url: '/documents/etats-financiers-mem003.xlsx',
        size: 2097152,
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        uploadedAt: '2023-05-10T10:30:00Z'
      },
      {
        id: 'doc-008',
        name: 'Attestation fiscale.pdf',
        type: 'tax_certificate',
        url: '/documents/attestation-fiscale-mem003.pdf',
        size: 409600,
        mimeType: 'application/pdf',
        uploadedAt: '2023-05-10T10:45:00Z'
      },
      {
        id: 'doc-009',
        name: 'Justificatif domicile.pdf',
        type: 'proof_of_address',
        url: '/documents/justificatif-mem003.pdf',
        size: 307200,
        mimeType: 'application/pdf',
        uploadedAt: '2023-05-10T11:00:00Z'
      },
      {
        id: 'doc-010',
        name: 'Acte de propriété.pdf',
        type: 'guarantee_document',
        url: '/documents/acte-propriete-mem003.pdf',
        size: 1536000,
        mimeType: 'application/pdf',
        uploadedAt: '2023-05-10T11:10:00Z',
        description: 'Acte de propriété comme garantie'
      }
    ],
    status: 'approved',
    createdAt: '2023-05-10T11:20:05Z',
    updatedAt: '2023-06-15T16:45:30Z'
  },
  {
    id: 'req-004',
    memberId: 'mem-004',
    productId: 'prod-001',
    receptionDate: '2023-04-05',
    requestAmount: 30000,
    periodicity: 'monthly',
    interestRate: 8.5,
    reason: 'Rénovation des locaux du magasin principal',
    scheduleType: 'constant',
    schedulesCount: 18,
    deferredPaymentsCount: 0,
    financingPurpose: 'Travaux de rénovation',
    creditManagerId: 'mgr-001',
    isGroup: false,
    status: 'rejected',
    createdAt: '2023-04-05T08:50:15Z',
    updatedAt: '2023-04-20T14:10:25Z',
    rejectionReason: 'Ratio d\'endettement trop élevé et garanties insuffisantes'
  },
  {
    id: 'req-005',
    memberId: 'grp-001',
    productId: 'prod-004',
    receptionDate: '2023-08-01',
    requestAmount: 100000,
    periodicity: 'quarterly',
    interestRate: 7,
    reason: 'Achat d\'équipements agricoles pour la coopérative',
    scheduleType: 'constant',
    schedulesCount: 8,
    deferredPaymentsCount: 1,
    financingPurpose: 'Équipements agricoles partagés',
    creditManagerId: 'mgr-002',
    isGroup: true,
    groupId: 'grp-001',
    distributions: [
      {
        id: 'dist-001',
        creditRequestId: 'req-005',
        memberId: 'mem-005',
        amount: 20000,
        createdAt: '2023-08-01T10:15:30Z'
      },
      {
        id: 'dist-002',
        creditRequestId: 'req-005',
        memberId: 'mem-015',
        amount: 20000,
        createdAt: '2023-08-01T10:15:30Z'
      },
      {
        id: 'dist-003',
        creditRequestId: 'req-005',
        memberId: 'mem-016',
        amount: 20000,
        createdAt: '2023-08-01T10:15:30Z'
      },
      {
        id: 'dist-004',
        creditRequestId: 'req-005',
        memberId: 'mem-017',
        amount: 20000,
        createdAt: '2023-08-01T10:15:30Z'
      },
      {
        id: 'dist-005',
        creditRequestId: 'req-005',
        memberId: 'mem-018',
        amount: 20000,
        createdAt: '2023-08-01T10:15:30Z'
      }
    ],
    status: 'pending',
    createdAt: '2023-08-01T10:15:30Z',
    updatedAt: '2023-08-01T10:15:30Z'
  }
];

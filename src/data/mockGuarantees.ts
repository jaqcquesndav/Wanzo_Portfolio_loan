import { Guarantee } from '../types/guarantee.ts';

export const mockGuarantees: Guarantee[] = [
  {
    id: 'G001',
    company: 'PME Agro Sarl',
    type: 'Hypothèque',
    value: 20000000,
    status: 'active',
    created_at: '2025-07-01T10:00:00Z',
    requestId: 'REQ-TRAD-20250701-0001',
    portfolioId: 'trad-1',
    contractId: 'CONT-20230509-0001',
    contractReference: 'CRDT-100000',
    details: {
      description: 'Terrain agricole avec bâtiments d\'exploitation',
      location: 'Zone industrielle Sud, Parcelle 24',
      reference: 'HYPO-2025-001',
      coverage: 100
    }
  },
  {
    id: 'G002',
    company: 'TransLogistics',
    type: 'Caution bancaire',
    value: 5000000,
    status: 'active',
    created_at: '2025-06-28T14:30:00Z',
    requestId: 'REQ-TRAD-20250628-0002',
    portfolioId: 'trad-1',
    contractId: 'CONT-20230509-0002',
    contractReference: 'CRDT-100001',
    details: {
      provider: 'Banque Atlantique',
      reference: 'CAUT-2025-102',
      coverage: 80,
      document_url: '#/documents/caution_123456'
    }
  },
  {
    id: 'G003',
    company: 'BTP Services',
    type: 'Dépôt espèces',
    value: 2500000,
    status: 'active',
    created_at: '2025-06-20T09:15:00Z',
    requestId: 'REQ-TRAD-20250620-0003',
    portfolioId: 'trad-1',
    contractId: 'CONT-20230509-0003',
    contractReference: 'CRDT-100002',
    details: {
      description: 'Dépôt de garantie pour crédit d\'investissement',
      reference: 'DEP-2025-035',
      coverage: 10
    }
  },
  {
    id: 'G004',
    company: 'InnoBiotech',
    type: 'Nantissement de matériel',
    value: 15000000,
    status: 'active',
    created_at: '2025-08-05T11:45:00Z',
    requestId: 'REQ-TRAD-20250805-0004',
    portfolioId: 'trad-2',
    contractId: 'CONT-20230812-0004',
    contractReference: 'CRDT-100003',
    details: {
      description: 'Équipement de laboratoire et chaîne de production',
      reference: 'NANT-2025-089',
      coverage: 75,
      document_url: '#/documents/nantissement_456789'
    }
  },
  {
    id: 'G005',
    company: 'Digital Solutions SARL',
    type: 'Caution personnelle',
    value: 8000000,
    status: 'active',
    created_at: '2025-09-10T13:20:00Z',
    requestId: 'REQ-TRAD-20250910-0005',
    portfolioId: 'trad-2',
    contractId: 'CONT-20230925-0005',
    contractReference: 'CRDT-100004',
  },
  {
    id: 'G006',
    company: 'Eco-Construct SA',
    type: 'Hypothèque',
    value: 30000000,
    status: 'active',
    created_at: '2025-10-15T09:30:00Z',
    requestId: 'REQ-TRAD-20251015-0006',
    portfolioId: 'trad-3',
    contractId: 'CONT-20231102-0006',
    contractReference: 'CRDT-100005',
  },
  {
    id: 'G007',
    company: 'AgroTech Innovations',
    type: 'Nantissement de fonds de commerce',
    value: 12000000,
    status: 'active',
    created_at: '2025-11-20T10:15:00Z',
    requestId: 'REQ-TRAD-20251120-0007',
    portfolioId: 'trad-3',
    contractId: 'CONT-20231215-0007',
    contractReference: 'CRDT-100006',
  },
  {
    id: 'G008',
    company: 'MediHealth Plus',
    type: 'Caution bancaire',
    value: 18000000,
    status: 'active',
    created_at: '2025-12-05T14:00:00Z',
    requestId: 'REQ-TRAD-20251205-0008',
    portfolioId: 'trad-4',
    contractId: 'CONT-20240110-0008',
    contractReference: 'CRDT-100007',
  }
];

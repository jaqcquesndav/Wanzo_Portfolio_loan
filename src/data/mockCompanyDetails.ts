export const mockCompanyDetails = {
  sector: 'Technologie',
  id: 'techinnovate-sn',
  name: 'TechInnovate Sénégal',
  industry: 'Technologie',
  legalForm: 'SARL',
  rccm: 'SN-DKR-2020-B-12345',
  taxId: 'SN123456789',
  natId: 'SN987654321',
  address: {
    street: 'Avenue Cheikh Anta Diop',
    city: 'Dakar',
    country: 'Sénégal'
  },
  contacts: {
    email: 'contact@techinnovate.sn',
    phone: '+221 33 123 45 67'
  },
  capital: {
    amount: 5000000,
    currency: 'XOF',
    isApplicable: true
  },
  logo: 'https://techinnovate.sn/logo.png',
  country: 'Sénégal',
  status: 'active',
  founded: 2017,
  employee_count: 120,
  annual_revenue: 32000000,
  employees: 120,
  financials: [
    { year: 2024, revenue: 32000000, profit: 4200000, assets: 15000000, liabilities: 6000000 },
    { year: 2023, revenue: 28000000, profit: 3900000, assets: 14000000, liabilities: 5500000 },
    { year: 2022, revenue: 21000000, profit: 2500000, assets: 12000000, liabilities: 5000000 }
  ],
  financial_metrics: {
    revenue_growth: 12.5
  },
  pitch_deck_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
  financialHighlights: {
    netIncome: 4200000,
    totalAssets: 15000000,
    totalLiabilities: 6000000,
    ebitda: 5000000,
    operatingMargin: 18.5,
    equityRatio: 40.2,
    growthRate: 12.5
  },
  securities: [
    {
      type: 'Action',
      symbol: 'TISN',
      quantity: 100000,
      value: 12.5,
      details: 'Actions ordinaires cotées à la BRVM',
      documents: [
        {
          id: 'sec-doc-1',
          title: 'Prospectus d’émission',
          url: 'https://example.com/prospectus.pdf',
          type: 'prospectus',
          date: '2024-01-10',
          size: '1.2MB',
          status: 'final',
        }
      ]
    },
    {
      type: 'Obligation',
      symbol: 'TISN24',
      quantity: 5000,
      value: 1000,
      details: 'Obligations 2024, taux fixe 5%',
      documents: [
        {
          id: 'sec-doc-2',
          title: 'Contrat d’émission',
          url: 'https://example.com/contrat.pdf',
          type: 'prospectus',
          date: '2024-01-15',
          size: '0.8MB',
          status: 'final',
        }
      ]
    }
  ],
  documents: [
    {
      id: 'doc1',
      title: 'États financiers 2024',
      url: 'https://example.com/etats-financiers-2024.pdf',
      type: 'financial_report',
      date: '2024-03-31',
      size: '2.4MB',
      status: 'final'
    },
    {
      id: 'doc2',
      title: 'Audit annuel 2024',
      url: 'https://example.com/audit-2024.pdf',
      type: 'audit_report',
      date: '2024-04-15',
      size: '1.1MB',
      status: 'final'
    },
    {
      id: 'doc3',
      title: 'Rapport d’activité',
      url: 'https://example.com/rapport-activite.pdf',
      type: 'annual_report',
      date: '2024-04-10',
      size: '1.2MB',
      status: 'draft'
    },
    {
      id: 'doc4',
      title: 'Prospectus obligations 2024',
      url: 'https://example.com/prospectus-obligations.pdf',
      type: 'prospectus',
      date: '2024-01-10',
      size: '1.2MB',
      status: 'final'
    }
  ]
};

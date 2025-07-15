export const mockCompanyDetails = {
  sector: 'Technologie',
  id: 'techinnovate-cd',
  name: 'TechInnovate Congo',
  industry: 'Technologie',
  legalForm: 'SARL',
  rccm: 'CD-GOM-2020-B-12345',
  taxId: 'CD123456789',
  natId: 'CD987654321',
  address: {
    street: 'Avenue des Volcans 123',
    city: 'Goma',
    country: 'République Démocratique du Congo'
  },
  contacts: {
    email: 'contact@techinnovate.cd',
    phone: '+243 970 123 456'
  },
  socialMedia: {
    website: 'https://www.techinnovate.cd',
    facebook: 'https://www.facebook.com/techinnovate.cd',
    linkedin: 'https://www.linkedin.com/company/techinnovate-congo',
    twitter: 'https://twitter.com/techinnovateCD',
    youtube: 'https://www.youtube.com/channel/techinnovateCD'
  },
  presentation_video: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
  ceo: {
    name: 'Marie Kabanga',
    gender: 'female',
    title: 'Directrice Générale & Co-fondatrice',
    linkedin: 'https://www.linkedin.com/in/marie-kabanga-ceo',
    bio: 'Marie Kabanga est une entrepreneure visionnaire dans le secteur technologique en RDC avec plus de 15 ans d\'expérience. Diplômée de l\'Université de Kinshasa et de HEC Paris, elle a fondé TechInnovate Congo en 2017 après un parcours réussi chez MTN et Airtel. Elle est régulièrement invitée comme conférencière sur les sujets d\'innovation et d\'entrepreneuriat féminin en Afrique centrale.',
    photo: 'https://randomuser.me/api/portraits/women/45.jpg'
  },
  capital: {
    amount: 5000000,
    currency: 'CDF',
    isApplicable: true
  },
  logo: 'https://placehold.co/400x400/2563eb/ffffff?text=TI',
  country: 'République Démocratique du Congo',
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

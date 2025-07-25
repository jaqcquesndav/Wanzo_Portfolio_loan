// src/data/companies/techinnovate.ts
// Données complètes pour TechInnovate Congo

import { Linkedin, Facebook, Twitter, Youtube, Globe } from 'lucide-react';

export const techinnovate = {
  sector: 'Technologie',
  id: 'techinnovate-cd',
  name: 'TechInnovate Congo',
  industry: 'Technologies de l\'Information',
  legalForm: 'SARL',
  rccm: 'CD-GOM-2020-B-12345',
  taxId: 'CD123456789',
  natId: 'CD987654321',
  description: 'TechInnovate Congo est une entreprise leader dans le développement de solutions logicielles innovantes et durables pour le marché africain. Nous spécialisons dans les applications mobiles, l\'intelligence artificielle et les solutions cloud pour les entreprises et les particuliers.',
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
    youtube: 'https://www.youtube.com/watch?v=2s3CHeVu1So'
  },
  socialIcons: {
    website: Globe,
    facebook: Facebook,
    linkedin: Linkedin,
    twitter: Twitter,
    youtube: Youtube
  },
  presentation_video: 'https://www.youtube.com/embed/TcMBFSGVi1c',
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
  creditRating: 'A',
  esgScore: 78,
  leadership_team: [
    {
      id: 'exec1',
      name: 'Jean-Paul Mutombo',
      title: 'Directeur Technique (CTO)',
      photo: 'https://randomuser.me/api/portraits/men/32.jpg',
      linkedin: 'https://www.linkedin.com/in/jean-paul-mutombo',
      gender: 'male',
      bio: 'Jean-Paul est un expert en développement de logiciels avec une spécialisation en intelligence artificielle. Il a travaillé chez Google à Nairobi avant de rejoindre TechInnovate.'
    },
    {
      id: 'exec2',
      name: 'Aimée Nshombo',
      title: 'Directrice Financière (CFO)',
      photo: 'https://randomuser.me/api/portraits/women/22.jpg',
      linkedin: 'https://www.linkedin.com/in/aimee-nshombo',
      gender: 'female',
      bio: 'Aimée a plus de 10 ans d\'expérience en finance d\'entreprise. Diplômée de l\'Université Catholique de Bukavu et de London Business School, elle gère la stratégie financière de l\'entreprise depuis 2019.'
    },
    {
      id: 'exec3',
      name: 'David Kalume',
      title: 'Directeur Commercial',
      photo: 'https://randomuser.me/api/portraits/men/54.jpg',
      linkedin: 'https://www.linkedin.com/in/david-kalume',
      gender: 'male',
      bio: 'David a développé le réseau commercial de TechInnovate dans 5 pays d\'Afrique centrale. Il a auparavant travaillé chez Orange et Vodacom.'
    }
  ],
  financials: [
    { year: 2024, revenue: 32000000, profit: 4200000, assets: 15000000, liabilities: 6000000 },
    { year: 2023, revenue: 28000000, profit: 3900000, assets: 14000000, liabilities: 5500000 },
    { year: 2022, revenue: 21000000, profit: 2500000, assets: 12000000, liabilities: 5000000 }
  ],
  financial_metrics: {
    revenue_growth: 12.5
  },
  pitch_deck_url: 'https://example.com/techinnovate_pitch_deck.pdf',
  financial_documents: [
    {
      id: 'doc1',
      name: 'Rapport Financier 2023',
      type: 'pdf',
      url: 'https://example.com/techinnovate_financial_2023.pdf',
      date: '2023-12-31'
    },
    {
      id: 'doc2',
      name: 'Présentation Investisseurs Q2 2024',
      type: 'pdf',
      url: 'https://example.com/techinnovate_investor_q2_2024.pdf',
      date: '2024-06-30'
    },
    {
      id: 'doc3',
      name: 'Plan Stratégique 2024-2026',
      type: 'pdf',
      url: 'https://example.com/techinnovate_strategic_plan.pdf',
      date: '2024-01-15'
    }
  ],
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
          title: 'Prospectus d\'émission',
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
          title: 'Contrat d\'émission',
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
      title: 'Rapport d\'activité',
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
  ],
  // Information de scénario pour cette entreprise
  scenario: {
    status: 'prospect',
    stage: 'initial_contact',
    nextAction: 'meeting_scheduled',
    lastContact: '2025-07-15',
    notes: 'Entreprise intéressée par un financement pour expansion régionale',
    potentialInvestment: 150000000
  }
};

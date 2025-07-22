// src/data/companies/constructionplus.ts
// Données complètes pour ConstructionPlus Côte d'Ivoire

import { Linkedin, Facebook, Twitter, Youtube, Globe } from 'lucide-react';

export const constructionplus = {
  sector: 'Construction',
  id: 'constructionplus-ci',
  name: 'ConstructionPlus Côte d\'Ivoire',
  industry: 'BTP et Infrastructures',
  legalForm: 'SARL',
  rccm: 'CI-ABJ-2017-D-12345',
  taxId: 'CI123456789',
  natId: 'CI987654321',
  description: 'ConstructionPlus Côte d\'Ivoire est une entreprise spécialisée dans la construction durable et l\'aménagement urbain. Nous utilisons des techniques et des matériaux innovants pour réduire l\'impact environnemental des projets de construction.',
  address: {
    street: 'Boulevard Latrille 234',
    city: 'Abidjan',
    country: 'Côte d\'Ivoire'
  },
  contacts: {
    email: 'contact@constructionplus-ci.com',
    phone: '+225 07 123 4567'
  },
  socialMedia: {
    website: 'https://www.constructionplus-ci.com',
    facebook: 'https://www.facebook.com/constructionplus.ci',
    linkedin: 'https://www.linkedin.com/company/constructionplus-ci',
    twitter: 'https://twitter.com/constructionplusci',
    youtube: 'https://www.youtube.com/channel/constructionplus-ci'
  },
  socialIcons: {
    website: Globe,
    facebook: Facebook,
    linkedin: Linkedin,
    twitter: Twitter,
    youtube: Youtube
  },
  presentation_video: 'https://www.youtube.com/embed/9vQaVIoEjOM',
  ceo: {
    name: 'Laurent Koné',
    gender: 'male',
    title: 'Directeur Général',
    linkedin: 'https://www.linkedin.com/in/laurent-kone',
    bio: 'Laurent Koné est un ingénieur civil de formation avec plus de 20 ans d\'expérience dans le secteur de la construction. Il a dirigé plusieurs grands projets d\'infrastructures en Afrique de l\'Ouest avant de fonder ConstructionPlus en 2017.',
    photo: 'https://randomuser.me/api/portraits/men/34.jpg'
  },
  capital: {
    amount: 500000000,
    currency: 'XOF',
    isApplicable: true
  },
  logo: 'https://placehold.co/400x400/fb923c/ffffff?text=CP',
  country: 'Côte d\'Ivoire',
  status: 'active',
  founded: 2017,
  employee_count: 250,
  annual_revenue: 1800000000,
  employees: 250,
  creditRating: 'A',
  esgScore: 76,
  leadership_team: [
    {
      id: 'exec1',
      name: 'Marie-Claire Kouassi',
      title: 'Directrice Financière',
      photo: 'https://randomuser.me/api/portraits/women/55.jpg',
      linkedin: 'https://www.linkedin.com/in/marie-claire-kouassi',
      gender: 'female',
      bio: 'Marie-Claire supervise toutes les opérations financières de l\'entreprise. Elle a travaillé dans le secteur bancaire pendant 12 ans avant de rejoindre ConstructionPlus.'
    },
    {
      id: 'exec2',
      name: 'Emmanuel Yao',
      title: 'Directeur des Opérations',
      photo: 'https://randomuser.me/api/portraits/men/22.jpg',
      linkedin: 'https://www.linkedin.com/in/emmanuel-yao',
      gender: 'male',
      bio: 'Emmanuel est responsable de la planification et de l\'exécution des projets de construction. Il possède une vaste expérience dans la gestion de grands projets d\'infrastructures.'
    },
    {
      id: 'exec3',
      name: 'Aya Touré',
      title: 'Directrice Innovation',
      photo: 'https://randomuser.me/api/portraits/women/41.jpg',
      linkedin: 'https://www.linkedin.com/in/aya-toure',
      gender: 'female',
      bio: 'Aya dirige le département de recherche et développement, en se concentrant sur les méthodes de construction durable et l\'intégration de technologies vertes dans les projets.'
    }
  ],
  financials: [
    { year: 2024, revenue: 1800000000, profit: 270000000, assets: 2500000000, liabilities: 1200000000 },
    { year: 2023, revenue: 1500000000, profit: 225000000, assets: 2100000000, liabilities: 1050000000 },
    { year: 2022, revenue: 1200000000, profit: 180000000, assets: 1800000000, liabilities: 900000000 }
  ],
  financial_metrics: {
    revenue_growth: 20.0
  },
  pitch_deck_url: 'https://example.com/constructionplus_company_overview.pdf',
  financial_documents: [
    {
      id: 'doc1',
      name: 'États Financiers 2023',
      type: 'pdf',
      url: 'https://example.com/constructionplus_financial_statements_2023.pdf',
      date: '2023-12-31'
    },
    {
      id: 'doc2',
      name: 'Rapport de Gestion 2024',
      type: 'pdf',
      url: 'https://example.com/constructionplus_management_report.pdf',
      date: '2024-03-31'
    },
    {
      id: 'doc3',
      name: 'Plan Stratégique 2024-2028',
      type: 'pdf',
      url: 'https://example.com/constructionplus_strategic_plan.pdf',
      date: '2024-01-30'
    }
  ],
  financialHighlights: {
    netIncome: 270000000,
    totalAssets: 2500000000,
    totalLiabilities: 1200000000,
    ebitda: 410000000,
    operatingMargin: 22.8,
    equityRatio: 52.0,
    growthRate: 20.0
  },
  documents: [
    {
      id: 'doc1',
      title: 'Rapport Annuel 2024',
      url: 'https://example.com/constructionplus-annual-report.pdf',
      type: 'annual_report',
      date: '2024-04-15',
      size: '4.2MB',
      status: 'final'
    },
    {
      id: 'doc2',
      title: 'Portefeuille de Projets',
      url: 'https://example.com/constructionplus-project-portfolio.pdf',
      type: 'portfolio',
      date: '2025-06-10',
      size: '6.8MB',
      status: 'final'
    },
    {
      id: 'doc3',
      title: 'Contrat de Prêt',
      url: 'https://example.com/constructionplus-loan-agreement.pdf',
      type: 'contract',
      date: '2024-09-05',
      size: '1.8MB',
      status: 'signed'
    },
    {
      id: 'doc4',
      title: 'Échéancier de Remboursement',
      url: 'https://example.com/constructionplus-repayment-schedule.pdf',
      type: 'schedule',
      date: '2024-09-05',
      size: '0.9MB',
      status: 'final'
    }
  ],
  // Information de scénario pour cette entreprise
  scenario: {
    status: 'funded',
    stage: 'active_loan',
    nextAction: 'monitor_repayments',
    lastContact: '2025-06-01',
    notes: 'Prêt accordé pour le projet d\'écoconstruction à Abidjan',
    approvedAmount: 650000000,
    requestedAmount: 650000000,
    applicationDate: '2024-07-10',
    approvalDate: '2024-09-01',
    disbursementDate: '2024-09-15',
    loanDetails: {
      id: 'LOAN-CP-2024-001',
      interestRate: 7.2,
      term: 84, // mois
      paymentFrequency: 'monthly',
      startDate: '2024-10-01',
      endDate: '2031-09-30',
      remainingBalance: 598750000,
      nextPaymentDate: '2025-07-01',
      nextPaymentAmount: 9625000,
      paymentsOnTime: 9,
      paymentsLate: 0
    },
    guarantees: [
      {
        id: 'G001',
        type: 'Hypothèque',
        description: 'Terrain commercial à Abidjan Plateau',
        value: 850000000,
        status: 'active',
        documentUrl: 'https://example.com/constructionplus-mortgage-deed.pdf'
      },
      {
        id: 'G002',
        type: 'Équipement',
        description: 'Flotte d\'engins de construction',
        value: 320000000,
        status: 'active',
        documentUrl: 'https://example.com/constructionplus-equipment-list.pdf'
      }
    ]
  },
  securities: []
};

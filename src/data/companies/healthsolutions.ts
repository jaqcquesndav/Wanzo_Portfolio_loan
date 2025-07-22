// src/data/companies/healthsolutions.ts
// Données complètes pour HealthSolutions Rwanda

import { Linkedin, Facebook, Twitter, Youtube, Globe } from 'lucide-react';

export const healthsolutions = {
  sector: 'Santé',
  id: 'healthsolutions-rw',
  name: 'HealthSolutions Rwanda',
  industry: 'Santé et Technologie Médicale',
  legalForm: 'LTD',
  rccm: 'RW-KGL-2020-E-56789',
  taxId: 'RW56789012',
  natId: 'RW12345678',
  description: 'HealthSolutions Rwanda développe des technologies médicales innovantes et accessibles pour améliorer l\'accès aux soins de santé dans les zones rurales du Rwanda. Notre mission est de démocratiser l\'accès aux diagnostics médicaux grâce à des solutions mobiles et à l\'intelligence artificielle.',
  address: {
    street: 'KG 7 Avenue 123',
    city: 'Kigali',
    country: 'Rwanda'
  },
  contacts: {
    email: 'contact@healthsolutions.rw',
    phone: '+250 78 123 4567'
  },
  socialMedia: {
    website: 'https://www.healthsolutions.rw',
    facebook: 'https://www.facebook.com/healthsolutions.rw',
    linkedin: 'https://www.linkedin.com/company/healthsolutions-rwanda',
    twitter: 'https://twitter.com/healthsolutionsrw',
    youtube: 'https://www.youtube.com/channel/healthsolutions-rwanda'
  },
  socialIcons: {
    website: Globe,
    facebook: Facebook,
    linkedin: Linkedin,
    twitter: Twitter,
    youtube: Youtube
  },
  presentation_video: 'https://www.youtube.com/embed/IoxHUbGQPWk',
  ceo: {
    name: 'Gloria Mukamana',
    gender: 'female',
    title: 'Directrice Générale et Co-fondatrice',
    linkedin: 'https://www.linkedin.com/in/gloria-mukamana',
    bio: 'Gloria Mukamana est une innovatrice dans le domaine de la santé, titulaire d\'un doctorat en ingénierie biomédicale de l\'Université de Stanford. Après avoir travaillé pour l\'OMS, elle est retournée au Rwanda pour fonder HealthSolutions afin de répondre aux défis de santé locaux.',
    photo: 'https://randomuser.me/api/portraits/women/28.jpg'
  },
  capital: {
    amount: 100000000,
    currency: 'RWF',
    isApplicable: true
  },
  logo: 'https://placehold.co/400x400/ec4899/ffffff?text=HS',
  country: 'Rwanda',
  status: 'active',
  founded: 2020,
  employee_count: 35,
  annual_revenue: 85000000,
  employees: 35,
  creditRating: 'B',
  esgScore: 88,
  leadership_team: [
    {
      id: 'exec1',
      name: 'Jean-Claude Nsengimana',
      title: 'Directeur Technique',
      photo: 'https://randomuser.me/api/portraits/men/15.jpg',
      linkedin: 'https://www.linkedin.com/in/jean-claude-nsengimana',
      gender: 'male',
      bio: 'Jean-Claude dirige le développement technique des solutions médicales. Il a une formation en génie informatique et a travaillé précédemment chez Microsoft Research Africa.'
    },
    {
      id: 'exec2',
      name: 'Alice Uwamahoro',
      title: 'Directrice Médicale',
      photo: 'https://randomuser.me/api/portraits/women/8.jpg',
      linkedin: 'https://www.linkedin.com/in/alice-uwamahoro',
      gender: 'female',
      bio: 'Dr. Alice est médecin de formation et veille à ce que toutes les solutions développées répondent aux besoins réels des professionnels de santé et des patients.'
    }
  ],
  financials: [
    { year: 2024, revenue: 85000000, profit: 6800000, assets: 120000000, liabilities: 65000000 },
    { year: 2023, revenue: 60000000, profit: 3600000, assets: 95000000, liabilities: 55000000 },
    { year: 2022, revenue: 35000000, profit: 1400000, assets: 70000000, liabilities: 45000000 }
  ],
  financial_metrics: {
    revenue_growth: 41.7
  },
  pitch_deck_url: 'https://example.com/healthsolutions_pitch.pdf',
  financial_documents: [
    {
      id: 'doc1',
      name: 'États Financiers 2023',
      type: 'pdf',
      url: 'https://example.com/healthsolutions_financial_2023.pdf',
      date: '2023-12-31'
    },
    {
      id: 'doc2',
      name: 'Projections 2024-2026',
      type: 'pdf',
      url: 'https://example.com/healthsolutions_projections.pdf',
      date: '2024-01-20'
    }
  ],
  financialHighlights: {
    netIncome: 6800000,
    totalAssets: 120000000,
    totalLiabilities: 65000000,
    ebitda: 9500000,
    operatingMargin: 12.5,
    equityRatio: 45.8,
    growthRate: 41.7
  },
  documents: [
    {
      id: 'doc1',
      title: 'Présentation de la Société',
      url: 'https://example.com/healthsolutions-company-profile.pdf',
      type: 'company_profile',
      date: '2025-01-15',
      size: '2.1MB',
      status: 'final'
    },
    {
      id: 'doc2',
      title: 'Catalogue de Produits',
      url: 'https://example.com/healthsolutions-product-catalog.pdf',
      type: 'catalog',
      date: '2025-03-10',
      size: '5.3MB',
      status: 'final'
    },
    {
      id: 'doc3',
      title: 'Étude de Marché - Afrique de l\'Est',
      url: 'https://example.com/healthsolutions-market-study.pdf',
      type: 'market_study',
      date: '2024-11-05',
      size: '3.7MB',
      status: 'final'
    }
  ],
  // Information de scénario pour cette entreprise
  scenario: {
    status: 'prospect',
    stage: 'evaluation',
    nextAction: 'schedule_pitch_meeting',
    lastContact: '2025-06-15',
    notes: 'Entreprise prometteuse dans le secteur de la santé numérique avec forte croissance',
    potentialInvestment: 200000000,
    evaluationSummary: {
      strengths: [
        'Technologie innovante avec plusieurs brevets',
        'Équipe de direction solide avec expertise technique et médicale',
        'Forte croissance du chiffre d\'affaires (+41.7% en 2024)',
        'Marché en expansion en Afrique de l\'Est'
      ],
      weaknesses: [
        'Entreprise relativement jeune (fondée en 2020)',
        'Besoin de renforcer l\'équipe commerciale',
        'Ratio d\'endettement élevé',
        'Concurrence croissante dans le secteur'
      ],
      opportunities: [
        'Expansion dans les pays voisins (Ouganda, Kenya, Tanzanie)',
        'Partenariats potentiels avec des hôpitaux nationaux',
        'Intérêt croissant des investisseurs pour la santé numérique en Afrique'
      ],
      risks: [
        'Changements réglementaires potentiels dans le secteur médical',
        'Défis logistiques pour le déploiement en zones rurales',
        'Besoin de certifications internationales pour l\'expansion'
      ]
    },
    meetingScheduled: '2025-07-05'
  },
  securities: []
};

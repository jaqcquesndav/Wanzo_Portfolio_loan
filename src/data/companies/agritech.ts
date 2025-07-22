// src/data/companies/agritech.ts
// Données complètes pour AgriTech Burkina

import { Linkedin, Facebook, Twitter, Youtube, Globe } from 'lucide-react';

export const agritech = {
  sector: 'Agriculture',
  id: 'agritech-bf',
  name: 'AgriTech Burkina',
  industry: 'Agrobusiness',
  legalForm: 'SA',
  rccm: 'BF-OUAG-2018-A-45678',
  taxId: 'BF45678901',
  natId: 'BF98765432',
  description: 'AgriTech Burkina développe des solutions technologiques innovantes pour le secteur agricole au Burkina Faso. Notre mission est d\'améliorer la productivité des agriculteurs et de favoriser l\'agriculture durable en Afrique de l\'Ouest.',
  address: {
    street: 'Rue de l\'Innovation 45',
    city: 'Ouagadougou',
    country: 'Burkina Faso'
  },
  contacts: {
    email: 'contact@agritech-burkina.bf',
    phone: '+226 70 123 456'
  },
  socialMedia: {
    website: 'https://www.agritech-burkina.bf',
    facebook: 'https://www.facebook.com/agritechburkina',
    linkedin: 'https://www.linkedin.com/company/agritech-burkina',
    twitter: 'https://twitter.com/agritechbf',
    youtube: 'https://www.youtube.com/channel/agritechburkina'
  },
  socialIcons: {
    website: Globe,
    facebook: Facebook,
    linkedin: Linkedin,
    twitter: Twitter,
    youtube: Youtube
  },
  presentation_video: 'https://www.youtube.com/embed/YdAIBlPVe9s',
  ceo: {
    name: 'Amadou Ouédraogo',
    gender: 'male',
    title: 'Directeur Général',
    linkedin: 'https://www.linkedin.com/in/amadou-ouedraogo',
    bio: 'Amadou Ouédraogo est un entrepreneur agricole avec une formation en agronomie et en informatique. Diplômé de l\'Université de Ouagadougou et de l\'ESMT Dakar, il a fondé AgriTech Burkina en 2018 après avoir travaillé comme consultant pour la FAO.',
    photo: 'https://randomuser.me/api/portraits/men/75.jpg'
  },
  capital: {
    amount: 15000000,
    currency: 'XOF',
    isApplicable: true
  },
  logo: 'https://placehold.co/400x400/4ade80/ffffff?text=AB',
  country: 'Burkina Faso',
  status: 'active',
  founded: 2018,
  employee_count: 45,
  annual_revenue: 120000000,
  employees: 45,
  creditRating: 'B+',
  esgScore: 82,
  leadership_team: [
    {
      id: 'exec1',
      name: 'Fatima Traoré',
      title: 'Directrice Technique',
      photo: 'https://randomuser.me/api/portraits/women/65.jpg',
      linkedin: 'https://www.linkedin.com/in/fatima-traore',
      gender: 'female',
      bio: 'Fatima supervise le développement des solutions techniques d\'AgriTech Burkina. Elle a un master en systèmes d\'information de l\'Université de Dakar.'
    },
    {
      id: 'exec2',
      name: 'Ibrahim Diallo',
      title: 'Directeur Financier',
      photo: 'https://randomuser.me/api/portraits/men/62.jpg',
      linkedin: 'https://www.linkedin.com/in/ibrahim-diallo',
      gender: 'male',
      bio: 'Ibrahim gère les finances et les investissements de l\'entreprise. Il a travaillé pendant 10 ans dans le secteur bancaire avant de rejoindre AgriTech.'
    }
  ],
  financials: [
    { year: 2024, revenue: 120000000, profit: 9500000, assets: 85000000, liabilities: 40000000 },
    { year: 2023, revenue: 95000000, profit: 7800000, assets: 70000000, liabilities: 35000000 },
    { year: 2022, revenue: 70000000, profit: 5200000, assets: 55000000, liabilities: 30000000 }
  ],
  financial_metrics: {
    revenue_growth: 26.3
  },
  pitch_deck_url: 'https://example.com/agritech_pitch_deck.pdf',
  financial_documents: [
    {
      id: 'doc1',
      name: 'Rapport Financier 2023',
      type: 'pdf',
      url: 'https://example.com/agritech_financial_2023.pdf',
      date: '2023-12-31'
    },
    {
      id: 'doc2',
      name: 'Plan d\'Affaires 2024-2026',
      type: 'pdf',
      url: 'https://example.com/agritech_business_plan.pdf',
      date: '2024-01-20'
    }
  ],
  financialHighlights: {
    netIncome: 9500000,
    totalAssets: 85000000,
    totalLiabilities: 40000000,
    ebitda: 12000000,
    operatingMargin: 15.2,
    equityRatio: 52.9,
    growthRate: 26.3
  },
  documents: [
    {
      id: 'doc1',
      title: 'États financiers 2024',
      url: 'https://example.com/agritech-financial-statements.pdf',
      type: 'financial_report',
      date: '2024-03-31',
      size: '1.8MB',
      status: 'final'
    },
    {
      id: 'doc2',
      title: 'Étude d\'impact environnemental',
      url: 'https://example.com/agritech-environmental-study.pdf',
      type: 'environmental_report',
      date: '2024-02-15',
      size: '3.2MB',
      status: 'final'
    },
    {
      id: 'doc3',
      title: 'Demande de financement',
      url: 'https://example.com/agritech-funding-request.pdf',
      type: 'funding_request',
      date: '2025-06-01',
      size: '2.4MB',
      status: 'pending'
    }
  ],
  // Information de scénario pour cette entreprise
  scenario: {
    status: 'funding_requested',
    stage: 'application_submitted',
    nextAction: 'review_financial_documents',
    lastContact: '2025-06-01',
    notes: 'Demande de financement pour l\'expansion de leur plateforme digitale agricole',
    requestedAmount: 75000000,
    requestDate: '2025-06-01',
    application: {
      id: 'APP-2025-0601',
      status: 'in_review',
      submittedBy: 'Amadou Ouédraogo',
      reviewedBy: null,
      purpose: 'Expansion technologique et commerciale',
      documents: ['business_plan', 'financial_statements', 'market_analysis']
    }
  },
  securities: []
};

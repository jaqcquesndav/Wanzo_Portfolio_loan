// src/data/companies/cleanenergy.ts
// Données complètes pour CleanEnergy Sénégal

import { Linkedin, Facebook, Twitter, Youtube, Globe } from 'lucide-react';

export const cleanenergy = {
  sector: 'Énergie',
  id: 'cleanenergy-sn',
  name: 'CleanEnergy Sénégal',
  industry: 'Énergies Renouvelables',
  legalForm: 'SAS',
  rccm: 'SN-DKR-2019-C-78901',
  taxId: 'SN789012345',
  natId: 'SN567890123',
  description: 'CleanEnergy Sénégal est spécialisée dans l\'installation et la maintenance de systèmes solaires pour les zones rurales et périurbaines du Sénégal. Notre objectif est de rendre l\'énergie propre accessible à tous les Sénégalais.',
  address: {
    street: 'Avenue Cheikh Anta Diop 78',
    city: 'Dakar',
    country: 'Sénégal'
  },
  contacts: {
    email: 'info@cleanenergy-senegal.sn',
    phone: '+221 78 456 7890'
  },
  socialMedia: {
    website: 'https://www.cleanenergy-senegal.sn',
    facebook: 'https://www.facebook.com/cleanenergy.senegal',
    linkedin: 'https://www.linkedin.com/company/cleanenergy-senegal',
    twitter: 'https://twitter.com/cleanenergysn',
    youtube: 'https://www.youtube.com/channel/cleanenergy-senegal'
  },
  socialIcons: {
    website: Globe,
    facebook: Facebook,
    linkedin: Linkedin,
    twitter: Twitter,
    youtube: Youtube
  },
  presentation_video: 'https://www.youtube.com/embed/jjS5zKu-e_Y',
  ceo: {
    name: 'Assane Diop',
    gender: 'male',
    title: 'Président Directeur Général',
    linkedin: 'https://www.linkedin.com/in/assane-diop',
    bio: 'Assane Diop est un ingénieur en énergie avec une expertise dans les technologies solaires. Il a travaillé pour Total Energies avant de créer CleanEnergy Sénégal en 2019 pour répondre aux besoins énergétiques des communautés rurales.',
    photo: 'https://randomuser.me/api/portraits/men/82.jpg'
  },
  capital: {
    amount: 250000000,
    currency: 'XOF',
    isApplicable: true
  },
  logo: 'https://placehold.co/400x400/facc15/ffffff?text=CE',
  country: 'Sénégal',
  status: 'active',
  founded: 2019,
  employee_count: 75,
  annual_revenue: 350000000,
  employees: 75,
  creditRating: 'A-',
  esgScore: 91,
  leadership_team: [
    {
      id: 'exec1',
      name: 'Mariama Sall',
      title: 'Directrice des Opérations',
      photo: 'https://randomuser.me/api/portraits/women/72.jpg',
      linkedin: 'https://www.linkedin.com/in/mariama-sall',
      gender: 'female',
      bio: 'Mariama supervise toutes les opérations d\'installation et de maintenance. Elle a plus de 15 ans d\'expérience dans le secteur énergétique.'
    },
    {
      id: 'exec2',
      name: 'Ousmane Ndiaye',
      title: 'Directeur Technique',
      photo: 'https://randomuser.me/api/portraits/men/42.jpg',
      linkedin: 'https://www.linkedin.com/in/ousmane-ndiaye',
      gender: 'male',
      bio: 'Ousmane est responsable de la R&D et de l\'innovation technique. Il est titulaire d\'un doctorat en génie électrique de l\'École Polytechnique Fédérale de Lausanne.'
    },
    {
      id: 'exec3',
      name: 'Aïssatou Mbaye',
      title: 'Directrice Commerciale',
      photo: 'https://randomuser.me/api/portraits/women/33.jpg',
      linkedin: 'https://www.linkedin.com/in/aissatou-mbaye',
      gender: 'female',
      bio: 'Aïssatou dirige toutes les activités commerciales et marketing. Elle a précédemment travaillé chez Orange Sénégal et possède un MBA de HEC Paris.'
    }
  ],
  financials: [
    { year: 2024, revenue: 350000000, profit: 52000000, assets: 420000000, liabilities: 180000000 },
    { year: 2023, revenue: 280000000, profit: 39000000, assets: 350000000, liabilities: 160000000 },
    { year: 2022, revenue: 200000000, profit: 24000000, assets: 290000000, liabilities: 140000000 }
  ],
  financial_metrics: {
    revenue_growth: 25.0
  },
  pitch_deck_url: 'https://example.com/cleanenergy_pitch_deck.pdf',
  financial_documents: [
    {
      id: 'doc1',
      name: 'Bilan Financier 2023',
      type: 'pdf',
      url: 'https://example.com/cleanenergy_balance_sheet_2023.pdf',
      date: '2023-12-31'
    },
    {
      id: 'doc2',
      name: 'Plan d\'Investissement 2024-2026',
      type: 'pdf',
      url: 'https://example.com/cleanenergy_investment_plan.pdf',
      date: '2024-01-15'
    },
    {
      id: 'doc3',
      name: 'Étude d\'Impact Social et Environnemental',
      type: 'pdf',
      url: 'https://example.com/cleanenergy_impact_study.pdf',
      date: '2024-02-28'
    }
  ],
  financialHighlights: {
    netIncome: 52000000,
    totalAssets: 420000000,
    totalLiabilities: 180000000,
    ebitda: 70000000,
    operatingMargin: 21.5,
    equityRatio: 57.1,
    growthRate: 25.0
  },
  documents: [
    {
      id: 'doc1',
      title: 'Rapport Annuel 2024',
      url: 'https://example.com/cleanenergy-annual-report.pdf',
      type: 'annual_report',
      date: '2024-04-30',
      size: '3.5MB',
      status: 'final'
    },
    {
      id: 'doc2',
      title: 'Présentation des Projets en Cours',
      url: 'https://example.com/cleanenergy-current-projects.pdf',
      type: 'project_report',
      date: '2025-05-15',
      size: '2.7MB',
      status: 'final'
    },
    {
      id: 'doc3',
      title: 'Contrat de Financement',
      url: 'https://example.com/cleanenergy-funding-agreement.pdf',
      type: 'contract',
      date: '2025-04-20',
      size: '1.6MB',
      status: 'signed'
    }
  ],
  // Information de scénario pour cette entreprise
  scenario: {
    status: 'funding_in_progress',
    stage: 'due_diligence',
    nextAction: 'prepare_loan_documents',
    lastContact: '2025-05-30',
    notes: 'Financement en cours de traitement pour l\'expansion des activités dans les régions rurales',
    approvedAmount: 180000000,
    requestedAmount: 200000000,
    applicationDate: '2025-03-10',
    approvalDate: '2025-04-20',
    disbursementSchedule: [
      { date: '2025-07-01', amount: 90000000 },
      { date: '2025-12-01', amount: 90000000 }
    ],
      loanTerms: {
      interestRate: 6.5,
      term: 60, // mois
      paymentFrequency: 'monthly',
      guarantees: ['equipment', 'company_assets']
    }
  },
  securities: []
};
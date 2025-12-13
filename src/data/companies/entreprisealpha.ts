// src/data/companies/entreprisealpha.ts
// Donnees enrichies pour Entreprise Alpha SARL

import { Linkedin, Facebook, Twitter, Youtube, Globe } from 'lucide-react';

export const entrepriseAlpha = {
  sector: 'Agroalimentaire',
  id: 'entreprise-alpha-cd',
  name: 'Entreprise Alpha SARL',
  sigle: 'EAS',
  size: 'medium',
  typeEntreprise: 'traditional',
  industry: 'Transformation agroalimentaire et logistique',
  legalForm: 'SARL',
  rccm: 'CD/KIN/RCCM/15-B-102030',
  taxId: 'CD-ALPHA-102030',
  natId: 'NAT/KIN/2015/4589',
  numeroIdentificationNationale: 'CD-KIN-2015-ALPHA',
  description: "Entreprise Alpha SARL transforme des produits agricoles locaux en aliments a forte valeur ajoutee et fournit une logistique sous froid pour les cooperatives agricoles de la RDC.",
  descriptionActivites: "Alpha offre une solution integree allant de la collecte des produits frais a la transformation et a la distribution, avec une plateforme numerique de suivi des commandes pour les acteurs agroalimentaires.",
  produitsServices: [
    'Confitures artisanales',
    'Purees de mangue et d ananas',
    'Logistique sous froid',
    'Conditionnement sous marque blanche'
  ],
  secteursActiviteSecondaires: [
    'Logistique agricole',
    'Distribution alimentaire',
    'Services numeriques B2B'
  ],
  secteursPersonalises: [
    'Transformation de produits maraichers',
    'Valorisation de surplus agricoles'
  ],
  address: {
    street: 'Avenue des Entrepreneurs 12',
    city: 'Kinshasa',
    country: 'Republique Democratique du Congo'
  },
  contacts: {
    email: 'contact@entreprise-alpha.cd',
    phone: '+243 998 123 456'
  },
  telephoneFixe: '+243 815 000 120',
  telephoneMobile: '+243 998 123 456',
  fax: '+243 820 555 910',
  boitePostale: 'BP 2456 Kinshasa 1',
  socialMedia: {
    website: 'https://www.entreprise-alpha.cd',
    facebook: 'https://www.facebook.com/entreprisealpha',
    linkedin: 'https://www.linkedin.com/company/entreprise-alpha',
    twitter: 'https://twitter.com/entreprisealpha',
    youtube: 'https://www.youtube.com/channel/entreprisealpha'
  },
  reseauxSociaux: [
    { platform: 'linkedin', url: 'https://www.linkedin.com/company/entreprise-alpha', label: 'LinkedIn' },
    { platform: 'facebook', url: 'https://www.facebook.com/entreprisealpha', label: 'Facebook' },
    { platform: 'twitter', url: 'https://twitter.com/entreprisealpha', label: 'Twitter' },
    { platform: 'website', url: 'https://www.entreprise-alpha.cd', label: 'Site web' }
  ],
  socialIcons: {
    website: Globe,
    facebook: Facebook,
    linkedin: Linkedin,
    twitter: Twitter,
    youtube: Youtube
  },
  presentation_video: 'https://www.youtube.com/embed/Gtvf8Iti6Mc',
  ceo: {
    name: 'Sarah Kanku',
    gender: 'female',
    title: 'Directrice Generale et Fondatrice',
    linkedin: 'https://www.linkedin.com/in/sarah-kanku',
    bio: "Sarah Kanku est ingenieure agroalimentaire avec 12 ans d experience dans la transformation et la logistique. Elle a fonde Entreprise Alpha en 2015 pour professionnaliser les chaines de valeur agricoles locales.",
    photo: 'https://randomuser.me/api/portraits/women/52.jpg'
  },
  owner: {
    id: 'owner',
    name: 'Sarah Kanku',
    email: 'sarah.kanku@entreprise-alpha.cd',
    phone: '+243 815 000 120'
  },
  contactPersons: [
    {
      id: 'contact-1',
      nom: 'Michel',
      prenoms: 'Kasongo',
      fonction: 'Directeur Commercial',
      email: 'michel.kasongo@entreprise-alpha.cd',
      telephone: '+243 810 334 567'
    },
    {
      id: 'contact-2',
      nom: 'Chantal',
      prenoms: 'Ilunga',
      fonction: 'Responsable Operations',
      email: 'chantal.ilunga@entreprise-alpha.cd',
      telephone: '+243 820 112 233'
    }
  ],
  leadership_team: [
    {
      id: 'exec-1',
      name: 'Michel Kasongo',
      title: 'Directeur Commercial',
      photo: 'https://randomuser.me/api/portraits/men/44.jpg',
      linkedin: 'https://www.linkedin.com/in/michel-kasongo',
      gender: 'male',
      bio: "Michel pilote la strategie commerciale et les partenariats avec les chaines de distribution de la region CEEAC."
    },
    {
      id: 'exec-2',
      name: 'Chantal Ilunga',
      title: 'Responsable Operations',
      photo: 'https://randomuser.me/api/portraits/women/47.jpg',
      linkedin: 'https://www.linkedin.com/in/chantal-ilunga',
      gender: 'female',
      bio: "Chantal supervise les unites de production et le reseau logistique sous froid."
    },
    {
      id: 'exec-3',
      name: 'Joel Mbuyi',
      title: 'Directeur Financier',
      photo: 'https://randomuser.me/api/portraits/men/61.jpg',
      linkedin: 'https://www.linkedin.com/in/joel-mbuyi',
      gender: 'male',
      bio: "Joel est charge de la strategie financiere et des relations avec les partenaires bancaires."
    }
  ],
  capital: {
    amount: 95000000,
    currency: 'USD',
    isApplicable: true
  },
  capitalSocial: 95000000,
  deviseCapital: 'USD',
  dateCreation: '2015-04-12',
  dateDebutActivites: '2015-09-01',
  logo: 'https://placehold.co/400x400/1d4ed8/ffffff?text=EAS',
  country: 'Republique Democratique du Congo',
  status: 'active',
  founded: 2015,
  employee_count: 85,
  employees: 85,
  annual_revenue: 145000000,
  creditRating: 'A',
  esgScore: 81,
  esg_metrics: {
    esg_rating: 'A',
    carbon_footprint: 540,
    environmental_rating: 'A',
    social_rating: 'A',
    governance_rating: 'B',
    gender_ratio: { male: 48, female: 52 }
  },
  incubation: {
    enIncubation: false
  },
  traditionalSpecifics: {
    certificationQualite: true,
    licencesExploitation: [
      'Certification HACCP',
      'Autorisation ministerielle de transformation agroalimentaire'
    ]
  },
  pitch: {
    elevator_pitch: "Nous offrons aux cooperatives agricoles une chaine de valeur integree pour transformer, stocker et distribuer leurs produits en toute fiabilite.",
    value_proposition: "Transformation industrialisee avec tracabilite numerique et distribution sous chaine du froid.",
    target_market: "Cooperatives agricoles, hotels et reseaux de distribution urbains en RDC et Congo Brazzaville.",
    competitive_advantage: "Infrastructure logistique sous froid, certifications qualite et plateforme numerique B2B.",
    pitch_deck_url: 'https://example.com/entreprise-alpha/pitch-deck.pdf',
    demo_video_url: 'https://www.youtube.com/watch?v=3Gf71dYpN3A'
  },
  siegeSocial: {
    id: 'siege-social',
    address: 'Avenue des Entrepreneurs 12',
    city: 'Kinshasa',
    country: 'Republique Democratique du Congo',
    isPrimary: true,
    coordinates: { lat: -4.325, lng: 15.322 }
  },
  siegeExploitation: {
    id: 'siege-exploitation',
    address: 'Zone Industrielle de Limete, Parcelle 45',
    city: 'Kinshasa',
    country: 'Republique Democratique du Congo',
    isPrimary: false,
    coordinates: { lat: -4.341, lng: 15.339 }
  },
  unitesProduction: [
    {
      id: 'unite-kin',
      address: 'Zone Industrielle de Limete, Parcelle 45',
      city: 'Kinshasa',
      country: 'Republique Democratique du Congo',
      isPrimary: true,
      coordinates: { lat: -4.341, lng: 15.339 }
    },
    {
      id: 'unite-matadi',
      address: 'Parc Agroindustriel de Matadi, Lot 7',
      city: 'Matadi',
      country: 'Republique Democratique du Congo',
      isPrimary: false,
      coordinates: { lat: -5.824, lng: 13.463 }
    }
  ],
  pointsVente: [
    {
      id: 'boutique-gombe',
      address: 'Boulevard du 30 Juin 101',
      city: 'Kinshasa',
      country: 'Republique Democratique du Congo',
      isPrimary: true,
      coordinates: { lat: -4.321, lng: 15.311 }
    },
    {
      id: 'showroom-brazzaville',
      address: 'Avenue de la Paix 22',
      city: 'Brazzaville',
      country: 'Republique du Congo',
      isPrimary: false,
      coordinates: { lat: -4.265, lng: 15.286 }
    }
  ],
  locations: [
    {
      id: 'primary',
      address: 'Avenue des Entrepreneurs 12',
      city: 'Kinshasa',
      country: 'Republique Democratique du Congo',
      isPrimary: true,
      coordinates: { lat: -4.325, lng: 15.322 }
    }
  ],
  moyensTechniques: [
    'Chambre froide de 800 metres cubes',
    'Unite de pasteurisation continue',
    'Ligne de conditionnement sous vide',
    'Flotte de camions frigorifiques'
  ],
  capaciteProduction: '150 tonnes de produits transformes par mois',
  organigramme: 'https://example.com/entreprise-alpha/organigramme.pdf',
  payment_info: {
    preferredMethod: 'bank',
    bankAccounts: [
      {
        accountNumber: '000123456789',
        accountName: 'Entreprise Alpha SARL',
        bankName: 'Banque Commerciale du Congo',
        currency: 'CDF',
        isPrimary: true,
        swiftCode: 'BCDCCDKI'
      },
      {
        accountNumber: '009876543210',
        accountName: 'Entreprise Alpha Export',
        bankName: 'Rawbank SA',
        currency: 'USD',
        isPrimary: false,
        swiftCode: 'RAWBCD3X'
      }
    ],
    mobileMoneyAccounts: [
      {
        phoneNumber: '+243 981 002 334',
        accountName: 'Entreprise Alpha SARL',
        provider: 'M-Pesa',
        currency: 'CDF',
        isPrimary: false
      }
    ]
  },
  assets: [
    {
      designation: 'Chambre froide principale',
      type: 'equipement',
      valeurActuelle: 45000000,
      etatActuel: 'excellent',
      observations: 'Maintenance preventive effectuee en mai 2025'
    },
    {
      designation: 'Ligne de conditionnement',
      type: 'equipement',
      valeurActuelle: 32000000,
      etatActuel: 'bon',
      observations: 'Projet de modernisation 2026'
    }
  ],
  stocks: [
    {
      designation: 'Purees de mangue',
      categorie: 'produit_fini',
       quantiteStock: 1200,
      valeurTotaleStock: 18000000,
      etatStock: 'bon'
    },
    {
      designation: 'Ananas frais',
      categorie: 'matiere_premiere',
      quantiteStock: 8500,
      valeurTotaleStock: 9500000,
      etatStock: 'excellent'
    }
  ],
  financials: [
    { year: 2024, revenue: 145000000, profit: 21500000, assets: 98000000, liabilities: 42000000 },
    { year: 2023, revenue: 128000000, profit: 18900000, assets: 90000000, liabilities: 46000000 },
    { year: 2022, revenue: 112000000, profit: 15400000, assets: 82000000, liabilities: 41000000 }
  ],
  financial_metrics: {
    revenue_growth: 13.3,
    profit_margin: 14.8,
    cash_flow: 18500000,
    debt_ratio: 0.43,
    working_capital: 56000000,
    credit_score: 86,
    financial_rating: 'A',
    ebitda: 26500000
  },
  pitch_deck_url: 'https://example.com/entreprise-alpha/pitch-deck.pdf',
  financial_documents: [
    {
      id: 'doc-fa-2024',
      name: 'Etats financiers consolides 2024',
      type: 'pdf',
      url: 'https://example.com/entreprise-alpha/etats-financiers-2024.pdf',
      date: '2024-12-31'
    },
    {
      id: 'doc-budget-2025',
      name: 'Budget previsionnel 2025',
      type: 'xlsx',
      url: 'https://example.com/entreprise-alpha/budget-2025.xlsx',
      date: '2024-11-30'
    },
    {
      id: 'doc-plan-strategique',
      name: 'Plan strategique 2025-2027',
      type: 'pdf',
      url: 'https://example.com/entreprise-alpha/plan-strategique.pdf',
      date: '2024-09-15'
    }
  ],
  financialHighlights: {
    netIncome: 21500000,
    totalAssets: 98000000,
    totalLiabilities: 42000000,
    ebitda: 26500000,
    operatingMargin: 18.6,
    equityRatio: 57.1,
    growthRate: 13.3
  },
  documentLibrary: [
    {
      id: 'doc1',
      title: 'Certificat HACCP',
      url: 'https://example.com/entreprise-alpha/certificat-haccp.pdf',
      type: 'certificate',
      date: '2024-02-28',
      size: '0.8MB',
      status: 'final'
    },
    {
      id: 'doc2',
      title: 'Rapport RSE 2024',
      url: 'https://example.com/entreprise-alpha/rapport-rse-2024.pdf',
      type: 'sustainability_report',
      date: '2025-01-15',
      size: '2.1MB',
      status: 'final'
    },
    {
      id: 'doc3',
      title: 'Contrat distribution Hotel Lux',
      url: 'https://example.com/entreprise-alpha/contrat-hotel-lux.pdf',
      type: 'contract',
      date: '2024-11-05',
      size: '0.6MB',
      status: 'signed'
    },
    {
      id: 'doc4',
      title: 'Plan d investissement 2025',
      url: 'https://example.com/entreprise-alpha/plan-investissement-2025.pdf',
      type: 'business_plan',
      date: '2024-08-22',
      size: '1.4MB',
      status: 'final'
    }
  ],
  legalAspects: {
    failliteAnterieure: false,
    poursuiteJudiciaire: false,
    garantiePrets: true,
    detailsGaranties: 'Hypotheque sur entrepot principal et caution personnelle de la fondatrice.',
    antecedentsFiscaux: false
  },
  pretsEnCours: [
    {
      id: 'LOAN-ALPHA-2024-001',
      type: 'Credit d investissement',
      amount: 75000000,
      currency: 'CDF',
      lender: 'Fonds de Developpement Agricole',
      startDate: '2024-03-01',
      endDate: '2029-02-28',
      interestRate: 7.5,
      status: 'active'
    },
    {
      id: 'LOAN-ALPHA-2022-002',
      type: 'Credit de tresorerie',
      amount: 12000000,
      currency: 'USD',
      lender: 'Banque Commerciale du Congo',
      startDate: '2022-06-15',
      endDate: '2025-06-15',
      interestRate: 6.2,
      status: 'active'
    }
  ],
  leveeDeFonds: [
    {
      id: 'ROUND-ALPHA-2021',
      roundType: 'Serie A',
      amount: 5000000,
      currency: 'USD',
      valuation: 18000000,
      investors: ['Impact Fund Kinshasa', 'Women in Tech Africa'],
      date: '2021-11-30'
    }
  ],
  scenario: {
    status: 'prospect',
    stage: 'due_diligence',
    nextAction: 'analyse_risque',
    lastContact: '2025-07-10',
    notes: "Besoin de financement pour etendre la logistique sous froid vers Lubumbashi.",
    potentialInvestment: 125000000,
    requestedAmount: 125000000,
    requestDate: '2025-06-25',
    application: {
      id: 'APP-ALPHA-2025-001',
      status: 'in_review',
      submittedBy: 'Sarah Kanku',
      reviewedBy: 'Equipe Credit RDC',
      purpose: 'Extension logistique et automatisation de la ligne de conditionnement',
      documents: ['pitch_deck', 'etats_financiers', 'plan_strategique']
    }
  },
  documents: {
    documentsEntreprise: [
      'https://example.com/entreprise-alpha/statuts.pdf',
      'https://example.com/entreprise-alpha/rccm.pdf'
    ],
    documentsPersonnel: [
      'https://example.com/entreprise-alpha/contrat-dg.pdf'
    ],
    documentsFinanciers: [
      'https://example.com/entreprise-alpha/etats-financiers-2024.pdf',
      'https://example.com/entreprise-alpha/budget-2025.xlsx'
    ],
    documentsPatrimoine: [
      'https://example.com/entreprise-alpha/titres-propriete.pdf'
    ],
    documentsProprieteIntellectuelle: [
      'https://example.com/entreprise-alpha/marque-alpha.pdf'
    ],
    documentsSectoriels: [
      'https://example.com/entreprise-alpha/certificat-haccp.pdf'
    ]
  },
  profileCompleteness: 92,
  lastSyncFromAccounting: '2025-07-05T10:15:00Z',
  lastSyncFromCustomer: '2025-07-08T14:20:00Z',
  created_at: '2015-04-12T09:00:00Z',
  updated_at: '2025-07-10T08:30:00Z'
};

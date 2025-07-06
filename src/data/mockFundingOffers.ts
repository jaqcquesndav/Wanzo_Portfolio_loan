import type { FundingOffer } from '../types/funding';

export const mockFundingOffers: FundingOffer[] = [
  {
    id: '1',
    type: 'equity',
    title: 'Capital d\'amorçage - Tech Startups',
    provider: 'Africa Venture Capital',
    description: 'Financement en capital pour les startups technologiques innovantes en phase de croissance. Focus sur les solutions digitales et l\'innovation technologique.',
    amount: { min: 50000000, max: 200000000 },
    duration: { min: 24, max: 48 },
    requirements: [
      'Entreprise technologique existante depuis 2 ans minimum',
      'Chiffre d\'affaires > 100M FCFA',
      'Business plan détaillé avec projections sur 5 ans',
      'Équipe de direction expérimentée dans le secteur tech'
    ]
  },
  {
    id: '2',
    type: 'credit',
    title: 'Crédit d\'investissement PME',
    provider: 'BOAD',
    description: 'Ligne de crédit dédiée aux PME pour le financement des investissements productifs et l\'expansion des activités.',
    amount: { min: 25000000, max: 150000000 },
    duration: { min: 12, max: 60 },
    interestRate: 8.5,
    requirements: [
      'PME formelle avec 3 ans d\'existence minimum',
      'États financiers des 3 derniers exercices',
      'Garanties réelles ou personnelles',
      'Plan d\'affaires viable'
    ]
  },
  {
    id: '3',
    type: 'leasing',
    title: 'Leasing Équipement Industriel',
    provider: 'African Leasing Company',
    description: 'Solution de leasing pour l\'acquisition d\'équipements industriels et machines de production.',
    amount: { min: 20000000, max: 100000000 },
    duration: { min: 24, max: 48 },
    interestRate: 10,
    requirements: [
      'Entreprise existante depuis 1 an minimum',
      'Apport personnel de 20% minimum',
      'Activité génératrice de revenus stable',
      'Devis des équipements à financer'
    ]
  },
  {
    id: '4',
    type: 'grant',
    title: 'Subvention Innovation Verte',
    provider: 'BAD',
    description: 'Programme de subvention pour les projets innovants dans le domaine de l\'économie verte et du développement durable.',
    amount: { min: 10000000, max: 50000000 },
    duration: { min: 12, max: 24 },
    requirements: [
      'Projet à impact environnemental positif',
      'Innovation technologique ou sociale',
      'Plan de mise en œuvre détaillé',
      'Mesure d\'impact environnemental'
    ]
  },
  {
    id: '5',
    type: 'equity',
    title: 'Capital Développement',
    provider: 'West Africa Growth Fund',
    description: 'Investissement en capital pour les entreprises en phase d\'expansion avec un fort potentiel de croissance.',
    amount: { min: 100000000, max: 500000000 },
    duration: { min: 36, max: 60 },
    requirements: [
      'Entreprise existante depuis 5 ans minimum',
      'Chiffre d\'affaires > 500M FCFA',
      'Position forte sur le marché',
      'Gouvernance d\'entreprise solide'
    ]
  }
];

export const getRecommendedOffers = (sector: string, size: string): FundingOffer[] => {
  // Logique de recommandation basée sur le secteur et la taille
  return mockFundingOffers.slice(0, 3);
};
// src/constants/sectors.ts
/**
 * Liste complète des secteurs d'activité des PME et PMI en Afrique
 * Cette liste unifiée doit être utilisée pour tous les types de portefeuilles et produits
 */
export const businessSectors = [
  // Secteurs agricoles
  'Agriculture vivrière',
  'Agriculture commerciale',
  'Élevage',
  'Pêche et aquaculture',
  'Sylviculture et exploitation forestière',
  'Agro-industrie',
  'Transformation agricole',
  
  // Industries et manufactures
  'Industrie textile',
  'Industrie agroalimentaire',
  'Industrie chimique',
  'Industrie pharmaceutique',
  'Manufacture légère',
  'Industrie du bois',
  'Métallurgie et sidérurgie',
  'Matériaux de construction',
  'Plasturgie',
  'Industrie cosmétique',
  
  // Construction et immobilier
  'BTP (Bâtiment et Travaux Publics)',
  'Construction résidentielle',
  'Construction commerciale',
  'Promotion immobilière',
  'Génie civil',
  'Services immobiliers',
  
  // Services
  'Commerce de détail',
  'Commerce de gros',
  'Restauration',
  'Hôtellerie',
  'Tourisme',
  'Transport routier',
  'Transport maritime',
  'Transport aérien',
  'Logistique et entreposage',
  'Réparation automobile',
  'Services à la personne',
  'Services aux entreprises',
  'Éducation et formation',
  'Santé et action sociale',
  'Services financiers',
  'Microfinance',
  'Assurance',
  
  // Technologies
  'Technologies de l\'information',
  'Développement de logiciels',
  'Commerce électronique',
  'Télécommunications',
  'FinTech',
  'EdTech',
  'HealthTech',
  'Énergie renouvelable',
  'CleanTech',
  'AgriTech',
  
  // Artisanat et culture
  'Artisanat',
  'Arts et spectacles',
  'Médias et divertissement',
  'Industries culturelles et créatives',
  
  // Ressources naturelles
  'Mines et extraction',
  'Énergie',
  'Gestion des déchets',
  'Eau et assainissement',
  
  // Autres secteurs
  'Économie circulaire',
  'Économie sociale et solidaire'
];

/**
 * Fonction pour filtrer les secteurs par terme de recherche
 */
export function filterSectors(searchTerm: string): string[] {
  if (!searchTerm || searchTerm.trim() === '') {
    return businessSectors;
  }
  
  const normalizedSearchTerm = searchTerm.toLowerCase().trim();
  return businessSectors.filter(sector => 
    sector.toLowerCase().includes(normalizedSearchTerm)
  );
}

/**
 * Obtenir les principaux secteurs (version abrégée pour les interfaces nécessitant moins de détails)
 */
export function getMainSectors(): string[] {
  return [
    'Agriculture',
    'Industrie',
    'BTP',
    'Services',
    'Commerce',
    'Transport et logistique',
    'Technologies',
    'Artisanat',
    'Éducation',
    'Santé',
    'Finance',
    'Énergie',
    'Tourisme'
  ];
}

/**
 * Liste des types de garanties acceptées pour les produits financiers
 */
export const acceptedGuarantees = [
  // Garanties réelles
  'Hypothèque',
  'Nantissement de matériel',
  'Nantissement de stock',
  'Nantissement de créances',
  'Nantissement de titres',
  'Gage sur véhicule',
  'Gage sur équipement',
  'Dépôt à terme',
  'Dépôt de garantie',
  
  // Garanties personnelles
  'Caution personnelle',
  'Caution solidaire',
  'Aval',
  'Garantie à première demande',
  
  // Garanties institutionnelles
  'Fonds de garantie',
  'Garantie d\'État',
  'Garantie d\'institution financière',
  'Assurance-crédit',
  
  // Autres garanties
  'Domiciliation des revenus',
  'Cession de créances',
  'Lettre de confort',
  'Sans garantie'
];

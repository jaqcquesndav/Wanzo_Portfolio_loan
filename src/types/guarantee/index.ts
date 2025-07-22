// Types de garanties disponibles
export type GuaranteeType = 
  'materiel' | 'immobilier' | 'caution_bancaire' | 'fonds_garantie' |
  'assurance_credit' | 'nantissement' | 'gage' | 'hypotheque' | 'depot_especes' | 'autre';

export interface Guarantee {
  id: string;
  company: string;
  type: GuaranteeType | string;
  subType?: string; // Sous-type ou détail du type de garantie
  value: number; // Valeur en devise
  status: 'active' | 'libérée' | 'saisie' | 'expirée';
  created_at: string;
  expiry_date?: string; // Date d'expiration (pertinent pour les assurances, cautions)
  requestId?: string;
  contractId?: string;
  contractReference?: string; // Référence du contrat associé
  portfolioId: string;
  details?: {
    description?: string;
    location?: string; // Pour les biens immobiliers
    reference?: string; // Numéro de référence externe (police d'assurance, etc.)
    provider?: string; // Assureur, banque émettrice de caution, etc.
    coverage?: number; // Pourcentage de couverture
    document_url?: string; // Lien vers le document justificatif
  };
}

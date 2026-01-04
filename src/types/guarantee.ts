/**
 * Types liés aux garanties - Conformes à la documentation API
 */

// Types de garanties disponibles (17 valeurs - incluant legacy)
export type GuaranteeType = 
  // Types principaux
  | 'materiel'          // Garantie sur matériel/équipement
  | 'immobilier'        // Garantie immobilière (terrain, bâtiment)
  | 'caution_bancaire'  // Caution bancaire
  | 'fonds_garantie'    // Fonds de garantie (FOGEC, etc.)
  | 'assurance_credit'  // Assurance crédit
  | 'nantissement'      // Nantissement (stocks, créances)
  | 'gage'              // Gage (biens meubles)
  | 'hypotheque'        // Hypothèque
  | 'depot_especes'     // Dépôt d'espèces (DAT, compte bloqué)
  | 'autre'             // Autre type de garantie
  // Types legacy
  | 'real_estate'       // Alias de immobilier
  | 'equipment'         // Alias de materiel
  | 'vehicle'           // Véhicule
  | 'inventory'         // Stock/Inventaire
  | 'third_party'       // Caution tierce
  | 'deposit'           // Alias de depot_especes
  | 'other';            // Alias de autre

// Statuts de la garantie (9 valeurs - incluant legacy)
export type GuaranteeStatus = 
  | 'pending'     // En attente de validation
  | 'active'      // Active (en cours de validité)
  | 'libérée'     // Libérée (mainlevée effectuée)
  | 'saisie'      // Saisie (réalisation en cours)
  | 'expirée'     // Expirée (hors validité)
  // Types legacy
  | 'proposed'    // Proposée
  | 'validated'   // Validée
  | 'registered'  // Enregistrée
  | 'rejected';   // Rejetée

// Détails de la garantie
export interface GuaranteeDetails {
  description?: string;
  location?: string;               // Pour les biens immobiliers
  reference?: string;              // Numéro de référence externe
  provider?: string;               // Assureur, banque émettrice, etc.
  coverage?: number;               // Pourcentage de couverture
  document_url?: string;           // Lien vers le document justificatif
  guarantor?: string;              // Personne physique garantissant
  contract_number?: string;        // Numéro du contrat de garantie
}

// Garant physique
export interface PhysicalGuarantor {
  id: string;
  firstName: string;
  lastName: string;
  idType: 'passport' | 'nationalId' | 'drivingLicense' | 'other';
  idNumber: string;
  gender: 'male' | 'female' | 'other';
  profession: string;
  employer?: string;
  address: string;
  photoUrl?: string;
  signatureUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Garant moral (personne morale)
export interface LegalGuarantor {
  id: string;
  name: string;
  registrationNumber: string;
  registrationDate: string;
  address: string;
  createdAt?: string;
  updatedAt?: string;
}

// Interface principale de garantie
export interface Guarantee {
  id: string;
  company: string;                     // Nom de l'entreprise
  type: GuaranteeType | string;
  subType?: string;                    // Sous-type ou détail du type de garantie
  value: number;                       // Valeur en devise
  status: GuaranteeStatus;
  created_at: string;                  // ISO 8601
  expiry_date?: string;                // Date d'expiration
  requestId?: string;
  contractId?: string;                 // ID du contrat associé
  contractReference?: string;          // Référence du contrat
  portfolioId: string;
  details?: GuaranteeDetails;
  // Garants
  physicalGuarantors?: PhysicalGuarantor[];
  legalGuarantors?: LegalGuarantor[];
}

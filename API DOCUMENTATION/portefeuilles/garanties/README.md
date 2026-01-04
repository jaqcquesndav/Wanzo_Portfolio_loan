# API des Garanties

Cette API permet de gérer les garanties associées aux contrats de crédit, incluant la création, consultation, mise à jour et évaluation des garanties.

## Entités et DTOs

### Guarantee (Entité principale)

```typescript
interface Guarantee {
  id: string;
  company: string;                     // Nom de l'entreprise
  type: GuaranteeType;
  subType?: string;                    // Sous-type ou détail du type
  value: number;                       // Valeur en devise
  status: GuaranteeStatus;
  created_at: string;                  // ISO 8601
  expiry_date?: string;                // Date d'expiration
  requestId?: string;
  contractId?: string;                 // ID du contrat associé
  contractReference?: string;          // Référence du contrat
  portfolioId: string;
  details?: GuaranteeDetails;
}
```

### Enums et Types

```typescript
// Types de garanties (17 valeurs - incluant legacy)
type GuaranteeType = 
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
  // Legacy values
  | 'real_estate'       // Alias de immobilier
  | 'equipment'         // Alias de materiel
  | 'vehicle'           // Véhicule
  | 'inventory'         // Stock/Inventaire
  | 'third_party'       // Caution tierce
  | 'deposit'           // Alias de depot_especes
  | 'other';            // Alias de autre

// Statuts de la garantie (9 valeurs - incluant legacy)
type GuaranteeStatus = 
  | 'pending'     // En attente de validation
  | 'active'      // Active (en cours de validité)
  | 'libérée'     // Libérée (mainlevée effectuée)
  | 'saisie'      // Saisie (réalisation en cours)
  | 'expirée'     // Expirée (hors validité)
  // Legacy values
  | 'proposed'    // Proposée
  | 'validated'   // Validée
  | 'registered'  // Enregistrée
  | 'rejected';   // Rejetée
```

### Types imbriqués

```typescript
interface GuaranteeDetails {
  description?: string;
  location?: string;               // Pour les biens immobiliers
  reference?: string;              // Numéro de référence externe
  provider?: string;               // Assureur, banque émettrice, etc.
  coverage?: number;               // Pourcentage de couverture
  document_url?: string;           // Lien vers le document justificatif
  guarantor?: string;              // Personne physique garantissant
  contract_number?: string;        // Numéro du contrat de garantie
}

// Pour les garanties avec garants physiques
interface PhysicalGuarantor {
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
}

// Pour les garanties avec garants moraux
interface LegalGuarantor {
  id: string;
  name: string;
  registrationNumber: string;
  registrationDate: string;
  address: string;
}
```

## Points d'accès

### Liste des garanties d'un portefeuille

**Endpoint** : `GET /portfolios/traditional/guarantees`

**Paramètres de requête** :
| Paramètre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `portfolioId` | string | Oui | ID du portefeuille |
| `contractId` | string | Non | Filtrer par contrat |
| `type` | GuaranteeType | Non | Filtrer par type |
| `status` | GuaranteeStatus | Non | Filtrer par statut |
| `page` | number | Non | Numéro de page (défaut: 1) |
| `limit` | number | Non | Éléments par page (défaut: 10) |

**Réponse réussie** (200 OK) :
```json
{
  "success": true,
  "data": [
    {
      "id": "GUAR-00001",
      "company": "Entreprise ABC",
      "type": "immobilier",
      "value": 80000.00,
      "status": "active",
      "created_at": "2025-01-05T08:00:00.000Z",
      "expiry_date": "2027-01-05T00:00:00.000Z",
      "contractId": "CC-00001",
      "contractReference": "CTR-20250001",
      "portfolioId": "TP-00001",
      "details": {
        "description": "Terrain situé à Gombe, Kinshasa",
        "location": "Avenue du Commerce, Gombe",
        "reference": "TF-12345-KIN",
        "coverage": 160
      }
    },
    {
      "id": "GUAR-00002",
      "company": "Entreprise ABC",
      "type": "caution_bancaire",
      "value": 25000.00,
      "status": "active",
      "created_at": "2025-01-06T10:00:00.000Z",
      "contractId": "CC-00001",
      "portfolioId": "TP-00001",
      "details": {
        "provider": "Rawbank",
        "reference": "CB-2025-00123",
        "coverage": 50
      }
    }
  ],
  "meta": {
    "total": 2,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

### Détails d'une garantie

**Endpoint** : `GET /portfolios/traditional/guarantees/{id}`

**Réponse réussie** (200 OK) : Retourne l'objet `Guarantee` complet.

### Créer une garantie

**Endpoint** : `POST /portfolios/traditional/guarantees`

**Corps de la requête (Garantie immobilière)** :
```json
{
  "portfolioId": "TP-00001",
  "contractId": "CC-00001",
  "company": "Entreprise ABC",
  "type": "immobilier",
  "value": 80000.00,
  "expiry_date": "2027-01-05T00:00:00.000Z",
  "details": {
    "description": "Terrain situé à Gombe, Kinshasa",
    "location": "Avenue du Commerce, Gombe",
    "reference": "TF-12345-KIN",
    "coverage": 160,
    "document_url": "https://storage.example.com/docs/titre-foncier.pdf"
  }
}
```

**Corps de la requête (Caution bancaire)** :
```json
{
  "portfolioId": "TP-00001",
  "contractId": "CC-00001",
  "company": "Entreprise ABC",
  "type": "caution_bancaire",
  "value": 25000.00,
  "expiry_date": "2026-01-05T00:00:00.000Z",
  "details": {
    "provider": "Rawbank",
    "reference": "CB-2025-00123",
    "coverage": 50,
    "document_url": "https://storage.example.com/docs/caution.pdf"
  }
}
```

### Mettre à jour une garantie

**Endpoint** : `PUT /portfolios/traditional/guarantees/{id}`

**Corps de la requête** : Champs partiels de `Guarantee`

### Libérer une garantie (mainlevée)

**Endpoint** : `POST /portfolios/traditional/guarantees/{id}/release`

**Corps de la requête** :
```json
{
  "release_date": "2026-01-15T00:00:00.000Z",
  "reason": "Remboursement intégral du crédit"
}
```

### Saisir une garantie

**Endpoint** : `POST /portfolios/traditional/guarantees/{id}/seize`

**Corps de la requête** :
```json
{
  "seizure_date": "2025-06-15T00:00:00.000Z",
  "reason": "Défaut de paiement prolongé",
  "legal_reference": "Décision tribunal commerce KIN-2025-00456"
}
```

### Supprimer une garantie

**Endpoint** : `DELETE /portfolios/traditional/guarantees/{id}`

**Conditions** : Seules les garanties avec statut `pending` peuvent être supprimées.

## Codes d'erreur

| Code | Description |
|------|-------------|
| 400 | Données invalides |
| 404 | Garantie non trouvée |
| 409 | Conflit (ex: garantie déjà libérée) |
| 422 | Opération non autorisée selon le statut |

## Règles métier

1. **Couverture minimale** : Le total des garanties doit couvrir au moins 100% du montant du crédit
2. **Expiration** : Les garanties expirées doivent être renouvelées ou remplacées
3. **Libération** : Une garantie ne peut être libérée que si le crédit associé est soldé
4. **Saisie** : Nécessite une décision de justice ou une clause contractuelle
5. **Types acceptés par produit** : Vérifier les types de garanties acceptés selon le produit financier

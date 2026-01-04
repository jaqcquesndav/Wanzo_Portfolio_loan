# Gestion des Utilisateurs

Cette API permet de gérer les utilisateurs de la plateforme Wanzo Portfolio Institution, incluant l'authentification, les profils, les rôles et permissions, ainsi que la vérification d'identité.

## Entités et DTOs

### User (Entité principale)

```typescript
interface User {
  id: string;
  email: string;
  emailVerified?: boolean;
  name?: string;
  givenName?: string;
  familyName?: string;
  picture?: string;                      // URL de la photo de profil
  phone?: string;
  phoneVerified?: boolean;
  address?: string;
  
  // Vérification d'identité
  idNumber?: string;                     // Numéro de pièce d'identité
  idType?: IdType;
  idStatus?: IdStatus;
  
  // Rôle et type
  role?: UserRole;
  userType?: UserType;
  status?: UserStatus;
  
  // Relations avec entités
  companyId?: string;                    // Pour type 'sme'
  financialInstitutionId?: string;       // Pour type 'financial_institution'
  institutionId?: string;                // ID de l'institution associée
  isCompanyOwner?: boolean;
  
  // Informations personnelles
  birthdate?: string;                    // ISO 8601
  bio?: string;
  department?: string;
  
  // Paramètres
  settings?: UserSettings;
  language?: Language;
  permissions?: string[];
  
  // Abonnement
  plan?: string;
  tokenBalance?: number;
  tokenTotal?: number;
  
  createdAt: string;
  updatedAt?: string;
}
```

### Enums et Types

```typescript
// Types d'utilisateur (2 valeurs)
type UserType = 'sme' | 'financial_institution';

// Rôles utilisateur (7 valeurs - incluant legacy)
type UserRole = 
  | 'Admin'              // Administrateur
  | 'Portfolio_Manager'  // Gestionnaire de portefeuille
  | 'Auditor'            // Auditeur
  | 'User'               // Utilisateur standard
  // Legacy values
  | 'manager'            // Alias de Portfolio_Manager
  | 'analyst'            // Analyste (legacy)
  | 'viewer';            // Lecteur seul (legacy)

// Types de pièce d'identité (4 valeurs)
type IdType = 'passport' | 'national_id' | 'driver_license' | 'other';

// Statuts de vérification d'identité (3 valeurs)
type IdStatus = 'pending' | 'verified' | 'rejected';

// Statuts utilisateur (4 valeurs - incluant legacy)
type UserStatus = 
  | 'active'     // Actif
  | 'inactive'   // Inactif
  | 'suspended'  // Suspendu
  | 'pending';   // En attente d'activation (legacy)

// Langues supportées (2 valeurs)
type Language = 'fr' | 'en';
```

### Types imbriqués

```typescript
// Paramètres utilisateur
interface UserSettings {
  notifications?: {
    email?: boolean;          // Notifications par email
    sms?: boolean;            // Notifications par SMS
    app?: boolean;            // Notifications in-app
  };
  theme?: 'light' | 'dark' | 'system';
  dashboard?: {
    defaultView?: string;
    widgets?: string[];
  };
}

// Adresse
interface Address {
  street: string;
  city: string;
  state?: string;
  postalCode?: string;
  country: string;
}

// Personne de contact
interface ContactPerson {
  name: string;
  title: string;
  email: string;
  phone: string;
  department?: string;
}

// Permission
interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}

// Activité utilisateur
interface UserActivity {
  id: string;
  userId: string;
  userName: string;
  action: string;
  entity: string;
  entityId?: string;
  details?: string;
  ip?: string;
  userAgent?: string;
  timestamp: string;
}

// Réponse utilisateur avec institution (pour /users/me)
interface UserWithInstitutionResponse {
  user: User & {
    institutionId?: string;
    auth0Id?: string;
    firstName?: string;        // Alias de givenName
    lastName?: string;         // Alias de familyName
  };
  institution: InstitutionLite | null;
  auth0Id: string;
  role: UserRole;
  permissions: string[];
}

// Institution (version allégée)
interface InstitutionLite {
  id: string;
  name: string;
  type: string;
  status: string;
  country?: string;
  city?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  logo?: string;
  license_number?: string;
  license_type?: string;
  legal_representative?: string;
  tax_id?: string;
  regulatory_status?: string;
  kiotaId?: string;
  active?: boolean;
  subscriptionPlan?: string;
  subscriptionStatus?: string;
  subscriptionEndDate?: string;
  tokenBalance?: number;
  tokensUsed?: number;
  settings?: {
    currency?: string;
    timezone?: string;
  };
  documents?: DocumentLite[];
  metadata?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
}
```

## Points d'accès

### Utilisateur courant

**Endpoint** : `GET /portfolio/api/v1/users/me`

**Description** : Retourne l'utilisateur courant avec son institution associée. Optimisé pour le login et le dashboard (~5KB vs ~100KB+).

**Réponse réussie** (200 OK) :

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "USER-001",
      "email": "jean.dupont@exemple.com",
      "emailVerified": true,
      "name": "Jean Dupont",
      "givenName": "Jean",
      "familyName": "Dupont",
      "picture": "https://storage.example.com/profiles/user-001.jpg",
      "phone": "+243810123456",
      "phoneVerified": true,
      "role": "Portfolio_Manager",
      "userType": "financial_institution",
      "status": "active",
      "institutionId": "INST-001",
      "idNumber": "P123456789",
      "idType": "passport",
      "idStatus": "verified",
      "language": "fr",
      "permissions": ["portfolios.read", "portfolios.write", "credits.manage"],
      "settings": {
        "notifications": {
          "email": true,
          "sms": false,
          "app": true
        },
        "theme": "light"
      },
      "createdAt": "2025-01-15T08:00:00.000Z",
      "updatedAt": "2025-02-01T10:30:00.000Z"
    },
    "institution": {
      "id": "INST-001",
      "name": "Rawbank",
      "type": "bank",
      "status": "active",
      "country": "RDC",
      "city": "Kinshasa",
      "phone": "+243810000001",
      "email": "contact@rawbank.cd",
      "website": "https://www.rawbank.cd",
      "logo": "https://storage.example.com/logos/rawbank.png",
      "license_number": "LIC-BCC-2020-001",
      "license_type": "commercial_bank",
      "regulatory_status": "compliant",
      "subscriptionPlan": "enterprise",
      "subscriptionStatus": "active",
      "tokenBalance": 5000,
      "settings": {
        "currency": "USD",
        "timezone": "Africa/Kinshasa"
      }
    },
    "auth0Id": "auth0|abc123def456",
    "role": "Portfolio_Manager",
    "permissions": ["portfolios.read", "portfolios.write", "credits.manage"]
  }
}
```

### Liste des utilisateurs

**Endpoint** : `GET /portfolio/api/v1/users`

**Paramètres de requête** :
| Paramètre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `page` | number | Non | Numéro de page (défaut: 1) |
| `limit` | number | Non | Éléments par page (défaut: 10) |
| `role` | UserRole | Non | Filtrer par rôle |
| `status` | UserStatus | Non | Filtrer par statut |
| `userType` | UserType | Non | Filtrer par type |
| `department` | string | Non | Filtrer par département |
| `search` | string | Non | Recherche textuelle |
| `sortBy` | string | Non | Champ de tri |
| `sortOrder` | string | Non | Ordre (asc, desc) |

**Réponse réussie** (200 OK) :

```json
{
  "success": true,
  "data": [
    {
      "id": "USER-001",
      "email": "jean.dupont@exemple.com",
      "name": "Jean Dupont",
      "givenName": "Jean",
      "familyName": "Dupont",
      "picture": "https://storage.example.com/profiles/user-001.jpg",
      "phone": "+243810123456",
      "role": "Portfolio_Manager",
      "userType": "financial_institution",
      "status": "active",
      "department": "Crédit",
      "createdAt": "2025-01-15T08:00:00.000Z"
    }
  ],
  "meta": {
    "total": 25,
    "page": 1,
    "limit": 10,
    "totalPages": 3
  }
}
```

### Détails d'un utilisateur

**Endpoint** : `GET /portfolio/api/v1/users/{id}`

**Réponse réussie** (200 OK) : Retourne l'objet `User` complet avec ses relations.

### Créer un utilisateur

**Endpoint** : `POST /portfolio/api/v1/users`

**Corps de la requête** :

```json
{
  "email": "nouveau.utilisateur@exemple.com",
  "givenName": "Nouveau",
  "familyName": "Utilisateur",
  "phone": "+243810123456",
  "role": "User",
  "userType": "financial_institution",
  "institutionId": "INST-001",
  "department": "Crédit",
  "language": "fr"
}
```

**Réponse réussie** (201 Created) : Retourne l'objet `User` créé.

### Mettre à jour un utilisateur

**Endpoint** : `PUT /portfolio/api/v1/users/{id}`

**Corps de la requête** : Champs partiels de `User`

### Mettre à jour le profil

**Endpoint** : `PUT /portfolio/api/v1/users/me`

**Corps de la requête** :

```json
{
  "givenName": "Jean-Pierre",
  "phone": "+243810999999",
  "bio": "Gestionnaire de portefeuille expérimenté",
  "language": "en",
  "settings": {
    "notifications": {
      "email": true,
      "sms": true,
      "app": true
    },
    "theme": "dark"
  }
}
```

### Vérification d'identité

**Endpoint** : `POST /portfolio/api/v1/users/{id}/verify-identity`

**Corps de la requête** :

```json
{
  "idType": "passport",
  "idNumber": "P123456789",
  "idDocument": "https://storage.example.com/docs/passport-front.jpg",
  "idDocumentBack": "https://storage.example.com/docs/passport-back.jpg"
}
```

**Réponse réussie** (200 OK) :

```json
{
  "success": true,
  "data": {
    "id": "USER-001",
    "idType": "passport",
    "idNumber": "P123456789",
    "idStatus": "pending",
    "verificationSubmittedAt": "2025-02-01T10:00:00.000Z"
  }
}
```

### Approuver/Rejeter la vérification

**Endpoint** : `PUT /portfolio/api/v1/users/{id}/verify-identity`

**Corps de la requête (Approbation)** :

```json
{
  "action": "approve",
  "verifiedBy": "USER-ADMIN"
}
```

**Corps de la requête (Rejet)** :

```json
{
  "action": "reject",
  "rejectionReason": "Document illisible ou expiré",
  "verifiedBy": "USER-ADMIN"
}
```

### Changer le rôle

**Endpoint** : `PUT /portfolio/api/v1/users/{id}/role`

**Corps de la requête** :

```json
{
  "role": "Portfolio_Manager",
  "permissions": ["portfolios.read", "portfolios.write", "credits.manage"]
}
```

### Suspendre un utilisateur

**Endpoint** : `POST /portfolio/api/v1/users/{id}/suspend`

**Corps de la requête** :

```json
{
  "reason": "Violation des conditions d'utilisation",
  "suspendedBy": "USER-ADMIN"
}
```

### Réactiver un utilisateur

**Endpoint** : `POST /portfolio/api/v1/users/{id}/reactivate`

### Supprimer un utilisateur

**Endpoint** : `DELETE /portfolio/api/v1/users/{id}`

**Note** : Suppression logique, les données sont conservées pour audit.

### Historique d'activité

**Endpoint** : `GET /portfolio/api/v1/users/{id}/activity`

**Paramètres de requête** :
| Paramètre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `dateFrom` | string | Non | Date de début (ISO 8601) |
| `dateTo` | string | Non | Date de fin (ISO 8601) |
| `action` | string | Non | Filtrer par action |
| `page` | number | Non | Numéro de page |
| `limit` | number | Non | Éléments par page |

**Réponse réussie** (200 OK) :

```json
{
  "success": true,
  "data": [
    {
      "id": "ACT-001",
      "userId": "USER-001",
      "userName": "Jean Dupont",
      "action": "portfolio.credit.approve",
      "entity": "CreditRequest",
      "entityId": "CR-00001",
      "details": "Approbation du crédit pour Entreprise ABC",
      "ip": "192.168.1.100",
      "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      "timestamp": "2025-02-01T10:30:00.000Z"
    }
  ],
  "meta": {
    "total": 150,
    "page": 1,
    "limit": 10,
    "totalPages": 15
  }
}
```

### Permissions disponibles

**Endpoint** : `GET /portfolio/api/v1/permissions`

**Réponse réussie** (200 OK) :

```json
{
  "success": true,
  "data": [
    {
      "id": "PERM-001",
      "name": "portfolios.read",
      "description": "Consulter les portefeuilles",
      "category": "Portefeuilles"
    },
    {
      "id": "PERM-002",
      "name": "portfolios.write",
      "description": "Créer et modifier les portefeuilles",
      "category": "Portefeuilles"
    },
    {
      "id": "PERM-003",
      "name": "credits.manage",
      "description": "Gérer les demandes de crédit",
      "category": "Crédits"
    }
  ]
}
```

## Codes d'erreur

| Code | Description |
|------|-------------|
| 400 | Données invalides |
| 401 | Non authentifié |
| 403 | Permission refusée |
| 404 | Utilisateur non trouvé |
| 409 | Email déjà utilisé |
| 422 | Opération non autorisée |

## Règles métier

1. **Email unique** : Un email ne peut être associé qu'à un seul compte
2. **Vérification d'identité** :
   - Obligatoire pour les rôles Admin et Portfolio_Manager
   - Le document doit être valide et lisible
   - Expiration automatique après 5 ans
3. **Rôles et permissions** :
   - Admin : Tous les droits
   - Portfolio_Manager : Gestion des portefeuilles et crédits
   - Auditor : Consultation uniquement
   - User : Accès limité selon permissions assignées
4. **Suspension** :
   - Un utilisateur suspendu ne peut plus se connecter
   - Les données restent accessibles en lecture seule
5. **Mots de passe** : Gérés par Auth0, non stockés localement

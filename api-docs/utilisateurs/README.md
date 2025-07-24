# Gestion des utilisateurs

Ce document décrit les endpoints pour la gestion des utilisateurs dans l'API Wanzo Portfolio Institution.

## Types de données

Les types principaux utilisés dans les API d'utilisateurs sont les suivants:

```typescript
// Types de base pour les utilisateurs
interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  department: string;
  position: string;
  phone?: string;
  profileImageUrl?: string;
  status: 'active' | 'inactive' | 'pending';
  lastLogin?: string;
  created_at: string;
  updated_at: string;
}

// Détails complets d'un utilisateur
interface UserDetails extends User {
  permissions: string[];
  manager?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  directReports: Array<{
    id: string;
    firstName: string;
    lastName: string;
    position: string;
  }>;
  portfolioAssignments: Array<{
    id: string;
    name: string;
    type: 'traditional' | 'investment' | 'leasing';
  }>;
  activityLog: Array<{
    action: string;
    timestamp: string;
    details?: string;
  }>;
}

// Utilisateur actuellement connecté
interface CurrentUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  department: string;
  position: string;
  phone?: string;
  profileImageUrl?: string;
  permissions: string[];
  preferences: {
    theme: 'light' | 'dark' | 'system';
    language: string;
    notifications: {
      email: boolean;
      push: boolean;
      desktop: boolean;
    };
    dashboardLayout?: Record<string, unknown>;
  };
  lastLogin?: string;
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

// Rôle utilisateur
interface UserRole {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  isSystem: boolean;
  created_at: string;
  updated_at: string;
}

// Permission
interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}
```

## Liste des utilisateurs

Récupère la liste des utilisateurs avec pagination et filtrage.

**Endpoint** : `GET /users`

**Paramètres de requête** :
- `page` (optionnel) : Numéro de la page
- `limit` (optionnel) : Nombre d'utilisateurs par page
- `role` (optionnel) : Filtre par rôle (ex: admin, manager, analyst)
- `status` (optionnel) : Filtre par statut (active, inactive, pending)
- `department` (optionnel) : Filtre par département
- `search` (optionnel) : Recherche textuelle (nom, prénom, email)

**Réponse** :

```json
{
  "data": [
    {
      "id": "user123",
      "firstName": "Jean",
      "lastName": "Dupont",
      "email": "jean.dupont@exemple.com",
      "role": "manager",
      "department": "credit",
      "position": "Responsable crédit",
      "status": "active",
      "lastLogin": "2025-07-20T10:30:00.000Z",
      "created_at": "2025-01-15T08:00:00.000Z",
      "updated_at": "2025-07-20T10:30:00.000Z"
    },
    // ... autres utilisateurs
  ],
  "meta": {
    "total": 45,
    "page": 1,
    "limit": 10,
    "totalPages": 5
  }
}
```

## Détails d'un utilisateur

Récupère les détails complets d'un utilisateur spécifique.

**Endpoint** : `GET /users/{id}`

**Paramètres de chemin** :
- `id` : Identifiant unique de l'utilisateur

**Réponse** :

```json
{
  "id": "user123",
  "firstName": "Jean",
  "lastName": "Dupont",
  "email": "jean.dupont@exemple.com",
  "role": "manager",
  "department": "credit",
  "position": "Responsable crédit",
  "phone": "+243810123456",
  "profileImageUrl": "https://example.com/profiles/jean.jpg",
  "status": "active",
  "permissions": ["read:users", "write:portfolios", "read:reports"],
  "manager": {
    "id": "user456",
    "firstName": "Marie",
    "lastName": "Martin",
    "email": "marie.martin@exemple.com"
  },
  "directReports": [
    {
      "id": "user789",
      "firstName": "Paul",
      "lastName": "Petit",
      "position": "Analyste crédit"
    }
  ],
  "portfolioAssignments": [
    {
      "id": "portfolio123",
      "name": "Portefeuille PME",
      "type": "traditional"
    }
  ],
  "activityLog": [
    {
      "action": "login",
      "timestamp": "2025-07-23T09:15:00.000Z",
      "details": "Connexion depuis 192.168.1.100"
    }
  ],
  "created_at": "2025-01-15T08:00:00.000Z",
  "updated_at": "2025-07-20T10:30:00.000Z"
}
```

## Création d'un utilisateur

Crée un nouvel utilisateur dans le système.

**Endpoint** : `POST /users`

**Corps de la requête** :

```json
{
  "firstName": "Thomas",
  "lastName": "Dubois",
  "email": "thomas.dubois@exemple.com",
  "role": "analyst",
  "department": "risk",
  "position": "Analyste de risque",
  "phone": "+243810789012",
  "managerId": "user123",
  "status": "active",
  "permissions": ["read:portfolios", "read:reports", "write:risk"],
  "sendInvitation": true
}
```

**Réponse** :

```json
{
  "id": "user456",
  "firstName": "Thomas",
  "lastName": "Dubois",
  "email": "thomas.dubois@exemple.com",
  "role": "analyst",
  "department": "risk",
  "position": "Analyste de risque",
  "phone": "+243810789012",
  "status": "active",
  "invitationSent": true,
  "created_at": "2025-07-24T15:30:00.000Z",
  "updated_at": "2025-07-24T15:30:00.000Z"
}
```

## Mise à jour d'un utilisateur

Met à jour les informations d'un utilisateur existant.

**Endpoint** : `PUT /users/{id}`

**Paramètres de chemin** :
- `id` : Identifiant unique de l'utilisateur

**Corps de la requête** :

```json
{
  "department": "compliance",
  "position": "Responsable conformité",
  "status": "active",
  "permissions": ["read:portfolios", "read:reports", "write:compliance"]
}
```

**Réponse** :

```json
{
  "id": "user456",
  "firstName": "Thomas",
  "lastName": "Dubois",
  "email": "thomas.dubois@exemple.com",
  "role": "analyst",
  "department": "compliance",
  "position": "Responsable conformité",
  "phone": "+243810789012",
  "status": "active",
  "created_at": "2025-07-24T15:30:00.000Z",
  "updated_at": "2025-07-24T16:45:00.000Z"
}
```

## Suppression d'un utilisateur

Supprime un utilisateur du système.

**Endpoint** : `DELETE /users/{id}`

**Paramètres de chemin** :
- `id` : Identifiant unique de l'utilisateur

**Réponse** : 204 No Content

## Réinitialisation du mot de passe

Réinitialise le mot de passe d'un utilisateur et envoie un email avec les instructions.

**Endpoint** : `POST /users/{id}/reset-password`

**Paramètres de chemin** :
- `id` : Identifiant unique de l'utilisateur

**Réponse** :

```json
{
  "success": true,
  "message": "Instructions de réinitialisation envoyées par email"
}
```

## Assignation de portefeuille

Assigne un portefeuille à un utilisateur avec un rôle spécifique.

**Endpoint** : `POST /users/{userId}/portfolios`

**Paramètres de chemin** :
- `userId` : Identifiant unique de l'utilisateur

**Corps de la requête** :

```json
{
  "portfolioId": "portfolio123",
  "role": "manager"
}
```

**Réponse** :

```json
{
  "userId": "user456",
  "portfolioId": "portfolio123",
  "role": "manager",
  "assigned_at": "2025-07-24T17:00:00.000Z"
}
```

## Suppression d'assignation de portefeuille

Supprime l'assignation d'un portefeuille à un utilisateur.

**Endpoint** : `DELETE /users/{userId}/portfolios/{portfolioId}`

**Paramètres de chemin** :
- `userId` : Identifiant unique de l'utilisateur
- `portfolioId` : Identifiant unique du portefeuille

**Réponse** : 204 No Content

## Utilisateur courant

Récupère les informations sur l'utilisateur actuellement authentifié.

**Endpoint** : `GET /users/me`

**Réponse** :

```json
{
  "id": "user123",
  "firstName": "Jean",
  "lastName": "Dupont",
  "email": "jean.dupont@exemple.com",
  "role": "manager",
  "department": "credit",
  "position": "Responsable crédit",
  "phone": "+243810123456",
  "profileImageUrl": "https://example.com/profiles/jean.jpg",
  "permissions": ["read:users", "write:portfolios", "read:reports"],
  "preferences": {
    "theme": "dark",
    "language": "fr",
    "notifications": {
      "email": true,
      "push": true,
      "desktop": false
    },
    "dashboardLayout": {
      "widgets": ["performance", "risk", "payments"]
    }
  },
  "lastLogin": "2025-07-24T09:00:00.000Z"
}
```

## Mise à jour des préférences utilisateur

Met à jour les préférences de l'utilisateur actuellement authentifié.

**Endpoint** : `PUT /users/me/preferences`

**Corps de la requête** :

```json
{
  "theme": "light",
  "notifications": {
    "desktop": true
  },
  "dashboardLayout": {
    "widgets": ["performance", "risk", "payments", "alerts"]
  }
}
```

**Réponse** :

```json
{
  "id": "user123",
  "preferences": {
    "theme": "light",
    "language": "fr",
    "notifications": {
      "email": true,
      "push": true,
      "desktop": true
    },
    "dashboardLayout": {
      "widgets": ["performance", "risk", "payments", "alerts"]
    }
  },
  "updated_at": "2025-07-24T10:15:00.000Z"
}
```

## Rôles utilisateur

Récupère la liste des rôles disponibles dans le système.

**Endpoint** : `GET /users/roles`

**Réponse** :

```json
[
  {
    "id": "role1",
    "name": "admin",
    "description": "Administrateur système avec tous les droits",
    "permissions": ["*"],
    "isSystem": true,
    "created_at": "2025-01-01T00:00:00.000Z",
    "updated_at": "2025-01-01T00:00:00.000Z"
  },
  {
    "id": "role2",
    "name": "manager",
    "description": "Gestionnaire de portefeuilles",
    "permissions": ["read:users", "write:portfolios", "read:reports", "write:reports"],
    "isSystem": true,
    "created_at": "2025-01-01T00:00:00.000Z",
    "updated_at": "2025-01-01T00:00:00.000Z"
  }
]
```

## Permissions

Récupère la liste des permissions disponibles dans le système.

**Endpoint** : `GET /users/permissions`

**Réponse** :

```json
[
  {
    "id": "perm1",
    "name": "read:users",
    "description": "Voir les utilisateurs",
    "category": "users"
  },
  {
    "id": "perm2",
    "name": "write:portfolios",
    "description": "Créer et modifier des portefeuilles",
    "category": "portfolios"
  }
]
```

## Activité utilisateur

Récupère les logs d'activité des utilisateurs avec filtrage.

**Endpoint** : `GET /users/activity`

**Paramètres de requête** :
- `userId` (optionnel) : Filtre par utilisateur
- `action` (optionnel) : Filtre par type d'action
- `startDate` (optionnel) : Date de début (format ISO)
- `endDate` (optionnel) : Date de fin (format ISO)
- `page` (optionnel) : Numéro de la page
- `limit` (optionnel) : Nombre d'entrées par page

**Réponse** :

```json
{
  "data": [
    {
      "id": "act1",
      "userId": "user123",
      "userName": "Jean Dupont",
      "action": "login",
      "entity": "auth",
      "details": "Connexion réussie",
      "ip": "192.168.1.100",
      "userAgent": "Mozilla/5.0...",
      "timestamp": "2025-07-24T09:00:00.000Z"
    },
    {
      "id": "act2",
      "userId": "user123",
      "userName": "Jean Dupont",
      "action": "view",
      "entity": "portfolio",
      "entityId": "portfolio123",
      "details": "Consultation du portefeuille PME",
      "ip": "192.168.1.100",
      "userAgent": "Mozilla/5.0...",
      "timestamp": "2025-07-24T09:05:00.000Z"
    }
  ],
  "meta": {
    "total": 145,
    "page": 1,
    "limit": 10,
    "totalPages": 15
  }
}
```
      }
    ],
    "lastLogin": "2025-07-23T09:15:00.000Z",
    "created_at": "2025-01-15T08:00:00.000Z",
    "updated_at": "2025-07-20T10:30:00.000Z"
  }
}
```

## Création d'un utilisateur

Crée un nouvel utilisateur dans le système.

**Endpoint** : `POST /portfolio_inst/users`

**Corps de la requête** :

```json
{
  "firstName": "Pierre",
  "lastName": "Durand",
  "email": "pierre.durand@exemple.com",
  "role": "analyst",
  "department": "risk",
  "position": "Analyste risque",
  "phone": "+243810987654",
  "profileImageUrl": "https://example.com/profiles/pierre.jpg",
  "managerId": "user123",
  "status": "active",
  "permissions": ["read:portfolios", "read:reports"],
  "sendInvitation": true
}
```

**Réponse réussie** (201 Created) :

```json
{
  "success": true,
  "data": {
    "id": "user789",
    "firstName": "Pierre",
    "lastName": "Durand",
    "email": "pierre.durand@exemple.com",
    "role": "analyst",
    "department": "risk",
    "position": "Analyste risque",
    "phone": "+243810987654",
    "profileImageUrl": "https://example.com/profiles/pierre.jpg",
    "status": "active",
    "invitationSent": true,
    "created_at": "2025-07-24T15:30:00.000Z",
    "updated_at": "2025-07-24T15:30:00.000Z"
  }
}
```

## Mise à jour d'un utilisateur

Met à jour les informations d'un utilisateur existant.

**Endpoint** : `PUT /portfolio_inst/users/{id}`

**Paramètres de chemin** :
- `id` : Identifiant unique de l'utilisateur

**Corps de la requête** :

```json
{
  "firstName": "Pierre",
  "lastName": "Durand-Martin",
  "email": "pierre.durand@exemple.com",
  "role": "manager",
  "department": "risk",
  "position": "Responsable risque",
  "phone": "+243810987654",
  "profileImageUrl": "https://example.com/profiles/pierre_new.jpg",
  "managerId": "user456",
  "status": "active",
  "permissions": ["read:portfolios", "write:portfolios", "read:reports", "write:reports"]
}
```

**Réponse réussie** (200 OK) :

```json
{
  "success": true,
  "data": {
    "id": "user789",
    "firstName": "Pierre",
    "lastName": "Durand-Martin",
    "email": "pierre.durand@exemple.com",
    "role": "manager",
    "department": "risk",
    "position": "Responsable risque",
    "phone": "+243810987654",
    "profileImageUrl": "https://example.com/profiles/pierre_new.jpg",
    "status": "active",
    "updated_at": "2025-07-24T16:15:00.000Z"
  }
}
```

## Suppression d'un utilisateur

Supprime un utilisateur du système.

**Endpoint** : `DELETE /portfolio_inst/users/{id}`

**Paramètres de chemin** :
- `id` : Identifiant unique de l'utilisateur

**Réponse réussie** (200 OK) :

```json
{
  "success": true,
  "data": {
    "message": "Utilisateur supprimé avec succès"
  }
}
```

## Réinitialisation du mot de passe

Envoie un email de réinitialisation de mot de passe à l'utilisateur.

**Endpoint** : `POST /portfolio_inst/users/{id}/reset-password`

**Paramètres de chemin** :
- `id` : Identifiant unique de l'utilisateur

**Réponse réussie** (200 OK) :

```json
{
  "success": true,
  "data": {
    "message": "Email de réinitialisation envoyé avec succès"
  }
}
```

## Attribution de portefeuille

Assigne un portefeuille à un utilisateur avec un rôle spécifique.

**Endpoint** : `POST /portfolio_inst/users/{userId}/portfolios`

**Paramètres de chemin** :
- `userId` : Identifiant unique de l'utilisateur

**Corps de la requête** :

```json
{
  "portfolioId": "portfolio123",
  "role": "manager"
}
```

**Réponse réussie** (201 Created) :

```json
{
  "success": true,
  "data": {
    "userId": "user789",
    "portfolioId": "portfolio123",
    "role": "manager",
    "assigned_at": "2025-07-24T16:30:00.000Z"
  }
}
```

## Suppression d'attribution de portefeuille

Supprime l'attribution d'un portefeuille à un utilisateur.

**Endpoint** : `DELETE /portfolio_inst/users/{userId}/portfolios/{portfolioId}`

**Paramètres de chemin** :
- `userId` : Identifiant unique de l'utilisateur
- `portfolioId` : Identifiant unique du portefeuille

**Réponse réussie** (200 OK) :

```json
{
  "success": true,
  "data": {
    "message": "Attribution supprimée avec succès"
  }
}
```

## Profil utilisateur courant

Récupère les informations du profil de l'utilisateur connecté.

**Endpoint** : `GET /portfolio_inst/users/me`

**Réponse réussie** (200 OK) :

```json
{
  "success": true,
  "data": {
    "id": "user123",
    "firstName": "Jean",
    "lastName": "Dupont",
    "email": "jean.dupont@exemple.com",
    "role": "manager",
    "department": "credit",
    "position": "Responsable crédit",
    "phone": "+243810123456",
    "profileImageUrl": "https://example.com/profiles/jean.jpg",
    "permissions": ["read:users", "write:portfolios", "read:reports"],
    "preferences": {
      "theme": "dark",
      "language": "fr",
      "notifications": {
        "email": true,
        "push": true,
        "desktop": false
      },
      "dashboardLayout": {
        "widgets": ["recentActivity", "portfolioSummary", "riskAlerts"]
      }
    },
    "lastLogin": "2025-07-23T09:15:00.000Z"
  }
}
```

## Mise à jour des préférences utilisateur

Met à jour les préférences de l'utilisateur connecté.

**Endpoint** : `PUT /portfolio_inst/users/me/preferences`

**Corps de la requête** :

```json
{
  "theme": "light",
  "language": "fr",
  "notifications": {
    "email": true,
    "push": false,
    "desktop": true
  },
  "dashboardLayout": {
    "widgets": ["portfolioSummary", "calendar", "messages"]
  }
}
```

**Réponse réussie** (200 OK) :

```json
{
  "success": true,
  "data": {
    "id": "user123",
    "preferences": {
      "theme": "light",
      "language": "fr",
      "notifications": {
        "email": true,
        "push": false,
        "desktop": true
      },
      "dashboardLayout": {
        "widgets": ["portfolioSummary", "calendar", "messages"]
      }
    },
    "updated_at": "2025-07-24T16:45:00.000Z"
  }
}
```

## Liste des rôles

Récupère la liste des rôles disponibles dans le système.

**Endpoint** : `GET /portfolio_inst/users/roles`

**Réponse réussie** (200 OK) :

```json
{
  "success": true,
  "data": [
    {
      "id": "role123",
      "name": "admin",
      "description": "Administrateur système",
      "permissions": ["*"],
      "isSystem": true,
      "created_at": "2025-01-01T00:00:00.000Z",
      "updated_at": "2025-01-01T00:00:00.000Z"
    },
    {
      "id": "role456",
      "name": "manager",
      "description": "Gestionnaire de portefeuille",
      "permissions": ["read:users", "read:portfolios", "write:portfolios", "read:reports"],
      "isSystem": true,
      "created_at": "2025-01-01T00:00:00.000Z",
      "updated_at": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

## Liste des permissions

Récupère la liste des permissions disponibles dans le système.

**Endpoint** : `GET /portfolio_inst/users/permissions`

**Réponse réussie** (200 OK) :

```json
{
  "success": true,
  "data": [
    {
      "id": "perm123",
      "name": "read:users",
      "description": "Voir les utilisateurs",
      "category": "users"
    },
    {
      "id": "perm456",
      "name": "write:users",
      "description": "Créer/modifier les utilisateurs",
      "category": "users"
    }
  ]
}
```

## Activité des utilisateurs

Récupère l'historique des activités des utilisateurs avec pagination et filtrage.

**Endpoint** : `GET /portfolio_inst/users/activity`

**Paramètres de requête** :
- `page` (optionnel) : Numéro de la page (défaut : 1)
- `limit` (optionnel) : Nombre d'activités par page (défaut : 10, max : 100)
- `userId` (optionnel) : Filtre par identifiant d'utilisateur
- `action` (optionnel) : Filtre par type d'action (login, logout, create, update, delete)
- `startDate` (optionnel) : Filtre par date de début (format ISO)
- `endDate` (optionnel) : Filtre par date de fin (format ISO)

**Réponse réussie** (200 OK) :

```json
{
  "success": true,
  "data": [
    {
      "id": "act123",
      "userId": "user123",
      "userName": "Jean Dupont",
      "action": "login",
      "entity": "auth",
      "details": "Connexion depuis 192.168.1.100",
      "ip": "192.168.1.100",
      "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "timestamp": "2025-07-24T09:00:00.000Z"
    },
    {
      "id": "act456",
      "userId": "user123",
      "userName": "Jean Dupont",
      "action": "create",
      "entity": "portfolio",
      "entityId": "portfolio789",
      "details": "Création d'un nouveau portefeuille 'PME 2025'",
      "ip": "192.168.1.100",
      "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "timestamp": "2025-07-24T10:15:00.000Z"
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

## Erreurs spécifiques

| Code HTTP | Code d'erreur         | Description                                  |
|-----------|------------------------|----------------------------------------------|
| 400       | INVALID_USER_DATA      | Données utilisateur invalides                |
| 404       | USER_NOT_FOUND         | Utilisateur non trouvé                       |
| 409       | EMAIL_ALREADY_EXISTS   | Email déjà utilisé par un autre utilisateur  |
| 403       | INSUFFICIENT_PERMISSIONS | Permissions insuffisantes                    |

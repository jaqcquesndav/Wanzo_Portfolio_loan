# Authentification

Ce document décrit le système d'authentification utilisé par l'API Wanzo Portfolio Institution, qui est basé sur Auth0.

## Vue d'ensemble de l'authentification

L'API Wanzo Portfolio Institution utilise Auth0 comme fournisseur d'identité principal. Ce service gère l'authentification des utilisateurs et la génération de tokens JWT (JSON Web Tokens) qui sont ensuite utilisés pour sécuriser les requêtes API.

### Flux d'authentification complet

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                           FLUX D'AUTHENTIFICATION WANZO                                  │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                          │
│  1. FRONTEND                    2. AUTH0                    3. BACKEND                   │
│  ─────────────────────────────────────────────────────────────────────────────────────   │
│                                                                                          │
│  ┌──────────────────┐                                                                    │
│  │ User clicks      │                                                                    │
│  │ "Login Auth0"    │────────────────┐                                                   │
│  └──────────────────┘                │                                                   │
│                                      ▼                                                   │
│                            ┌──────────────────┐                                          │
│                            │ Auth0 Login Page │                                          │
│                            │ (email/password) │                                          │
│                            └────────┬─────────┘                                          │
│                                     │                                                    │
│                                     ▼                                                    │
│                            ┌──────────────────┐                                          │
│                            │ Auth0 génère     │                                          │
│                            │ access_token JWT │                                          │
│                            └────────┬─────────┘                                          │
│                                     │                                                    │
│  ┌──────────────────┐               │                                                    │
│  │ AuthCallback.tsx │◄──────────────┘                                                    │
│  │ reçoit le token  │                                                                    │
│  └────────┬─────────┘                                                                    │
│           │                                                                              │
│           │ GET /users/me (avec Bearer token)                                            │
│           └─────────────────────────────────────────────────►┌──────────────────────┐    │
│                                                              │ Backend identifie    │    │
│                                                              │ l'utilisateur via    │    │
│                                                              │ le token JWT         │    │
│                                                              └──────────┬───────────┘    │
│                                                                         │                │
│                                                                         ▼                │
│                                                              ┌──────────────────────┐    │
│                                                              │ Retourne:            │    │
│                                                              │ - user (id, email)   │    │
│                                                              │ - institution (id)   │    │
│                                                              │ - role, permissions  │    │
│                                                              └──────────┬───────────┘    │
│  ┌──────────────────┐                                                   │                │
│  │ AppContextStore  │◄──────────────────────────────────────────────────┘                │
│  │ stocke:          │                                                                    │
│  │ - institutionId  │                                                                    │
│  │ - user           │                                                                    │
│  │ - permissions    │                                                                    │
│  └────────┬─────────┘                                                                    │
│           │                                                                              │
│           ▼                                                                              │
│  ┌──────────────────┐                                                                    │
│  │ Navigation vers  │                                                                    │
│  │ /app/traditional │                                                                    │
│  └──────────────────┘                                                                    │
│                                                                                          │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

### Étapes détaillées

1. L'utilisateur accède à la page d'accueil de l'application (`PortfolioTypeSelector`)
2. L'utilisateur clique sur "Continuer avec Auth0"
3. Le système génère un code PKCE (Proof Key for Code Exchange) et redirige vers la page de connexion Auth0
4. L'utilisateur s'authentifie via l'interface Auth0
5. Auth0 redirige l'utilisateur vers `/auth/callback` avec un code d'autorisation
6. L'application échange ce code et le code_verifier PKCE contre des tokens d'accès
7. **CRITIQUE**: L'application appelle `GET /users/me` avec le token JWT pour récupérer:
   - Les données de l'utilisateur (id, name, email, role)
   - L'ID de l'institution associée à cet utilisateur
   - Les permissions de l'utilisateur
8. Le contexte global (`AppContextStore`) est mis à jour avec ces données
9. L'utilisateur est redirigé vers le tableau de bord principal

### ⚠️ Point important : L'institution vient du backend

**L'`institutionId` est toujours fourni par le backend**, jamais par Auth0 directement. Auth0 gère uniquement l'authentification (qui est l'utilisateur), tandis que le backend gère l'autorisation (à quelle institution appartient l'utilisateur).

```javascript
// AuthCallback.tsx - Après l'obtention du token Auth0
const meResponse = await userApi.getCurrentUserWithInstitution();
const { user, institution, auth0Id, role, permissions } = meResponse;

// L'institutionId provient de la réponse du backend
setGlobalContext({
  user: { ...user, role, permissions },
  institution,  // Fourni par le backend
  auth0Id,
  permissions
});
```

## Interface de connexion

### Page PortfolioTypeSelector (`/`)

L'application affiche une page de connexion unique avec le style Auth0 standardisé:

**Composant**: `src/pages/PortfolioTypeSelector.tsx`

**Éléments visuels**:
- Titre: "Wanzo Portfolio"
- Sous-titre: "Accès à votre espace de gestion"
- Section principale:
  - Titre: "Connexion"
  - Description: "Connectez-vous pour accéder à votre tableau de bord."
- Bouton avec logo Auth0: "Continuer avec Auth0"
- Liens: Conditions d'utilisation et politique de confidentialité

**Comportement**:
- Au clic sur "Continuer avec Auth0", le système:
  1. Définit le type de portefeuille sur 'traditional'
  2. Stocke ce choix dans localStorage
  3. Génère les codes PKCE (code_verifier et code_challenge)
  4. Redirige vers Auth0 pour l'authentification

## Intégration avec Auth0

### Configuration côté client

Le client doit être configuré pour utiliser Auth0 avec les paramètres suivants:

- **Domain**: Domaine Auth0 de l'application
- **Client ID**: Identifiant client Auth0
- **Audience**: Audience API définie dans Auth0
- **Redirect URI**: URI de redirection après authentification
- **Scope**: Étendue des permissions demandées (généralement "openid profile email")

### Flux d'authentification PKCE

L'application utilise le flux PKCE (Proof Key for Code Exchange) pour une sécurité renforcée:

1. Génération d'un `code_verifier` aléatoire et calcul du `code_challenge` correspondant
2. Redirection vers la page d'autorisation Auth0 avec le `code_challenge`
3. Réception du code d'autorisation après connexion réussie
4. Échange du code et du `code_verifier` contre des tokens d'accès et d'identification

## Gestion des tokens

### Types de tokens

L'authentification Auth0 fournit plusieurs tokens:

- **Access Token**: Token JWT utilisé pour accéder aux API protégées
- **ID Token**: Token JWT contenant des informations sur l'utilisateur
- **Refresh Token**: Token permettant d'obtenir de nouveaux tokens sans nouvelle authentification

### Structure du token JWT

Les tokens JWT générés par Auth0 contiennent généralement les informations suivantes dans leur payload:

```json
{
  "iss": "https://votre-domaine.auth0.com/",
  "sub": "auth0|user123",
  "aud": ["api-audience", "https://votre-domaine.auth0.com/userinfo"],
  "iat": 1627048800,
  "exp": 1627052400,
  "azp": "client-id",
  "scope": "openid profile email"
}
```

Les tokens ID contiennent également des informations utilisateur comme le nom, l'email, etc.

## Endpoints d'API pour l'authentification

### Vérification du token

Vérifie si le token d'accès est valide et renvoie les informations de l'utilisateur.

**Endpoint** : `GET /api/auth/verify-token`

**En-tête d'autorisation** : `Bearer {token}`

**Réponse réussie** (200 OK) :

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "auth0|user123",
      "name": "Jean Dupont",
      "email": "jean.dupont@exemple.com",
      "role": "Portfolio_Manager",
      "permissions": ["read:users", "write:portfolios", "read:reports"]
    },
    "token": {
      "expiresAt": "2025-07-24T22:30:00.000Z",
      "issuedAt": "2025-07-24T21:30:00.000Z"
    }
  }
}
```

### Rafraîchissement du token

Obtient un nouveau token d'accès en utilisant le refresh token.

**Endpoint** : `POST /api/auth/refresh`

**Corps de la requête** :

```json
{
  "refresh_token": "V6.eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Réponse réussie** (200 OK) :

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "id_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "V6.eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 86400,
  "token_type": "Bearer"
}
```

### Déconnexion

Déconnecte l'utilisateur en invalidant la session côté client et Auth0.

**Endpoint** : `GET /api/auth/logout`

**Paramètres de requête** :
- `returnTo` (optionnel) : URL de redirection après déconnexion

**Comportement** : Redirection vers l'URL de déconnexion Auth0 puis vers l'URL de retour spécifiée

## Création et gestion des utilisateurs

Les utilisateurs créés localement dans l'application sont synchronisés avec Auth0 via le backend. Cela permet de maintenir une source unique de vérité pour les informations utilisateur.

### Création d'un utilisateur

**Endpoint** : `POST /api/users`

**Corps de la requête** :

```json
{
  "email": "nouveau.utilisateur@exemple.com",
  "firstName": "Nouveau",
  "lastName": "Utilisateur",
  "role": "User",
  "department": "Finance",
  "position": "Analyste",
  "phone": "+243810123456",
  "sendInvitation": true
}
```

**Comportement** :
1. Création de l'utilisateur dans la base de données locale
2. Création de l'utilisateur dans Auth0 via l'API Management
3. Envoi d'une invitation par email avec un lien de définition de mot de passe

## Sécurité et recommandations

1. Utiliser le flux PKCE plutôt que le flux implicite pour plus de sécurité
2. Stocker les tokens de manière sécurisée (localStorage n'est pas recommandé pour les applications à haut risque)
3. Implémenter un mécanisme d'expiration automatique des sessions
4. Utiliser HTTPS pour toutes les communications
5. Configurer des règles Auth0 pour renforcer la sécurité (MFA, restrictions d'adresses IP, etc.)

## Gestion des erreurs

| Code HTTP | Description                                   | Solution                                        |
|-----------|-----------------------------------------------|------------------------------------------------|
| 401       | Token expiré ou invalide                      | Rafraîchir le token ou se reconnecter           |
| 403       | Permissions insuffisantes                     | Vérifier les rôles et permissions de l'utilisateur |
| 429       | Trop de requêtes                              | Implémenter une stratégie de backoff exponentiel |

## Authentification à deux facteurs (2FA)

L'authentification à deux facteurs est prise en charge via Auth0. Pour les applications à haute sécurité, elle peut être configurée comme obligatoire dans les règles Auth0.

### Activation du 2FA

L'activation se fait directement via l'interface Auth0 ou via les règles Auth0 configurées par l'administrateur.

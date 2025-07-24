# Authentification

Ce document décrit les endpoints d'authentification pour l'API Wanzo Portfolio Institution.

## Vue d'ensemble de l'authentification

L'API Wanzo Portfolio Institution utilise un système d'authentification basé sur JWT (JSON Web Tokens) pour sécuriser les requêtes. Tous les endpoints protégés nécessitent un token d'accès valide.

### Flux d'authentification

1. L'utilisateur s'authentifie via l'endpoint `/portfolio_inst/auth/login`
2. Le système vérifie les identifiants et génère un token d'accès JWT
3. Ce token doit être inclus dans l'en-tête `Authorization` de chaque requête ultérieure sous la forme `Bearer {token}`
4. Un token de rafraîchissement est également fourni pour obtenir un nouveau token d'accès sans avoir à se reconnecter
## Connexion utilisateur

Authentifie un utilisateur et génère les tokens d'accès et de rafraîchissement.

**Endpoint** : `POST /portfolio_inst/auth/login`

**Corps de la requête** :

```json
{
  "email": "jean.dupont@exemple.com",
  "password": "motdepasse123",
  "rememberMe": true
}
```

**Réponse réussie** (200 OK) :

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user123",
      "firstName": "Jean",
      "lastName": "Dupont",
      "email": "jean.dupont@exemple.com",
      "role": "manager",
      "permissions": ["read:users", "write:portfolios", "read:reports"]
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expiresIn": 3600,
      "tokenType": "Bearer"
    }
  }
}
```

## Rafraîchissement du token

Obtient un nouveau token d'accès en utilisant le token de rafraîchissement.

**Endpoint** : `POST /portfolio_inst/auth/refresh-token`

**Corps de la requête** :

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Réponse réussie** (200 OK) :

```json
{
  "success": true,
  "data": {
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expiresIn": 3600,
      "tokenType": "Bearer"
    }
  }
}
```

## Déconnexion

Révoque le token de rafraîchissement et invalide la session en cours.

**Endpoint** : `POST /portfolio_inst/auth/logout`

**En-tête d'autorisation** : `Bearer {token}`

**Réponse réussie** (200 OK) :

```json
{
  "success": true,
  "data": {
    "message": "Déconnexion réussie"
  }
}
```

## Mot de passe oublié

Envoie un email avec un lien de réinitialisation du mot de passe.

**Endpoint** : `POST /portfolio_inst/auth/forgot-password`

**Corps de la requête** :

```json
{
  "email": "jean.dupont@exemple.com"
}
```

**Réponse réussie** (200 OK) :

```json
{
  "success": true,
  "data": {
    "message": "Si cette adresse email est associée à un compte, un email de réinitialisation a été envoyé"
  }
}
```

## Réinitialisation du mot de passe

Réinitialise le mot de passe en utilisant le token envoyé par email.

**Endpoint** : `POST /portfolio_inst/auth/reset-password`

**Corps de la requête** :

```json
{
  "token": "reset_token_123456",
  "newPassword": "nouveaumotdepasse123",
  "confirmPassword": "nouveaumotdepasse123"
}
```

**Réponse réussie** (200 OK) :

```json
{
  "success": true,
  "data": {
    "message": "Mot de passe réinitialisé avec succès"
  }
}
```

## Changement de mot de passe

Change le mot de passe de l'utilisateur connecté.

**Endpoint** : `POST /portfolio_inst/auth/change-password`

**En-tête d'autorisation** : `Bearer {token}`

**Corps de la requête** :

```json
{
  "currentPassword": "motdepasse123",
  "newPassword": "nouveaumotdepasse123",
  "confirmPassword": "nouveaumotdepasse123"
}
```

**Réponse réussie** (200 OK) :

```json
{
  "success": true,
  "data": {
    "message": "Mot de passe changé avec succès"
  }
}
```

## Vérification du token

Vérifie si le token d'accès est valide et renvoie les informations de l'utilisateur.

**Endpoint** : `GET /portfolio_inst/auth/verify-token`

**En-tête d'autorisation** : `Bearer {token}`

**Réponse réussie** (200 OK) :

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user123",
      "firstName": "Jean",
      "lastName": "Dupont",
      "email": "jean.dupont@exemple.com",
      "role": "manager",
      "permissions": ["read:users", "write:portfolios", "read:reports"]
    },
    "token": {
      "expiresAt": "2025-07-24T22:30:00.000Z",
      "issuedAt": "2025-07-24T21:30:00.000Z"
    }
  }
}
```

## Authentification avec OAuth 2.0

Authentifie un utilisateur via un fournisseur OAuth 2.0 (Google, Microsoft, etc.).

**Endpoint** : `GET /portfolio_inst/auth/oauth/{provider}`

**Paramètres de chemin** :
- `provider` : Nom du fournisseur OAuth (google, microsoft, facebook)

**Paramètres de requête** :
- `redirect_uri` (obligatoire) : URI de redirection après authentification

**Réponse** : Redirection vers la page d'authentification du fournisseur

## Callback OAuth 2.0

Point de retour après authentification réussie via un fournisseur OAuth 2.0.

**Endpoint** : `GET /portfolio_inst/auth/oauth/{provider}/callback`

**Paramètres de chemin** :
- `provider` : Nom du fournisseur OAuth (google, microsoft, facebook)

**Paramètres de requête** (fournis par le fournisseur OAuth) :
- `code` : Code d'autorisation
- `state` : État de la requête pour la vérification CSRF

**Réponse** : Redirection vers l'application avec le token en paramètre

## Structure du token JWT

Les tokens JWT générés par l'API contiennent les informations suivantes dans leur payload :

```json
{
  "sub": "user123",
  "name": "Jean Dupont",
  "email": "jean.dupont@exemple.com",
  "role": "manager",
  "permissions": ["read:users", "write:portfolios", "read:reports"],
  "iat": 1627048800,
  "exp": 1627052400,
  "iss": "wanzo-portfolio-institution",
  "aud": "portfolio-institution-client"
}
```

## Sécurité et recommandations

1. Ne jamais exposer le token de rafraîchissement dans des stockages non sécurisés
2. Vérifier la validité du token pour chaque requête sensible côté client
3. Utiliser HTTPS pour toutes les communications
4. Implémenter un mécanisme de déconnexion automatique après inactivité
5. Révoquer tous les tokens lors d'un changement de mot de passe

## Erreurs spécifiques

| Code HTTP | Code d'erreur              | Description                                    |
|-----------|----------------------------|------------------------------------------------|
| 400       | INVALID_CREDENTIALS        | Identifiants invalides                         |
| 400       | INVALID_TOKEN              | Token invalide ou expiré                        |
| 400       | INVALID_REFRESH_TOKEN      | Token de rafraîchissement invalide ou expiré    |
| 400       | PASSWORD_MISMATCH          | Les mots de passe ne correspondent pas         |
| 400       | INVALID_PASSWORD_FORMAT    | Format de mot de passe invalide                |
| 401       | UNAUTHORIZED               | Non autorisé                                   |
| 403       | FORBIDDEN                  | Accès interdit                                 |
| 429       | TOO_MANY_ATTEMPTS          | Trop de tentatives, veuillez réessayer plus tard |

**Corps de la requête** :

```json
{
  "code": "123456"
}
```

**Réponse réussie** (200 OK) :

```json
{
  "success": true,
  "data": {
    "verified": true
  }
}
```

### Désactivation du 2FA

**Endpoint** : `POST /api/v1/users/2fa/disable`

**Corps de la requête** :

```json
{
  "code": "123456"
}
```

**Réponse réussie** (200 OK) :

```json
{
  "success": true,
  "data": {
    "message": "2FA désactivé avec succès"
  }
}
```

## Intégration avec Auth0

Le système prend également en charge l'authentification via Auth0 pour une gestion d'identité plus robuste et l'authentification unique (SSO).

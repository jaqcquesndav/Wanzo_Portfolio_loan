# Actifs d'Investissement

Ce document décrit les endpoints pour la gestion des actifs d'investissement dans le cadre des portefeuilles d'investissement.

## Liste des actifs d'investissement

Récupère la liste des actifs d'investissement pour un portefeuille d'investissement spécifique.

**Endpoint** : GET /portfolios/investment/assets

**Paramètres de requête** :
- portfolioId (obligatoire) : Identifiant unique du portefeuille d'investissement
- 	ype (optionnel) : Filtre par type d'actif (share, bond, other)
- status (optionnel) : Filtre par statut (active, exited, written-off)

**Réponse réussie** (200 OK) :

`json
[
  {
    "id": "ASSET-00001",
    "name": "Actions ImmoPlus SA",
    "companyId": "COMP-00001",
    "type": "share",
    "acquiredDate": "2024-07-15T00:00:00.000Z",
    "initialValue": 150000.00,
    "currentValue": 180000.00,
    "status": "active",
    "created_at": "2024-07-15T10:00:00.000Z",
    "updated_at": "2025-07-01T14:45:00Z"
  },
  {
    "id": "ASSET-00002",
    "name": "Obligations TechInvest",
    "companyId": "COMP-00002",
    "type": "bond",
    "acquiredDate": "2024-08-20T00:00:00.000Z",
    "initialValue": 120000.00,
    "currentValue": 132000.00,
    "status": "active",
    "created_at": "2024-08-20T14:00:00.000Z",
    "updated_at": "2025-07-01T14:45:00Z"
  }
]
`

## Détails d'un actif

Récupère les détails d'un actif d'investissement spécifique.

**Endpoint** : GET /portfolios/investment/assets/{id}

**Paramètres de chemin** :
- id : Identifiant unique de l'actif d'investissement

**Réponse réussie** (200 OK) :

`json
{
  "id": "ASSET-00001",
  "name": "Actions ImmoPlus SA",
  "companyId": "COMP-00001",
  "type": "share",
  "acquiredDate": "2024-07-15T00:00:00.000Z",
  "initialValue": 150000.00,
  "currentValue": 180000.00,
  "status": "active",
  "created_at": "2024-07-15T10:00:00.000Z",
  "updated_at": "2025-07-01T14:45:00Z"
}
`

## Création d'un actif d'investissement

Ajoute un nouvel actif d'investissement.

**Endpoint** : POST /portfolios/investment/assets

**Corps de la requête** :

`json
{
  "name": "Actions GreenEnergy",
  "companyId": "COMP-00003",
  "type": "share",
  "acquiredDate": "2025-03-15T00:00:00.000Z",
  "initialValue": 200000.00,
  "status": "active"
}
`

**Réponse réussie** (201 Created) :

`json
{
  "id": "ASSET-00003",
  "name": "Actions GreenEnergy",
  "companyId": "COMP-00003",
  "type": "share",
  "acquiredDate": "2025-03-15T00:00:00.000Z",
  "initialValue": 200000.00,
  "currentValue": 200000.00,
  "status": "active",
  "created_at": "2025-07-02T11:20:00Z",
  "updated_at": "2025-07-02T11:20:00Z"
}
`

## Mise à jour d'un actif

Met à jour les informations d'un actif d'investissement existant.

**Endpoint** : PUT /portfolios/investment/assets/{id}

**Paramètres de chemin** :
- id : Identifiant unique de l'actif d'investissement

**Corps de la requête** :

`json
{
  "name": "Actions GreenEnergy SA",
  "currentValue": 220000.00
}
`

**Réponse réussie** (200 OK) :

`json
{
  "id": "ASSET-00003",
  "name": "Actions GreenEnergy SA",
  "companyId": "COMP-00003",
  "type": "share",
  "acquiredDate": "2025-03-15T00:00:00.000Z",
  "initialValue": 200000.00,
  "currentValue": 220000.00,
  "status": "active",
  "created_at": "2025-07-02T11:20:00Z",
  "updated_at": "2025-07-02T15:45:00Z"
}
`

## Marquer un actif comme cédé (exit)

Enregistre la cession d'un actif d'investissement.

**Endpoint** : POST /portfolios/investment/assets/{id}/exit

**Paramètres de chemin** :
- id : Identifiant unique de l'actif d'investissement

**Corps de la requête** :

`json
{
  "exitDate": "2025-06-30T00:00:00.000Z",
  "exitValue": 240000.00,
  "exitReason": "Opportunité de marché",
  "exitROI": 20.0
}
`

**Réponse réussie** (200 OK) :

`json
{
  "id": "ASSET-00003",
  "name": "Actions GreenEnergy SA",
  "companyId": "COMP-00003",
  "type": "share",
  "acquiredDate": "2025-03-15T00:00:00.000Z",
  "initialValue": 200000.00,
  "currentValue": 240000.00,
  "status": "exited",
  "exitDate": "2025-06-30T00:00:00.000Z",
  "exitValue": 240000.00,
  "exitReason": "Opportunité de marché",
  "exitROI": 20.0,
  "created_at": "2025-07-02T11:20:00Z",
  "updated_at": "2025-07-02T16:30:00Z"
}
`

## Marquer un actif comme déprécié (write-off)

Enregistre la dépréciation totale d'un actif d'investissement.

**Endpoint** : POST /portfolios/investment/assets/{id}/write-off

**Paramètres de chemin** :
- id : Identifiant unique de l'actif d'investissement

**Corps de la requête** :

`json
{
  "reason": "Faillite de l'entreprise"
}
`

**Réponse réussie** (200 OK) :

`json
{
  "id": "ASSET-00004",
  "name": "Actions StartupXYZ",
  "companyId": "COMP-00004",
  "type": "share",
  "acquiredDate": "2024-12-01T00:00:00.000Z",
  "initialValue": 100000.00,
  "currentValue": 0.00,
  "status": "written-off",
  "writeOffDate": "2025-07-15T00:00:00.000Z",
  "writeOffReason": "Faillite de l'entreprise",
  "created_at": "2024-12-01T09:00:00Z",
  "updated_at": "2025-07-15T10:20:00Z"
}
`

## Mise à jour de la valeur d'un actif

Met à jour la valeur actuelle d'un actif d'investissement.

**Endpoint** : POST /portfolios/investment/assets/{id}/value

**Paramètres de chemin** :
- id : Identifiant unique de l'actif d'investissement

**Corps de la requête** :

`json
{
  "currentValue": 230000.00,
  "valuationDate": "2025-07-15T00:00:00.000Z",
  "notes": "Revalorisation suite à une nouvelle levée de fonds"
}
`

**Réponse réussie** (200 OK) :

`json
{
  "id": "ASSET-00003",
  "name": "Actions GreenEnergy SA",
  "companyId": "COMP-00003",
  "type": "share",
  "acquiredDate": "2025-03-15T00:00:00.000Z",
  "initialValue": 200000.00,
  "currentValue": 230000.00,
  "lastValuationDate": "2025-07-15T00:00:00.000Z",
  "valuationNotes": "Revalorisation suite à une nouvelle levée de fonds",
  "status": "active",
  "created_at": "2025-07-02T11:20:00Z",
  "updated_at": "2025-07-15T14:30:00Z"
}
`

## Codes d'erreur

| Code | Description |
|------|-------------|
| 400  | Requête invalide ou paramètres manquants |
| 401  | Non autorisé - Authentification requise |
| 403  | Accès interdit - Droits insuffisants |
| 404  | Ressource non trouvée |
| 409  | Conflit - La ressource existe déjà |
| 422  | Entité non traitable - Validation échouée |
| 500  | Erreur serveur interne |

## Modèle de données

### InvestmentAsset

| Champ | Type | Description |
|-------|------|-------------|
| id | string | Identifiant unique de l'actif (format: ASSET-XXXXX) |
| name | string | Nom de l'actif |
| companyId | string | Identifiant de l'entreprise liée à l'actif |
| type | string | Type d'actif (share, bond, other) |
| acquiredDate | string | Date d'acquisition (format ISO) |
| initialValue | number | Valeur initiale de l'actif |
| currentValue | number | Valeur actuelle de l'actif |
| status | string | Statut de l'actif (active, exited, written-off) |
| exitDate | string | Date de sortie (si statut = exited) |
| exitValue | number | Valeur de sortie (si statut = exited) |
| exitReason | string | Raison de la sortie (si statut = exited) |
| exitROI | number | Retour sur investissement en % (si statut = exited) |
| writeOffDate | string | Date de dépréciation (si statut = written-off) |
| writeOffReason | string | Raison de la dépréciation (si statut = written-off) |
| lastValuationDate | string | Date de la dernière valorisation |
| valuationNotes | string | Notes sur la valorisation |
| created_at | string | Date de création de l'enregistrement (format ISO) |
| updated_at | string | Date de dernière mise à jour (format ISO) |

# Contrats de Leasing

Ce document décrit les endpoints pour la gestion des contrats de leasing d'équipements dans les portefeuilles de leasing.

## Liste des contrats de leasing

Récupère la liste paginée des contrats de leasing.

**Endpoint** : `GET /portfolios/leasing/contracts`

**Paramètres de requête** :
- `page` (optionnel) : Numéro de page (défaut: 1)
- `limit` (optionnel) : Nombre d'éléments par page (défaut: 10)
- `status` (optionnel) : Filtrer par statut (ex: "active", "draft", "terminated")
- `clientId` (optionnel) : Filtrer par identifiant client
- `startDateFrom` (optionnel) : Filtrer par date de début (format: YYYY-MM-DD)
- `startDateTo` (optionnel) : Filtrer par date de fin (format: YYYY-MM-DD)

**Réponse réussie** (200 OK) :

```json
{
  "data": [
    {
      "id": "EQ-000001",
      "equipment_id": "WL-00000001",
      "client_id": "CLI-001",
      "client_name": "Société Industrielle Alpha",
      "start_date": "2025-01-15",
      "end_date": "2027-01-15",
      "monthly_payment": 1250.00,
      "status": "active",
      "nextInvoiceDate": "2025-08-15"
    },
    {
      "id": "EQ-000002",
      "equipment_id": "WL-00000002",
      "client_id": "CLI-002",
      "client_name": "Gamma Technologies",
      "start_date": "2025-02-01",
      "end_date": "2026-08-01",
      "monthly_payment": 980.00,
      "status": "active",
      "nextInvoiceDate": "2025-08-01"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalItems": 18,
    "totalPages": 2
  }
}
```
## Détails d'un contrat de leasing

Récupère les détails complets d'un contrat de leasing spécifique.

**Endpoint** : `GET /portfolios/leasing/contracts/{id}`

**Paramètres de chemin** :
- `id` : Identifiant unique du contrat de leasing

**Réponse réussie** (200 OK) :

```json
{
  "id": "EQ-000001",
  "equipment_id": "WL-00000001",
  "client_id": "CLI-001",
  "client_name": "Société Industrielle Alpha",
  "request_id": "WL-00000001",
  "start_date": "2025-01-15",
  "end_date": "2027-01-15",
  "monthly_payment": 1250.00,
  "interest_rate": 3.75,
  "maintenance_included": true,
  "insurance_included": true,
  "status": "active",
  "activationDate": "2025-01-15",
  "nextInvoiceDate": "2025-08-15",
  "amortization_schedule": [
    {
      "date": "2025-02-15",
      "amount": 1250,
      "principal": 1100,
      "interest": 150,
      "balance": 28900
    },
    {
      "date": "2025-03-15",
      "amount": 1250,
      "principal": 1110,
      "interest": 140,
      "balance": 27790
    }
  ]
}
```

## Création d'un contrat de leasing

Crée un nouveau contrat de leasing.

**Endpoint** : `POST /portfolios/leasing/contracts`

**Corps de la requête** :

```json
{
  "equipment_id": "EQ-97531",
  "client_id": "CL-86420",
  "client_name": "Epsilon Consulting",
  "start_date": "2025-03-20",
  "end_date": "2026-09-20",
  "monthly_payment": 735.00,
  "interest_rate": 4.1,
  "maintenance_included": false,
  "insurance_included": false,
  "status": "draft"
}
```

**Réponse réussie** (201 Created) :

```json
{
  "id": "EQ-000024",
  "equipment_id": "EQ-97531",
  "client_id": "CL-86420",
  "client_name": "Epsilon Consulting",
  "start_date": "2025-03-20",
  "end_date": "2026-09-20",
  "monthly_payment": 735.00,
  "interest_rate": 4.1,
  "maintenance_included": false,
  "insurance_included": false,
  "status": "draft",
  "createdAt": "2025-07-25T10:30:00Z"
}
```

## Création d'un contrat à partir d'une demande

Crée un nouveau contrat de leasing à partir d'une demande existante.

**Endpoint** : `POST /portfolios/leasing/contracts/from-request/{requestId}`

**Paramètres de chemin** :
- `requestId` : Identifiant unique de la demande de leasing

**Corps de la requête** :

```json
{
  "start_date": "2025-04-01",
  "end_date": "2027-04-01",
  "monthly_payment": 850.00,
  "interest_rate": 3.9,
  "maintenance_included": true,
  "insurance_included": true
}
```

**Réponse réussie** (201 Created) :

```json
{
  "id": "EQ-000025",
  "equipment_id": "EQ-13579", 
  "client_id": "CL-24680",
  "client_name": "Société Technologie Beta",
  "request_id": "LR-00012",
  "start_date": "2025-04-01",
  "end_date": "2027-04-01",
  "monthly_payment": 850.00,
  "interest_rate": 3.9,
  "maintenance_included": true,
  "insurance_included": true,
  "status": "pending_activation",
  "createdAt": "2025-07-25T11:45:00Z"
}
```

## Mise à jour d'un contrat de leasing

Met à jour les informations d'un contrat de leasing existant.

**Endpoint** : `PUT /portfolios/leasing/contracts/{id}`

**Paramètres de chemin** :
- `id` : Identifiant unique du contrat de leasing

**Corps de la requête** :

```json
{
  "monthly_payment": 1300.00,
  "interest_rate": 3.95,
  "maintenance_included": true,
  "insurance_included": true,
  "status": "active"
}
```

**Réponse réussie** (200 OK) :

```json
{
  "id": "EQ-000001",
  "equipment_id": "WL-00000001",
  "client_id": "CLI-001",
  "client_name": "Société Industrielle Alpha",
  "request_id": "WL-00000001",
  "start_date": "2025-01-15",
  "end_date": "2027-01-15",
  "monthly_payment": 1300.00,
  "interest_rate": 3.95,
  "maintenance_included": true,
  "insurance_included": true,
  "status": "active",
  "activationDate": "2025-01-15",
  "nextInvoiceDate": "2025-08-15",
  "updatedAt": "2025-07-25T14:20:00Z"
}
```

## Activation d'un contrat de leasing

Change le statut d'un contrat de leasing à "actif".

**Endpoint** : `POST /portfolios/leasing/contracts/{id}/activate`

**Paramètres de chemin** :
- `id` : Identifiant unique du contrat de leasing

**Corps de la requête** :

```json
{
  "activationDate": "2025-08-01"
}
```

**Réponse réussie** (200 OK) :

```json
{
  "id": "EQ-000001",
  "status": "active",
  "activationDate": "2025-08-01",
  "nextInvoiceDate": "2025-09-01",
  "message": "Le contrat de leasing a été activé avec succès"
}
```

## Suspension d'un contrat de leasing

Suspend temporairement un contrat de leasing actif.

**Endpoint** : `POST /portfolios/leasing/contracts/{id}/suspend`

**Paramètres de chemin** :
- `id` : Identifiant unique du contrat de leasing

**Corps de la requête** :

```json
{
  "suspensionReason": "Restructuration financière en cours",
  "suspensionDate": "2025-09-15",
  "expectedReactivationDate": "2025-12-15"
}
```

**Réponse réussie** (200 OK) :

```json
{
  "id": "EQ-000001",
  "status": "suspended",
  "suspensionDate": "2025-09-15",
  "expectedReactivationDate": "2025-12-15",
  "suspensionReason": "Restructuration financière en cours",
  "message": "Le contrat de leasing a été suspendu avec succès"
}
```

## Résiliation d'un contrat de leasing

Résilie un contrat de leasing avant son terme.

**Endpoint** : `POST /portfolios/leasing/contracts/{id}/terminate`

**Paramètres de chemin** :
- `id` : Identifiant unique du contrat de leasing

**Corps de la requête** :

```json
{
  "terminationDate": "2025-10-31",
  "terminationReason": "Fermeture de l'entreprise",
  "terminationFee": 2500.00
}
```

**Réponse réussie** (200 OK) :

```json
{
  "id": "EQ-000001",
  "status": "terminated",
  "terminationDate": "2025-10-31",
  "terminationReason": "Fermeture de l'entreprise",
  "terminationFee": 2500.00,
  "message": "Le contrat de leasing a été résilié avec succès"
}
```

## Suppression d'un contrat de leasing

Supprime un contrat de leasing du système.

**Endpoint** : `DELETE /portfolios/leasing/contracts/{id}`

**Paramètres de chemin** :
- `id` : Identifiant unique du contrat de leasing

**Réponse réussie** (200 OK) :

```json
{
  "success": true,
  "message": "Le contrat de leasing a été supprimé avec succès"
}
```

## Liste des contrats de leasing

Récupère la liste paginée des contrats de leasing.

**Endpoint** : `GET /portfolios/leasing/contracts`

**Paramètres de requête** :
- `page` (optionnel) : Numéro de page (défaut: 1)
- `limit` (optionnel) : Nombre d'éléments par page (défaut: 10)
- `status` (optionnel) : Filtrer par statut (ex: "active", "draft", "terminated")
- `clientId` (optionnel) : Filtrer par identifiant client
- `startDateFrom` (optionnel) : Filtrer par date de début (format: YYYY-MM-DD)
- `startDateTo` (optionnel) : Filtrer par date de fin (format: YYYY-MM-DD)

**Réponse réussie** (200 OK) :

```json
{
  "data": [
    {
      "id": "EQ-000001",
      "equipment_id": "WL-00000001",
      "client_id": "CLI-001",
      "client_name": "Société Industrielle Alpha",
      "start_date": "2025-01-15",
      "end_date": "2027-01-15",
      "monthly_payment": 1250.00,
      "status": "active",
      "nextInvoiceDate": "2025-08-15"
    },
    {
      "id": "EQ-000002",
      "equipment_id": "WL-00000002",
      "client_id": "CLI-002",
      "client_name": "Gamma Technologies",
      "start_date": "2025-02-01",
      "end_date": "2026-08-01",
      "monthly_payment": 980.00,
      "status": "active",
      "nextInvoiceDate": "2025-08-01"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalItems": 18,
    "totalPages": 2
  }
}
```

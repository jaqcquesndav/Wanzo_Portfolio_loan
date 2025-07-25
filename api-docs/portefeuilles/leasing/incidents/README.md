# Incidents des Équipements

Ce document décrit les endpoints pour la gestion des incidents des équipements dans les portefeuilles de leasing.

## Liste des incidents

Récupère la liste des incidents avec filtrage.

**Endpoint** : `GET /portfolios/leasing/incidents`

**Paramètres de requête** :
- `portfolioId` (optionnel) : Filtre par identifiant du portefeuille
- `contractId` (optionnel) : Filtre par identifiant du contrat
- `equipmentId` (optionnel) : Filtre par identifiant d'équipement
- `status` (optionnel) : Filtre par statut ('open', 'in_progress', 'closed')
- `severity` (optionnel) : Filtre par gravité ('low', 'medium', 'high', 'critical')
- `dateFrom` (optionnel) : Filtre par date de signalement (début)
- `dateTo` (optionnel) : Filtre par date de signalement (fin)

**Réponse réussie** (200 OK) :

```json
[
  {
    "id": "INC-20250710-001",
    "date": "2025-07-10T10:15:00Z",
    "equipmentId": "EQ-LEASE-001",
    "equipmentName": "Tracteur Agricole TX-500",
    "clientName": "Ferme Moderne SARL",
    "portfolioId": "leasing-1",
    "portfolioName": "Leasing Agricole",
    "description": "Panne moteur - Intervention urgente requise",
    "status": "in_progress",
    "severity": "high",
    "cost": 250000,
    "estimatedRepairTime": 48,
    "technician": "Jean Dupont",
    "location": "Site client - Ferme Nord"
  },
  {
    "id": "INC-20250705-002",
    "date": "2025-07-05T14:30:00Z",
    "equipmentId": "EQ-LEASE-005",
    "equipmentName": "Chariot Élévateur FT2000",
    "clientName": "Logistique Express",
    "portfolioId": "leasing-2",
    "portfolioName": "Leasing Industriel",
    "description": "Problème hydraulique - Fuite détectée",
    "status": "closed",
    "severity": "medium",
    "cost": 85000,
    "estimatedRepairTime": 24,
    "technician": "Marc Technicien",
    "location": "Entrepôt client"
  }
]
```

## Détails d'un incident

Récupère les détails d'un incident spécifique.

**Endpoint** : `GET /portfolios/leasing/incidents/{id}`

**Paramètres de chemin** :
- `id` : Identifiant unique de l'incident

**Réponse réussie** (200 OK) :

```json
{
  "id": "INC-20250710-001",
  "date": "2025-07-10T10:15:00Z",
  "equipmentId": "EQ-LEASE-001",
  "equipmentName": "Tracteur Agricole TX-500",
  "clientName": "Ferme Moderne SARL",
  "portfolioId": "leasing-1",
  "portfolioName": "Leasing Agricole",
  "description": "Panne moteur - Intervention urgente requise",
  "status": "in_progress",
  "severity": "high",
  "cost": 250000,
  "estimatedRepairTime": 48,
  "technician": "Jean Dupont",
  "location": "Site client - Ferme Nord",
  "reported_by": "Ahmed Konaté",
  "created_at": "2025-07-10T10:20:00Z",
  "updated_at": "2025-07-10T14:35:00Z"
}
```

## Création d'un incident

Crée un nouvel incident pour un équipement en leasing.

**Endpoint** : `POST /portfolios/leasing/incidents`

**Corps de la requête** :

```json
{
  "contractId": "LEAS-2025-001",
  "equipmentId": "EQ-LEASE-001",
  "title": "Panne du système hydraulique",
  "description": "Le système hydraulique ne répond plus correctement. Impossible de soulever des charges lourdes.",
  "severity": "high",
  "reportedBy": "Marie Dupont"
}
```

**Réponse réussie** (201 Created) :

```json
{
  "id": "INC-20250725-001",
  "date": "2025-07-25T13:45:00Z",
  "contractId": "LEAS-2025-001",
  "equipmentId": "EQ-LEASE-001",
  "description": "Panne du système hydraulique",
  "status": "open",
  "severity": "high",
  "reported_by": "Marie Dupont",
  "created_at": "2025-07-25T13:45:00Z"
}
```

## Mise à jour d'un incident

Met à jour les informations d'un incident existant.

**Endpoint** : `PUT /portfolios/leasing/incidents/{id}`

**Paramètres de chemin** :
- `id` : Identifiant unique de l'incident

**Corps de la requête** :

```json
{
  "status": "in_progress",
  "severity": "medium",
  "assignedTo": "Jean Technicien"
}
```

**Réponse réussie** (200 OK) :

```json
{
  "id": "INC-20250725-001",
  "status": "in_progress",
  "severity": "medium",
  "assignedTo": "Jean Technicien",
  "updated_at": "2025-07-25T14:30:00Z"
}
```

## Résolution d'un incident

Marque un incident comme résolu.

**Endpoint** : `PUT /portfolios/leasing/incidents/{id}/resolve`

**Paramètres de chemin** :
- `id` : Identifiant unique de l'incident

**Corps de la requête** :

```json
{
  "resolution": "Remplacement du joint hydraulique défectueux et recalibrage du système."
}
```

**Réponse réussie** (200 OK) :

```json
{
  "id": "INC-20250725-001",
  "status": "resolved",
  "resolution": "Remplacement du joint hydraulique défectueux et recalibrage du système.",
  "resolved_at": "2025-07-26T10:15:00Z",
  "message": "L'incident a été résolu avec succès"
}
```

## Ajout d'un commentaire

Ajoute un commentaire à un incident existant.

**Endpoint** : `POST /portfolios/leasing/incidents/{id}/comments`

**Paramètres de chemin** :
- `id` : Identifiant unique de l'incident

**Corps de la requête** :

```json
{
  "text": "Les pièces de rechange ont été commandées. Livraison prévue demain.",
  "authorId": "USER-001",
  "authorName": "Jean Technicien"
}
```

**Réponse réussie** (201 Created) :

```json
{
  "id": "COM-001",
  "incidentId": "INC-20250725-001",
  "text": "Les pièces de rechange ont été commandées. Livraison prévue demain.",
  "authorId": "USER-001",
  "authorName": "Jean Technicien",
  "created_at": "2025-07-25T15:30:00Z"
}
```

## Liste des commentaires

Récupère tous les commentaires associés à un incident.

**Endpoint** : `GET /portfolios/leasing/incidents/{id}/comments`

**Paramètres de chemin** :
- `id` : Identifiant unique de l'incident

**Réponse réussie** (200 OK) :

```json
[
  {
    "id": "COM-001",
    "incidentId": "INC-20250725-001",
    "text": "Les pièces de rechange ont été commandées. Livraison prévue demain.",
    "authorId": "USER-001",
    "authorName": "Jean Technicien",
    "created_at": "2025-07-25T15:30:00Z"
  },
  {
    "id": "COM-002",
    "incidentId": "INC-20250725-001",
    "text": "Pièces reçues. Intervention planifiée pour demain matin.",
    "authorId": "USER-002",
    "authorName": "Sophie Responsable",
    "created_at": "2025-07-26T08:15:00Z"
  }
]
```

# Maintenance - Portefeuille de Leasing

Ce document décrit les endpoints pour la gestion de la maintenance des équipements dans les portefeuilles de leasing.

## Liste des maintenances

Récupère la liste des opérations de maintenance pour un portefeuille de leasing spécifique.

**Endpoint** : `GET /portfolio_inst/portfolios/leasing/{portfolioId}/maintenance`

**Paramètres de chemin** :
- `portfolioId` : Identifiant unique du portefeuille

**Paramètres de requête** :
- `page` (optionnel) : Numéro de la page (défaut : 1)
- `limit` (optionnel) : Nombre d'opérations par page (défaut : 10, max : 100)
- `status` (optionnel) : Filtre par statut (scheduled, in_progress, completed, cancelled)
- `type` (optionnel) : Filtre par type (preventive, curative)
- `equipmentId` (optionnel) : Filtre par équipement
- `dateFrom` (optionnel) : Filtre par date de programmation (début)
- `dateTo` (optionnel) : Filtre par date de programmation (fin)
- `provider` (optionnel) : Filtre par prestataire
- `sortBy` (optionnel) : Trier par (scheduled_date, type, status)
- `sortOrder` (optionnel) : Ordre de tri (asc, desc)

**Réponse réussie** (200 OK) :

```json
{
  "success": true,
  "data": [
    {
      "id": "mnt123",
      "equipment_id": "eq456",
      "equipment_name": "Tractopelle JCB 3CX",
      "type": "preventive",
      "description": "Révision périodique après 1000 heures",
      "scheduled_date": "2025-08-15T10:00:00.000Z",
      "completed_date": null,
      "status": "scheduled",
      "cost": 350.00,
      "provider": "TechMaint SARL",
      "created_at": "2025-07-01T14:23:10.000Z",
      "updated_at": "2025-07-01T14:23:10.000Z"
    }
  ],
  "meta": {
    "total": 12,
    "page": 1,
    "limit": 10,
    "totalPages": 2
  }
}
```

## Détails d'une maintenance

Récupère les détails d'une opération de maintenance spécifique.

**Endpoint** : `GET /portfolio_inst/portfolios/leasing/{portfolioId}/maintenance/{maintenanceId}`

**Paramètres de chemin** :
- `portfolioId` : Identifiant unique du portefeuille
- `maintenanceId` : Identifiant unique de l'opération de maintenance

**Réponse réussie** (200 OK) :

```json
{
  "success": true,
  "data": {
    "id": "mnt123",
    "equipment_id": "eq456",
    "equipment": {
      "id": "eq456",
      "name": "Tractopelle JCB 3CX",
      "category": "engin_chantier",
      "model": "3CX",
      "imageUrl": "https://api.wanzo.com/images/equipments/jcb-3cx.jpg"
    },
    "type": "preventive",
    "description": "Révision périodique après 1000 heures",
    "scheduled_date": "2025-08-15T10:00:00.000Z",
    "completed_date": null,
    "status": "scheduled",
    "cost": 350.00,
    "provider": "TechMaint SARL",
    "provider_details": {
      "name": "TechMaint SARL",
      "contact": "+243 123 456 789",
      "address": "123 Avenue de la Technique, Kinshasa"
    },
    "created_at": "2025-07-01T14:23:10.000Z",
    "updated_at": "2025-07-01T14:23:10.000Z",
    "tasks": [
      {
        "description": "Vidange huile moteur",
        "status": "pending"
      },
      {
        "description": "Remplacement filtres",
        "status": "pending"
      },
      {
        "description": "Vérification circuit hydraulique",
        "status": "pending"
      }
    ]
  }
}
```

## Créer une maintenance

Planifie une nouvelle opération de maintenance pour un équipement.

**Endpoint** : `POST /portfolio_inst/portfolios/leasing/{portfolioId}/maintenance`

**Paramètres de chemin** :
- `portfolioId` : Identifiant unique du portefeuille

**Corps de la requête** :

```json
{
  "equipment_id": "eq456",
  "type": "preventive",
  "description": "Révision périodique après 1000 heures",
  "scheduled_date": "2025-08-15T10:00:00.000Z",
  "provider": "TechMaint SARL",
  "cost": 350.00,
  "tasks": [
    "Vidange huile moteur",
    "Remplacement filtres",
    "Vérification circuit hydraulique"
  ]
}
```

**Réponse réussie** (201 Created) :

```json
{
  "success": true,
  "data": {
    "id": "mnt123",
    "status": "scheduled",
    "message": "Maintenance programmée avec succès"
  }
}
```

## Mettre à jour une maintenance

Modifie une opération de maintenance existante.

**Endpoint** : `PUT /portfolio_inst/portfolios/leasing/{portfolioId}/maintenance/{maintenanceId}`

**Paramètres de chemin** :
- `portfolioId` : Identifiant unique du portefeuille
- `maintenanceId` : Identifiant unique de l'opération de maintenance

**Corps de la requête** :

```json
{
  "scheduled_date": "2025-08-20T14:00:00.000Z",
  "status": "in_progress",
  "provider": "TechService Plus",
  "cost": 400.00
}
```

**Réponse réussie** (200 OK) :

```json
{
  "success": true,
  "message": "Maintenance mise à jour avec succès"
}
```

## Marquer une maintenance comme terminée

Marque une opération de maintenance comme terminée.

**Endpoint** : `PATCH /portfolio_inst/portfolios/leasing/{portfolioId}/maintenance/{maintenanceId}/complete`

**Paramètres de chemin** :
- `portfolioId` : Identifiant unique du portefeuille
- `maintenanceId` : Identifiant unique de l'opération de maintenance

**Corps de la requête** :

```json
{
  "completed_date": "2025-08-15T15:30:00.000Z",
  "notes": "Tous les travaux effectués conformément au plan. Remplacement supplémentaire des balais d'essuie-glace.",
  "final_cost": 380.00,
  "tasks_status": [
    {
      "description": "Vidange huile moteur",
      "status": "completed"
    },
    {
      "description": "Remplacement filtres",
      "status": "completed"
    },
    {
      "description": "Vérification circuit hydraulique",
      "status": "completed"
    }
  ]
}
```

**Réponse réussie** (200 OK) :

```json
{
  "success": true,
  "message": "Maintenance marquée comme terminée"
}
```

## Annuler une maintenance

Annule une opération de maintenance planifiée.

**Endpoint** : `PATCH /portfolio_inst/portfolios/leasing/{portfolioId}/maintenance/{maintenanceId}/cancel`

**Paramètres de chemin** :
- `portfolioId` : Identifiant unique du portefeuille
- `maintenanceId` : Identifiant unique de l'opération de maintenance

**Corps de la requête** :

```json
{
  "reason": "Équipement retourné au fournisseur pour réparation sous garantie"
}
```

**Réponse réussie** (200 OK) :

```json
{
  "success": true,
  "message": "Maintenance annulée avec succès"
}
```

## Supprimer une maintenance

Supprime une opération de maintenance du système.

**Endpoint** : `DELETE /portfolio_inst/portfolios/leasing/{portfolioId}/maintenance/{maintenanceId}`

**Paramètres de chemin** :
- `portfolioId` : Identifiant unique du portefeuille
- `maintenanceId` : Identifiant unique de l'opération de maintenance

**Réponse réussie** (200 OK) :

```json
{
  "success": true,
  "message": "Maintenance supprimée avec succès"
}
```

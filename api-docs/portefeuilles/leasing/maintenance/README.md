# Maintenance des Équipements

Ce document décrit les endpoints pour la gestion de la maintenance des équipements dans les portefeuilles de leasing.

## Liste des maintenances

Récupère la liste des maintenances avec filtrage.

**Endpoint** : `GET /portfolios/leasing/maintenance`

**Paramètres de requête** :
- `portfolioId` (optionnel) : Filtre par identifiant du portefeuille
- `equipmentId` (optionnel) : Filtre par identifiant d'équipement
- `status` (optionnel) : Filtre par statut ('scheduled', 'in_progress', 'completed', 'cancelled')
- `type` (optionnel) : Filtre par type de maintenance ('routine', 'repair', 'emergency')
- `dateFrom` (optionnel) : Filtre par date de début
- `dateTo` (optionnel) : Filtre par date de fin

**Réponse réussie** (200 OK) :

```json
[
  {
    "id": "MNT-001",
    "equipment_id": "EQ-LEASE-001",
    "equipment_name": "Tracteur Agricole TX-500",
    "type": "routine",
    "description": "Maintenance préventive trimestrielle",
    "scheduled_date": "2025-08-15T09:00:00Z",
    "status": "scheduled",
    "estimated_duration": 4,
    "estimated_cost": 150000,
    "technician_name": "Jean Dupont",
    "technician_id": "TECH-001",
    "created_at": "2025-07-15T14:30:00Z",
    "updated_at": "2025-07-15T14:30:00Z"
  },
  {
    "id": "MNT-002",
    "equipment_id": "EQ-LEASE-005",
    "equipment_name": "Chariot Élévateur FT2000",
    "type": "repair",
    "description": "Réparation du système hydraulique",
    "scheduled_date": "2025-07-20T10:00:00Z",
    "completed_date": "2025-07-20T14:30:00Z",
    "status": "completed",
    "estimated_duration": 6,
    "actual_duration": 4.5,
    "estimated_cost": 200000,
    "actual_cost": 180000,
    "technician_name": "Marc Technicien",
    "technician_id": "TECH-003",
    "notes": "Remplacement du joint hydraulique défectueux et test du système",
    "created_at": "2025-07-19T08:45:00Z",
    "updated_at": "2025-07-20T14:45:00Z"
  }
]
```

## Détails d'une maintenance

Récupère les détails d'une maintenance spécifique.

**Endpoint** : `GET /portfolios/leasing/maintenance/{id}`

**Paramètres de chemin** :
- `id` : Identifiant unique de la maintenance

**Réponse réussie** (200 OK) :

```json
{
  "id": "MNT-001",
  "equipment_id": "EQ-LEASE-001",
  "equipment_name": "Tracteur Agricole TX-500",
  "client_id": "CL-456",
  "client_name": "Ferme Moderne SARL",
  "type": "routine",
  "description": "Maintenance préventive trimestrielle",
  "scheduled_date": "2025-08-15T09:00:00Z",
  "status": "scheduled",
  "estimated_duration": 4,
  "estimated_cost": 150000,
  "technician_name": "Jean Dupont",
  "technician_id": "TECH-001",
  "location": "Site client - Ferme Nord",
  "parts_needed": [
    {
      "name": "Filtre à huile",
      "quantity": 1,
      "unit_cost": 15000
    },
    {
      "name": "Huile moteur",
      "quantity": 10,
      "unit": "L",
      "unit_cost": 5000
    }
  ],
  "created_at": "2025-07-15T14:30:00Z",
  "updated_at": "2025-07-15T14:30:00Z"
}
```

## Planification d'une maintenance

Planifie une nouvelle maintenance pour un équipement.

**Endpoint** : `POST /portfolios/leasing/maintenance`

**Corps de la requête** :

```json
{
  "equipmentId": "EQ-LEASE-001",
  "type": "routine",
  "scheduledDate": "2025-08-15T09:00:00Z",
  "estimatedDuration": 4,
  "description": "Maintenance préventive trimestrielle",
  "technicianId": "TECH-001",
  "technicianName": "Jean Dupont",
  "cost": 150000
}
```

**Réponse réussie** (201 Created) :

```json
{
  "id": "MNT-003",
  "equipment_id": "EQ-LEASE-001",
  "type": "routine",
  "description": "Maintenance préventive trimestrielle",
  "scheduled_date": "2025-08-15T09:00:00Z",
  "status": "scheduled",
  "estimated_duration": 4,
  "estimated_cost": 150000,
  "technician_id": "TECH-001",
  "technician_name": "Jean Dupont",
  "created_at": "2025-07-25T10:30:00Z"
}
```

## Mise à jour d'une maintenance

Met à jour les informations d'une maintenance existante.

**Endpoint** : `PUT /portfolios/leasing/maintenance/{id}`

**Paramètres de chemin** :
- `id` : Identifiant unique de la maintenance

**Corps de la requête** :

```json
{
  "status": "scheduled",
  "scheduledDate": "2025-08-16T10:00:00Z",
  "technicianId": "TECH-002",
  "technicianName": "Sophie Martin",
  "notes": "Reprogrammation à la demande du client"
}
```

**Réponse réussie** (200 OK) :

```json
{
  "id": "MNT-003",
  "equipment_id": "EQ-LEASE-001",
  "status": "scheduled",
  "scheduled_date": "2025-08-16T10:00:00Z",
  "technician_id": "TECH-002",
  "technician_name": "Sophie Martin",
  "notes": "Reprogrammation à la demande du client",
  "updated_at": "2025-07-25T11:15:00Z"
}
```

## Démarrage d'une maintenance

Marque une maintenance comme étant en cours.

**Endpoint** : `POST /portfolios/leasing/maintenance/{id}/start`

**Paramètres de chemin** :
- `id` : Identifiant unique de la maintenance

**Corps de la requête** :
```json
{}
```

**Réponse réussie** (200 OK) :

```json
{
  "id": "MNT-003",
  "status": "in_progress",
  "start_time": "2025-08-16T10:05:00Z",
  "technician_id": "TECH-002",
  "technician_name": "Sophie Martin",
  "message": "La maintenance a été démarrée avec succès"
}
```

## Terminer une maintenance

Marque une maintenance comme terminée et ajoute les détails de l'intervention.

**Endpoint** : `POST /portfolios/leasing/maintenance/{id}/complete`

**Paramètres de chemin** :
- `id` : Identifiant unique de la maintenance

**Corps de la requête** :

```json
{
  "actualDuration": 3.5,
  "actualCost": 140000,
  "notes": "Maintenance effectuée sans problème. Tous les systèmes fonctionnent correctement.",
  "repairDetails": "Remplacement des filtres et vidange d'huile",
  "partsReplaced": [
    "Filtre à huile",
    "Filtre à air",
    "Huile moteur (10L)"
  ]
}
```

**Réponse réussie** (200 OK) :

```json
{
  "id": "MNT-003",
  "status": "completed",
  "completion_time": "2025-08-16T13:35:00Z",
  "actual_duration": 3.5,
  "actual_cost": 140000,
  "notes": "Maintenance effectuée sans problème. Tous les systèmes fonctionnent correctement.",
  "parts_replaced": [
    "Filtre à huile",
    "Filtre à air",
    "Huile moteur (10L)"
  ],
  "message": "La maintenance a été complétée avec succès"
}
```

## Annulation d'une maintenance

Annule une maintenance planifiée.

**Endpoint** : `POST /portfolios/leasing/maintenance/{id}/cancel`

**Paramètres de chemin** :
- `id` : Identifiant unique de la maintenance

**Corps de la requête** :

```json
{
  "reason": "Équipement non disponible à la date prévue"
}
```

**Réponse réussie** (200 OK) :

```json
{
  "id": "MNT-003",
  "status": "cancelled",
  "cancellation_date": "2025-07-26T09:30:00Z",
  "cancellation_reason": "Équipement non disponible à la date prévue",
  "message": "La maintenance a été annulée avec succès"
}
```

## Calendrier de maintenance

Récupère le calendrier des maintenances planifiées.

**Endpoint** : `GET /portfolios/leasing/maintenance/schedule`

**Paramètres de requête** :
- `equipmentId` (optionnel) : Filtre par identifiant d'équipement
- `month` (optionnel) : Filtre par mois (format: YYYY-MM)

**Réponse réussie** (200 OK) :

```json
{
  "month": "2025-08",
  "days": [
    {
      "date": "2025-08-01",
      "maintenances": []
    },
    {
      "date": "2025-08-02",
      "maintenances": []
    },
    {
      "date": "2025-08-03",
      "maintenances": []
    },
    {
      "date": "2025-08-04",
      "maintenances": []
    },
    {
      "date": "2025-08-05",
      "maintenances": []
    },
    {
      "date": "2025-08-06",
      "maintenances": []
    },
    {
      "date": "2025-08-07",
      "maintenances": []
    },
    {
      "date": "2025-08-08",
      "maintenances": []
    },
    {
      "date": "2025-08-09",
      "maintenances": []
    },
    {
      "date": "2025-08-10",
      "maintenances": []
    },
    {
      "date": "2025-08-11",
      "maintenances": []
    },
    {
      "date": "2025-08-12",
      "maintenances": []
    },
    {
      "date": "2025-08-13",
      "maintenances": []
    },
    {
      "date": "2025-08-14",
      "maintenances": []
    },
    {
      "date": "2025-08-15",
      "maintenances": []
    },
    {
      "date": "2025-08-16",
      "maintenances": [
        {
          "id": "MNT-003",
          "equipment_id": "EQ-LEASE-001",
          "equipment_name": "Tracteur Agricole TX-500",
          "type": "routine",
          "scheduled_time": "10:00",
          "estimated_duration": 4,
          "technician_name": "Sophie Martin"
        }
      ]
    },
    {
      "date": "2025-08-17",
      "maintenances": []
    },
    {
      "date": "2025-08-18",
      "maintenances": []
    },
    {
      "date": "2025-08-19",
      "maintenances": []
    },
    {
      "date": "2025-08-20",
      "maintenances": [
        {
          "id": "MNT-004",
          "equipment_id": "EQ-LEASE-010",
          "equipment_name": "Excavatrice compacte EC-250",
          "type": "routine",
          "scheduled_time": "09:30",
          "estimated_duration": 6,
          "technician_name": "Jean Dupont"
        }
      ]
    },
    {
      "date": "2025-08-21",
      "maintenances": []
    },
    {
      "date": "2025-08-22",
      "maintenances": []
    },
    {
      "date": "2025-08-23",
      "maintenances": []
    },
    {
      "date": "2025-08-24",
      "maintenances": []
    },
    {
      "date": "2025-08-25",
      "maintenances": []
    },
    {
      "date": "2025-08-26",
      "maintenances": []
    },
    {
      "date": "2025-08-27",
      "maintenances": []
    },
    {
      "date": "2025-08-28",
      "maintenances": []
    },
    {
      "date": "2025-08-29",
      "maintenances": []
    },
    {
      "date": "2025-08-30",
      "maintenances": []
    },
    {
      "date": "2025-08-31",
      "maintenances": []
    }
  ],
  "equipment_summary": [
    {
      "equipment_id": "EQ-LEASE-001",
      "equipment_name": "Tracteur Agricole TX-500",
      "maintenance_count": 1,
      "next_maintenance": "2025-08-16T10:00:00Z"
    },
    {
      "equipment_id": "EQ-LEASE-010",
      "equipment_name": "Excavatrice compacte EC-250",
      "maintenance_count": 1,
      "next_maintenance": "2025-08-20T09:30:00Z"
    }
  ]
}
```

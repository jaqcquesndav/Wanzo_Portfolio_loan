# Portefeuilles de Leasing

Ce document décrit les endpoints principaux pour la gestion des portefeuilles de leasing dans l'API Wanzo Portfolio Institution.

## Modules des Portefeuilles de Leasing

Les portefeuilles de leasing sont organisés en plusieurs modules :

1. **[Équipements](./equipements/README.md)** - Gestion du catalogue d'équipements
2. **[Demandes](./demandes/README.md)** - Gestion des demandes de leasing
3. **[Contrats](./contrats/README.md)** - Gestion des contrats de leasing
4. **[Maintenances](./maintenances/README.md)** - Gestion des opérations de maintenance
5. **[Incidents](./incidents/README.md)** - Gestion des incidents sur les équipements
6. **[Paiements](./paiements/README.md)** - Gestion des paiements de leasing
7. **[Mouvements](./mouvements/README.md)** - Gestion des mouvements d'équipements
8. **[Paramètres](./parametres/README.md)** - Configuration des portefeuilles de leasing

## Liste des portefeuilles de leasing

Récupère la liste des portefeuilles de leasing avec pagination et filtrage.

**Endpoint** : `GET /portfolio_inst/portfolios/leasing`

**Paramètres de requête** :
- `page` (optionnel) : Numéro de la page (défaut : 1)
- `limit` (optionnel) : Nombre d'éléments par page (défaut : 10, max : 100)
- `status` (optionnel) : Filtre par statut (active, inactive)
- `sector` (optionnel) : Filtre par secteur cible
- `search` (optionnel) : Recherche textuelle (nom, description)
- `sortBy` (optionnel) : Trier par (created_at, name, target_amount, utilizationRate)
- `sortOrder` (optionnel) : Ordre de tri (asc, desc)

**Réponse réussie** (200 OK) :

```json
{
  "success": true,
  "data": [
    {
      "id": "portfolio-leasing-123",
      "name": "Équipements Industriels",
      "description": "Portefeuille de leasing dédié aux équipements industriels",
      "type": "leasing",
      "status": "active",
      "target_amount": 5000000.00,
      "current_amount": 3750000.00,
      "target_return": 12.5,
      "current_return": 11.8,
      "target_sectors": ["manufacturing", "construction", "logistics"],
      "risk_profile": "moderate",
      "metrics": {
        "totalLeased": 15,
        "availableEquipment": 7,
        "utilizationRate": 68.2,
        "defaultRate": 2.1,
        "totalRevenue": 850000.00,
        "totalIncidents": 5,
        "totalMaintenance": 12
      },
      "manager": {
        "id": "user789",
        "name": "Sophie Martin"
      },
      "created_at": "2024-10-15T10:00:00.000Z"
    }
  ],
  "meta": {
    "total": 3,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

## Création d'un portefeuille de leasing

Crée un nouveau portefeuille de leasing.

**Endpoint** : `POST /portfolio_inst/portfolios/leasing`

**Corps de la requête** :

```json
{
  "name": "Équipements Industriels",
  "description": "Portefeuille de leasing dédié aux équipements industriels",
  "type": "leasing",
  "target_amount": 5000000.00,
  "target_return": 12.5,
  "target_sectors": ["manufacturing", "construction", "logistics"],
  "risk_profile": "moderate",
  "leasing_terms": {
    "min_duration": 12,
    "max_duration": 60,
    "interest_rate_range": {
      "min": 8,
      "max": 15
    },
    "maintenance_included": true,
    "insurance_required": true
  },
  "manager_id": "user789",
  "documents": [
    {
      "type": "terms",
      "file_id": "file123",
      "name": "Conditions_Générales.pdf"
    },
    {
      "type": "procedures",
      "file_id": "file124",
      "name": "Procédures_Opérationnelles.pdf"
    }
  ]
}
```

**Réponse réussie** (201 Created) :

```json
{
  "success": true,
  "data": {
    "id": "portfolio-leasing-123",
    "name": "Équipements Industriels",
    "type": "leasing",
    "status": "active",
    "message": "Portefeuille de leasing créé avec succès"
  }
}
```

## Détails d'un portefeuille de leasing

Récupère les détails complets d'un portefeuille de leasing spécifique.

**Endpoint** : `GET /portfolio_inst/portfolios/leasing/{portfolioId}`

**Paramètres de chemin** :
- `portfolioId` : Identifiant unique du portefeuille de leasing

**Réponse réussie** (200 OK) :

```json
{
  "success": true,
  "data": {
    "id": "portfolio-leasing-123",
    "name": "Équipements Industriels",
    "description": "Portefeuille de leasing dédié aux équipements industriels",
    "type": "leasing",
    "status": "active",
    "status_history": [
      {
        "status": "active",
        "timestamp": "2024-10-15T10:00:00.000Z",
        "user_id": "user123"
      }
    ],
    "target_amount": 5000000.00,
    "current_amount": 3750000.00,
    "target_return": 12.5,
    "current_return": 11.8,
    "inception_date": "2024-10-15T00:00:00.000Z",
    "target_sectors": ["manufacturing", "construction", "logistics"],
    "risk_profile": "moderate",
    "leasing_terms": {
      "min_duration": 12,
      "max_duration": 60,
      "interest_rate_range": {
        "min": 8,
        "max": 15
      },
      "maintenance_included": true,
      "insurance_required": true
    },
    "metrics": {
      "totalLeased": 15,
      "availableEquipment": 7,
      "utilizationRate": 68.2,
      "defaultRate": 2.1,
      "totalRevenue": 850000.00,
      "totalIncidents": 5,
      "totalMaintenance": 12,
      "averageLeaseDuration": 36,
      "averageLeaseValue": 125000.00
    },
    "equipment_summary": {
      "total_count": 22,
      "leased_count": 15,
      "available_count": 7,
      "maintenance_count": 2,
      "total_value": 3750000.00,
      "average_equipment_age": 1.5,
      "by_category": [
        {
          "category": "construction",
          "count": 8,
          "value": 1800000.00
        },
        {
          "category": "manufacturing",
          "count": 10,
          "value": 1500000.00
        },
        {
          "category": "logistics",
          "count": 4,
          "value": 450000.00
        }
      ]
    },
    "contracts_summary": {
      "total_count": 18,
      "active_count": 15,
      "expired_count": 2,
      "terminated_count": 1,
      "average_monthly_payment": 21250.00,
      "total_monthly_revenue": 318750.00,
      "total_contract_value": 11475000.00
    },
    "maintenance_summary": {
      "total_count": 35,
      "preventive_count": 28,
      "corrective_count": 7,
      "scheduled_count": 8,
      "completed_count": 27,
      "total_cost": 175000.00,
      "average_time_to_resolve": 3.2
    },
    "incidents_summary": {
      "total_count": 12,
      "open_count": 2,
      "resolved_count": 10,
      "by_priority": [
        {
          "priority": "high",
          "count": 3
        },
        {
          "priority": "medium",
          "count": 6
        },
        {
          "priority": "low",
          "count": 3
        }
      ],
      "average_time_to_resolve": 2.8
    },
    "manager": {
      "id": "user789",
      "name": "Sophie Martin",
      "email": "sophie.martin@example.com",
      "phone": "+22500000000"
    },
    "documents": [
      {
        "id": "doc123",
        "type": "terms",
        "name": "Conditions_Générales.pdf",
        "uploaded_at": "2024-10-15T10:00:00.000Z"
      },
      {
        "id": "doc124",
        "type": "procedures",
        "name": "Procédures_Opérationnelles.pdf",
        "uploaded_at": "2024-10-15T10:00:00.000Z"
      }
    ],
    "bank_accounts": [
      {
        "id": "account456",
        "bank_name": "Banque Atlantique",
        "account_number": "****9012",
        "currency": "XOF",
        "balance": 1250000.00
      }
    ],
    "created_at": "2024-10-15T10:00:00.000Z",
    "created_by": {
      "id": "user123",
      "name": "Marie Koné"
    },
    "updated_at": "2025-07-15T09:00:00.000Z"
  }
}
```

## Mettre à jour un portefeuille de leasing

Modifie un portefeuille de leasing existant.

**Endpoint** : `PUT /portfolio_inst/portfolios/leasing/{portfolioId}`

**Paramètres de chemin** :
- `portfolioId` : Identifiant unique du portefeuille de leasing

**Corps de la requête** :

```json
{
  "name": "Équipements Industriels Premium",
  "description": "Portefeuille de leasing dédié aux équipements industriels haut de gamme",
  "target_amount": 7500000.00,
  "target_return": 14.0,
  "target_sectors": ["manufacturing", "construction", "logistics", "mining"],
  "risk_profile": "moderate",
  "leasing_terms": {
    "min_duration": 24,
    "max_duration": 72,
    "interest_rate_range": {
      "min": 7,
      "max": 14
    },
    "maintenance_included": true,
    "insurance_required": true
  },
  "manager_id": "user456"
}
```

**Réponse réussie** (200 OK) :

```json
{
  "success": true,
  "message": "Portefeuille de leasing mis à jour avec succès"
}
```

## Supprimer un portefeuille de leasing

Supprime un portefeuille de leasing (uniquement possible s'il n'a pas d'équipements ou de contrats actifs).

**Endpoint** : `DELETE /portfolio_inst/portfolios/leasing/{portfolioId}`

**Paramètres de chemin** :
- `portfolioId` : Identifiant unique du portefeuille de leasing

**Réponse réussie** (200 OK) :

```json
{
  "success": true,
  "message": "Portefeuille de leasing supprimé avec succès"
}
```

## Métriques du portefeuille

Récupère des métriques détaillées pour un portefeuille de leasing spécifique.

**Endpoint** : `GET /portfolio_inst/portfolios/leasing/{portfolioId}/metrics`

**Paramètres de chemin** :
- `portfolioId` : Identifiant unique du portefeuille de leasing

**Paramètres de requête** :
- `period` (optionnel) : Période pour les métriques (month, quarter, year, all) (défaut : all)
- `startDate` (optionnel) : Date de début pour les métriques personnalisées
- `endDate` (optionnel) : Date de fin pour les métriques personnalisées

**Réponse réussie** (200 OK) :

```json
{
  "success": true,
  "data": {
    "portfolio_id": "portfolio-leasing-123",
    "period": "all",
    "start_date": "2024-10-15T00:00:00.000Z",
    "end_date": "2025-07-25T00:00:00.000Z",
    "performance": {
      "current_return": 11.8,
      "target_return": 12.5,
      "roi": 11.2,
      "yield": 10.9
    },
    "equipment": {
      "total_count": 22,
      "leased_count": 15,
      "available_count": 7,
      "maintenance_count": 2,
      "total_value": 3750000.00,
      "average_equipment_age": 1.5,
      "utilization_rate": 68.2,
      "utilization_by_month": [
        {
          "month": "2024-11",
          "rate": 60.0
        },
        {
          "month": "2024-12",
          "rate": 65.5
        },
        {
          "month": "2025-01",
          "rate": 70.2
        },
        {
          "month": "2025-02",
          "rate": 68.7
        },
        {
          "month": "2025-03",
          "rate": 67.5
        },
        {
          "month": "2025-04",
          "rate": 66.8
        },
        {
          "month": "2025-05",
          "rate": 69.1
        },
        {
          "month": "2025-06",
          "rate": 68.5
        },
        {
          "month": "2025-07",
          "rate": 68.2
        }
      ]
    },
    "contracts": {
      "total_count": 18,
      "active_count": 15,
      "expired_count": 2,
      "terminated_count": 1,
      "average_duration": 36,
      "average_monthly_payment": 21250.00,
      "total_monthly_revenue": 318750.00,
      "total_contract_value": 11475000.00,
      "contracts_by_month": [
        {
          "month": "2024-11",
          "new_contracts": 3,
          "expired_contracts": 0
        },
        {
          "month": "2024-12",
          "new_contracts": 4,
          "expired_contracts": 0
        },
        {
          "month": "2025-01",
          "new_contracts": 2,
          "expired_contracts": 0
        },
        {
          "month": "2025-02",
          "new_contracts": 3,
          "expired_contracts": 0
        },
        {
          "month": "2025-03",
          "new_contracts": 2,
          "expired_contracts": 1
        },
        {
          "month": "2025-04",
          "new_contracts": 1,
          "expired_contracts": 0
        },
        {
          "month": "2025-05",
          "new_contracts": 2,
          "expired_contracts": 0
        },
        {
          "month": "2025-06",
          "new_contracts": 1,
          "expired_contracts": 1
        },
        {
          "month": "2025-07",
          "new_contracts": 0,
          "expired_contracts": 0
        }
      ]
    },
    "revenue": {
      "total_revenue": 2870000.00,
      "monthly_average": 318750.00,
      "by_category": [
        {
          "category": "construction",
          "amount": 1300000.00,
          "percentage": 45.3
        },
        {
          "category": "manufacturing",
          "amount": 1170000.00,
          "percentage": 40.8
        },
        {
          "category": "logistics",
          "amount": 400000.00,
          "percentage": 13.9
        }
      ],
      "revenue_by_month": [
        {
          "month": "2024-11",
          "amount": 180000.00
        },
        {
          "month": "2024-12",
          "amount": 270000.00
        },
        {
          "month": "2025-01",
          "amount": 300000.00
        },
        {
          "month": "2025-02",
          "amount": 325000.00
        },
        {
          "month": "2025-03",
          "amount": 330000.00
        },
        {
          "month": "2025-04",
          "amount": 340000.00
        },
        {
          "month": "2025-05",
          "amount": 350000.00
        },
        {
          "month": "2025-06",
          "amount": 360000.00
        },
        {
          "month": "2025-07",
          "amount": 415000.00
        }
      ]
    },
    "maintenance": {
      "total_count": 35,
      "preventive_count": 28,
      "corrective_count": 7,
      "scheduled_count": 8,
      "completed_count": 27,
      "total_cost": 175000.00,
      "average_time_to_resolve": 3.2,
      "maintenance_by_month": [
        {
          "month": "2024-11",
          "preventive": 2,
          "corrective": 0
        },
        {
          "month": "2024-12",
          "preventive": 3,
          "corrective": 1
        },
        {
          "month": "2025-01",
          "preventive": 3,
          "corrective": 0
        },
        {
          "month": "2025-02",
          "preventive": 3,
          "corrective": 1
        },
        {
          "month": "2025-03",
          "preventive": 3,
          "corrective": 2
        },
        {
          "month": "2025-04",
          "preventive": 4,
          "corrective": 0
        },
        {
          "month": "2025-05",
          "preventive": 3,
          "corrective": 1
        },
        {
          "month": "2025-06",
          "preventive": 4,
          "corrective": 2
        },
        {
          "month": "2025-07",
          "preventive": 3,
          "corrective": 0
        }
      ]
    },
    "incidents": {
      "total_count": 12,
      "open_count": 2,
      "resolved_count": 10,
      "average_time_to_resolve": 2.8,
      "by_priority": [
        {
          "priority": "high",
          "count": 3,
          "percentage": 25.0
        },
        {
          "priority": "medium",
          "count": 6,
          "percentage": 50.0
        },
        {
          "priority": "low",
          "count": 3,
          "percentage": 25.0
        }
      ],
      "incidents_by_month": [
        {
          "month": "2024-11",
          "count": 0
        },
        {
          "month": "2024-12",
          "count": 1
        },
        {
          "month": "2025-01",
          "count": 1
        },
        {
          "month": "2025-02",
          "count": 2
        },
        {
          "month": "2025-03",
          "count": 1
        },
        {
          "month": "2025-04",
          "count": 2
        },
        {
          "month": "2025-05",
          "count": 2
        },
        {
          "month": "2025-06",
          "count": 2
        },
        {
          "month": "2025-07",
          "count": 1
        }
      ]
    }
  }
}
```

## Suspendre un portefeuille de leasing

Suspend temporairement un portefeuille de leasing actif.

**Endpoint** : `POST /portfolio_inst/portfolios/leasing/{portfolioId}/suspend`

**Paramètres de chemin** :
- `portfolioId` : Identifiant unique du portefeuille de leasing

**Corps de la requête** :

```json
{
  "suspension_date": "2025-03-15T00:00:00.000Z",
  "reason": "restructuring",
  "expected_reactivation_date": "2025-04-15T00:00:00.000Z",
  "notes": "Suspension temporaire pour restructuration du portefeuille"
}
```

**Réponse réussie** (200 OK) :

```json
{
  "success": true,
  "message": "Portefeuille de leasing suspendu",
  "data": {
    "portfolio_id": "portfolio-leasing-123",
    "new_status": "inactive",
    "expected_reactivation_date": "2025-04-15T00:00:00.000Z"
  }
}
```

## Réactiver un portefeuille de leasing

Réactive un portefeuille de leasing suspendu.

**Endpoint** : `POST /portfolio_inst/portfolios/leasing/{portfolioId}/reactivate`

**Paramètres de chemin** :
- `portfolioId` : Identifiant unique du portefeuille de leasing

**Corps de la requête** :

```json
{
  "reactivation_date": "2025-04-10T00:00:00.000Z",
  "notes": "Réactivation suite à la finalisation de la restructuration"
}
```

**Réponse réussie** (200 OK) :

```json
{
  "success": true,
  "message": "Portefeuille de leasing réactivé",
  "data": {
    "portfolio_id": "portfolio-leasing-123",
    "new_status": "active"
  }
}
```

## Rapport de performance du portefeuille

Génère un rapport de performance pour un portefeuille de leasing.

**Endpoint** : `GET /portfolio_inst/portfolios/leasing/{portfolioId}/performance-report`

**Paramètres de chemin** :
- `portfolioId` : Identifiant unique du portefeuille de leasing

**Paramètres de requête** :
- `period` (optionnel) : Période pour le rapport (month, quarter, year) (défaut : month)
- `format` (optionnel) : Format du rapport (json, pdf, excel) (défaut : json)

**Réponse réussie** (200 OK) :

```json
{
  "success": true,
  "data": {
    "portfolio_id": "portfolio-leasing-123",
    "portfolio_name": "Équipements Industriels",
    "period": "month",
    "report_date": "2025-07-25T00:00:00.000Z",
    "period_start": "2025-06-01T00:00:00.000Z",
    "period_end": "2025-06-30T23:59:59.000Z",
    "summary": {
      "performance_rating": "good",
      "total_revenue": 360000.00,
      "revenue_change": 2.9,
      "utilization_rate": 68.5,
      "utilization_rate_change": -0.6,
      "active_contracts": 15,
      "new_contracts": 1,
      "expired_contracts": 1
    },
    "key_metrics": {
      "financial": {
        "revenue": 360000.00,
        "expenses": 75000.00,
        "maintenance_cost": 25000.00,
        "net_income": 260000.00,
        "roi": 11.5
      },
      "operational": {
        "equipment_count": 22,
        "leased_count": 15,
        "maintenance_count": 4,
        "incident_count": 2,
        "average_resolution_time": 2.5
      },
      "client": {
        "total_clients": 12,
        "new_clients": 1,
        "renewal_rate": 95,
        "satisfaction_score": 4.2
      }
    },
    "top_performing_categories": [
      {
        "category": "construction",
        "revenue": 160000.00,
        "utilization_rate": 75.0
      },
      {
        "category": "manufacturing",
        "revenue": 150000.00,
        "utilization_rate": 70.0
      },
      {
        "category": "logistics",
        "revenue": 50000.00,
        "utilization_rate": 50.0
      }
    ],
    "upcoming_activities": {
      "contract_expirations": 2,
      "scheduled_maintenance": 3,
      "pending_requests": 5
    },
    "recommendations": [
      "Augmenter l'inventaire des équipements de construction pour répondre à la demande croissante",
      "Planifier des maintenances préventives supplémentaires pour les équipements logistiques",
      "Revoir les tarifs des équipements manufacturiers pour améliorer la compétitivité"
    ],
    "download_url": "/api/reports/leasing-performance-202506-portfolio-leasing-123.pdf"
  }
}
```

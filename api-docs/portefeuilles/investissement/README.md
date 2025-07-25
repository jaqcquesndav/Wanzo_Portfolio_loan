# Portefeuilles d'Investissement

Ce document décrit les endpoints principaux pour la gestion des portefeuilles d'investissement dans l'API Wanzo Portfolio Institution.

## Modules des Portefeuilles d'Investissement

Les portefeuilles d'investissement sont organisés en plusieurs modules :

1. **[Actifs](./actifs/README.md)** - Gestion des actifs d'investissement
2. **[Demandes](./demandes/README.md)** - Gestion des demandes d'investissement
3. **[Transactions](./transactions/README.md)** - Gestion des transactions d'investissement
4. **[Rapports](./rapports/README.md)** - Gestion des rapports de performance
5. **[Sorties](./sorties/README.md)** - Gestion des événements de sortie
6. **[Paramètres](./parametres/README.md)** - Configuration des portefeuilles d'investissement

## Liste des portefeuilles d'investissement

Récupère la liste des portefeuilles d'investissement avec pagination et filtrage.

**Endpoint** : `GET /portfolio_inst/portfolios/investment`

**Paramètres de requête** :
- `page` (optionnel) : Numéro de la page (défaut : 1)
- `limit` (optionnel) : Nombre d'éléments par page (défaut : 10, max : 100)
- `status` (optionnel) : Filtre par statut (active, inactive, pending, archived)
- `sector` (optionnel) : Filtre par secteur cible
- `risk_profile` (optionnel) : Filtre par profil de risque (conservative, moderate, aggressive)
- `search` (optionnel) : Recherche textuelle (nom, description)
- `sortBy` (optionnel) : Trier par (created_at, name, target_amount, performance)
- `sortOrder` (optionnel) : Ordre de tri (asc, desc)

**Réponse réussie** (200 OK) :

```json
{
  "success": true,
  "data": [
    {
      "id": "portfolio123",
      "name": "Fonds Immobilier Commercial",
      "description": "Portefeuille d'investissement dédié aux projets immobiliers commerciaux",
      "type": "investment",
      "status": "active",
      "target_amount": 5000000.00,
      "current_amount": 4500000.00,
      "target_return": 15.0,
      "current_return": 16.8,
      "investment_horizon": {
        "min": 3,
        "max": 5,
        "unit": "year"
      },
      "risk_profile": "moderate",
      "target_sectors": ["real_estate", "commercial"],
      "metrics": {
        "totalAssets": 7,
        "avgInvestmentSize": 160714.29,
        "totalTransactions": 14,
        "totalExits": 2,
        "performance": {
          "current_year": 16.8,
          "since_inception": 14.7
        }
      },
      "manager": {
        "id": "user456",
        "name": "Jean Dupont"
      },
      "created_at": "2024-06-15T10:00:00.000Z"
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

## Création d'un portefeuille d'investissement

Crée un nouveau portefeuille d'investissement.

**Endpoint** : `POST /portfolio_inst/portfolios/investment`

**Corps de la requête** :

```json
{
  "name": "Fonds Immobilier Commercial",
  "description": "Portefeuille d'investissement dédié aux projets immobiliers commerciaux",
  "type": "investment",
  "target_amount": 5000000.00,
  "target_return": 15.0,
  "target_sectors": ["real_estate", "commercial"],
  "risk_profile": "moderate",
  "investment_horizon": {
    "min": 3,
    "max": 5,
    "unit": "year"
  },
  "investment_criteria": {
    "min_investment_size": 100000.00,
    "max_investment_size": 1000000.00,
    "target_company_stages": ["growth", "mature"],
    "target_company_size": {
      "min_revenue": 500000.00,
      "min_employees": 10
    },
    "geographical_focus": ["Abidjan", "Dakar", "Accra"]
  },
  "manager_id": "user456",
  "documents": [
    {
      "type": "strategy",
      "file_id": "file123",
      "name": "Strategie_Investissement.pdf"
    },
    {
      "type": "terms",
      "file_id": "file124",
      "name": "Termes_et_Conditions.pdf"
    }
  ]
}
```

**Réponse réussie** (201 Created) :

```json
{
  "success": true,
  "data": {
    "id": "portfolio123",
    "name": "Fonds Immobilier Commercial",
    "type": "investment",
    "status": "pending",
    "message": "Portefeuille d'investissement créé avec succès"
  }
}
```

## Détails d'un portefeuille d'investissement

Récupère les détails complets d'un portefeuille d'investissement spécifique.

**Endpoint** : `GET /portfolio_inst/portfolios/investment/{portfolioId}`

**Paramètres de chemin** :
- `portfolioId` : Identifiant unique du portefeuille d'investissement

**Réponse réussie** (200 OK) :

```json
{
  "success": true,
  "data": {
    "id": "portfolio123",
    "name": "Fonds Immobilier Commercial",
    "description": "Portefeuille d'investissement dédié aux projets immobiliers commerciaux",
    "type": "investment",
    "status": "active",
    "status_history": [
      {
        "status": "pending",
        "timestamp": "2024-06-15T10:00:00.000Z",
        "user_id": "user123"
      },
      {
        "status": "active",
        "timestamp": "2024-06-20T14:30:00.000Z",
        "user_id": "user123"
      }
    ],
    "target_amount": 5000000.00,
    "current_amount": 4500000.00,
    "target_return": 15.0,
    "current_return": 16.8,
    "inception_date": "2024-06-20T00:00:00.000Z",
    "investment_horizon": {
      "min": 3,
      "max": 5,
      "unit": "year"
    },
    "target_end_date": "2029-06-20T00:00:00.000Z",
    "risk_profile": "moderate",
    "target_sectors": ["real_estate", "commercial"],
    "investment_criteria": {
      "min_investment_size": 100000.00,
      "max_investment_size": 1000000.00,
      "target_company_stages": ["growth", "mature"],
      "target_company_size": {
        "min_revenue": 500000.00,
        "min_employees": 10
      },
      "geographical_focus": ["Abidjan", "Dakar", "Accra"]
    },
    "metrics": {
      "totalAssets": 7,
      "totalInvestmentRequests": 12,
      "approvedRequests": 9,
      "rejectedRequests": 2,
      "pendingRequests": 1,
      "avgInvestmentSize": 160714.29,
      "totalTransactions": 14,
      "totalExits": 2,
      "performance": {
        "current_year": 16.8,
        "since_inception": 14.7,
        "IRR": 15.3,
        "MOIC": 1.2
      },
      "asset_allocation": {
        "by_sector": [
          {
            "sector": "real_estate",
            "percentage": 60.0
          },
          {
            "sector": "commercial",
            "percentage": 40.0
          }
        ],
        "by_stage": [
          {
            "stage": "growth",
            "percentage": 70.0
          },
          {
            "stage": "mature",
            "percentage": 30.0
          }
        ]
      }
    },
    "assets_summary": {
      "total_count": 7,
      "active_count": 5,
      "exited_count": 2,
      "total_value": 1125000.00,
      "value_appreciation": 250000.00,
      "appreciation_percentage": 28.57
    },
    "transactions_summary": {
      "total_count": 14,
      "investment_count": 9,
      "distribution_count": 3,
      "exit_count": 2,
      "total_investment": 1125000.00,
      "total_distribution": 215000.00,
      "total_exit_value": 260000.00
    },
    "manager": {
      "id": "user456",
      "name": "Jean Dupont",
      "email": "jean.dupont@example.com",
      "phone": "+22500000000"
    },
    "documents": [
      {
        "id": "doc123",
        "type": "strategy",
        "name": "Strategie_Investissement.pdf",
        "uploaded_at": "2024-06-15T10:00:00.000Z"
      },
      {
        "id": "doc124",
        "type": "terms",
        "name": "Termes_et_Conditions.pdf",
        "uploaded_at": "2024-06-15T10:00:00.000Z"
      },
      {
        "id": "doc125",
        "type": "performance_report",
        "name": "Rapport_Performance_Q2_2025.pdf",
        "uploaded_at": "2025-07-15T09:00:00.000Z"
      }
    ],
    "bank_accounts": [
      {
        "id": "account123",
        "bank_name": "Banque Atlantique",
        "account_number": "****5678",
        "currency": "XOF",
        "balance": 850000.00
      }
    ],
    "created_at": "2024-06-15T10:00:00.000Z",
    "created_by": {
      "id": "user123",
      "name": "Marie Koné"
    },
    "updated_at": "2025-07-15T09:00:00.000Z"
  }
}
```

## Mettre à jour un portefeuille d'investissement

Modifie un portefeuille d'investissement existant.

**Endpoint** : `PUT /portfolio_inst/portfolios/investment/{portfolioId}`

**Paramètres de chemin** :
- `portfolioId` : Identifiant unique du portefeuille d'investissement

**Corps de la requête** :

```json
{
  "name": "Fonds Immobilier Commercial - Phase II",
  "description": "Portefeuille d'investissement dédié aux projets immobiliers commerciaux en phase d'expansion",
  "target_amount": 6000000.00,
  "target_return": 16.0,
  "target_sectors": ["real_estate", "commercial", "retail"],
  "risk_profile": "moderate",
  "investment_horizon": {
    "min": 4,
    "max": 6,
    "unit": "year"
  },
  "investment_criteria": {
    "min_investment_size": 150000.00,
    "max_investment_size": 1200000.00,
    "target_company_stages": ["growth", "mature", "expansion"],
    "geographical_focus": ["Abidjan", "Dakar", "Accra", "Lagos"]
  },
  "manager_id": "user789"
}
```

**Réponse réussie** (200 OK) :

```json
{
  "success": true,
  "message": "Portefeuille d'investissement mis à jour avec succès"
}
```

## Supprimer un portefeuille d'investissement

Supprime un portefeuille d'investissement (uniquement possible si le statut est "pending").

**Endpoint** : `DELETE /portfolio_inst/portfolios/investment/{portfolioId}`

**Paramètres de chemin** :
- `portfolioId` : Identifiant unique du portefeuille d'investissement

**Réponse réussie** (200 OK) :

```json
{
  "success": true,
  "message": "Portefeuille d'investissement supprimé avec succès"
}
```

## Métriques du portefeuille

Récupère des métriques détaillées pour un portefeuille d'investissement spécifique.

**Endpoint** : `GET /portfolio_inst/portfolios/investment/{portfolioId}/metrics`

**Paramètres de chemin** :
- `portfolioId` : Identifiant unique du portefeuille d'investissement

**Paramètres de requête** :
- `period` (optionnel) : Période pour les métriques (month, quarter, year, all) (défaut : all)
- `startDate` (optionnel) : Date de début pour les métriques personnalisées
- `endDate` (optionnel) : Date de fin pour les métriques personnalisées

**Réponse réussie** (200 OK) :

```json
{
  "success": true,
  "data": {
    "portfolio_id": "portfolio123",
    "period": "all",
    "start_date": "2024-06-20T00:00:00.000Z",
    "end_date": "2025-07-25T00:00:00.000Z",
    "performance": {
      "current_return": 16.8,
      "since_inception": 14.7,
      "current_year": 16.8,
      "IRR": 15.3,
      "MOIC": 1.2,
      "DPI": 0.42,
      "RVPI": 0.78,
      "TVPI": 1.2
    },
    "growth": {
      "portfolio_value_growth": 28.57,
      "year_over_year_growth": 16.8
    },
    "assets": {
      "total_count": 7,
      "active_count": 5,
      "exited_count": 2,
      "total_value": 1125000.00,
      "initial_value": 875000.00,
      "value_appreciation": 250000.00,
      "appreciation_percentage": 28.57,
      "asset_performance_distribution": [
        {
          "performance_range": "0-10%",
          "count": 1,
          "percentage": 14.29
        },
        {
          "performance_range": "10-20%",
          "count": 3,
          "percentage": 42.86
        },
        {
          "performance_range": "20-30%",
          "count": 2,
          "percentage": 28.57
        },
        {
          "performance_range": ">30%",
          "count": 1,
          "percentage": 14.29
        }
      ]
    },
    "transactions": {
      "total_count": 14,
      "investment_count": 9,
      "distribution_count": 3,
      "exit_count": 2,
      "total_investment": 1125000.00,
      "total_distribution": 215000.00,
      "total_exit_value": 260000.00,
      "transaction_volume_by_period": [
        {
          "period": "2024-Q3",
          "investment": 450000.00,
          "distribution": 0.00,
          "exit": 0.00
        },
        {
          "period": "2024-Q4",
          "investment": 325000.00,
          "distribution": 35000.00,
          "exit": 0.00
        },
        {
          "period": "2025-Q1",
          "investment": 200000.00,
          "distribution": 65000.00,
          "exit": 125000.00
        },
        {
          "period": "2025-Q2",
          "investment": 150000.00,
          "distribution": 115000.00,
          "exit": 135000.00
        }
      ]
    },
    "allocation": {
      "by_sector": [
        {
          "sector": "real_estate",
          "amount": 675000.00,
          "percentage": 60.0
        },
        {
          "sector": "commercial",
          "amount": 450000.00,
          "percentage": 40.0
        }
      ],
      "by_stage": [
        {
          "stage": "growth",
          "amount": 787500.00,
          "percentage": 70.0
        },
        {
          "stage": "mature",
          "amount": 337500.00,
          "percentage": 30.0
        }
      ],
      "by_geography": [
        {
          "location": "Abidjan",
          "amount": 562500.00,
          "percentage": 50.0
        },
        {
          "location": "Dakar",
          "amount": 337500.00,
          "percentage": 30.0
        },
        {
          "location": "Accra",
          "amount": 225000.00,
          "percentage": 20.0
        }
      ]
    }
  }
}
```

## Activer un portefeuille d'investissement

Active un portefeuille d'investissement en statut pending.

**Endpoint** : `POST /portfolio_inst/portfolios/investment/{portfolioId}/activate`

**Paramètres de chemin** :
- `portfolioId` : Identifiant unique du portefeuille d'investissement

**Corps de la requête** :

```json
{
  "activation_date": "2024-06-20T00:00:00.000Z",
  "initial_funding": 1000000.00,
  "funding_source": "institution",
  "notes": "Activation du portefeuille suite à l'approbation du comité d'investissement"
}
```

**Réponse réussie** (200 OK) :

```json
{
  "success": true,
  "message": "Portefeuille d'investissement activé avec succès",
  "data": {
    "portfolio_id": "portfolio123",
    "new_status": "active",
    "inception_date": "2024-06-20T00:00:00.000Z"
  }
}
```

## Clôturer la levée de fonds

Marque la fin de la période de levée de fonds pour un portefeuille d'investissement.

**Endpoint** : `POST /portfolio_inst/portfolios/investment/{portfolioId}/close-fundraising`

**Paramètres de chemin** :
- `portfolioId` : Identifiant unique du portefeuille d'investissement

**Corps de la requête** :

```json
{
  "closing_date": "2024-09-20T00:00:00.000Z",
  "final_amount": 4500000.00,
  "notes": "Clôture de la levée de fonds avec un montant final de 4.5M XOF"
}
```

**Réponse réussie** (200 OK) :

```json
{
  "success": true,
  "message": "Levée de fonds clôturée avec succès",
  "data": {
    "portfolio_id": "portfolio123",
    "target_amount": 5000000.00,
    "raised_amount": 4500000.00,
    "achievement_percentage": 90.0
  }
}
```

## Suspendre un portefeuille d'investissement

Suspend temporairement un portefeuille d'investissement actif.

**Endpoint** : `POST /portfolio_inst/portfolios/investment/{portfolioId}/suspend`

**Paramètres de chemin** :
- `portfolioId` : Identifiant unique du portefeuille d'investissement

**Corps de la requête** :

```json
{
  "suspension_date": "2025-01-15T00:00:00.000Z",
  "reason": "regulatory_review",
  "expected_reactivation_date": "2025-02-15T00:00:00.000Z",
  "notes": "Suspension temporaire pour revue réglementaire"
}
```

**Réponse réussie** (200 OK) :

```json
{
  "success": true,
  "message": "Portefeuille d'investissement suspendu",
  "data": {
    "portfolio_id": "portfolio123",
    "new_status": "inactive",
    "expected_reactivation_date": "2025-02-15T00:00:00.000Z"
  }
}
```

## Réactiver un portefeuille d'investissement

Réactive un portefeuille d'investissement suspendu.

**Endpoint** : `POST /portfolio_inst/portfolios/investment/{portfolioId}/reactivate`

**Paramètres de chemin** :
- `portfolioId` : Identifiant unique du portefeuille d'investissement

**Corps de la requête** :

```json
{
  "reactivation_date": "2025-02-10T00:00:00.000Z",
  "notes": "Réactivation suite à la confirmation de la conformité réglementaire"
}
```

**Réponse réussie** (200 OK) :

```json
{
  "success": true,
  "message": "Portefeuille d'investissement réactivé",
  "data": {
    "portfolio_id": "portfolio123",
    "new_status": "active"
  }
}
```

## Clôturer un portefeuille d'investissement

Clôture définitivement un portefeuille d'investissement.

**Endpoint** : `POST /portfolio_inst/portfolios/investment/{portfolioId}/close`

**Paramètres de chemin** :
- `portfolioId` : Identifiant unique du portefeuille d'investissement

**Corps de la requête** :

```json
{
  "closing_date": "2029-06-20T00:00:00.000Z",
  "final_performance": {
    "return": 17.2,
    "IRR": 16.8,
    "MOIC": 1.7
  },
  "final_distribution": 7650000.00,
  "notes": "Clôture du portefeuille après réalisation de tous les investissements et distribution des fonds aux investisseurs"
}
```

**Réponse réussie** (200 OK) :

```json
{
  "success": true,
  "message": "Portefeuille d'investissement clôturé",
  "data": {
    "portfolio_id": "portfolio123",
    "new_status": "archived",
    "final_performance": {
      "return": 17.2,
      "IRR": 16.8,
      "MOIC": 1.7
    },
    "life_span": {
      "years": 5,
      "months": 0,
      "days": 0
    }
  }
}
```

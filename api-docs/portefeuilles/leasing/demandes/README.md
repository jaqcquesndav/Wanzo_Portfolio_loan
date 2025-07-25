# Demandes de Leasing

Ce document décrit les endpoints pour la gestion des demandes de leasing d'équipements dans les portefeuilles de leasing.

## Liste des demandes

Récupère la liste des demandes de leasing avec pagination et filtrage.

**Endpoint** : `GET /portfolios/leasing/requests`

**Paramètres de requête** :
- `status` (optionnel) : Filtre par statut ('pending', 'approved', 'rejected', 'contract_created')
- `clientId` (optionnel) : Filtre par identifiant du client
- `equipmentType` (optionnel) : Filtre par type d'équipement
- `dateFrom` (optionnel) : Filtre par date de demande (début)
- `dateTo` (optionnel) : Filtre par date de demande (fin)

**Réponse réussie** (200 OK) :

```json
[
  {
    "id": "WL-00001",
    "equipment_id": "EQ-12345",
    "client_id": "CL-78901",
    "client_name": "Société Industrielle Alpha",
    "request_date": "2025-01-10T10:30:00Z",
    "requested_duration": 24,
    "contract_type": "standard",
    "monthly_budget": 1300,
    "maintenance_included": true,
    "insurance_included": true,
    "status": "contract_created",
    "status_date": "2025-01-12T14:30:00Z",
    "notes": "Client prioritaire, traitement urgent demandé",
    "technical_sheet_url": "/documents/technical-sheets/EQ-12345.pdf",
    "transaction_id": "TR-LR-25011000001",
    "contract_id": "LC-00001"
  },
  {
    "id": "WL-00002",
    "equipment_id": "EQ-67890",
    "client_id": "CL-12345",
    "client_name": "Entreprise Beta Tech",
    "request_date": "2025-01-28T14:45:00Z",
    "requested_duration": 18,
    "contract_type": "standard",
    "monthly_budget": 950,
    "maintenance_included": false,
    "insurance_included": true,
    "status": "approved",
    "status_date": "2025-01-30T09:20:00Z",
    "technical_sheet_url": "/documents/technical-sheets/EQ-67890.pdf",
    "transaction_id": "TR-LR-25012800002"
  }
]
```

## Détails d'une demande

Récupère les détails complets d'une demande spécifique.

**Endpoint** : `GET /portfolios/leasing/requests/{id}`

**Paramètres de chemin** :
- `id` : Identifiant unique de la demande

**Réponse réussie** (200 OK) :

```json
{
  "id": "WL-00001",
  "equipment_id": "EQ-12345",
  "client_id": "CL-78901",
  "client_name": "Société Industrielle Alpha",
  "request_date": "2025-01-10T10:30:00Z",
  "requested_duration": 24,
  "contract_type": "standard",
  "monthly_budget": 1300,
  "maintenance_included": true,
  "insurance_included": true,
  "status": "contract_created",
  "status_date": "2025-01-12T14:30:00Z",
  "notes": "Client prioritaire, traitement urgent demandé",
  "technical_sheet_url": "/documents/technical-sheets/EQ-12345.pdf",
  "transaction_id": "TR-LR-25011000001",
  "contract_id": "LC-00001"
}
```

## Création d'une demande

Crée une nouvelle demande de leasing.

**Endpoint** : `POST /portfolios/leasing/requests`

**Corps de la requête** :

```json
{
  "equipment_id": "EQ-67890",
  "client_id": "CL-12345",
  "client_name": "Entreprise Beta Tech",
  "requested_duration": 18,
  "contract_type": "standard",
  "monthly_budget": 950,
  "maintenance_included": false,
  "insurance_included": true,
  "notes": "Demande prioritaire pour projet en cours"
}
```

**Réponse réussie** (201 Created) :

```json
{
  "id": "WL-00005",
  "equipment_id": "EQ-67890",
  "client_id": "CL-12345",
  "client_name": "Entreprise Beta Tech",
  "request_date": "2025-07-25T13:45:00Z",
  "requested_duration": 18,
  "contract_type": "standard",
  "monthly_budget": 950,
  "maintenance_included": false,
  "insurance_included": true,
  "status": "pending",
  "status_date": "2025-07-25T13:45:00Z",
  "notes": "Demande prioritaire pour projet en cours"
}
```

## Mise à jour d'une demande

Met à jour une demande de leasing existante.

**Endpoint** : `PUT /portfolios/leasing/requests/{id}`

**Paramètres de chemin** :
- `id` : Identifiant unique de la demande

**Corps de la requête** :

```json
{
  "requested_duration": 24,
  "monthly_budget": 1100,
  "maintenance_included": true,
  "insurance_included": true,
  "notes": "Demande mise à jour avec nouvelles conditions"
}
```

**Réponse réussie** (200 OK) :

```json
{
  "id": "WL-00005",
  "equipment_id": "EQ-67890",
  "client_id": "CL-12345",
  "client_name": "Entreprise Beta Tech",
  "request_date": "2025-07-25T13:45:00Z",
  "requested_duration": 24,
  "contract_type": "standard",
  "monthly_budget": 1100,
  "maintenance_included": true,
  "insurance_included": true,
  "status": "pending",
  "status_date": "2025-07-25T13:45:00Z",
  "notes": "Demande mise à jour avec nouvelles conditions",
  "updated_at": "2025-07-25T15:20:00Z"
}
```

## Approbation d'une demande

Approuve une demande de leasing.

**Endpoint** : `POST /portfolios/leasing/requests/{id}/approve`

**Paramètres de chemin** :
- `id` : Identifiant unique de la demande

**Corps de la requête** :
```json
{}
```

**Réponse réussie** (200 OK) :

```json
{
  "id": "WL-00005",
  "equipment_id": "EQ-67890",
  "client_id": "CL-12345",
  "client_name": "Entreprise Beta Tech",
  "status": "approved",
  "status_date": "2025-07-25T16:05:00Z",
  "message": "La demande de leasing a été approuvée avec succès"
}
```

## Rejet d'une demande

Rejette une demande de leasing.

**Endpoint** : `POST /portfolios/leasing/requests/{id}/reject`

**Paramètres de chemin** :
- `id` : Identifiant unique de la demande

**Corps de la requête** :
```json
{
  "reason": "Budget mensuel insuffisant pour l'équipement demandé"
}
```

**Réponse réussie** (200 OK) :

```json
{
  "id": "WL-00005",
  "status": "rejected",
  "status_date": "2025-07-25T16:10:00Z",
  "rejectionReason": "Budget mensuel insuffisant pour l'équipement demandé",
  "message": "La demande de leasing a été rejetée"
}
```

## Annulation d'une demande

Annule une demande de leasing.

**Endpoint** : `POST /portfolios/leasing/requests/{id}/cancel`

**Paramètres de chemin** :
- `id` : Identifiant unique de la demande

**Corps de la requête** :
```json
{
  "reason": "Le client a décidé de ne pas poursuivre la demande"
}
```

**Réponse réussie** (200 OK) :

```json
{
  "id": "WL-00005",
  "status": "rejected",
  "status_date": "2025-07-25T16:30:00Z",
  "rejectionReason": "Le client a décidé de ne pas poursuivre la demande",
  "message": "La demande de leasing a été annulée"
}
```

## Statuts des demandes

Les demandes de leasing peuvent avoir les statuts suivants :

| Statut | Description |
|--------|-------------|
| `pending` | Demande en attente d'évaluation |
| `approved` | Demande approuvée, prête pour la création du contrat |
| `rejected` | Demande rejetée (inclut également les demandes annulées) |
| `contract_created` | Un contrat a été créé à partir de cette demande |
        "date": "2025-08-01T10:30:00.000Z",
        "user": {
          "id": "user-123",
          "name": "Alex Traoré"
        },
        "notes": "Création de la demande"
      },
      {
        "status": "submitted",
        "date": "2025-08-01T11:15:00.000Z",
        "user": {
          "id": "user-123",
          "name": "Alex Traoré"
        },
        "notes": "Demande soumise pour examen"
      },
      {
        "status": "under_review",
        "date": "2025-08-05T14:45:00.000Z",
        "user": {
          "id": "user-456",
          "name": "Fatou Diallo"
        },
        "notes": "Demande en cours d'examen par le comité de crédit"
      }
    ],
    "review": {
      "assigned_to": {
        "id": "user-456",
        "name": "Fatou Diallo",
        "position": "Analyste de crédit"
      },
      "started_at": "2025-08-05T14:45:00.000Z",
      "expected_completion": "2025-08-12T14:45:00.000Z",
      "credit_check": {
        "status": "in_progress",
        "scoring": null,
        "report_url": null
      },
      "client_visit": {
        "required": true,
        "scheduled_date": "2025-08-08T10:00:00.000Z",
        "status": "scheduled"
      },
      "equipment_verification": {
        "status": "pending",
        "verified_by": null,
        "verification_date": null
      },
      "committee_review": {
        "required": true,
        "scheduled_date": "2025-08-10T09:00:00.000Z",
        "status": "scheduled"
      }
    },
    "notes": [
      {
        "id": "note-123",
        "user": {
          "id": "user-123",
          "name": "Alex Traoré"
        },
        "date": "2025-08-01T11:20:00.000Z",
        "content": "Client existant avec bon historique de paiement sur deux contrats précédents."
      },
      {
        "id": "note-124",
        "user": {
          "id": "user-456",
          "name": "Fatou Diallo"
        },
        "date": "2025-08-05T15:30:00.000Z",
        "content": "Documents financiers vérifiés. Ratio d'endettement dans les limites acceptables."
      }
    ],
    "created_by": {
      "id": "user-123",
      "name": "Alex Traoré"
    },
    "created_at": "2025-08-01T10:30:00.000Z",
    "updated_at": "2025-08-05T15:30:00.000Z"
  }
}
```

## Créer une demande

Crée une nouvelle demande de leasing.

**Endpoint** : `POST /portfolio_inst/portfolios/leasing/{portfolioId}/requests`

**Paramètres de chemin** :
- `portfolioId` : Identifiant unique du portefeuille de leasing

**Corps de la requête** :

```json
{
  "client_id": "client-791",
  "equipment": {
    "type_id": "equip-type-458",
    "manufacturer_preference": "AgriTech",
    "model_preference": "TA750",
    "specifications": {
      "power": "75 kW",
      "weight": "4500 kg",
      "dimensions": "4.2m x 2.1m x 2.8m",
      "engine_type": "Diesel",
      "additional_features": [
        "Cabine climatisée",
        "Système GPS de guidage",
        "Attelage trois points catégorie II"
      ]
    },
    "usage": {
      "description": "Travaux agricoles (labour, semis, récolte)",
      "location": "Exploitation agricole à Yamoussoukro",
      "estimated_hours_per_week": 30,
      "environment": "Champs agricoles, terrains variés"
    },
    "quantity": 1,
    "new_equipment": true,
    "options": [
      {
        "name": "Ensemble d'accessoires",
        "description": "Kit complet d'accessoires agricoles",
        "cost": 2000000
      }
    ]
  },
  "financial": {
    "amount": 30000000,
    "currency": "XOF",
    "term_months": 24,
    "payment_frequency": "monthly",
    "initial_payment_percentage": 15,
    "insurance_required": true,
    "maintenance_included": true
  },
  "documents": [
    {
      "type": "equipment_quote",
      "name": "Devis Tracteur TA750",
      "file": "base64_encoded_file_content...",
      "description": "Devis détaillé du fournisseur AgriTech"
    }
  ],
  "notes": "Client exploitant agricole en pleine expansion. Projet d'extension des surfaces cultivées."
}
```

**Réponse réussie** (201 Created) :

```json
{
  "success": true,
  "message": "Demande créée avec succès",
  "data": {
    "id": "request-125",
    "reference": "LR-2025-125",
    "status": "draft",
    "client_id": "client-791",
    "client_name": "AgriBusiness SARL",
    "equipment_type": "Tracteur agricole",
    "amount": 30000000,
    "term_months": 24,
    "created_at": "2025-08-16T09:30:00.000Z",
    "documents": [
      {
        "id": "doc-460",
        "type": "equipment_quote",
        "name": "Devis Tracteur TA750",
        "upload_date": "2025-08-16T09:30:00.000Z",
        "file_url": "/documents/requests/request-125/QUOTE-TA750.pdf"
      }
    ]
  }
}
```

## Mettre à jour une demande

Modifie les informations d'une demande existante.

**Endpoint** : `PUT /portfolio_inst/portfolios/leasing/{portfolioId}/requests/{requestId}`

**Paramètres de chemin** :
- `portfolioId` : Identifiant unique du portefeuille de leasing
- `requestId` : Identifiant unique de la demande

**Corps de la requête** :

```json
{
  "equipment": {
    "manufacturer_preference": "AgriTech",
    "model_preference": "TA850",
    "specifications": {
      "power": "85 kW",
      "weight": "4800 kg",
      "dimensions": "4.3m x 2.2m x 2.9m",
      "engine_type": "Diesel",
      "additional_features": [
        "Cabine climatisée",
        "Système GPS de guidage avancé",
        "Attelage trois points catégorie II",
        "Système de télémétrie"
      ]
    },
    "options": [
      {
        "name": "Ensemble d'accessoires premium",
        "description": "Kit complet d'accessoires agricoles haut de gamme",
        "cost": 3000000
      },
      {
        "name": "Extension de garantie",
        "description": "Extension de garantie à 36 mois",
        "cost": 1500000
      }
    ]
  },
  "financial": {
    "amount": 35000000,
    "term_months": 24,
    "initial_payment_percentage": 10
  },
  "notes": "Client a révisé sa demande pour un modèle plus puissant suite à l'extension de son activité."
}
```

**Réponse réussie** (200 OK) :

```json
{
  "success": true,
  "message": "Demande mise à jour avec succès",
  "data": {
    "id": "request-125",
    "reference": "LR-2025-125",
    "status": "draft",
    "changes": {
      "equipment": {
        "model": {
          "from": "TA750",
          "to": "TA850"
        },
        "specifications": {
          "power": {
            "from": "75 kW",
            "to": "85 kW"
          }
        },
        "options": {
          "added": 1,
          "modified": 1
        }
      },
      "financial": {
        "amount": {
          "from": 30000000,
          "to": 35000000
        },
        "initial_payment_percentage": {
          "from": 15,
          "to": 10
        }
      }
    },
    "updated_at": "2025-08-16T11:45:00.000Z"
  }
}
```

## Soumettre une demande

Soumet une demande en état "draft" pour examen.

**Endpoint** : `POST /portfolio_inst/portfolios/leasing/{portfolioId}/requests/{requestId}/submit`

**Paramètres de chemin** :
- `portfolioId` : Identifiant unique du portefeuille de leasing
- `requestId` : Identifiant unique de la demande

**Corps de la requête** :

```json
{
  "submission_notes": "Tous les documents requis ont été fournis. Le client est en règle avec ses obligations fiscales et sociales.",
  "priority": "normal",
  "notify_client": true
}
```

**Réponse réussie** (200 OK) :

```json
{
  "success": true,
  "message": "Demande soumise avec succès",
  "data": {
    "id": "request-125",
    "reference": "LR-2025-125",
    "previous_status": "draft",
    "new_status": "submitted",
    "submitted_at": "2025-08-16T14:30:00.000Z",
    "submitted_by": {
      "id": "user-123",
      "name": "Alex Traoré"
    },
    "expected_review_start": "2025-08-19T00:00:00.000Z",
    "client_notification": {
      "sent_to": "finance@agribusiness.ci",
      "sent_at": "2025-08-16T14:35:00.000Z"
    }
  }
}
```

## Examiner une demande

Met à jour le statut d'examen d'une demande.

**Endpoint** : `POST /portfolio_inst/portfolios/leasing/{portfolioId}/requests/{requestId}/review`

**Paramètres de chemin** :
- `portfolioId` : Identifiant unique du portefeuille de leasing
- `requestId` : Identifiant unique de la demande

**Corps de la requête** :

```json
{
  "review_status": "under_review",
  "assigned_to": "user-456",
  "credit_check": {
    "status": "completed",
    "scoring": 82,
    "rating": "B+",
    "report_url": "/documents/credit/CREDIT-REP-125.pdf",
    "notes": "Bon historique de crédit. Ratio d'endettement acceptable."
  },
  "client_visit": {
    "status": "completed",
    "date": "2025-08-22T10:30:00.000Z",
    "conducted_by": "user-789",
    "report_url": "/documents/visits/VISIT-REP-125.pdf",
    "findings": "L'entreprise est bien établie. Les installations sont adaptées à l'équipement demandé."
  },
  "equipment_verification": {
    "status": "completed",
    "verified_by": "user-789",
    "verification_date": "2025-08-22T11:30:00.000Z",
    "notes": "L'équipement demandé correspond aux besoins réels de l'entreprise."
  },
  "additional_documents_required": [
    {
      "type": "business_plan",
      "description": "Plan d'affaires pour les 3 prochaines années",
      "reason": "Évaluation de la viabilité à long terme"
    }
  ],
  "notes": "La visite client a été positive. Quelques documents supplémentaires sont requis pour finaliser l'analyse."
}
```

**Réponse réussie** (200 OK) :

```json
{
  "success": true,
  "message": "Examen de la demande mis à jour avec succès",
  "data": {
    "id": "request-125",
    "reference": "LR-2025-125",
    "status": "under_review",
    "review_status": {
      "credit_check": "completed",
      "client_visit": "completed",
      "equipment_verification": "completed",
      "additional_documents": "requested",
      "committee_review": "pending"
    },
    "next_steps": [
      {
        "action": "document_request",
        "description": "Demander les documents supplémentaires au client",
        "due_date": "2025-08-26T00:00:00.000Z",
        "assigned_to": "user-456"
      },
      {
        "action": "committee_review",
        "description": "Planifier la revue par le comité de crédit",
        "due_date": "2025-08-30T00:00:00.000Z",
        "assigned_to": "user-456"
      }
    ],
    "document_requests": [
      {
        "id": "doc-req-123",
        "type": "business_plan",
        "description": "Plan d'affaires pour les 3 prochaines années",
        "status": "pending",
        "requested_at": "2025-08-23T09:30:00.000Z",
        "due_date": "2025-08-26T00:00:00.000Z"
      }
    ],
    "updated_at": "2025-08-23T09:30:00.000Z"
  }
}
```

## Approuver une demande

Approuve une demande de leasing.

**Endpoint** : `POST /portfolio_inst/portfolios/leasing/{portfolioId}/requests/{requestId}/approve`

**Paramètres de chemin** :
- `portfolioId` : Identifiant unique du portefeuille de leasing
- `requestId` : Identifiant unique de la demande

**Corps de la requête** :

```json
{
  "approved_by": "committee",
  "approval_date": "2025-08-30T10:00:00.000Z",
  "approved_terms": {
    "amount": 35000000,
    "term_months": 24,
    "interest_rate": 8.25,
    "initial_payment_percentage": 10,
    "initial_payment_amount": 3500000,
    "monthly_payment": 1500000,
    "payment_frequency": "monthly",
    "insurance_required": true,
    "insurance_details": {
      "type": "comprehensive",
      "annual_premium": 875000,
      "coverage": "Dommages matériels, vol, incendie, responsabilité civile"
    },
    "maintenance_included": true,
    "maintenance_details": {
      "level": "standard",
      "coverage": "Entretien préventif trimestriel, pièces d'usure incluses",
      "monthly_cost": 200000
    }
  },
  "conditions": [
    {
      "type": "document",
      "description": "Fourniture d'une attestation d'assurance avant livraison",
      "mandatory": true
    },
    {
      "type": "financial",
      "description": "Paiement initial de 10% avant signature du contrat",
      "mandatory": true
    },
    {
      "type": "operational",
      "description": "Formation des opérateurs lors de la livraison",
      "mandatory": false
    }
  ],
  "equipment_details": {
    "equipment_id": "equip-new-123",
    "manufacturer": "AgriTech",
    "model": "TA850",
    "year": 2025,
    "delivery_estimate": "2025-09-30T00:00:00.000Z"
  },
  "notes": "Demande approuvée par le comité de crédit. Le client présente un bon profil de risque et l'équipement correspond à ses besoins d'exploitation.",
  "generate_contract": true,
  "notify_client": true
}
```

**Réponse réussie** (200 OK) :

```json
{
  "success": true,
  "message": "Demande approuvée avec succès",
  "data": {
    "id": "request-125",
    "reference": "LR-2025-125",
    "previous_status": "under_review",
    "new_status": "approved",
    "approved_at": "2025-08-30T10:00:00.000Z",
    "approved_by": {
      "type": "committee",
      "user": {
        "id": "user-456",
        "name": "Fatou Diallo"
      }
    },
    "contract": {
      "id": "contract-460",
      "reference": "LEASE-2025-460",
      "status": "draft",
      "url": "/documents/contracts/LEASE-2025-460.pdf"
    },
    "client_notification": {
      "sent_to": "finance@agribusiness.ci",
      "sent_at": "2025-08-30T10:15:00.000Z"
    },
    "next_steps": [
      {
        "action": "contract_signing",
        "description": "Planifier la signature du contrat",
        "due_date": "2025-09-06T00:00:00.000Z",
        "assigned_to": "user-123"
      },
      {
        "action": "initial_payment",
        "description": "Recevoir le paiement initial",
        "due_date": "2025-09-06T00:00:00.000Z",
        "assigned_to": "user-123"
      },
      {
        "action": "equipment_order",
        "description": "Commander l'équipement auprès du fournisseur",
        "due_date": "2025-09-10T00:00:00.000Z",
        "assigned_to": "user-789"
      }
    ]
  }
}
```

## Rejeter une demande

Rejette une demande de leasing.

**Endpoint** : `POST /portfolio_inst/portfolios/leasing/{portfolioId}/requests/{requestId}/reject`

**Paramètres de chemin** :
- `portfolioId` : Identifiant unique du portefeuille de leasing
- `requestId` : Identifiant unique de la demande

**Corps de la requête** :

```json
{
  "rejected_by": "credit_officer",
  "rejection_date": "2025-08-30T10:00:00.000Z",
  "rejection_reasons": [
    {
      "type": "financial",
      "description": "Ratio d'endettement trop élevé"
    },
    {
      "type": "documentation",
      "description": "Documents financiers incomplets"
    },
    {
      "type": "risk",
      "description": "Historique de paiement insuffisant"
    }
  ],
  "alternative_offer": {
    "available": true,
    "description": "Possibilité de reconsidérer la demande avec un montant réduit et une période plus courte",
    "details": {
      "max_amount": 20000000,
      "max_term_months": 12,
      "required_initial_payment_percentage": 20
    }
  },
  "notes": "Le client présente un risque financier élevé en raison de son ratio d'endettement actuel. Une offre alternative à montant réduit pourrait être envisagée après amélioration de sa situation financière.",
  "notify_client": true
}
```

**Réponse réussie** (200 OK) :

```json
{
  "success": true,
  "message": "Demande rejetée",
  "data": {
    "id": "request-126",
    "reference": "LR-2025-126",
    "previous_status": "under_review",
    "new_status": "rejected",
    "rejected_at": "2025-08-30T10:00:00.000Z",
    "rejected_by": {
      "type": "credit_officer",
      "user": {
        "id": "user-456",
        "name": "Fatou Diallo"
      }
    },
    "client_notification": {
      "sent_to": "finance@client-example.ci",
      "sent_at": "2025-08-30T10:15:00.000Z"
    },
    "follow_up": {
      "scheduled": true,
      "date": "2025-09-30T00:00:00.000Z",
      "assigned_to": "user-123",
      "purpose": "Discuter des possibilités de restructuration de la demande"
    }
  }
}
```

## Annuler une demande

Annule une demande de leasing.

**Endpoint** : `POST /portfolio_inst/portfolios/leasing/{portfolioId}/requests/{requestId}/cancel`

**Paramètres de chemin** :
- `portfolioId` : Identifiant unique du portefeuille de leasing
- `requestId` : Identifiant unique de la demande

**Corps de la requête** :

```json
{
  "cancellation_date": "2025-08-25T15:30:00.000Z",
  "cancellation_reason": "client_request",
  "notes": "Le client a décidé de reporter son projet d'acquisition d'équipement",
  "cancelled_by": "client",
  "client_contact": {
    "name": "Jean Dupont",
    "position": "Directeur Général",
    "contact_method": "email",
    "contact_details": "j.dupont@industriesmetalliques.ci"
  }
}
```

**Réponse réussie** (200 OK) :

```json
{
  "success": true,
  "message": "Demande annulée avec succès",
  "data": {
    "id": "request-123",
    "reference": "LR-2025-123",
    "previous_status": "under_review",
    "new_status": "cancelled",
    "cancelled_at": "2025-08-25T15:30:00.000Z",
    "cancelled_by": {
      "type": "client",
      "details": "Jean Dupont, Directeur Général"
    },
    "reason": "client_request",
    "follow_up": {
      "scheduled": true,
      "date": "2025-10-25T00:00:00.000Z",
      "assigned_to": "user-123",
      "purpose": "Vérifier si le client souhaite réactiver sa demande"
    }
  }
}
```

## Ajouter un document à une demande

Ajoute un nouveau document à une demande existante.

**Endpoint** : `POST /portfolio_inst/portfolios/leasing/{portfolioId}/requests/{requestId}/documents`

**Paramètres de chemin** :
- `portfolioId` : Identifiant unique du portefeuille de leasing
- `requestId` : Identifiant unique de la demande

**Corps de la requête** :

```json
{
  "type": "business_plan",
  "name": "Plan d'affaires 2025-2027",
  "description": "Plan d'affaires détaillé pour les 3 prochaines années",
  "file": "base64_encoded_file_content...",
  "notes": "Document fourni suite à la demande de l'analyste de crédit"
}
```

**Réponse réussie** (201 Created) :

```json
{
  "success": true,
  "message": "Document ajouté avec succès",
  "data": {
    "id": "doc-461",
    "request_id": "request-125",
    "type": "business_plan",
    "name": "Plan d'affaires 2025-2027",
    "description": "Plan d'affaires détaillé pour les 3 prochaines années",
    "upload_date": "2025-08-26T09:45:00.000Z",
    "uploaded_by": {
      "id": "user-123",
      "name": "Alex Traoré"
    },
    "file_url": "/documents/requests/request-125/BUSINESS-PLAN-2025-2027.pdf",
    "document_request": {
      "id": "doc-req-123",
      "status": "fulfilled",
      "fulfilled_at": "2025-08-26T09:45:00.000Z"
    }
  }
}
```

## Ajouter une note à une demande

Ajoute une note à une demande existante.

**Endpoint** : `POST /portfolio_inst/portfolios/leasing/{portfolioId}/requests/{requestId}/notes`

**Paramètres de chemin** :
- `portfolioId` : Identifiant unique du portefeuille de leasing
- `requestId` : Identifiant unique de la demande

**Corps de la requête** :

```json
{
  "content": "Entretien téléphonique avec le client ce jour. Il a confirmé qu'il fournira les documents supplémentaires demandés d'ici la fin de la semaine.",
  "visibility": "internal",
  "notify_users": [
    "user-456",
    "user-789"
  ]
}
```

**Réponse réussie** (201 Created) :

```json
{
  "success": true,
  "message": "Note ajoutée avec succès",
  "data": {
    "id": "note-125",
    "request_id": "request-125",
    "content": "Entretien téléphonique avec le client ce jour. Il a confirmé qu'il fournira les documents supplémentaires demandés d'ici la fin de la semaine.",
    "created_at": "2025-08-24T11:30:00.000Z",
    "created_by": {
      "id": "user-123",
      "name": "Alex Traoré"
    },
    "visibility": "internal",
    "notifications": {
      "sent_to": [
        {
          "id": "user-456",
          "name": "Fatou Diallo"
        },
        {
          "id": "user-789",
          "name": "Mohamed Koné"
        }
      ],
      "sent_at": "2025-08-24T11:30:00.000Z"
    }
  }
}
```

## Générer un rapport de demandes

Génère un rapport sur les demandes du portefeuille.

**Endpoint** : `GET /portfolio_inst/portfolios/leasing/{portfolioId}/requests/report`

**Paramètres de chemin** :
- `portfolioId` : Identifiant unique du portefeuille de leasing

**Paramètres de requête** :
- `startDate` (optionnel) : Date de début de la période
- `endDate` (optionnel) : Date de fin de la période
- `reportType` (optionnel) : Type de rapport (request_status, approval_rate, processing_time, equipment_type, all)
- `groupBy` (optionnel) : Regroupement (day, week, month, quarter, equipment_type, client_sector, status)
- `format` (optionnel) : Format du rapport (json, csv, pdf, excel). Défaut : json

**Réponse réussie** (200 OK) :

Si format=json :
```json
{
  "success": true,
  "data": {
    "report_type": "request_status",
    "period": {
      "start_date": "2025-01-01T00:00:00.000Z",
      "end_date": "2025-07-31T23:59:59.999Z"
    },
    "summary": {
      "total_requests": 120,
      "by_status": {
        "draft": 12,
        "submitted": 15,
        "under_review": 23,
        "approved": 52,
        "rejected": 10,
        "cancelled": 8
      },
      "approval_rate": 83.9,
      "rejection_rate": 16.1,
      "average_processing_time": {
        "submission_to_review": 2.5,
        "review_to_decision": 7.3,
        "total_time": 9.8
      },
      "total_requested_amount": 3750000000,
      "total_approved_amount": 2950000000
    },
    "monthly_trends": [
      {
        "month": "2025-01",
        "total": 15,
        "draft": 0,
        "submitted": 0,
        "under_review": 0,
        "approved": 12,
        "rejected": 2,
        "cancelled": 1,
        "approval_rate": 85.7,
        "amount_requested": 450000000,
        "amount_approved": 380000000
      },
      {
        "month": "2025-02",
        "total": 18,
        "draft": 0,
        "submitted": 0,
        "under_review": 1,
        "approved": 13,
        "rejected": 3,
        "cancelled": 1,
        "approval_rate": 81.3,
        "amount_requested": 520000000,
        "amount_approved": 420000000
      },
      {
        "month": "2025-03",
        "total": 20,
        "draft": 0,
        "submitted": 1,
        "under_review": 2,
        "approved": 15,
        "rejected": 1,
        "cancelled": 1,
        "approval_rate": 93.8,
        "amount_requested": 580000000,
        "amount_approved": 490000000
      },
      {
        "month": "2025-04",
        "total": 16,
        "draft": 0,
        "submitted": 2,
        "under_review": 3,
        "approved": 9,
        "rejected": 1,
        "cancelled": 1,
        "approval_rate": 90.0,
        "amount_requested": 490000000,
        "amount_approved": 420000000
      },
      {
        "month": "2025-05",
        "total": 18,
        "draft": 2,
        "submitted": 3,
        "under_review": 5,
        "approved": 6,
        "rejected": 1,
        "cancelled": 1,
        "approval_rate": 85.7,
        "amount_requested": 550000000,
        "amount_approved": 450000000
      },
      {
        "month": "2025-06",
        "total": 16,
        "draft": 3,
        "submitted": 4,
        "under_review": 5,
        "approved": 2,
        "rejected": 1,
        "cancelled": 1,
        "approval_rate": 66.7,
        "amount_requested": 580000000,
        "amount_approved": 390000000
      },
      {
        "month": "2025-07",
        "total": 17,
        "draft": 7,
        "submitted": 5,
        "under_review": 3,
        "approved": 0,
        "rejected": 1,
        "cancelled": 1,
        "approval_rate": 0.0,
        "amount_requested": 580000000,
        "amount_approved": 0
      }
    ],
    "equipment_types": [
      {
        "type": "construction",
        "total": 45,
        "approved": 22,
        "rejected": 3,
        "pending": 20,
        "approval_rate": 88.0,
        "amount_requested": 1500000000,
        "amount_approved": 1200000000,
        "average_amount": 33333333
      },
      {
        "type": "logistics",
        "total": 38,
        "approved": 16,
        "rejected": 4,
        "pending": 18,
        "approval_rate": 80.0,
        "amount_requested": 950000000,
        "amount_approved": 750000000,
        "average_amount": 25000000
      },
      {
        "type": "agriculture",
        "total": 37,
        "approved": 14,
        "rejected": 3,
        "pending": 20,
        "approval_rate": 82.4,
        "amount_requested": 1300000000,
        "amount_approved": 1000000000,
        "average_amount": 35135135
      }
    ],
    "rejection_reasons": [
      {
        "reason": "financial",
        "count": 6,
        "percentage": 60.0
      },
      {
        "reason": "documentation",
        "count": 2,
        "percentage": 20.0
      },
      {
        "reason": "risk",
        "count": 2,
        "percentage": 20.0
      }
    ],
    "recommendations": [
      {
        "type": "process_optimization",
        "description": "Réduire le temps de traitement des demandes en automatisant certaines vérifications"
      },
      {
        "type": "documentation",
        "description": "Améliorer la clarté des exigences documentaires pour réduire les rejets liés à une documentation incomplète"
      }
    ],
    "generated_at": "2025-08-16T16:00:00.000Z",
    "generated_by": "user-456"
  }
}
```

Si format=csv, format=pdf ou format=excel :
```
Content-Type: application/csv, application/pdf ou application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
Content-Disposition: attachment; filename="leasing_requests_report_20250101_20250731.csv"

[Contenu binaire du fichier]
```

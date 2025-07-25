# Transactions d'Investissement

Ce document décrit les endpoints pour la gestion des transactions d'investissement dans le cadre des portefeuilles d'investissement.

## Liste des transactions d'investissement

Récupère la liste des transactions d'investissement pour un portefeuille d'investissement spécifique.

**Endpoint** : `GET /portfolio_inst/portfolios/investment/{portfolioId}/transactions`

**Paramètres de chemin** :
- `portfolioId` : Identifiant unique du portefeuille d'investissement

**Paramètres de requête** :
- `page` (optionnel) : Numéro de la page (défaut : 1)
- `limit` (optionnel) : Nombre d'éléments par page (défaut : 10, max : 100)
- `type` (optionnel) : Filtre par type de transaction (prise de participation, complément, dividende, cession)
- `status` (optionnel) : Filtre par statut (effectué, prévu, annulé)
- `companyId` (optionnel) : Filtre par identifiant de société
- `dateFrom` (optionnel) : Filtre par date de transaction (début)
- `dateTo` (optionnel) : Filtre par date de transaction (fin)
- `search` (optionnel) : Recherche textuelle (référence, nom de la société)
- `sortBy` (optionnel) : Trier par (date, company_name, amount, type)
- `sortOrder` (optionnel) : Ordre de tri (asc, desc)

**Réponse réussie** (200 OK) :

```json
{
  "success": true,
  "data": [
    {
      "id": "transaction123",
      "reference": "INVEST-TRX-20250415-0123",
      "portfolio_id": "portfolio123",
      "company_id": "company456",
      "company_name": "GreenEnergy SARL",
      "request_id": "request789",
      "type": "prise de participation",
      "amount": 225000.00,
      "currency": "XOF",
      "date": "2025-04-15T00:00:00.000Z",
      "status": "effectué",
      "created_at": "2025-04-15T14:30:00.000Z"
    },
    {
      "id": "transaction124",
      "reference": "INVEST-TRX-20250620-0124",
      "portfolio_id": "portfolio123",
      "company_id": "company456",
      "company_name": "GreenEnergy SARL",
      "type": "dividende",
      "amount": 11250.00,
      "currency": "XOF",
      "date": "2025-06-20T00:00:00.000Z",
      "status": "effectué",
      "created_at": "2025-06-20T09:45:00.000Z"
    }
  ],
  "meta": {
    "total": 14,
    "page": 1,
    "limit": 10,
    "totalPages": 2
  }
}
```

## Création d'une transaction d'investissement

Crée une nouvelle transaction d'investissement pour un portefeuille d'investissement.

**Endpoint** : `POST /portfolio_inst/portfolios/investment/{portfolioId}/transactions`

**Paramètres de chemin** :
- `portfolioId` : Identifiant unique du portefeuille d'investissement

**Corps de la requête** :

```json
{
  "company_id": "company456",
  "request_id": "request789",
  "type": "prise de participation",
  "amount": 225000.00,
  "currency": "XOF",
  "date": "2025-04-15T00:00:00.000Z",
  "details": {
    "ownership_percentage": 15.0,
    "shares_acquired": 1500,
    "price_per_share": 150.00,
    "valuation": 1500000.00,
    "investment_stage": "developpement",
    "asset_id": "asset123"
  },
  "payment_details": {
    "method": "bank_transfer",
    "bank_account_id": "account123",
    "recipient": {
      "name": "GreenEnergy SARL",
      "bank_name": "Banque Atlantique",
      "account_number": "****1234"
    },
    "reference": "WIRE-20250415-0123"
  },
  "documents": [
    {
      "type": "investment_agreement",
      "file_id": "file123",
      "name": "Contrat_Investissement.pdf"
    },
    {
      "type": "payment_proof",
      "file_id": "file124",
      "name": "Preuve_Virement.pdf"
    }
  ],
  "notes": "Prise de participation initiale suite à l'approbation de la demande d'investissement"
}
```

**Réponse réussie** (201 Created) :

```json
{
  "success": true,
  "data": {
    "id": "transaction123",
    "reference": "INVEST-TRX-20250415-0123",
    "status": "effectué",
    "message": "Transaction d'investissement créée avec succès",
    "asset_id": "asset123"
  }
}
```

## Détails d'une transaction d'investissement

Récupère les détails complets d'une transaction d'investissement spécifique.

**Endpoint** : `GET /portfolio_inst/portfolios/investment/{portfolioId}/transactions/{transactionId}`

**Paramètres de chemin** :
- `portfolioId` : Identifiant unique du portefeuille d'investissement
- `transactionId` : Identifiant unique de la transaction d'investissement

**Réponse réussie** (200 OK) :

```json
{
  "success": true,
  "data": {
    "id": "transaction123",
    "reference": "INVEST-TRX-20250415-0123",
    "portfolio_id": "portfolio123",
    "company": {
      "id": "company456",
      "name": "GreenEnergy SARL",
      "type": "company",
      "sector": "energy",
      "stage": "growth",
      "contact": {
        "name": "Marie Diallo",
        "title": "Directrice Générale",
        "phone": "+22500000000",
        "email": "marie@greenenergy.com"
      }
    },
    "request": {
      "id": "request789",
      "reference": "INVEST-REQ-20250315-0123",
      "amount_requested": 225000.00,
      "status": "acceptée"
    },
    "type": "prise de participation",
    "amount": 225000.00,
    "currency": "XOF",
    "date": "2025-04-15T00:00:00.000Z",
    "details": {
      "ownership_percentage": 15.0,
      "shares_acquired": 1500,
      "price_per_share": 150.00,
      "valuation": 1500000.00,
      "investment_stage": "developpement",
      "asset_id": "asset123"
    },
    "payment_details": {
      "method": "bank_transfer",
      "bank_account_id": "account123",
      "bank_account": {
        "bank_name": "Banque Atlantique",
        "account_number": "****5678"
      },
      "recipient": {
        "name": "GreenEnergy SARL",
        "bank_name": "Banque Atlantique",
        "account_number": "****1234"
      },
      "reference": "WIRE-20250415-0123",
      "execution_date": "2025-04-15T14:25:00.000Z",
      "processed_by": {
        "id": "user456",
        "name": "Jean Dupont"
      }
    },
    "status": "effectué",
    "documents": [
      {
        "id": "doc123",
        "type": "investment_agreement",
        "name": "Contrat_Investissement.pdf",
        "uploaded_at": "2025-04-15T14:30:00.000Z"
      },
      {
        "id": "doc124",
        "type": "payment_proof",
        "name": "Preuve_Virement.pdf",
        "uploaded_at": "2025-04-15T14:30:00.000Z"
      }
    ],
    "notes": "Prise de participation initiale suite à l'approbation de la demande d'investissement",
    "created_at": "2025-04-15T14:30:00.000Z",
    "created_by": {
      "id": "user456",
      "name": "Jean Dupont"
    },
    "updated_at": "2025-04-15T14:30:00.000Z"
  }
}
```

## Enregistrer une transaction de dividende

Enregistre une transaction de dividende pour un actif d'investissement.

**Endpoint** : `POST /portfolio_inst/portfolios/investment/{portfolioId}/transactions/dividend`

**Paramètres de chemin** :
- `portfolioId` : Identifiant unique du portefeuille d'investissement

**Corps de la requête** :

```json
{
  "company_id": "company456",
  "asset_id": "asset123",
  "amount": 11250.00,
  "currency": "XOF",
  "date": "2025-06-20T00:00:00.000Z",
  "details": {
    "dividend_type": "regular",
    "dividend_period": "Q2-2025",
    "dividend_per_share": 7.50,
    "shares_owned": 1500,
    "gross_amount": 11250.00,
    "withholding_tax": {
      "rate": 10.0,
      "amount": 1125.00
    },
    "net_amount": 10125.00
  },
  "payment_details": {
    "method": "bank_transfer",
    "bank_account_id": "account123",
    "sender": {
      "name": "GreenEnergy SARL",
      "bank_name": "Banque Atlantique",
      "account_number": "****1234"
    },
    "reference": "DIV-20250620-0124"
  },
  "documents": [
    {
      "type": "dividend_notice",
      "file_id": "file125",
      "name": "Avis_Dividende.pdf"
    },
    {
      "type": "payment_proof",
      "file_id": "file126",
      "name": "Preuve_Virement_Dividende.pdf"
    }
  ],
  "notes": "Distribution de dividendes pour le deuxième trimestre 2025"
}
```

**Réponse réussie** (201 Created) :

```json
{
  "success": true,
  "data": {
    "id": "transaction124",
    "reference": "INVEST-TRX-20250620-0124",
    "status": "effectué",
    "message": "Transaction de dividende créée avec succès",
    "asset": {
      "id": "asset123",
      "total_distributions": 11250.00
    }
  }
}
```

## Enregistrer une transaction de cession

Enregistre une transaction de cession (vente) d'un actif d'investissement.

**Endpoint** : `POST /portfolio_inst/portfolios/investment/{portfolioId}/transactions/exit`

**Paramètres de chemin** :
- `portfolioId` : Identifiant unique du portefeuille d'investissement

**Corps de la requête** :

```json
{
  "company_id": "company456",
  "asset_id": "asset123",
  "amount": 270000.00,
  "currency": "XOF",
  "date": "2027-04-15T00:00:00.000Z",
  "type": "cession",
  "details": {
    "exit_type": "strategic_sale",
    "buyer": {
      "name": "EnergieTech SA",
      "type": "corporate"
    },
    "shares_sold": 1500,
    "price_per_share": 180.00,
    "initial_investment": 225000.00,
    "holding_period": {
      "years": 2,
      "months": 0,
      "days": 0
    },
    "total_dividends_received": 45000.00,
    "total_return": 90000.00,
    "return_percentage": 40.0,
    "irr": 18.3
  },
  "payment_details": {
    "method": "bank_transfer",
    "bank_account_id": "account123",
    "sender": {
      "name": "EnergieTech SA",
      "bank_name": "Banque Internationale",
      "account_number": "****5678"
    },
    "reference": "EXIT-20270415-0125"
  },
  "documents": [
    {
      "type": "sale_agreement",
      "file_id": "file127",
      "name": "Contrat_Cession.pdf"
    },
    {
      "type": "payment_proof",
      "file_id": "file128",
      "name": "Preuve_Virement_Cession.pdf"
    }
  ],
  "notes": "Cession stratégique de notre participation avec un rendement supérieur aux attentes"
}
```

**Réponse réussie** (201 Created) :

```json
{
  "success": true,
  "data": {
    "id": "transaction125",
    "reference": "INVEST-TRX-20270415-0125",
    "status": "effectué",
    "message": "Transaction de cession créée avec succès",
    "asset": {
      "id": "asset123",
      "new_status": "exited",
      "exit_summary": {
        "initial_investment": 225000.00,
        "exit_value": 270000.00,
        "dividends_received": 45000.00,
        "total_return": 90000.00,
        "return_percentage": 40.0,
        "irr": 18.3
      }
    },
    "portfolio_impact": {
      "contribution_to_portfolio_return": 2.0
    }
  }
}
```

## Enregistrer un investissement complémentaire

Enregistre une transaction d'investissement complémentaire pour un actif existant.

**Endpoint** : `POST /portfolio_inst/portfolios/investment/{portfolioId}/transactions/follow-on`

**Paramètres de chemin** :
- `portfolioId` : Identifiant unique du portefeuille d'investissement

**Corps de la requête** :

```json
{
  "company_id": "company456",
  "asset_id": "asset123",
  "amount": 75000.00,
  "currency": "XOF",
  "date": "2026-03-15T00:00:00.000Z",
  "type": "complément",
  "details": {
    "round_name": "Series B",
    "additional_shares": 500,
    "price_per_share": 150.00,
    "new_ownership_percentage": 18.0,
    "pre_money_valuation": 1950000.00,
    "rationale": "Financement de l'expansion internationale"
  },
  "payment_details": {
    "method": "bank_transfer",
    "bank_account_id": "account123",
    "recipient": {
      "name": "GreenEnergy SARL",
      "bank_name": "Banque Atlantique",
      "account_number": "****1234"
    },
    "reference": "WIRE-20260315-0126"
  },
  "documents": [
    {
      "type": "investment_agreement",
      "file_id": "file129",
      "name": "Contrat_Investissement_Complementaire.pdf"
    },
    {
      "type": "payment_proof",
      "file_id": "file130",
      "name": "Preuve_Virement_Complement.pdf"
    }
  ],
  "notes": "Investissement complémentaire pour soutenir l'expansion internationale de l'entreprise"
}
```

**Réponse réussie** (201 Created) :

```json
{
  "success": true,
  "data": {
    "id": "transaction126",
    "reference": "INVEST-TRX-20260315-0126",
    "status": "effectué",
    "message": "Transaction d'investissement complémentaire créée avec succès",
    "asset": {
      "id": "asset123",
      "updated_investment": 300000.00,
      "updated_shares": 2000,
      "updated_ownership_percentage": 18.0
    }
  }
}
```

## Annuler une transaction planifiée

Annule une transaction d'investissement planifiée mais non exécutée.

**Endpoint** : `POST /portfolio_inst/portfolios/investment/{portfolioId}/transactions/{transactionId}/cancel`

**Paramètres de chemin** :
- `portfolioId` : Identifiant unique du portefeuille d'investissement
- `transactionId` : Identifiant unique de la transaction d'investissement

**Corps de la requête** :

```json
{
  "cancellation_date": "2025-04-10T00:00:00.000Z",
  "reason": "investment_committee_decision",
  "detailed_reason": "Révision de la stratégie d'investissement du portefeuille",
  "cancellation_notes": "Annulation décidée lors de la réunion du comité d'investissement du 10/04/2025"
}
```

**Réponse réussie** (200 OK) :

```json
{
  "success": true,
  "message": "Transaction d'investissement annulée avec succès",
  "data": {
    "transaction_id": "transaction127",
    "new_status": "annulé"
  }
}
```

## Ajouter un document à une transaction

Ajoute un nouveau document à une transaction d'investissement existante.

**Endpoint** : `POST /portfolio_inst/portfolios/investment/{portfolioId}/transactions/{transactionId}/documents`

**Paramètres de chemin** :
- `portfolioId` : Identifiant unique du portefeuille d'investissement
- `transactionId` : Identifiant unique de la transaction d'investissement

**Corps de la requête** :

```json
{
  "type": "shareholder_agreement",
  "file_id": "file131",
  "name": "Pacte_Actionnaires.pdf",
  "description": "Pacte d'actionnaires signé par toutes les parties",
  "category": "legal"
}
```

**Réponse réussie** (201 Created) :

```json
{
  "success": true,
  "message": "Document ajouté à la transaction avec succès",
  "data": {
    "document_id": "doc125"
  }
}
```

# Paiements de Leasing

Ce document décrit les endpoints pour la gestion des paiements dans le cadre des portefeuilles de leasing.

## Liste des paiements

Récupère la liste des paiements avec filtrage.

**Endpoint** : `GET /portfolios/leasing/payments`

**Paramètres de requête** :
- `portfolioId` (optionnel) : Filtre par identifiant du portefeuille
- `contractId` (optionnel) : Filtre par identifiant du contrat
- `clientId` (optionnel) : Filtre par identifiant du client
- `status` (optionnel) : Filtre par statut ('pending', 'paid', 'overdue', 'cancelled')
- `dateFrom` (optionnel) : Filtre par date (début)
- `dateTo` (optionnel) : Filtre par date (fin)

**Réponse réussie** (200 OK) :
```json
[
  {
    "id": "payment-123",
    "portfolio_id": "portfolio-123",
    "contract_id": "contract-456",
    "date": "2025-07-15T10:30:00.000Z",
    "amount": 25000,
    "type": "rent",
    "status": "paid",
    "created_at": "2025-07-15T10:30:00.000Z",
    "updated_at": "2025-07-15T10:30:00.000Z"
  },
  {
    "id": "payment-124",
    "portfolio_id": "portfolio-123",
    "contract_id": "contract-456",
    "date": "2025-08-15T10:30:00.000Z",
    "amount": 25000,
    "type": "rent",
    "status": "pending",
    "created_at": "2025-07-15T10:30:00.000Z",
    "updated_at": "2025-07-15T10:30:00.000Z"
  }
]
```

## Détails d'un paiement

Récupère les détails d'un paiement spécifique.

**Endpoint** : `GET /portfolios/leasing/payments/{id}`

**Paramètres de chemin** :
- `id` : Identifiant unique du paiement

**Réponse réussie** (200 OK) :
```json
{
  "id": "payment-123",
  "portfolio_id": "portfolio-123",
  "contract_id": "contract-456",
  "date": "2025-07-15T10:30:00.000Z",
  "amount": 25000,
  "type": "rent",
  "status": "paid",
  "created_at": "2025-07-15T10:30:00.000Z",
  "updated_at": "2025-07-15T10:30:00.000Z"
}
```

## Créer une facture

Crée une nouvelle facture pour un contrat de leasing.

**Endpoint** : `POST /portfolios/leasing/contracts/{contractId}/invoices`

**Paramètres de chemin** :
- `contractId` : Identifiant unique du contrat

**Corps de la requête** :
```json
{
  "amount": 25000,
  "dueDate": "2025-08-15T00:00:00.000Z",
  "description": "Loyer mensuel - Août 2025",
  "period": {
    "from": "2025-08-01T00:00:00.000Z",
    "to": "2025-08-31T23:59:59.000Z"
  }
}
```

**Réponse réussie** (201 Created) :
```json
{
  "id": "invoice-123",
  "contract_id": "contract-456",
  "amount": 25000,
  "due_date": "2025-08-15T00:00:00.000Z",
  "description": "Loyer mensuel - Août 2025",
  "period": {
    "from": "2025-08-01T00:00:00.000Z",
    "to": "2025-08-31T23:59:59.000Z"
  },
  "status": "pending",
  "created_at": "2025-07-25T14:30:00.000Z",
  "updated_at": "2025-07-25T14:30:00.000Z"
}
```

## Récupérer les factures d'un contrat

Récupère la liste des factures pour un contrat spécifique.

**Endpoint** : `GET /portfolios/leasing/contracts/{contractId}/invoices`

**Paramètres de chemin** :
- `contractId` : Identifiant unique du contrat

**Paramètres de requête** :
- `status` (optionnel) : Filtre par statut ('pending', 'paid', 'overdue', 'cancelled')

**Réponse réussie** (200 OK) :
```json
[
  {
    "id": "invoice-123",
    "contract_id": "contract-456",
    "amount": 25000,
    "due_date": "2025-08-15T00:00:00.000Z",
    "description": "Loyer mensuel - Août 2025",
    "period": {
      "from": "2025-08-01T00:00:00.000Z",
      "to": "2025-08-31T23:59:59.000Z"
    },
    "status": "pending",
    "created_at": "2025-07-25T14:30:00.000Z",
    "updated_at": "2025-07-25T14:30:00.000Z"
  },
  {
    "id": "invoice-122",
    "contract_id": "contract-456",
    "amount": 25000,
    "due_date": "2025-07-15T00:00:00.000Z",
    "description": "Loyer mensuel - Juillet 2025",
    "period": {
      "from": "2025-07-01T00:00:00.000Z",
      "to": "2025-07-31T23:59:59.000Z"
    },
    "status": "paid",
    "payment": {
      "id": "payment-123",
      "date": "2025-07-15T10:30:00.000Z",
      "amount": 25000,
      "method": "bank_transfer"
    },
    "created_at": "2025-06-25T14:30:00.000Z",
    "updated_at": "2025-07-15T10:30:00.000Z"
  }
]
```

## Enregistrer un paiement pour une facture

Enregistre un paiement pour une facture spécifique.

**Endpoint** : `POST /portfolios/leasing/invoices/{invoiceId}/payments`

**Paramètres de chemin** :
- `invoiceId` : Identifiant unique de la facture

**Corps de la requête** :
```json
{
  "amount": 25000,
  "date": "2025-07-15T10:30:00.000Z",
  "method": "bank_transfer",
  "reference": "VIRT-123456789",
  "notes": "Paiement reçu par virement bancaire"
}
```

**Réponse réussie** (201 Created) :
```json
{
  "id": "payment-123",
  "invoice_id": "invoice-122",
  "amount": 25000,
  "date": "2025-07-15T10:30:00.000Z",
  "method": "bank_transfer",
  "reference": "VIRT-123456789",
  "notes": "Paiement reçu par virement bancaire",
  "created_at": "2025-07-15T10:30:00.000Z",
  "updated_at": "2025-07-15T10:30:00.000Z"
}
```

## Annuler une facture

Annule une facture existante.

**Endpoint** : `POST /portfolios/leasing/invoices/{invoiceId}/cancel`

**Paramètres de chemin** :
- `invoiceId` : Identifiant unique de la facture

**Corps de la requête** :
```json
{
  "reason": "Erreur de facturation - montant incorrect"
}
```

**Réponse réussie** (200 OK) :
```json
{
  "id": "invoice-123",
  "contract_id": "contract-456",
  "amount": 25000,
  "due_date": "2025-08-15T00:00:00.000Z",
  "description": "Loyer mensuel - Août 2025",
  "period": {
    "from": "2025-08-01T00:00:00.000Z",
    "to": "2025-08-31T23:59:59.000Z"
  },
  "status": "cancelled",
  "cancellation": {
    "date": "2025-07-25T15:45:00.000Z",
    "reason": "Erreur de facturation - montant incorrect"
  },
  "created_at": "2025-07-25T14:30:00.000Z",
  "updated_at": "2025-07-25T15:45:00.000Z"
}
```

## Générer un rapport de paiements

Génère un rapport de paiements selon les filtres spécifiés.

**Endpoint** : `POST /portfolios/leasing/payments/reports`

**Corps de la requête** :
```json
{
  "portfolioId": "portfolio-123",
  "dateFrom": "2025-01-01T00:00:00.000Z",
  "dateTo": "2025-07-31T23:59:59.000Z",
  "groupBy": "month"
}
```

**Réponse réussie** (200 OK) :
```json
{
  "report_id": "report-123",
  "generated_at": "2025-07-25T16:00:00.000Z",
  "filters": {
    "portfolioId": "portfolio-123",
    "dateFrom": "2025-01-01T00:00:00.000Z",
    "dateTo": "2025-07-31T23:59:59.000Z",
    "groupBy": "month"
  },
  "data": [
    {
      "period": "2025-01",
      "total_amount": 250000,
      "paid_amount": 250000,
      "pending_amount": 0,
      "overdue_amount": 0,
      "count": 10
    },
    {
      "period": "2025-02",
      "total_amount": 250000,
      "paid_amount": 250000,
      "pending_amount": 0,
      "overdue_amount": 0,
      "count": 10
    },
    {
      "period": "2025-03",
      "total_amount": 250000,
      "paid_amount": 250000,
      "pending_amount": 0,
      "overdue_amount": 0,
      "count": 10
    },
    {
      "period": "2025-04",
      "total_amount": 250000,
      "paid_amount": 250000,
      "pending_amount": 0,
      "overdue_amount": 0,
      "count": 10
    },
    {
      "period": "2025-05",
      "total_amount": 250000,
      "paid_amount": 250000,
      "pending_amount": 0,
      "overdue_amount": 0,
      "count": 10
    },
    {
      "period": "2025-06",
      "total_amount": 250000,
      "paid_amount": 250000,
      "pending_amount": 0,
      "overdue_amount": 0,
      "count": 10
    },
    {
      "period": "2025-07",
      "total_amount": 250000,
      "paid_amount": 200000,
      "pending_amount": 50000,
      "overdue_amount": 0,
      "count": 10
    }
  ],
  "summary": {
    "total_amount": 1750000,
    "paid_amount": 1700000,
    "pending_amount": 50000,
    "overdue_amount": 0,
    "count": 70
  }
}
```

## Statistiques de paiement

Récupère les statistiques de paiement pour un portefeuille.

**Endpoint** : `GET /portfolios/leasing/{portfolioId}/payment-stats`

**Paramètres de chemin** :
- `portfolioId` : Identifiant unique du portefeuille

**Paramètres de requête** :
- `period` : Période d'analyse ('month', 'quarter', 'year')

**Réponse réussie** (200 OK) :
```json
{
  "portfolio_id": "portfolio-123",
  "period": "month",
  "stats": {
    "total_invoiced": 250000,
    "total_paid": 200000,
    "total_pending": 50000,
    "total_overdue": 0,
    "payment_rate": 80,
    "average_delay_days": 0,
    "payment_methods_distribution": {
      "bank_transfer": 70,
      "mobile_money": 20,
      "check": 10,
      "cash": 0
    }
  },
  "trends": {
    "payment_rates": [75, 82, 90, 85, 80, 78, 80],
    "average_delay_days": [2, 1, 0, 0, 1, 1, 0],
    "months": ["2025-01", "2025-02", "2025-03", "2025-04", "2025-05", "2025-06", "2025-07"]
  },
  "generated_at": "2025-07-25T16:15:00.000Z"
}
```

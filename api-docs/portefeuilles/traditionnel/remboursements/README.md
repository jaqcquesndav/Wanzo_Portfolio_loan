# Remboursements - Portefeuille Traditionnel

Ce document décrit les endpoints pour la gestion des remboursements dans les portefeuilles traditionnels.

## Liste des remboursements

Récupère la liste des remboursements pour un portefeuille traditionnel spécifique.

**Endpoint** : `GET /portfolio_inst/portfolios/traditional/{portfolioId}/repayments`

**Paramètres de chemin** :
- `portfolioId` : Identifiant unique du portefeuille

**Paramètres de requête** :
- `page` (optionnel) : Numéro de la page (défaut : 1)
- `limit` (optionnel) : Nombre de remboursements par page (défaut : 10, max : 100)
- `status` (optionnel) : Filtre par statut (pending, completed, failed)
- `contractId` (optionnel) : Filtre par contrat
- `clientId` (optionnel) : Filtre par client
- `dateFrom` (optionnel) : Filtre par date de remboursement (début)
- `dateTo` (optionnel) : Filtre par date de remboursement (fin)
- `search` (optionnel) : Recherche textuelle (référence, nom du client)
- `sortBy` (optionnel) : Trier par (repaymentDate, amount)
- `sortOrder` (optionnel) : Ordre de tri (asc, desc)

**Réponse réussie** (200 OK) :

```json
{
  "success": true,
  "data": [
    {
      "id": "repayment123",
      "reference": "REP-2025-001",
      "portfolioId": "portfolio123",
      "contractId": "contract456",
      "scheduleId": "schedule789",
      "client": {
        "id": "client789",
        "name": "Entreprise ABC"
      },
      "amount": 5000.00,
      "principal": 4000.00,
      "interest": 1000.00,
      "currency": "CDF",
      "paymentMethod": "bank_transfer",
      "transactionId": "tx123456",
      "status": "completed",
      "repaymentDate": "2025-08-01T10:30:00.000Z",
      "receivedBy": {
        "id": "user123",
        "name": "Jean Dupont"
      },
      "notes": "Remboursement mensuel régulier",
      "createdAt": "2025-08-01T10:30:00.000Z",
      "updatedAt": "2025-08-01T10:30:00.000Z"
    }
  ],
  "meta": {
    "total": 30,
    "page": 1,
    "limit": 10,
    "totalPages": 3
  }
}
```

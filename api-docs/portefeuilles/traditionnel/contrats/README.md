# Contrats de Crédit - Portefeuille Traditionnel

Ce document décrit les endpoints pour la gestion des contrats de crédit dans les portefeuilles traditionnels.

## Liste des contrats de crédit

Récupère la liste des contrats de crédit pour un portefeuille traditionnel spécifique.

**Endpoint** : `GET /portfolio_inst/portfolios/traditional/{portfolioId}/contracts`

**Paramètres de chemin** :
- `portfolioId` : Identifiant unique du portefeuille

**Paramètres de requête** :
- `page` (optionnel) : Numéro de la page (défaut : 1)
- `limit` (optionnel) : Nombre de contrats par page (défaut : 10, max : 100)
- `status` (optionnel) : Filtre par statut (active, completed, defaulted, cancelled)
- `clientId` (optionnel) : Filtre par client
- `dateFrom` (optionnel) : Filtre par date de signature (début)
- `dateTo` (optionnel) : Filtre par date de signature (fin)
- `search` (optionnel) : Recherche textuelle (référence, nom du client)
- `sortBy` (optionnel) : Trier par (signedAt, amount, endDate)
- `sortOrder` (optionnel) : Ordre de tri (asc, desc)

**Réponse réussie** (200 OK) :

```json
{
  "success": true,
  "data": [
    {
      "id": "contract123",
      "reference": "CONT-2025-001",
      "portfolioId": "portfolio123",
      "requestId": "request456",
      "client": {
        "id": "client789",
        "name": "Entreprise ABC",
        "type": "business"
      },
      "amount": 50000.00,
      "outstandingBalance": 40000.00,
      "currency": "CDF",
      "term": 12,
      "interestRate": 8.5,
      "startDate": "2025-07-01T00:00:00.000Z",
      "endDate": "2026-07-01T00:00:00.000Z",
      "paymentFrequency": "monthly",
      "status": "active",
      "signedAt": "2025-07-01T10:00:00.000Z",
      "createdAt": "2025-07-01T10:00:00.000Z",
      "updatedAt": "2025-07-15T14:30:00.000Z"
    }
  ],
  "meta": {
    "total": 25,
    "page": 1,
    "limit": 10,
    "totalPages": 3
  }
}
```

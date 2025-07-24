# Remboursements - Portefeuille Traditionnel

Ce document d�crit les endpoints pour la gestion des remboursements dans les portefeuilles traditionnels.

## Liste des remboursements

R�cup�re la liste des remboursements pour un portefeuille traditionnel sp�cifique.

**Endpoint** : `GET /portfolio_inst/portfolios/traditional/{portfolioId}/repayments`

**Param�tres de chemin** :
- `portfolioId` : Identifiant unique du portefeuille

**Param�tres de requ�te** :
- `page` (optionnel) : Num�ro de la page (d�faut : 1)
- `limit` (optionnel) : Nombre de remboursements par page (d�faut : 10, max : 100)
- `status` (optionnel) : Filtre par statut (pending, completed, failed)
- `contractId` (optionnel) : Filtre par contrat
- `clientId` (optionnel) : Filtre par client
- `dateFrom` (optionnel) : Filtre par date de remboursement (d�but)
- `dateTo` (optionnel) : Filtre par date de remboursement (fin)
- `search` (optionnel) : Recherche textuelle (r�f�rence, nom du client)
- `sortBy` (optionnel) : Trier par (repaymentDate, amount)
- `sortOrder` (optionnel) : Ordre de tri (asc, desc)

**R�ponse r�ussie** (200 OK) :

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
      "notes": "Remboursement mensuel r�gulier",
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

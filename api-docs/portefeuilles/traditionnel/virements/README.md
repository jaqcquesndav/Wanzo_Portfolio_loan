# Virements (Disbursements) - Portefeuille Traditionnel

Ce document d�crit les endpoints pour la gestion des virements (disbursements) dans les portefeuilles traditionnels.

## Liste des virements

R�cup�re la liste des virements pour un portefeuille traditionnel sp�cifique.

**Endpoint** : `GET /portfolio_inst/portfolios/traditional/{portfolioId}/disbursements`

**Param�tres de chemin** :
- `portfolioId` : Identifiant unique du portefeuille

**Param�tres de requ�te** :
- `page` (optionnel) : Num�ro de la page (d�faut : 1)
- `limit` (optionnel) : Nombre de virements par page (d�faut : 10, max : 100)
- `status` (optionnel) : Filtre par statut (pending, completed, failed, cancelled)
- `contractId` (optionnel) : Filtre par contrat
- `clientId` (optionnel) : Filtre par client
- `dateFrom` (optionnel) : Filtre par date de virement (d�but)
- `dateTo` (optionnel) : Filtre par date de virement (fin)
- `search` (optionnel) : Recherche textuelle (r�f�rence, nom du client)
- `sortBy` (optionnel) : Trier par (disbursedAt, amount)
- `sortOrder` (optionnel) : Ordre de tri (asc, desc)

**R�ponse r�ussie** (200 OK) :

```json
{
  "success": true,
  "data": [
    {
      "id": "disbursement123",
      "reference": "DISB-2025-001",
      "portfolioId": "portfolio123",
      "contractId": "contract456",
      "client": {
        "id": "client789",
        "name": "Entreprise ABC"
      },
      "amount": 50000.00,
      "currency": "CDF",
      "bankAccount": {
        "bank": "Banque Commerciale du Congo",
        "accountNumber": "XXXX-XXXX-XXXX-1234",
        "accountHolder": "Entreprise ABC"
      },
      "status": "completed",
      "transactionId": "tx789012",
      "disbursedAt": "2025-07-05T10:00:00.000Z",
      "disbursedBy": {
        "id": "user123",
        "name": "Jean Dupont"
      },
      "notes": "Virement pour fonds de roulement",
      "createdAt": "2025-07-04T16:30:00.000Z",
      "updatedAt": "2025-07-05T10:00:00.000Z"
    }
  ],
  "meta": {
    "total": 18,
    "page": 1,
    "limit": 10,
    "totalPages": 2
  }
}
```

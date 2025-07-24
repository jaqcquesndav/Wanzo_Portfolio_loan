# Contrats de Cr�dit - Portefeuille Traditionnel

Ce document d�crit les endpoints pour la gestion des contrats de cr�dit dans les portefeuilles traditionnels.

## Liste des contrats de cr�dit

R�cup�re la liste des contrats de cr�dit pour un portefeuille traditionnel sp�cifique.

**Endpoint** : `GET /portfolio_inst/portfolios/traditional/{portfolioId}/contracts`

**Param�tres de chemin** :
- `portfolioId` : Identifiant unique du portefeuille

**Param�tres de requ�te** :
- `page` (optionnel) : Num�ro de la page (d�faut : 1)
- `limit` (optionnel) : Nombre de contrats par page (d�faut : 10, max : 100)
- `status` (optionnel) : Filtre par statut (active, completed, defaulted, cancelled)
- `clientId` (optionnel) : Filtre par client
- `dateFrom` (optionnel) : Filtre par date de signature (d�but)
- `dateTo` (optionnel) : Filtre par date de signature (fin)
- `search` (optionnel) : Recherche textuelle (r�f�rence, nom du client)
- `sortBy` (optionnel) : Trier par (signedAt, amount, endDate)
- `sortOrder` (optionnel) : Ordre de tri (asc, desc)

**R�ponse r�ussie** (200 OK) :

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

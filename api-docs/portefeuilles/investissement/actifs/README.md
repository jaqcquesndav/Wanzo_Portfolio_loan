# API des Actifs - Portefeuille d'Investissement

Cette API permet de gérer les actifs financiers dans le portefeuille d'investissement.

## Liste des actifs

Récupère la liste des actifs pour un portefeuille d'investissement spécifique.

**Endpoint** : `GET /portfolio_inst/portfolios/investment/{portfolioId}/assets`

**Paramètres de chemin** :
- `portfolioId` : Identifiant unique du portefeuille

**Paramètres de requête** :
- `page` (optionnel) : Numéro de la page (défaut : 1)
- `limit` (optionnel) : Nombre d'actifs par page (défaut : 10, max : 100)
- `assetType` (optionnel) : Filtre par type d'actif (equity, bond, etf, mutual_fund, cash)
- `sector` (optionnel) : Filtre par secteur
- `currency` (optionnel) : Filtre par devise
- `search` (optionnel) : Recherche textuelle (nom, ticker)
- `sortBy` (optionnel) : Trier par (acquisitionDate, marketValue, weight)
- `sortOrder` (optionnel) : Ordre de tri (asc, desc)

**Paramètres de requête** :
- `page` (optionnel) : Numéro de la page (défaut : 1)
- `limit` (optionnel) : Nombre d'actifs par page (défaut : 10, max : 100)
- `assetType` (optionnel) : Filtre par type d'actif (equity, bond, etf, mutual_fund, cash)
- `sector` (optionnel) : Filtre par secteur
- `currency` (optionnel) : Filtre par devise
- `search` (optionnel) : Recherche textuelle (nom, ticker)
- `sortBy` (optionnel) : Trier par (acquisitionDate, marketValue, weight)
- `sortOrder` (optionnel) : Ordre de tri (asc, desc)

**Réponse réussie** (200 OK) :

```json
{
  "success": true,
  "data": [
    {
      "id": "asset123",
      "portfolioId": "portfolio456",
      "securityId": "security789",
      "ticker": "ABC",
      "name": "Alpha Bank Corporation",
      "assetType": "equity",
      "sector": "finance",
      "quantity": 1000,
      "acquisitionPrice": 100.00,
      "acquisitionValue": 100000.00,
      "currentPrice": 120.50,
      "marketValue": 120500.00,
      "unrealizedGain": 20500.00,
      "unrealizedGainPercent": 20.5,
      "weight": 12.05,
      "currency": "USD",
      "acquisitionDate": "2025-01-15T00:00:00.000Z",
      "updatedAt": "2025-07-24T10:00:00.000Z"
    }
  ],
  "meta": {
    "total": 15,
    "page": 1,
    "limit": 10,
    "totalPages": 2
  }
}
```

## Ajout d'un actif

Ajoute un nouvel actif à un portefeuille d'investissement.

**Endpoint** : `POST /portfolio_inst/portfolios/investment/{portfolioId}/assets`

**Paramètres de chemin** :
- `portfolioId` : Identifiant unique du portefeuille

**Corps de la requête** :

```json
{
  "securityId": "security789",
  "quantity": 500,
  "acquisitionPrice": 115.25,
  "currency": "USD",
  "acquisitionDate": "2025-07-24T00:00:00.000Z",
  "acquisitionFees": 250.00,
  "notes": "Achat stratégique pour diversification du secteur financier"
}
```

**Réponse réussie** (201 Created) :

```json
{
  "success": true,
  "data": {
    "id": "asset456",
    "portfolioId": "portfolio456",
    "securityId": "security789",
    "ticker": "ABC",
    "name": "Alpha Bank Corporation",
    "assetType": "equity",
    "sector": "finance",
    "quantity": 500,
    "acquisitionPrice": 115.25,
    "acquisitionFees": 250.00,
    "acquisitionValue": 57875.00,
    "currentPrice": 120.50,
    "marketValue": 60250.00,
    "unrealizedGain": 2375.00,
    "unrealizedGainPercent": 4.10,
    "weight": 6.03,
    "currency": "USD",
    "acquisitionDate": "2025-07-24T00:00:00.000Z",
    "createdAt": "2025-07-24T11:30:00.000Z",
    "updatedAt": "2025-07-24T11:30:00.000Z",
    "createdBy": {
      "id": "user123",
      "name": "Jean Dupont"
    },
    "notes": "Achat stratégique pour diversification du secteur financier"
  }
}
```

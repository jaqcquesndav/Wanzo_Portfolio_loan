# Marché - Portefeuille d'Investissement

Ce document décrit les endpoints pour la gestion du marché dans les portefeuilles d'investissement.

## Liste des titres du marché

Récupère la liste des titres disponibles sur le marché pour un portefeuille d'investissement.

**Endpoint** : `GET /portfolio_inst/portfolios/investment/{portfolioId}/market`

**Paramètres de chemin** :
- `portfolioId` : Identifiant unique du portefeuille

**Paramètres de requête** :
- `page` (optionnel) : Numéro de la page (défaut : 1)
- `limit` (optionnel) : Nombre de titres par page (défaut : 10, max : 100)
- `assetType` (optionnel) : Filtre par type d'actif (equity, bond, etf, mutual_fund)
- `sector` (optionnel) : Filtre par secteur
- `risk` (optionnel) : Filtre par niveau de risque (low, medium, high)
- `search` (optionnel) : Recherche textuelle (nom, ticker)
- `sortBy` (optionnel) : Trier par (name, price, marketCap, yield)
- `sortOrder` (optionnel) : Ordre de tri (asc, desc)

**Réponse réussie** (200 OK) :

```json
{
  "success": true,
  "data": [
    {
      "id": "security123",
      "ticker": "ABC",
      "name": "Alpha Bank Corporation",
      "assetType": "equity",
      "sector": "finance",
      "exchange": "NASDAQ",
      "currency": "USD",
      "currentPrice": 120.50,
      "previousClose": 118.75,
      "priceChange": 1.47,
      "marketCap": 1500000000,
      "volume": 250000,
      "pe": 15.6,
      "dividend": 2.8,
      "yield": 2.32,
      "risk": "medium",
      "lastUpdated": "2025-07-24T10:00:00.000Z"
    }
  ],
  "meta": {
    "total": 500,
    "page": 1,
    "limit": 10,
    "totalPages": 50
  }
}
```

## Détails d'un titre du marché

Récupère les détails complets d'un titre spécifique du marché.

**Endpoint** : `GET /portfolio_inst/portfolios/investment/{portfolioId}/market/{securityId}`

**Paramètres de chemin** :
- `portfolioId` : Identifiant unique du portefeuille
- `securityId` : Identifiant unique du titre

**Réponse réussie** (200 OK) :

```json
{
  "success": true,
  "data": {
    "id": "security123",
    "ticker": "ABC",
    "name": "Alpha Bank Corporation",
    "assetType": "equity",
    "sector": "finance",
    "industry": "Banking",
    "exchange": "NASDAQ",
    "currency": "USD",
    "currentPrice": 120.50,
    "previousClose": 118.75,
    "open": 119.00,
    "dayHigh": 121.25,
    "dayLow": 118.90,
    "52WeekHigh": 130.00,
    "52WeekLow": 95.50,
    "priceChange": 1.47,
    "priceChangePercent": 1.24,
    "marketCap": 1500000000,
    "volume": 250000,
    "avgVolume": 300000,
    "pe": 15.6,
    "eps": 7.72,
    "dividend": 2.8,
    "yield": 2.32,
    "beta": 0.95,
    "risk": "medium",
    "description": "Alpha Bank Corporation est une banque multinationale offrant des services financiers complets aux particuliers et aux entreprises.",
    "financials": {
      "revenue": 450000000,
      "netIncome": 85000000,
      "totalAssets": 7500000000,
      "totalLiabilities": 6500000000,
      "equity": 1000000000
    },
    "historicalPrices": [
      {
        "date": "2025-07-23",
        "open": 118.75,
        "high": 119.50,
        "low": 117.80,
        "close": 118.75,
        "volume": 240000
      },
      {
        "date": "2025-07-22",
        "open": 117.00,
        "high": 119.00,
        "low": 116.50,
        "close": 118.25,
        "volume": 260000
      }
    ],
    "analysts": {
      "consensusRating": "buy",
      "targetPrice": 135.00,
      "numberOfAnalysts": 15,
      "ratings": {
        "buy": 10,
        "hold": 4,
        "sell": 1
      }
    },
    "lastUpdated": "2025-07-24T10:00:00.000Z"
  }
}
```

# Portefeuilles d'Investissement

Ce document décrit les endpoints principaux pour la gestion des portefeuilles d'investissement dans l'API Wanzo Portfolio Institution.

## Modules des Portefeuilles d'Investissement

Les portefeuilles d'investissement sont organisés en plusieurs modules :

1. **[Marché](./marche/README.md)** - Gestion des transactions sur le marché
2. **[Actifs](./actifs/README.md)** - Gestion des actifs du portefeuille
3. **[Souscriptions](./souscriptions/README.md)** - Gestion des souscriptions
4. **[Valorisation](./valorisation/README.md)** - Analyse et valorisation du portefeuille
5. **[Paramètres](./parametres/README.md)** - Configuration des paramètres du portefeuille

## Liste des portefeuilles d'investissement

Récupère la liste des portefeuilles d'investissement avec pagination et filtrage.

**Endpoint** : `GET /portfolio_inst/portfolios/investment`
**Paramètres de requête** :
- `page` (optionnel) : Numéro de la page (défaut : 1)
- `limit` (optionnel) : Nombre de portefeuilles par page (défaut : 10, max : 100)
- `status` (optionnel) : Filtre par statut (active, closed, suspended)
- `manager` (optionnel) : Filtre par gestionnaire
- `client` (optionnel) : Filtre par client
- `dateFrom` (optionnel) : Filtre par date de création (début)
- `dateTo` (optionnel) : Filtre par date de création (fin)
- `search` (optionnel) : Recherche textuelle (nom, référence)
- `sortBy` (optionnel) : Trier par (createdAt, name, totalAmount)
- `sortOrder` (optionnel) : Ordre de tri (asc, desc)

**Réponse réussie** (200 OK) :

```json
{
  "success": true,
  "data": [
    {
      "id": "inv_portfolio123",
      "reference": "IPF-2025-001",
      "name": "Portefeuille Investissement 2025",
      "description": "Portefeuille d'investissement diversifié",
      "status": "active",
      "totalAmount": 10000000.00,
      "currency": "USD",
      "investmentCount": 15,
      "currentValue": 10500000.00,
      "performanceMTD": 1.2,
      "performanceYTD": 5.0,
      "manager": {
        "id": "user789",
        "name": "Pierre Durand"
      },
      "client": {
        "id": "client123",
        "name": "Fond de Pension National"
      },
      "createdAt": "2025-01-10T08:00:00.000Z",
      "updatedAt": "2025-07-20T10:30:00.000Z"
    }
  ],
  "meta": {
    "total": 8,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

# Portefeuilles d'Investissement

Ce document d�crit les endpoints principaux pour la gestion des portefeuilles d'investissement dans l'API Wanzo Portfolio Institution.

## Modules des Portefeuilles d'Investissement

Les portefeuilles d'investissement sont organis�s en plusieurs modules :

1. **[March�](./marche/README.md)** - Gestion des transactions sur le march�
2. **[Actifs](./actifs/README.md)** - Gestion des actifs du portefeuille
3. **[Souscriptions](./souscriptions/README.md)** - Gestion des souscriptions
4. **[Valorisation](./valorisation/README.md)** - Analyse et valorisation du portefeuille
5. **[Param�tres](./parametres/README.md)** - Configuration des param�tres du portefeuille

## Liste des portefeuilles d'investissement

R�cup�re la liste des portefeuilles d'investissement avec pagination et filtrage.

**Endpoint** : `GET /portfolio_inst/portfolios/investment`
**Param�tres de requ�te** :
- `page` (optionnel) : Num�ro de la page (d�faut : 1)
- `limit` (optionnel) : Nombre de portefeuilles par page (d�faut : 10, max : 100)
- `status` (optionnel) : Filtre par statut (active, closed, suspended)
- `manager` (optionnel) : Filtre par gestionnaire
- `client` (optionnel) : Filtre par client
- `dateFrom` (optionnel) : Filtre par date de cr�ation (d�but)
- `dateTo` (optionnel) : Filtre par date de cr�ation (fin)
- `search` (optionnel) : Recherche textuelle (nom, r�f�rence)
- `sortBy` (optionnel) : Trier par (createdAt, name, totalAmount)
- `sortOrder` (optionnel) : Ordre de tri (asc, desc)

**R�ponse r�ussie** (200 OK) :

```json
{
  "success": true,
  "data": [
    {
      "id": "inv_portfolio123",
      "reference": "IPF-2025-001",
      "name": "Portefeuille Investissement 2025",
      "description": "Portefeuille d'investissement diversifi�",
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

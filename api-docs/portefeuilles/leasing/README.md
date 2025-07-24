# Portefeuilles de Leasing

Ce document décrit les endpoints principaux pour la gestion des portefeuilles de leasing dans l'API Wanzo Portfolio Institution.

## Modules des Portefeuilles de Leasing

Les portefeuilles de leasing sont organisés en plusieurs modules :

1. **[Demandes](./demandes/README.md)** - Gestion des demandes de leasing
2. **[Contrats](./contrats/README.md)** - Gestion des contrats de leasing
3. **[Incidents](./incidents/README.md)** - Gestion des incidents
4. **[Maintenance](./maintenance/README.md)** - Gestion de la maintenance
5. **[Paiements](./paiements/README.md)** - Gestion des paiements
6. **[Paramètres](./parametres/README.md)** - Configuration des paramètres du portefeuille

## Liste des portefeuilles de leasing

Récupère la liste des portefeuilles de leasing avec pagination et filtrage.

**Endpoint** : `GET /portfolio_inst/portfolios/leasing`
**Paramètres de requête** :
- `page` (optionnel) : Numéro de la page (défaut : 1)
- `limit` (optionnel) : Nombre de portefeuilles par page (défaut : 10, max : 100)
- `status` (optionnel) : Filtre par statut (active, closed, suspended)
- `manager` (optionnel) : Filtre par gestionnaire
- `client` (optionnel) : Filtre par client
- `dateFrom` (optionnel) : Filtre par date de création (début)
- `dateTo` (optionnel) : Filtre par date de création (fin)
- `search` (optionnel) : Recherche textuelle (nom, référence)
- `sortBy` (optionnel) : Trier par (createdAt, name, totalValue)
- `sortOrder` (optionnel) : Ordre de tri (asc, desc)

**Réponse réussie** (200 OK) :

```json
{
  "success": true,
  "data": [
    {
      "id": "leasing_portfolio123",
      "reference": "LPF-2025-001",
      "name": "Portefeuille Immobilier Commercial",
      "description": "Portefeuille de leasing pour propriétés commerciales",
      "status": "active",
      "totalValue": 20000000.00,
      "currency": "USD",
      "propertyCount": 12,
      "occupancyRate": 92.5,
      "averageLeaseYield": 7.8,
      "manager": {
        "id": "user456",
        "name": "Marie Martin"
      },
      "client": {
        "id": "client789",
        "name": "Fonds Immobilier Kinshasa"
      },
      "createdAt": "2025-02-15T08:00:00.000Z",
      "updatedAt": "2025-07-15T10:30:00.000Z"
    }
  ],
  "meta": {
    "total": 5,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

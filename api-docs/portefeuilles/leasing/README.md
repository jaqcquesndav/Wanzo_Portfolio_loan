# Portefeuilles de Leasing

Ce document décrit les endpoints principaux pour la gestion des portefeuilles de leasing dans l'API Wanzo Portfolio Institution.

## Modules des Portefeuilles de Leasing

Les portefeuilles de leasing sont organisés en plusieurs modules :

1. **[Équipements](./equipements/README.md)** - Gestion du catalogue d'équipements
2. **[Demandes](./demandes/README.md)** - Gestion des demandes de leasing
3. **[Contrats](./contrats/README.md)** - Gestion des contrats de leasing
4. **[Incidents](./incidents/README.md)** - Gestion des incidents liés aux équipements
5. **[Maintenance](./maintenance/README.md)** - Gestion de la maintenance des équipements
6. **[Réservations](./reservations/README.md)** - Gestion des réservations d'équipements
7. **[Mouvements](./mouvements/README.md)** - Suivi des déplacements d'équipements
8. **[Paiements](./paiements/README.md)** - Gestion des paiements et échéanciers
9. **[Paramètres](./parametres/README.md)** - Configuration des paramètres du portefeuille

## Liste des portefeuilles de leasing

Récupère la liste des portefeuilles de leasing avec pagination et filtrage.

**Endpoint** : `GET /portfolio_inst/portfolios/leasing`
**Paramètres de requête** :
- `page` (optionnel) : Numéro de la page (défaut : 1)
- `limit` (optionnel) : Nombre de portefeuilles par page (défaut : 10, max : 100)
- `status` (optionnel) : Filtre par statut (active, inactive)
- `manager` (optionnel) : Filtre par gestionnaire
- `risk_profile` (optionnel) : Filtre par profil de risque (conservative, moderate, aggressive)
- `dateFrom` (optionnel) : Filtre par date de création (début)
- `dateTo` (optionnel) : Filtre par date de création (fin)
- `search` (optionnel) : Recherche textuelle (nom, référence)
- `sortBy` (optionnel) : Trier par (created_at, name, target_amount, utilizationRate)
- `sortOrder` (optionnel) : Ordre de tri (asc, desc)

**Réponse réussie** (200 OK) :

```json
{
  "success": true,
  "data": [
    {
      "id": "leasing_portfolio123",
      "name": "Portefeuille Équipements Industriels",
      "type": "leasing",
      "status": "active",
      "target_amount": 5000000.00,
      "target_return": 8.5,
      "target_sectors": ["construction", "agriculture", "industrie"],
      "risk_profile": "moderate",
      "metrics": {
        "totalLeased": 3250000.00,
        "utilizationRate": 78.5,
        "defaultRate": 1.2,
        "totalRevenue": 420000.00,
        "totalIncidents": 5,
        "totalMaintenance": 12
      },
      "manager": {
        "id": "user456",
        "name": "Marie Martin"
      },
      "created_at": "2025-02-15T08:00:00.000Z",
      "updated_at": "2025-07-15T10:30:00.000Z"
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

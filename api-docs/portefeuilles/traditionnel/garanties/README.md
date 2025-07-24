# Garanties - Portefeuille Traditionnel

Ce document décrit les endpoints pour la gestion des garanties dans les portefeuilles traditionnels.

## Liste des garanties

Récupère la liste des garanties pour un portefeuille traditionnel spécifique.

**Endpoint** : `GET /portfolio_inst/portfolios/traditional/{portfolioId}/guarantees`

**Paramètres de chemin** :
- `portfolioId` : Identifiant unique du portefeuille

**Paramètres de requête** :
- `page` (optionnel) : Numéro de la page (défaut : 1)
- `limit` (optionnel) : Nombre de garanties par page (défaut : 10, max : 100)
- `status` (optionnel) : Filtre par statut (active, released, executed)
- `contractId` (optionnel) : Filtre par contrat
- `clientId` (optionnel) : Filtre par client
- `type` (optionnel) : Filtre par type de garantie (collateral, personal, third_party)
- `search` (optionnel) : Recherche textuelle (référence, description)
- `sortBy` (optionnel) : Trier par (createdAt, value)
- `sortOrder` (optionnel) : Ordre de tri (asc, desc)

**Réponse réussie** (200 OK) :

```json
{
  "success": true,
  "data": [
    {
      "id": "guarantee123",
      "reference": "GAR-2025-001",
      "portfolioId": "portfolio123",
      "contractId": "contract456",
      "client": {
        "id": "client789",
        "name": "Entreprise ABC"
      },
      "type": "collateral",
      "category": "real_estate",
      "description": "Propriété commerciale à Kinshasa",
      "value": 100000.00,
      "currency": "CDF",
      "coverageRatio": 2.0,
      "status": "active",
      "documents": [
        {
          "id": "doc123",
          "type": "title_deed",
          "name": "Acte de propriété",
          "url": "https://example.com/documents/doc123.pdf",
          "uploadedAt": "2025-07-01T08:00:00.000Z"
        },
        {
          "id": "doc456",
          "type": "valuation_report",
          "name": "Rapport d'évaluation",
          "url": "https://example.com/documents/doc456.pdf",
          "uploadedAt": "2025-07-01T08:15:00.000Z"
        }
      ],
      "registeredAt": "2025-07-01T09:00:00.000Z",
      "registeredBy": {
        "id": "user123",
        "name": "Jean Dupont"
      },
      "notes": "Garantie principale pour le contrat de crédit",
      "createdAt": "2025-07-01T09:00:00.000Z",
      "updatedAt": "2025-07-01T09:00:00.000Z"
    }
  ],
  "meta": {
    "total": 12,
    "page": 1,
    "limit": 10,
    "totalPages": 2
  }
}
```

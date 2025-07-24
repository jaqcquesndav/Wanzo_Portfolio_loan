# Garanties - Portefeuille Traditionnel

Ce document d�crit les endpoints pour la gestion des garanties dans les portefeuilles traditionnels.

## Liste des garanties

R�cup�re la liste des garanties pour un portefeuille traditionnel sp�cifique.

**Endpoint** : `GET /portfolio_inst/portfolios/traditional/{portfolioId}/guarantees`

**Param�tres de chemin** :
- `portfolioId` : Identifiant unique du portefeuille

**Param�tres de requ�te** :
- `page` (optionnel) : Num�ro de la page (d�faut : 1)
- `limit` (optionnel) : Nombre de garanties par page (d�faut : 10, max : 100)
- `status` (optionnel) : Filtre par statut (active, released, executed)
- `contractId` (optionnel) : Filtre par contrat
- `clientId` (optionnel) : Filtre par client
- `type` (optionnel) : Filtre par type de garantie (collateral, personal, third_party)
- `search` (optionnel) : Recherche textuelle (r�f�rence, description)
- `sortBy` (optionnel) : Trier par (createdAt, value)
- `sortOrder` (optionnel) : Ordre de tri (asc, desc)

**R�ponse r�ussie** (200 OK) :

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
      "description": "Propri�t� commerciale � Kinshasa",
      "value": 100000.00,
      "currency": "CDF",
      "coverageRatio": 2.0,
      "status": "active",
      "documents": [
        {
          "id": "doc123",
          "type": "title_deed",
          "name": "Acte de propri�t�",
          "url": "https://example.com/documents/doc123.pdf",
          "uploadedAt": "2025-07-01T08:00:00.000Z"
        },
        {
          "id": "doc456",
          "type": "valuation_report",
          "name": "Rapport d'�valuation",
          "url": "https://example.com/documents/doc456.pdf",
          "uploadedAt": "2025-07-01T08:15:00.000Z"
        }
      ],
      "registeredAt": "2025-07-01T09:00:00.000Z",
      "registeredBy": {
        "id": "user123",
        "name": "Jean Dupont"
      },
      "notes": "Garantie principale pour le contrat de cr�dit",
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

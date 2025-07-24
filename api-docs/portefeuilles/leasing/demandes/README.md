# Demandes de Leasing

Ce document décrit les endpoints pour la gestion des demandes de leasing dans les portefeuilles de leasing.

## Liste des demandes de leasing

Récupère la liste des demandes de leasing pour un portefeuille de leasing spécifique.

**Endpoint** : `GET /portfolio_inst/portfolios/leasing/{portfolioId}/requests`

**Paramètres de chemin** :
- `portfolioId` : Identifiant unique du portefeuille

**Paramètres de requête** :
- `page` (optionnel) : Numéro de la page (défaut : 1)
- `limit` (optionnel) : Nombre de demandes par page (défaut : 10, max : 100)
- `status` (optionnel) : Filtre par statut (pending, approved, rejected, cancelled)
- `clientId` (optionnel) : Filtre par client
- `propertyType` (optionnel) : Filtre par type de propriété (commercial, residential, industrial)
- `dateFrom` (optionnel) : Filtre par date de création (début)
- `dateTo` (optionnel) : Filtre par date de création (fin)
- `search` (optionnel) : Recherche textuelle (référence, nom du client, adresse)
- `sortBy` (optionnel) : Trier par (createdAt, propertyValue, monthlyRent)
- `sortOrder` (optionnel) : Ordre de tri (asc, desc)

**Réponse réussie** (200 OK) :

```json
{
  "success": true,
  "data": [
    {
      "id": "request123",
      "reference": "LR-2025-001",
      "portfolioId": "portfolio456",
      "client": {
        "id": "client789",
        "name": "Entreprise XYZ",
        "type": "business"
      },
      "property": {
        "type": "commercial",
        "address": "123 Avenue du Commerce, Kinshasa",
        "size": 250,
        "sizeUnit": "m2",
        "value": 500000.00,
        "currency": "USD"
      },
      "leaseTerms": {
        "duration": 36,
        "monthlyRent": 5000.00,
        "securityDeposit": 15000.00,
        "startDate": "2025-09-01T00:00:00.000Z",
        "endDate": "2028-08-31T00:00:00.000Z"
      },
      "purpose": "Ouverture d'un nouveau magasin",
      "status": "pending",
      "submittedBy": {
        "id": "user123",
        "name": "Jean Dupont"
      },
      "documents": [
        {
          "id": "doc123",
          "type": "business_plan",
          "name": "Plan d'affaires",
          "url": "https://example.com/documents/doc123.pdf",
          "uploadedAt": "2025-07-20T10:00:00.000Z"
        },
        {
          "id": "doc456",
          "type": "financial_statements",
          "name": "États financiers",
          "url": "https://example.com/documents/doc456.pdf",
          "uploadedAt": "2025-07-20T10:15:00.000Z"
        }
      ],
      "createdAt": "2025-07-20T10:30:00.000Z",
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

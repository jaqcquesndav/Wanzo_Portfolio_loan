# Contrats de Leasing

Ce document décrit les endpoints pour la gestion des contrats de leasing dans les portefeuilles de leasing.

## Liste des contrats de leasing

Récupère la liste des contrats de leasing pour un portefeuille de leasing spécifique.

**Endpoint** : `GET /portfolio_inst/portfolios/leasing/{portfolioId}/contracts`

**Paramètres de chemin** :
- `portfolioId` : Identifiant unique du portefeuille

**Paramètres de requête** :
- `page` (optionnel) : Numéro de la page (défaut : 1)
- `limit` (optionnel) : Nombre de contrats par page (défaut : 10, max : 100)
- `status` (optionnel) : Filtre par statut (active, expired, terminated, renewed)
- `clientId` (optionnel) : Filtre par client
- `propertyType` (optionnel) : Filtre par type de propriété (commercial, residential, industrial)
- `dateFrom` (optionnel) : Filtre par date de début (début)
- `dateTo` (optionnel) : Filtre par date de début (fin)
- `expiryDateFrom` (optionnel) : Filtre par date d'expiration (début)
- `expiryDateTo` (optionnel) : Filtre par date d'expiration (fin)
- `search` (optionnel) : Recherche textuelle (référence, nom du client, adresse)
- `sortBy` (optionnel) : Trier par (startDate, endDate, monthlyRent)
- `sortOrder` (optionnel) : Ordre de tri (asc, desc)

**Réponse réussie** (200 OK) :

```json
{
  "success": true,
  "data": [
    {
      "id": "contract123",
      "reference": "LC-2025-001",
      "portfolioId": "portfolio456",
      "requestId": "request789",
      "client": {
        "id": "client012",
        "name": "Entreprise XYZ",
        "type": "business",
        "contactPerson": {
          "name": "Marie Martin",
          "email": "marie.martin@xyz.com",
          "phone": "+243820123456"
        }
      },
      "property": {
        "id": "property345",
        "type": "commercial",
        "address": "123 Avenue du Commerce, Kinshasa",
        "size": 250,
        "sizeUnit": "m2",
        "value": 500000.00,
        "currency": "USD",
        "amenities": ["parking", "security", "air_conditioning"]
      },
      "leaseTerms": {
        "duration": 36,
        "monthlyRent": 5000.00,
        "securityDeposit": 15000.00,
        "startDate": "2025-09-01T00:00:00.000Z",
        "endDate": "2028-08-31T00:00:00.000Z",
        "paymentDay": 5,
        "rentEscalation": {
          "frequency": "annual",
          "rate": 3.0
        },
        "renewalOption": true,
        "renewalNoticePeriod": 90
      },
      "status": "active",
      "signedAt": "2025-08-15T10:00:00.000Z",
      "documents": [
        {
          "id": "doc678",
          "type": "signed_contract",
          "name": "Contrat signé",
          "url": "https://example.com/documents/doc678.pdf",
          "uploadedAt": "2025-08-15T10:30:00.000Z"
        },
        {
          "id": "doc901",
          "type": "property_inspection",
          "name": "Rapport d'inspection de la propriété",
          "url": "https://example.com/documents/doc901.pdf",
          "uploadedAt": "2025-08-10T14:00:00.000Z"
        }
      ],
      "createdAt": "2025-08-15T10:00:00.000Z",
      "updatedAt": "2025-08-15T10:30:00.000Z",
      "createdBy": {
        "id": "user123",
        "name": "Jean Dupont"
      }
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

# Contrats de Leasing

Ce document d�crit les endpoints pour la gestion des contrats de leasing dans les portefeuilles de leasing.

## Liste des contrats de leasing

R�cup�re la liste des contrats de leasing pour un portefeuille de leasing sp�cifique.

**Endpoint** : `GET /portfolio_inst/portfolios/leasing/{portfolioId}/contracts`

**Param�tres de chemin** :
- `portfolioId` : Identifiant unique du portefeuille

**Param�tres de requ�te** :
- `page` (optionnel) : Num�ro de la page (d�faut : 1)
- `limit` (optionnel) : Nombre de contrats par page (d�faut : 10, max : 100)
- `status` (optionnel) : Filtre par statut (active, expired, terminated, renewed)
- `clientId` (optionnel) : Filtre par client
- `propertyType` (optionnel) : Filtre par type de propri�t� (commercial, residential, industrial)
- `dateFrom` (optionnel) : Filtre par date de d�but (d�but)
- `dateTo` (optionnel) : Filtre par date de d�but (fin)
- `expiryDateFrom` (optionnel) : Filtre par date d'expiration (d�but)
- `expiryDateTo` (optionnel) : Filtre par date d'expiration (fin)
- `search` (optionnel) : Recherche textuelle (r�f�rence, nom du client, adresse)
- `sortBy` (optionnel) : Trier par (startDate, endDate, monthlyRent)
- `sortOrder` (optionnel) : Ordre de tri (asc, desc)

**R�ponse r�ussie** (200 OK) :

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
          "name": "Contrat sign�",
          "url": "https://example.com/documents/doc678.pdf",
          "uploadedAt": "2025-08-15T10:30:00.000Z"
        },
        {
          "id": "doc901",
          "type": "property_inspection",
          "name": "Rapport d'inspection de la propri�t�",
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

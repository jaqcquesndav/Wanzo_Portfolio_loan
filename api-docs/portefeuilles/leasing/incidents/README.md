# Incidents - Portefeuille de Leasing

Ce document d�crit les endpoints pour la gestion des incidents dans les portefeuilles de leasing.

## Liste des incidents

R�cup�re la liste des incidents pour un portefeuille de leasing sp�cifique.

**Endpoint** : `GET /portfolio_inst/portfolios/leasing/{portfolioId}/incidents`

**Param�tres de chemin** :
- `portfolioId` : Identifiant unique du portefeuille

**Param�tres de requ�te** :
- `page` (optionnel) : Num�ro de la page (d�faut : 1)
- `limit` (optionnel) : Nombre d'incidents par page (d�faut : 10, max : 100)
- `status` (optionnel) : Filtre par statut (reported, investigating, resolved, closed)
- `contractId` (optionnel) : Filtre par contrat
- `propertyId` (optionnel) : Filtre par propri�t�
- `clientId` (optionnel) : Filtre par client
- `type` (optionnel) : Filtre par type d'incident (damage, security, utility, other)
- `severity` (optionnel) : Filtre par s�v�rit� (low, medium, high, critical)
- `dateFrom` (optionnel) : Filtre par date de signalement (d�but)
- `dateTo` (optionnel) : Filtre par date de signalement (fin)
- `search` (optionnel) : Recherche textuelle (r�f�rence, description)
- `sortBy` (optionnel) : Trier par (reportedAt, resolvedAt, severity)
- `sortOrder` (optionnel) : Ordre de tri (asc, desc)

**R�ponse r�ussie** (200 OK) :

```json
{
  "success": true,
  "data": [
    {
      "id": "incident123",
      "reference": "INC-2025-001",
      "portfolioId": "portfolio456",
      "contractId": "contract789",
      "propertyId": "property012",
      "client": {
        "id": "client345",
        "name": "Entreprise XYZ"
      },
      "reportedBy": {
        "id": "user678",
        "name": "Marie Martin",
        "role": "tenant",
        "email": "marie.martin@xyz.com",
        "phone": "+243820123456"
      },
      "type": "damage",
      "category": "plumbing",
      "severity": "high",
      "title": "Fuite d'eau importante",
      "description": "Fuite d'eau importante dans les toilettes du premier �tage causant des dommages au plafond de l'�tage inf�rieur.",
      "location": "Premier �tage, toilettes",
      "status": "investigating",
      "reportedAt": "2025-07-23T08:30:00.000Z",
      "assignedTo": {
        "id": "user901",
        "name": "Pierre Durand",
        "role": "maintenance_manager"
      },
      "estimatedRepairCost": 1500.00,
      "actualRepairCost": null,
      "photos": [
        {
          "id": "photo123",
          "url": "https://example.com/photos/photo123.jpg",
          "caption": "Fuite visible au plafond",
          "uploadedAt": "2025-07-23T08:35:00.000Z"
        },
        {
          "id": "photo456",
          "url": "https://example.com/photos/photo456.jpg",
          "caption": "Dommages caus�s au plancher",
          "uploadedAt": "2025-07-23T08:36:00.000Z"
        }
      ],
      "timeline": [
        {
          "timestamp": "2025-07-23T08:30:00.000Z",
          "action": "reported",
          "by": {
            "id": "user678",
            "name": "Marie Martin"
          },
          "notes": "Incident signal� par le locataire"
        },
        {
          "timestamp": "2025-07-23T09:15:00.000Z",
          "action": "assigned",
          "by": {
            "id": "user123",
            "name": "Jean Dupont"
          },
          "notes": "Incident assign� � Pierre Durand"
        },
        {
          "timestamp": "2025-07-23T10:00:00.000Z",
          "action": "status_updated",
          "by": {
            "id": "user901",
            "name": "Pierre Durand"
          },
          "notes": "Inspection planifi�e pour 14h00"
        }
      ],
      "createdAt": "2025-07-23T08:30:00.000Z",
      "updatedAt": "2025-07-23T10:00:00.000Z"
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

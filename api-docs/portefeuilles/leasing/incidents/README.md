# Incidents - Portefeuille de Leasing

Ce document décrit les endpoints pour la gestion des incidents dans les portefeuilles de leasing.

## Liste des incidents

Récupère la liste des incidents pour un portefeuille de leasing spécifique.

**Endpoint** : `GET /portfolio_inst/portfolios/leasing/{portfolioId}/incidents`

**Paramètres de chemin** :
- `portfolioId` : Identifiant unique du portefeuille

**Paramètres de requête** :
- `page` (optionnel) : Numéro de la page (défaut : 1)
- `limit` (optionnel) : Nombre d'incidents par page (défaut : 10, max : 100)
- `status` (optionnel) : Filtre par statut (reported, investigating, resolved, closed)
- `contractId` (optionnel) : Filtre par contrat
- `propertyId` (optionnel) : Filtre par propriété
- `clientId` (optionnel) : Filtre par client
- `type` (optionnel) : Filtre par type d'incident (damage, security, utility, other)
- `severity` (optionnel) : Filtre par sévérité (low, medium, high, critical)
- `dateFrom` (optionnel) : Filtre par date de signalement (début)
- `dateTo` (optionnel) : Filtre par date de signalement (fin)
- `search` (optionnel) : Recherche textuelle (référence, description)
- `sortBy` (optionnel) : Trier par (reportedAt, resolvedAt, severity)
- `sortOrder` (optionnel) : Ordre de tri (asc, desc)

**Réponse réussie** (200 OK) :

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
      "description": "Fuite d'eau importante dans les toilettes du premier étage causant des dommages au plafond de l'étage inférieur.",
      "location": "Premier étage, toilettes",
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
          "caption": "Dommages causés au plancher",
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
          "notes": "Incident signalé par le locataire"
        },
        {
          "timestamp": "2025-07-23T09:15:00.000Z",
          "action": "assigned",
          "by": {
            "id": "user123",
            "name": "Jean Dupont"
          },
          "notes": "Incident assigné à Pierre Durand"
        },
        {
          "timestamp": "2025-07-23T10:00:00.000Z",
          "action": "status_updated",
          "by": {
            "id": "user901",
            "name": "Pierre Durand"
          },
          "notes": "Inspection planifiée pour 14h00"
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

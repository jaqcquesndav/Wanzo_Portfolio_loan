# Équipements de Leasing

Ce document décrit les endpoints pour la gestion des équipements dans les portefeuilles de leasing.

## Liste des équipements

Récupère la liste des équipements du catalogue de leasing avec filtrage.

**Endpoint** : `GET /portfolios/leasing/equipment`

**Paramètres de requête** :
- `category` (optionnel) : Filtre par catégorie d'équipement
- `status` (optionnel) : Filtre par statut (available, leased, maintenance, retired)
- `minValue` (optionnel) : Prix minimum
- `maxValue` (optionnel) : Prix maximum

**Réponse réussie** (200 OK) :

```json
[
  {
    "id": "EQP-001",
    "name": "Tracteur agricole XT5000",
    "description": "Tracteur polyvalent idéal pour les grandes exploitations agricoles",
    "category": "Agricole",
    "manufacturer": "AgriTech Congo",
    "model": "XT5000",
    "year": 2024,
    "price": 75000000,
    "condition": "new",
    "specifications": {
      "puissance": "120 CV",
      "carburant": "Diesel",
      "capacité": "5000 kg",
      "vitesse": "40 km/h"
    },
    "availability": true,
    "maintenanceIncluded": true,
    "warrantyDuration": 24,
    "deliveryTime": 15,
    "imageUrl": "/images/equipments/tracteur-xt5000.jpg"
  },
  {
    "id": "EQP-002",
    "name": "Excavatrice BTP Pro X1",
    "description": "Excavatrice haute performance pour chantiers de grande envergure",
    "category": "Construction",
    "manufacturer": "ConstructCorp",
    "model": "Pro X1",
    "year": 2023,
    "price": 120000000,
    "condition": "new",
    "specifications": {
      "puissance": "200 CV",
      "profondeur_max": "6m",
      "capacité_godet": "1.2m³"
    },
    "availability": true,
    "maintenanceIncluded": true,
    "warrantyDuration": 36,
    "deliveryTime": 30,
    "imageUrl": "/images/equipments/excavatrice-prox1.jpg"
  }
]
```

## Détails d'un équipement

Récupère les informations détaillées d'un équipement.

**Endpoint** : `GET /portfolios/leasing/equipment/{equipmentId}`

**Paramètres de chemin** :
- `equipmentId` : Identifiant unique de l'équipement

**Réponse réussie** (200 OK) :

```json
{
  "id": "EQP-001",
  "name": "Tracteur agricole XT5000",
  "description": "Tracteur polyvalent idéal pour les grandes exploitations agricoles",
  "category": "Agricole",
  "manufacturer": "AgriTech Congo",
  "model": "XT5000",
  "year": 2024,
  "price": 75000000,
  "condition": "new",
  "specifications": {
    "puissance": "120 CV",
    "carburant": "Diesel",
    "capacité": "5000 kg",
    "vitesse": "40 km/h"
  },
  "availability": true,
  "maintenanceIncluded": true,
  "warrantyDuration": 24,
  "deliveryTime": 15,
  "imageUrl": "/images/equipments/tracteur-xt5000.jpg"
}
```

## Équipements disponibles pour un portefeuille

Récupère la liste des équipements disponibles pour un portefeuille spécifique.

**Endpoint** : `GET /portfolios/leasing/{portfolioId}/available-equipment`

**Paramètres de chemin** :
- `portfolioId` : Identifiant unique du portefeuille de leasing

**Réponse réussie** (200 OK) :

```json
[
  {
    "id": "EQP-001",
    "name": "Tracteur agricole XT5000",
    "description": "Tracteur polyvalent idéal pour les grandes exploitations agricoles",
    "category": "Agricole",
    "manufacturer": "AgriTech Congo",
    "model": "XT5000",
    "year": 2024,
    "price": 75000000,
    "condition": "new",
    "specifications": {
      "puissance": "120 CV",
      "carburant": "Diesel",
      "capacité": "5000 kg",
      "vitesse": "40 km/h"
    },
    "availability": true,
    "maintenanceIncluded": true,
    "warrantyDuration": 24,
    "deliveryTime": 15,
    "imageUrl": "/images/equipments/tracteur-xt5000.jpg"
  }
]
```

## Historique de maintenance d'un équipement

Récupère l'historique des interventions de maintenance pour un équipement spécifique.

**Endpoint** : `GET /portfolios/leasing/equipment/{equipmentId}/maintenance-history`

**Paramètres de chemin** :
- `equipmentId` : Identifiant unique de l'équipement

**Réponse réussie** (200 OK) :

```json
[
  {
    "id": "MAINT-001",
    "equipmentId": "EQP-001",
    "date": "2024-05-15T10:00:00Z",
    "type": "scheduled",
    "description": "Maintenance préventive trimestrielle",
    "technician": "Jean Lukusa",
    "cost": 250000,
    "parts": [
      {
        "name": "Filtre à huile",
        "quantity": 1,
        "cost": 50000
      },
      {
        "name": "Huile moteur",
        "quantity": 5,
        "unit": "L",
        "cost": 100000
      }
    ],
    "duration": 120,
    "status": "completed",
    "notes": "Remplacement des filtres et vidange effectués"
  }
]
```

## Historique des contrats d'un équipement

Récupère l'historique des contrats associés à un équipement spécifique.

**Endpoint** : `GET /portfolios/leasing/equipment/{equipmentId}/contract-history`

**Paramètres de chemin** :
- `equipmentId` : Identifiant unique de l'équipement

**Réponse réussie** (200 OK) :

```json
[
  {
    "id": "LEAS-001",
    "equipmentId": "EQP-001",
    "clientId": "CLI-005",
    "clientName": "Ferme Kivu Vert",
    "startDate": "2023-07-01T00:00:00Z",
    "endDate": "2025-06-30T23:59:59Z",
    "monthlyPayment": 3500000,
    "status": "active",
    "totalValue": 84000000
  },
  {
    "id": "LEAS-045",
    "equipmentId": "EQP-001",
    "clientId": "CLI-022",
    "clientName": "Coopérative Agricole du Congo",
    "startDate": "2022-03-15T00:00:00Z",
    "endDate": "2023-03-14T23:59:59Z",
    "monthlyPayment": 3200000,
    "status": "completed",
    "totalValue": 38400000
  }
]
```

## Incidents liés à un équipement

Récupère la liste des incidents signalés pour un équipement spécifique.

**Endpoint** : `GET /portfolios/leasing/equipment/{equipmentId}/incidents`

**Paramètres de chemin** :
- `equipmentId` : Identifiant unique de l'équipement

**Réponse réussie** (200 OK) :

```json
[
  {
    "id": "INC-023",
    "equipmentId": "EQP-001",
    "date": "2024-04-10T14:30:00Z",
    "reportedBy": "Ferme Kivu Vert",
    "type": "breakdown",
    "description": "Panne du système hydraulique lors des travaux dans le champ",
    "severity": "high",
    "status": "resolved",
    "resolutionDate": "2024-04-12T16:45:00Z",
    "resolutionDescription": "Remplacement de la pompe hydraulique et des joints défectueux",
    "downtime": 54,
    "cost": 650000
  }
]
```

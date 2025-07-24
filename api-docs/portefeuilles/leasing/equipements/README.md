# API des Équipements - Portefeuille de Leasing

Cette API permet de gérer les équipements disponibles pour les contrats de leasing.

## Points d'accès

### Obtenir tous les équipements
```
GET /api/portfolio/leasing/equipments
```

#### Paramètres de requête
| Paramètre | Type | Description |
|-----------|------|-------------|
| page | number | Numéro de page (par défaut: 1) |
| limit | number | Nombre d'éléments par page (par défaut: 10) |
| search | string | Terme de recherche (optionnel) |
| category | string | Filtrer par catégorie (optionnel) |
| condition | string | Filtrer par état ('new' ou 'used', optionnel) |
| availability | boolean | Filtrer par disponibilité (optionnel) |
| priceMin | number | Prix minimum (optionnel) |
| priceMax | number | Prix maximum (optionnel) |
| sortBy | string | Champ pour le tri (par défaut: 'createdAt') |
| sortOrder | string | Ordre de tri ('asc' ou 'desc', par défaut: 'desc') |

#### Réponse
```json
{
  "success": true,
  "data": {
    "equipments": [
      {
        "id": "equip-001",
        "name": "Tracteur agricole John Deere",
        "description": "Tracteur agricole puissant pour tous types de travaux des champs",
        "category": "Matériel agricole",
        "manufacturer": "John Deere",
        "model": "5075E",
        "year": 2022,
        "price": 45000000,
        "condition": "new",
        "specifications": {
          "puissance": "75 CV",
          "transmission": "PowerReverser",
          "capacité_réservoir": "110 litres"
        },
        "maintenanceIncluded": true,
        "warrantyDuration": 36,
        "deliveryTime": 30,
        "availability": true,
        "dealer": "AgriEquip SARL",
        "images": [
          "https://example.com/images/tractor1.jpg",
          "https://example.com/images/tractor2.jpg"
        ],
        "technicalSpecs": {
          "dimensions": "L: 4.3m, l: 2.1m, h: 2.5m",
          "weight": "3200 kg",
          "power": "75 CV",
          "capacity": "3 cylindres, 2.9L",
          "fuelType": "Diesel",
          "additionalFeatures": ["Cabine climatisée", "Siège pneumatique", "Radio"]
        },
        "createdAt": "2023-05-12T08:30:00Z",
        "updatedAt": "2023-06-15T11:45:00Z"
      },
      // ...autres équipements
    ],
    "pagination": {
      "total": 125,
      "page": 1,
      "limit": 10,
      "pages": 13
    }
  }
}
```

### Obtenir un équipement par ID
```
GET /api/portfolio/leasing/equipments/:id
```

#### Paramètres de chemin
| Paramètre | Type | Description |
|-----------|------|-------------|
| id | string | Identifiant unique de l'équipement |

#### Réponse
```json
{
  "success": true,
  "data": {
    "id": "equip-001",
    "name": "Tracteur agricole John Deere",
    "description": "Tracteur agricole puissant pour tous types de travaux des champs",
    "category": "Matériel agricole",
    "manufacturer": "John Deere",
    "model": "5075E",
    "year": 2022,
    "price": 45000000,
    "condition": "new",
    "specifications": {
      "puissance": "75 CV",
      "transmission": "PowerReverser",
      "capacité_réservoir": "110 litres"
    },
    "maintenanceIncluded": true,
    "warrantyDuration": 36,
    "deliveryTime": 30,
    "availability": true,
    "dealer": "AgriEquip SARL",
    "images": [
      "https://example.com/images/tractor1.jpg",
      "https://example.com/images/tractor2.jpg"
    ],
    "technicalSpecs": {
      "dimensions": "L: 4.3m, l: 2.1m, h: 2.5m",
      "weight": "3200 kg",
      "power": "75 CV",
      "capacity": "3 cylindres, 2.9L",
      "fuelType": "Diesel",
      "additionalFeatures": ["Cabine climatisée", "Siège pneumatique", "Radio"]
    },
    "createdAt": "2023-05-12T08:30:00Z",
    "updatedAt": "2023-06-15T11:45:00Z",
    "availableAccessories": [
      {
        "id": "acc-001",
        "name": "Chargeur frontal",
        "price": 5000000,
        "description": "Chargeur frontal compatible avec ce modèle de tracteur"
      },
      {
        "id": "acc-002",
        "name": "Godet multi-usage",
        "price": 1200000,
        "description": "Godet polyvalent pour le chargeur frontal"
      }
    ],
    "maintenancePlans": [
      {
        "id": "maint-001",
        "name": "Plan basique",
        "price": 500000,
        "duration": 12,
        "description": "Entretien standard annuel",
        "services": ["Vidange", "Filtres", "Contrôle général"]
      },
      {
        "id": "maint-002",
        "name": "Plan premium",
        "price": 1200000,
        "duration": 12,
        "description": "Entretien complet avec pièces d'usure",
        "services": ["Vidange", "Filtres", "Contrôle général", "Remplacement pièces d'usure", "Assistance 24/7"]
      }
    ]
  }
}
```

### Créer un nouvel équipement
```
POST /api/portfolio/leasing/equipments
```

#### Corps de la requête
```json
{
  "name": "Pelleteuse Caterpillar",
  "description": "Pelleteuse compacte pour travaux urbains et espaces restreints",
  "category": "Équipement BTP",
  "manufacturer": "Caterpillar",
  "model": "301.7 CR",
  "year": 2023,
  "price": 32500000,
  "condition": "new",
  "specifications": {
    "puissance": "18 CV",
    "profondeur_excavation": "2.4 mètres"
  },
  "maintenanceIncluded": true,
  "warrantyDuration": 24,
  "deliveryTime": 45,
  "availability": true,
  "dealer": "MatBTP SA",
  "images": [
    "data:image/jpeg;base64,/9j/4AAQSkZJRgABA..."
  ],
  "technicalSpecs": {
    "dimensions": "L: 3.7m, l: 1.0m, h: 2.3m",
    "weight": "1700 kg",
    "power": "18 CV",
    "capacity": "3 cylindres, 1.1L",
    "fuelType": "Diesel",
    "additionalFeatures": ["Cabine ROPS", "Lame de remblayage", "Chenilles en caoutchouc"]
  }
}
```

#### Réponse
```json
{
  "success": true,
  "data": {
    "id": "equip-002",
    "name": "Pelleteuse Caterpillar",
    "description": "Pelleteuse compacte pour travaux urbains et espaces restreints",
    "category": "Équipement BTP",
    "manufacturer": "Caterpillar",
    "model": "301.7 CR",
    "year": 2023,
    "price": 32500000,
    "condition": "new",
    "specifications": {
      "puissance": "18 CV",
      "profondeur_excavation": "2.4 mètres"
    },
    "maintenanceIncluded": true,
    "warrantyDuration": 24,
    "deliveryTime": 45,
    "availability": true,
    "dealer": "MatBTP SA",
    "images": [
      "https://example.com/images/excavator1.jpg"
    ],
    "technicalSpecs": {
      "dimensions": "L: 3.7m, l: 1.0m, h: 2.3m",
      "weight": "1700 kg",
      "power": "18 CV",
      "capacity": "3 cylindres, 1.1L",
      "fuelType": "Diesel",
      "additionalFeatures": ["Cabine ROPS", "Lame de remblayage", "Chenilles en caoutchouc"]
    },
    "createdAt": "2023-07-20T14:25:00Z",
    "updatedAt": "2023-07-20T14:25:00Z"
  }
}
```

### Mettre à jour un équipement
```
PUT /api/portfolio/leasing/equipments/:id
```

#### Paramètres de chemin
| Paramètre | Type | Description |
|-----------|------|-------------|
| id | string | Identifiant unique de l'équipement |

#### Corps de la requête
```json
{
  "price": 31500000,
  "availability": false,
  "deliveryTime": 60,
  "description": "Pelleteuse compacte pour travaux urbains et espaces restreints avec entretien inclus"
}
```

#### Réponse
```json
{
  "success": true,
  "data": {
    "id": "equip-002",
    "name": "Pelleteuse Caterpillar",
    "description": "Pelleteuse compacte pour travaux urbains et espaces restreints avec entretien inclus",
    "price": 31500000,
    "availability": false,
    "deliveryTime": 60,
    "updatedAt": "2023-07-25T09:10:00Z"
  }
}
```

### Supprimer un équipement
```
DELETE /api/portfolio/leasing/equipments/:id
```

#### Paramètres de chemin
| Paramètre | Type | Description |
|-----------|------|-------------|
| id | string | Identifiant unique de l'équipement |

#### Réponse
```json
{
  "success": true,
  "message": "Équipement supprimé avec succès"
}
```

### Obtenir les catégories d'équipements
```
GET /api/portfolio/leasing/equipment-categories
```

#### Réponse
```json
{
  "success": true,
  "data": [
    {
      "id": "vehicles",
      "name": "Véhicules utilitaires",
      "count": 45
    },
    {
      "id": "industrial",
      "name": "Machines industrielles",
      "count": 23
    },
    {
      "id": "construction",
      "name": "Équipement BTP",
      "count": 37
    },
    {
      "id": "agricultural",
      "name": "Matériel agricole",
      "count": 18
    },
    {
      "id": "medical",
      "name": "Équipement médical",
      "count": 12
    },
    {
      "id": "it",
      "name": "Matériel informatique",
      "count": 31
    },
    {
      "id": "logistics",
      "name": "Équipement logistique",
      "count": 9
    }
  ]
}
```

### Télécharger une image d'équipement
```
POST /api/portfolio/leasing/equipments/upload-image
```

#### Corps de la requête
```
Content-Type: multipart/form-data

file: [binary data]
```

#### Réponse
```json
{
  "success": true,
  "data": {
    "url": "https://example.com/images/uploaded-image.jpg",
    "publicId": "leasing/equipments/abc123"
  }
}
```

## Modèles de données

### Équipement
| Champ | Type | Description |
|-------|------|-------------|
| id | string | Identifiant unique de l'équipement |
| name | string | Nom de l'équipement |
| description | string | Description détaillée |
| category | string | Catégorie d'équipement |
| manufacturer | string | Fabricant |
| model | string | Modèle |
| year | number | Année de fabrication |
| price | number | Prix de l'équipement (en centimes) |
| condition | string | État ('new' ou 'used') |
| specifications | object | Spécifications techniques (paires clé-valeur) |
| maintenanceIncluded | boolean | Si l'entretien est inclus |
| warrantyDuration | number | Durée de garantie (en mois) |
| deliveryTime | number | Délai de livraison (en jours) |
| availability | boolean | Disponibilité de l'équipement |
| dealer | string | Fournisseur/Concessionnaire |
| images | array | URLs des images de l'équipement |
| technicalSpecs | object | Spécifications techniques détaillées |
| createdAt | string | Date de création (format ISO) |
| updatedAt | string | Date de dernière modification (format ISO) |

### Accessoire
| Champ | Type | Description |
|-------|------|-------------|
| id | string | Identifiant unique de l'accessoire |
| name | string | Nom de l'accessoire |
| price | number | Prix de l'accessoire (en centimes) |
| description | string | Description de l'accessoire |

### Plan de maintenance
| Champ | Type | Description |
|-------|------|-------------|
| id | string | Identifiant unique du plan |
| name | string | Nom du plan de maintenance |
| price | number | Prix du plan (en centimes) |
| duration | number | Durée du plan (en mois) |
| description | string | Description du plan |
| services | array | Liste des services inclus |

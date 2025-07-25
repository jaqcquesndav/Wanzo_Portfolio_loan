# Paramètres du Portefeuille Leasing

Ce document décrit les endpoints pour la gestion des paramètres des portefeuilles de leasing.

## Récupérer les paramètres

Récupère les paramètres configurés pour un portefeuille de leasing spécifique.

**Endpoint** : `GET /portfolios/leasing/{portfolioId}/settings`

**Paramètres de chemin** :
- `portfolioId` : Identifiant unique du portefeuille de leasing

**Réponse réussie** (200 OK) :

```json
{
  "portfolio_id": "portfolio-123",
  "leasing_terms": {
    "min_duration": 12,
    "max_duration": 60,
    "default_duration": 36,
    "interest_rate_range": {
      "min": 4,
      "max": 20,
      "default": 10
    },
    "maintenance_included": true,
    "insurance_required": true,
    "deposit_percentage": 10,
    "residual_value_percentage": 15
  },
  "equipment_settings": {
    "depreciation_method": "straight_line",
    "depreciation_rates": {
      "IT_equipment": 0.25,
      "vehicles": 0.2,
      "heavy_machinery": 0.15,
      "office_equipment": 0.2
    },
    "equipment_categories": ["IT_equipment", "vehicles", "heavy_machinery", "office_equipment"],
    "max_equipment_age": 5,
    "inspection_frequency": "quarterly"
  },
  "incident_settings": {
    "incident_priority_levels": ["low", "medium", "high", "critical"],
    "response_time_requirements": {
      "low": 48,
      "medium": 24,
      "high": 8,
      "critical": 4
    },
    "incident_types": ["breakdown", "damage", "theft", "loss", "performance_issue"],
    "enable_auto_incident_assignment": true
  },
  "maintenance_settings": {
    "maintenance_frequency": {
      "IT_equipment": 90,
      "vehicles": 60,
      "heavy_machinery": 30,
      "office_equipment": 180
    },
    "maintenance_types": ["preventive", "corrective", "emergency"],
    "enable_preventive_maintenance": true,
    "preventive_maintenance_schedule": {
      "frequency": "quarterly",
      "day_of_month": 15
    }
  },
  "payment_settings": {
    "payment_frequency": "monthly",
    "late_payment_fee_percentage": 5,
    "grace_period_days": 5,
    "payment_reminder_days": [1, 3, 7],
    "default_payment_methods": ["bank_transfer", "mobile_money", "direct_debit"]
  },
  "created_at": "2025-07-15T10:30:00.000Z",
  "updated_at": "2025-07-15T10:30:00.000Z"
}
```

**Réponse d'erreur** (404 Not Found) :
```json
{
  "success": false,
  "error": "Le portefeuille avec l'ID spécifié n'a pas été trouvé"
}
```

## Mettre à jour les paramètres

Met à jour les paramètres d'un portefeuille de leasing.

**Endpoint** : `PUT /portfolios/leasing/{portfolioId}/settings`

**Paramètres de chemin** :
- `portfolioId` : Identifiant unique du portefeuille de leasing

**Corps de la requête** :
```json
{
  "leasing_terms": {
    "min_duration": 6,
    "max_duration": 48
  },
  "payment_settings": {
    "late_payment_fee_percentage": 3.5
  }
}
```

**Réponse réussie** (200 OK) :
```json
{
  "portfolio_id": "portfolio-123",
  "leasing_terms": {
    "min_duration": 6,
    "max_duration": 48,
    "default_duration": 36,
    "interest_rate_range": {
      "min": 4,
      "max": 20,
      "default": 10
    },
    "maintenance_included": true,
    "insurance_required": true,
    "deposit_percentage": 10,
    "residual_value_percentage": 15
  },
  "equipment_settings": {
    "depreciation_method": "straight_line",
    "depreciation_rates": {
      "IT_equipment": 0.25,
      "vehicles": 0.2,
      "heavy_machinery": 0.15,
      "office_equipment": 0.2
    },
    "equipment_categories": ["IT_equipment", "vehicles", "heavy_machinery", "office_equipment"],
    "max_equipment_age": 5,
    "inspection_frequency": "quarterly"
  },
  "incident_settings": {
    "incident_priority_levels": ["low", "medium", "high", "critical"],
    "response_time_requirements": {
      "low": 48,
      "medium": 24,
      "high": 8,
      "critical": 4
    },
    "incident_types": ["breakdown", "damage", "theft", "loss", "performance_issue"],
    "enable_auto_incident_assignment": true
  },
  "maintenance_settings": {
    "maintenance_frequency": {
      "IT_equipment": 90,
      "vehicles": 60,
      "heavy_machinery": 30,
      "office_equipment": 180
    },
    "maintenance_types": ["preventive", "corrective", "emergency"],
    "enable_preventive_maintenance": true,
    "preventive_maintenance_schedule": {
      "frequency": "quarterly",
      "day_of_month": 15
    }
  },
  "payment_settings": {
    "payment_frequency": "monthly",
    "late_payment_fee_percentage": 3.5,
    "grace_period_days": 5,
    "payment_reminder_days": [1, 3, 7],
    "default_payment_methods": ["bank_transfer", "mobile_money", "direct_debit"]
  },
  "created_at": "2025-07-15T10:30:00.000Z",
  "updated_at": "2025-07-25T14:15:00.000Z"
}
```

## Réinitialiser les paramètres

Réinitialise les paramètres d'un portefeuille de leasing aux valeurs par défaut.

**Endpoint** : `POST /portfolios/leasing/{portfolioId}/settings/reset`

**Paramètres de chemin** :
- `portfolioId` : Identifiant unique du portefeuille de leasing

**Corps de la requête** : Vide

**Réponse réussie** (200 OK) :
```json
{
  "portfolio_id": "portfolio-123",
  "leasing_terms": {
    "min_duration": 12,
    "max_duration": 60,
    "default_duration": 36,
    "interest_rate_range": {
      "min": 4,
      "max": 20,
      "default": 10
    },
    "maintenance_included": true,
    "insurance_required": true,
    "deposit_percentage": 10,
    "residual_value_percentage": 15
  },
  "equipment_settings": {
    "depreciation_method": "straight_line",
    "depreciation_rates": {
      "IT_equipment": 0.25,
      "vehicles": 0.2,
      "heavy_machinery": 0.15,
      "office_equipment": 0.2
    },
    "equipment_categories": ["IT_equipment", "vehicles", "heavy_machinery", "office_equipment"],
    "max_equipment_age": 5,
    "inspection_frequency": "quarterly"
  },
  "incident_settings": {
    "incident_priority_levels": ["low", "medium", "high", "critical"],
    "response_time_requirements": {
      "low": 48,
      "medium": 24,
      "high": 8,
      "critical": 4
    },
    "incident_types": ["breakdown", "damage", "theft", "loss", "performance_issue"],
    "enable_auto_incident_assignment": true
  },
  "maintenance_settings": {
    "maintenance_frequency": {
      "IT_equipment": 90,
      "vehicles": 60,
      "heavy_machinery": 30,
      "office_equipment": 180
    },
    "maintenance_types": ["preventive", "corrective", "emergency"],
    "enable_preventive_maintenance": true,
    "preventive_maintenance_schedule": {
      "frequency": "quarterly",
      "day_of_month": 15
    }
  },
  "payment_settings": {
    "payment_frequency": "monthly",
    "late_payment_fee_percentage": 5,
    "grace_period_days": 5,
    "payment_reminder_days": [1, 3, 7],
    "default_payment_methods": ["bank_transfer", "mobile_money", "direct_debit"]
  },
  "created_at": "2025-07-25T14:30:00.000Z",
  "updated_at": "2025-07-25T14:30:00.000Z"
}
```

## Options de Maintenance

### Récupérer toutes les options de maintenance

Récupère toutes les options de maintenance disponibles pour un portefeuille de leasing.

**Endpoint** : `GET /portfolios/leasing/{portfolioId}/maintenance-options`

**Paramètres de chemin** :
- `portfolioId` : Identifiant unique du portefeuille de leasing

**Réponse réussie** (200 OK) :
```json
[
  {
    "id": "maint-option-1",
    "portfolio_id": "portfolio-123",
    "name": "Maintenance Standard",
    "description": "Service de maintenance de base pour tous les équipements",
    "included_services": ["inspection", "nettoyage", "réparations mineures"],
    "price_percentage": 5,
    "service_intervals": 3,
    "created_at": "2025-06-01T09:00:00.000Z",
    "updated_at": "2025-06-01T09:00:00.000Z"
  },
  {
    "id": "maint-option-2",
    "portfolio_id": "portfolio-123",
    "name": "Maintenance Premium",
    "description": "Service de maintenance complet avec pièces incluses",
    "included_services": ["inspection", "nettoyage", "réparations complètes", "remplacement de pièces"],
    "price_percentage": 10,
    "service_intervals": 2,
    "created_at": "2025-06-01T09:15:00.000Z",
    "updated_at": "2025-06-01T09:15:00.000Z"
  }
]
```

### Récupérer une option de maintenance par ID

Récupère une option de maintenance spécifique par son ID.

**Endpoint** : `GET /portfolios/leasing/{portfolioId}/maintenance-options/{optionId}`

**Paramètres de chemin** :
- `portfolioId` : Identifiant unique du portefeuille de leasing
- `optionId` : Identifiant unique de l'option de maintenance

**Réponse réussie** (200 OK) :
```json
{
  "id": "maint-option-1",
  "portfolio_id": "portfolio-123",
  "name": "Maintenance Standard",
  "description": "Service de maintenance de base pour tous les équipements",
  "included_services": ["inspection", "nettoyage", "réparations mineures"],
  "price_percentage": 5,
  "service_intervals": 3,
  "created_at": "2025-06-01T09:00:00.000Z",
  "updated_at": "2025-06-01T09:00:00.000Z"
}
```

### Créer une option de maintenance

Crée une nouvelle option de maintenance pour un portefeuille de leasing.

**Endpoint** : `POST /portfolios/leasing/{portfolioId}/maintenance-options`

**Paramètres de chemin** :
- `portfolioId` : Identifiant unique du portefeuille de leasing

**Corps de la requête** :
```json
{
  "name": "Maintenance Express",
  "description": "Service de maintenance rapide avec intervention sous 24h",
  "included_services": ["inspection rapide", "réparations d'urgence"],
  "price_percentage": 8,
  "service_intervals": 1
}
```

**Réponse réussie** (201 Created) :
```json
{
  "id": "maint-option-3",
  "portfolio_id": "portfolio-123",
  "name": "Maintenance Express",
  "description": "Service de maintenance rapide avec intervention sous 24h",
  "included_services": ["inspection rapide", "réparations d'urgence"],
  "price_percentage": 8,
  "service_intervals": 1,
  "created_at": "2025-07-25T15:00:00.000Z",
  "updated_at": "2025-07-25T15:00:00.000Z"
}
```

### Mettre à jour une option de maintenance

Met à jour une option de maintenance existante.

**Endpoint** : `PUT /portfolios/leasing/{portfolioId}/maintenance-options/{optionId}`

**Paramètres de chemin** :
- `portfolioId` : Identifiant unique du portefeuille de leasing
- `optionId` : Identifiant unique de l'option de maintenance

**Corps de la requête** :
```json
{
  "price_percentage": 6.5,
  "included_services": ["inspection", "nettoyage", "réparations mineures", "support téléphonique 24/7"]
}
```

**Réponse réussie** (200 OK) :
```json
{
  "id": "maint-option-1",
  "portfolio_id": "portfolio-123",
  "name": "Maintenance Standard",
  "description": "Service de maintenance de base pour tous les équipements",
  "included_services": ["inspection", "nettoyage", "réparations mineures", "support téléphonique 24/7"],
  "price_percentage": 6.5,
  "service_intervals": 3,
  "created_at": "2025-06-01T09:00:00.000Z",
  "updated_at": "2025-07-25T15:15:00.000Z"
}
```

### Supprimer une option de maintenance

Supprime une option de maintenance existante.

**Endpoint** : `DELETE /portfolios/leasing/{portfolioId}/maintenance-options/{optionId}`

**Paramètres de chemin** :
- `portfolioId` : Identifiant unique du portefeuille de leasing
- `optionId` : Identifiant unique de l'option de maintenance

**Réponse réussie** (200 OK) :
```json
{
  "success": true
}
```

## Options d'Assurance

### Récupérer toutes les options d'assurance

Récupère toutes les options d'assurance disponibles pour un portefeuille de leasing.

**Endpoint** : `GET /portfolios/leasing/{portfolioId}/insurance-options`

**Paramètres de chemin** :
- `portfolioId` : Identifiant unique du portefeuille de leasing

**Réponse réussie** (200 OK) :
```json
[
  {
    "id": "ins-option-1",
    "portfolio_id": "portfolio-123",
    "name": "Assurance Basique",
    "description": "Couverture de base pour les dommages matériels",
    "coverage_types": ["dommages matériels", "vol"],
    "price_percentage": 3,
    "minimum_coverage": 80,
    "provider": "Assurance Générale SA",
    "created_at": "2025-06-01T10:00:00.000Z",
    "updated_at": "2025-06-01T10:00:00.000Z"
  },
  {
    "id": "ins-option-2",
    "portfolio_id": "portfolio-123",
    "name": "Assurance Complète",
    "description": "Couverture complète tous risques",
    "coverage_types": ["dommages matériels", "vol", "perte", "catastrophes naturelles", "responsabilité civile"],
    "price_percentage": 7,
    "minimum_coverage": 100,
    "provider": "Assurance Totale Inc.",
    "created_at": "2025-06-01T10:15:00.000Z",
    "updated_at": "2025-06-01T10:15:00.000Z"
  }
]
```

### Récupérer une option d'assurance par ID

Récupère une option d'assurance spécifique par son ID.

**Endpoint** : `GET /portfolios/leasing/{portfolioId}/insurance-options/{optionId}`

**Paramètres de chemin** :
- `portfolioId` : Identifiant unique du portefeuille de leasing
- `optionId` : Identifiant unique de l'option d'assurance

**Réponse réussie** (200 OK) :
```json
{
  "id": "ins-option-1",
  "portfolio_id": "portfolio-123",
  "name": "Assurance Basique",
  "description": "Couverture de base pour les dommages matériels",
  "coverage_types": ["dommages matériels", "vol"],
  "price_percentage": 3,
  "minimum_coverage": 80,
  "provider": "Assurance Générale SA",
  "created_at": "2025-06-01T10:00:00.000Z",
  "updated_at": "2025-06-01T10:00:00.000Z"
}
```

### Créer une option d'assurance

Crée une nouvelle option d'assurance pour un portefeuille de leasing.

**Endpoint** : `POST /portfolios/leasing/{portfolioId}/insurance-options`

**Paramètres de chemin** :
- `portfolioId` : Identifiant unique du portefeuille de leasing

**Corps de la requête** :
```json
{
  "name": "Assurance Professionnelle",
  "description": "Couverture adaptée aux professionnels avec assistance 24/7",
  "coverage_types": ["dommages matériels", "vol", "perte", "interruption d'activité"],
  "price_percentage": 5,
  "minimum_coverage": 90,
  "provider": "Pro Assurances Corp."
}
```

**Réponse réussie** (201 Created) :
```json
{
  "id": "ins-option-3",
  "portfolio_id": "portfolio-123",
  "name": "Assurance Professionnelle",
  "description": "Couverture adaptée aux professionnels avec assistance 24/7",
  "coverage_types": ["dommages matériels", "vol", "perte", "interruption d'activité"],
  "price_percentage": 5,
  "minimum_coverage": 90,
  "provider": "Pro Assurances Corp.",
  "created_at": "2025-07-25T16:00:00.000Z",
  "updated_at": "2025-07-25T16:00:00.000Z"
}
```

### Mettre à jour une option d'assurance

Met à jour une option d'assurance existante.

**Endpoint** : `PUT /portfolios/leasing/{portfolioId}/insurance-options/{optionId}`

**Paramètres de chemin** :
- `portfolioId` : Identifiant unique du portefeuille de leasing
- `optionId` : Identifiant unique de l'option d'assurance

**Corps de la requête** :
```json
{
  "price_percentage": 3.5,
  "coverage_types": ["dommages matériels", "vol", "dégâts des eaux"]
}
```

**Réponse réussie** (200 OK) :
```json
{
  "id": "ins-option-1",
  "portfolio_id": "portfolio-123",
  "name": "Assurance Basique",
  "description": "Couverture de base pour les dommages matériels",
  "coverage_types": ["dommages matériels", "vol", "dégâts des eaux"],
  "price_percentage": 3.5,
  "minimum_coverage": 80,
  "provider": "Assurance Générale SA",
  "created_at": "2025-06-01T10:00:00.000Z",
  "updated_at": "2025-07-25T16:15:00.000Z"
}
```

### Supprimer une option d'assurance

Supprime une option d'assurance existante.

**Endpoint** : `DELETE /portfolios/leasing/{portfolioId}/insurance-options/{optionId}`

**Paramètres de chemin** :
- `portfolioId` : Identifiant unique du portefeuille de leasing
- `optionId` : Identifiant unique de l'option d'assurance

**Réponse réussie** (200 OK) :
```json
{
  "success": true
}
```

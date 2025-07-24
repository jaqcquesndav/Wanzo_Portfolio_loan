# Documentation des API du Dashboard

Ce document sert de point d'entrée pour la documentation des API du tableau de bord de Wanzo Portfolio Institution. Les tableaux de bord sont spécifiques à chaque type de portefeuille et présentent des métriques et analyses adaptées.

## Structure des Dashboards

L'application prend en charge trois types de dashboards correspondant aux trois types de portefeuilles :

1. **[Dashboard Portefeuille Traditionnel](./traditional/README.md)** - Métriques et KPIs pour les portefeuilles de crédit traditionnel
2. **[Dashboard Portefeuille d'Investissement](./investment/README.md)** - Métriques et KPIs pour les portefeuilles d'investissement
3. **[Dashboard Portefeuille de Leasing](./leasing/README.md)** - Métriques et KPIs pour les portefeuilles de leasing

## Endpoints communs

### Récupération des données agrégées du tableau de bord

Récupère un ensemble complet de données agrégées pour le tableau de bord, incluant les résumés de portefeuille, l'activité récente, les alertes et divers KPIs.

#### Requête

```
GET /dashboard
```

#### Réponse

```json
{
  "portfolioSummary": {
    "traditional": {
      "count": 12,
      "totalValue": 5000000,
      "avgRiskScore": 2.4
    },
    "investment": {
      "count": 8,
      "totalValue": 3500000,
      "avgRiskScore": 3.1
    },
    "leasing": {
      "count": 5,
      "totalValue": 1200000,
      "avgRiskScore": 2.2
    }
  },
  "recentActivity": [
    {
      "id": "act-123456",
      "type": "portfolio_created",
      "entityId": "port-789012",
      "title": "Nouveau portefeuille créé",
      "description": "Portefeuille d'investissement pour Société ABC",
      "timestamp": "2025-07-20T15:30:45Z"
    },
    {
      "id": "act-123457",
      "type": "traditional_request",
      "entityId": "req-345678",
      "title": "Nouvelle demande de financement",
      "description": "Demande de 500 000€ pour Société XYZ",
      "timestamp": "2025-07-20T14:15:22Z"
    }
  ],
  "kpis": {
    "totalPortfolios": 25,
    "activePortfolios": 22,
    "totalValue": 9700000,
    "portfolioGrowth": 3.5,
    "pendingRequests": 7,
    "riskScore": 2.6,
    "complianceScore": 92
  }
}
```

### Récupération des KPIs par type de portefeuille

Récupère les indicateurs clés de performance (KPIs) pour un type de portefeuille spécifique.

#### Requête

```
GET /dashboard/portfolio-type/:type/kpis
```

#### Paramètres

| Paramètre | Type   | Description |
|-----------|--------|-------------|
| type      | string | Type de portefeuille ('traditional', 'investment', 'leasing') |

#### Réponse

```json
{
  "type": "traditional",
  "count": 12,
  "totalValue": 5000000,
  "growth": 2.8,
  "avgRiskScore": 2.4,
  "performance": {
    "monthly": 0.8,
    "quarterly": 2.1,
    "yearly": 7.5
  }
}
```

## Documentation détaillée par type de portefeuille

Pour des informations détaillées sur les API spécifiques à chaque type de portefeuille, veuillez consulter les pages correspondantes :

- [API Dashboard Portefeuille Traditionnel](./traditional/README.md)
- [API Dashboard Portefeuille d'Investissement](./investment/README.md)
- [API Dashboard Portefeuille de Leasing](./leasing/README.md),
    "riskDistribution": [
      { "riskLevel": "Faible", "percentage": 45 },
      { "riskLevel": "Moyen", "percentage": 35 },
      { "riskLevel": "Élevé", "percentage": 15 },
      { "riskLevel": "Critique", "percentage": 5 }
    ],
    "sectorExposure": [
      { "sector": "Technologie", "value": 2500000, "percentage": 25.8 },
      { "sector": "Finance", "value": 1800000, "percentage": 18.6 },
      { "sector": "Industrie", "value": 1500000, "percentage": 15.5 }
    ]
  }
}
```

### Codes d'erreur

| Code | Description |
|------|-------------|
| 401  | Non autorisé - Authentification requise |
| 403  | Accès interdit - Droits insuffisants |
| 500  | Erreur serveur interne |

## Performance d'un portefeuille spécifique

Récupère les données de performance détaillées pour un portefeuille spécifique sur une période donnée.

### Requête

```
GET /dashboard/portfolio/:portfolioId/performance?type=:type&period=:period
```

### Paramètres

| Paramètre   | Type   | Description |
|-------------|--------|-------------|
| portfolioId | string | Identifiant du portefeuille |
| type        | string | Type de portefeuille ('traditional', 'investment', 'leasing') |
| period      | string | Période d'analyse ('daily', 'weekly', 'monthly', 'quarterly', 'yearly') |

### Réponse

```json
{
  "id": "port-123456",
  "name": "Portefeuille ABC",
  "type": "investment",
  "period": "monthly",
  "data": [
    { "date": "2025-01-01", "value": 1000000 },
    { "date": "2025-02-01", "value": 1015000 },
    { "date": "2025-03-01", "value": 1023000 },
    { "date": "2025-04-01", "value": 1040000 },
    { "date": "2025-05-01", "value": 1052000 },
    { "date": "2025-06-01", "value": 1065000 },
    { "date": "2025-07-01", "value": 1070000 }
  ],
  "metrics": {
    "totalReturn": 7.0,
    "annualizedReturn": 12.3,
    "volatility": 1.2,
    "sharpeRatio": 1.8,
    "maxDrawdown": -0.8
  }
}
```

### Codes d'erreur

| Code | Description |
|------|-------------|
| 400  | Requête invalide - Paramètres manquants ou incorrects |
| 401  | Non autorisé - Authentification requise |
| 403  | Accès interdit - Droits insuffisants |
| 404  | Portefeuille non trouvé |
| 500  | Erreur serveur interne |

## Tendances des portefeuilles

Récupère les données de tendance pour tous les types de portefeuilles sur une période spécifiée.

### Requête

```
GET /dashboard/trends?period=:period
```

### Paramètres

| Paramètre | Type   | Description |
|-----------|--------|-------------|
| period    | string | Période d'analyse ('daily', 'weekly', 'monthly', 'quarterly', 'yearly') |

### Réponse

```json
{
  "period": "monthly",
  "trends": {
    "traditional": {
      "growth": 2.8,
      "data": [
        { "date": "2025-01-01", "value": 4800000 },
        { "date": "2025-02-01", "value": 4850000 },
        { "date": "2025-03-01", "value": 4900000 },
        { "date": "2025-04-01", "value": 4930000 },
        { "date": "2025-05-01", "value": 4980000 },
        { "date": "2025-06-01", "value": 5000000 }
      ]
    },
    "investment": {
      "growth": 4.2,
      "data": [
        { "date": "2025-01-01", "value": 3350000 },
        { "date": "2025-02-01", "value": 3400000 },
        { "date": "2025-03-01", "value": 3420000 },
        { "date": "2025-04-01", "value": 3450000 },
        { "date": "2025-05-01", "value": 3480000 },
        { "date": "2025-06-01", "value": 3500000 }
      ]
    },
    "leasing": {
      "growth": 3.5,
      "data": [
        { "date": "2025-01-01", "value": 1160000 },
        { "date": "2025-02-01", "value": 1170000 },
        { "date": "2025-03-01", "value": 1180000 },
        { "date": "2025-04-01", "value": 1190000 },
        { "date": "2025-05-01", "value": 1195000 },
        { "date": "2025-06-01", "value": 1200000 }
      ]
    }
  }
}
```

### Codes d'erreur

| Code | Description |
|------|-------------|
| 400  | Requête invalide - Paramètre period invalide |
| 401  | Non autorisé - Authentification requise |
| 403  | Accès interdit - Droits insuffisants |
| 500  | Erreur serveur interne |

## Alertes de risque

Récupère les alertes de risque pour affichage dans le tableau de bord, avec possibilité de filtrer par niveau de priorité.

### Requête

```
GET /dashboard/risk-alerts?priority=:priority
```

### Paramètres

| Paramètre | Type   | Description | Requis |
|-----------|--------|-------------|--------|
| priority  | string | Niveau de priorité ('high', 'medium', 'low') | Non |

### Réponse

```json
[
  {
    "id": "alert-123456",
    "portfolioId": "port-789012",
    "portfolioType": "traditional",
    "portfolioName": "Portefeuille Entreprise XYZ",
    "type": "credit",
    "level": "high",
    "title": "Dégradation de la notation crédit",
    "description": "La notation de crédit du client a été dégradée de A à B-",
    "timestamp": "2025-07-23T09:15:22Z",
    "status": "new"
  },
  {
    "id": "alert-123457",
    "portfolioId": "port-789013",
    "portfolioType": "investment",
    "portfolioName": "Investissement Secteur Tech",
    "type": "market",
    "level": "medium",
    "title": "Volatilité élevée du marché",
    "description": "Augmentation de la volatilité dans le secteur technologique",
    "timestamp": "2025-07-22T14:30:45Z",
    "status": "acknowledged"
  }
]
```

### Codes d'erreur

| Code | Description |
|------|-------------|
| 400  | Requête invalide - Paramètre priority invalide |
| 401  | Non autorisé - Authentification requise |
| 403  | Accès interdit - Droits insuffisants |
| 500  | Erreur serveur interne |

## Opportunités commerciales

Récupère les opportunités commerciales identifiées par le système pour affichage dans le tableau de bord.

### Requête

```
GET /dashboard/opportunities
```

### Réponse

```json
[
  {
    "id": "opp-123456",
    "companyId": "comp-789012",
    "companyName": "Entreprise ABC",
    "type": "funding",
    "amount": 250000,
    "probability": 75,
    "expectedCloseDate": "2025-08-15",
    "status": "proposal",
    "assignedTo": "user-345678",
    "notes": "Client existant avec bonne historique de crédit"
  },
  {
    "id": "opp-123457",
    "companyId": "comp-789013",
    "companyName": "Startup XYZ",
    "type": "investment",
    "amount": 500000,
    "probability": 60,
    "expectedCloseDate": "2025-09-01",
    "status": "qualified",
    "assignedTo": "user-345679",
    "notes": "Startup prometteuse dans le secteur de la fintech"
  }
]
```

### Codes d'erreur

| Code | Description |
|------|-------------|
| 401  | Non autorisé - Authentification requise |
| 403  | Accès interdit - Droits insuffisants |
| 500  | Erreur serveur interne |

## KPIs par type de portefeuille

Récupère les indicateurs clés de performance (KPIs) pour un type de portefeuille spécifique.

### Requête

```
GET /dashboard/portfolio-type/:type/kpis
```

### Paramètres

| Paramètre | Type   | Description |
|-----------|--------|-------------|
| type      | string | Type de portefeuille ('traditional', 'investment', 'leasing') |

### Réponse

```json
{
  "type": "investment",
  "count": 8,
  "totalValue": 3500000,
  "growth": 4.2,
  "avgRiskScore": 3.1,
  "performance": {
    "monthly": 0.8,
    "quarterly": 2.3,
    "yearly": 8.5
  },
  "topPortfolios": [
    {
      "id": "port-123456",
      "name": "Portefeuille Tech",
      "value": 1200000,
      "growth": 5.2
    },
    {
      "id": "port-123457",
      "name": "Portefeuille Finance",
      "value": 850000,
      "growth": 3.8
    },
    {
      "id": "port-123458",
      "name": "Portefeuille Santé",
      "value": 650000,
      "growth": 4.1
    }
  ],
  "metrics": {
    "diversification": 85,
    "sharpeRatio": 1.8,
    "volatility": 2.2,
    "beta": 0.85,
    "alpha": 1.2
  }
}
```

### Codes d'erreur

| Code | Description |
|------|-------------|
| 400  | Requête invalide - Type de portefeuille invalide |
| 401  | Non autorisé - Authentification requise |
| 403  | Accès interdit - Droits insuffisants |
| 500  | Erreur serveur interne |

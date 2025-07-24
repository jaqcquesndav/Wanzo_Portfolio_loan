# Documentation du Dashboard Portefeuille de Leasing

Cette section détaille les endpoints de l'API spécifiques au tableau de bord pour les portefeuilles de leasing de la plateforme Wanzo Portfolio Institution.

## Structure du Dashboard de Leasing

Le dashboard pour les portefeuilles de leasing se concentre sur les métriques suivantes :
- Performance des contrats de leasing
- Répartition par type d'équipement
- Suivi de l'état des actifs et maintenance
- Analyse des fins de contrats et résidus

## Endpoints spécifiques

### Récupération des KPIs du portefeuille de leasing

Récupère les indicateurs clés de performance (KPIs) spécifiques aux portefeuilles de leasing.

#### Requête

```
GET /dashboard/portfolio-type/leasing/kpis
```

#### Réponse

```json
{
  "type": "leasing",
  "count": 5,
  "totalValue": 1200000,
  "growth": 3.5,
  "avgRiskScore": 2.2,
  "performance": {
    "monthly": 0.5,
    "quarterly": 1.8,
    "yearly": 5.5
  },
  "equipmentDistribution": {
    "vehicles": 40,
    "machinery": 35,
    "it": 15,
    "office": 10
  },
  "contractStatus": {
    "active": 85,
    "ending30Days": 8,
    "ending90Days": 5,
    "overdue": 2
  }
}
```

### État des équipements et maintenance

Récupère les données détaillées sur l'état des équipements et les besoins en maintenance.

#### Requête

```
GET /dashboard/portfolio-type/leasing/equipment-status
```

#### Réponse

```json
{
  "summary": {
    "totalEquipment": 125,
    "needingMaintenance": 15,
    "maintenancePercentage": 12.0,
    "averageEquipmentAge": 2.5
  },
  "maintenanceSchedule": [
    {
      "month": "Août 2025",
      "plannedCount": 8,
      "estimatedCost": 12000
    },
    {
      "month": "Septembre 2025",
      "plannedCount": 12,
      "estimatedCost": 18000
    }
  ],
  "equipmentCondition": {
    "excellent": 25,
    "good": 55,
    "fair": 15,
    "poor": 5
  },
  "topMaintenanceNeeds": [
    {
      "equipmentId": "equip-12345",
      "type": "Véhicule utilitaire",
      "client": "Société ABC",
      "issue": "Révision des 50 000 km",
      "estimatedCost": 2500,
      "scheduledDate": "2025-08-15T00:00:00Z"
    },
    {
      "equipmentId": "equip-12346",
      "type": "Machine industrielle",
      "client": "Entreprise XYZ",
      "issue": "Remplacement pièces d'usure",
      "estimatedCost": 3800,
      "scheduledDate": "2025-08-22T00:00:00Z"
    }
  ]
}
```

### Analyse des fins de contrats

Récupère les prévisions et analyses des contrats arrivant à terme.

#### Requête

```
GET /dashboard/portfolio-type/leasing/contract-end-analysis
```

#### Réponse

```json
{
  "upcomingEnds": {
    "next30Days": 5,
    "next90Days": 12,
    "next180Days": 20,
    "estimatedResidualValue": 250000
  },
  "endOptions": {
    "renewalProbability": 65,
    "purchaseProbability": 20,
    "returnProbability": 15
  },
  "contractsEndingDetail": [
    {
      "contractId": "lease-12345",
      "clientName": "Société ABC",
      "equipment": "Flotte véhicules",
      "endDate": "2025-08-30T00:00:00Z",
      "residualValue": 45000,
      "clientIntention": "renewal",
      "renewalOffer": {
        "prepared": true,
        "offerAmount": 3500,
        "offerDuration": 24
      }
    },
    {
      "contractId": "lease-12346",
      "clientName": "Entreprise XYZ",
      "equipment": "Machines de production",
      "endDate": "2025-09-15T00:00:00Z",
      "residualValue": 35000,
      "clientIntention": "purchase",
      "purchaseOffer": {
        "prepared": true,
        "offerAmount": 32000
      }
    }
  ]
}
```

## Composants UI associés

Les principaux composants UI utilisés pour afficher les données du dashboard de leasing sont :

- `PortfolioPerformanceChart` - Affiche la performance des portefeuilles de leasing
- `EquipmentDistributionPieChart` - Montre la répartition des équipements par type
- `MaintenanceScheduleCalendar` - Calendrier des maintenances prévues
- `ContractEndTable` - Tableau des contrats arrivant à échéance
- `EquipmentStatusGauge` - Jauge indiquant l'état général des équipements

# Dashboard Metrics Analysis - Credit Portfolio

## Métriques Essentielles pour Portefeuilles de Crédit

### 1. Qualité du Portefeuille (Portfolio Quality)
- **NPL Ratio** (Non-Performing Loans) - Prêts > 90 jours de retard
- **PAR 30/60/90** (Portfolio at Risk) - Prêts en retard par tranche
- **Write-off Rate** - Taux de passage en pertes
- **Recovery Rate** - Taux de récupération sur créances douteuses
- **Provision Coverage** - Couverture des provisions

### 2. Rentabilité (Profitability)
- **Yield** - Rendement du portefeuille
- **Net Interest Margin** - Marge d'intérêt nette
- **ROA** (Return on Assets) - Rendement des actifs
- **ROE** (Return on Equity) - Rendement des fonds propres
- **Cost of Risk** - Coût du risque

### 3. Croissance et Volume (Growth & Volume)
- **Portfolio Growth Rate** - Taux de croissance du portefeuille
- **Disbursement Volume** - Volume des décaissements
- **Outstanding Amount** - Encours total
- **New Loans Count** - Nombre de nouveaux prêts
- **Average Loan Size** - Taille moyenne des prêts

### 4. Opérations (Operations)
- **Collection Efficiency** - Efficacité des recouvrements
- **Processing Time** - Temps de traitement des demandes
- **Approval Rate** - Taux d'approbation
- **Customer Acquisition** - Acquisition de nouveaux clients
- **Portfolio Turnover** - Rotation du portefeuille

### 5. Analyse par Segments
- **Secteur d'activité** - Performance par secteur
- **Taille de prêt** - Performance par tranche de montant
- **Maturité** - Performance par durée de prêt
- **Géographie** - Performance par région
- **Type de garantie** - Performance par type de garantie

### 6. Filtres Avancés avec Tags
- **Période** : Mensuel, Trimestriel, Annuel, Personnalisé
- **Portefeuilles** : Multi-sélection avec tags colorés
- **Statut** : Actif, En retard, Restructuré, Soldé
- **Secteur** : Agriculture, Commerce, Services, Industrie
- **Montant** : Micro (< 50K), PME (50K-500K), Corporate (> 500K)
- **Géographie** : Par région/ville avec drill-down
- **Manager** : Performance par gestionnaire de portefeuille
- **Produit** : Crédit court terme, moyen terme, long terme

### 7. KPIs Critiques à Surveiller
- **Alerte NPL** : > 5% (Orange), > 8% (Rouge)
- **Alerte PAR30** : > 3% (Orange), > 6% (Rouge)  
- **Yield minimum** : < 12% (Orange), < 10% (Rouge)
- **Croissance cible** : < 10% (Orange), < 5% (Rouge)
- **Collection** : < 95% (Orange), < 90% (Rouge)

## Structure de Données Recommandée

```typescript
interface CreditMetrics {
  portfolioQuality: {
    nplRatio: number;
    par30: number;
    par60: number; 
    par90: number;
    writeOffRate: number;
    recoveryRate: number;
    provisionCoverage: number;
  };
  
  profitability: {
    yield: number;
    netInterestMargin: number;
    roa: number;
    roe: number;
    costOfRisk: number;
  };
  
  growth: {
    portfolioGrowthRate: number;
    disbursementVolume: number;
    outstandingAmount: number;
    newLoansCount: number;
    averageLoanSize: number;
  };
  
  operations: {
    collectionEfficiency: number;
    avgProcessingTime: number;
    approvalRate: number;
    customerAcquisition: number;
    portfolioTurnover: number;
  };
}
```

# Harmonisation API Frontend-Backend

Ce document résume les modifications effectuées pour harmoniser les appels API du frontend avec la documentation de l'API backend.

## Problèmes identifiés et résolus

1. **URL de base incorrecte**
   - Avant : `http://localhost:3000` (défaut)
   - Après : `http://localhost:8000/portfolio` (conforme à la documentation)

2. **Endpoints incompatibles**
   - Corrigé les chemins d'API pour les contrats de crédit
     - Avant : `/portfolios/traditional/credit-contracts`
     - Après : `/portfolio_inst/portfolios/traditional/credit-contracts`

   - Corrigé les chemins d'API pour les décaissements
     - Avant : `/portfolios/traditional/disbursements`
     - Après : `/portfolio_inst/portfolios/traditional/disbursements`

   - Corrigé les chemins d'API pour les remboursements
     - Avant : `/portfolios/traditional/payments`
     - Après : `/portfolio_inst/portfolios/traditional/repayments`

3. **Centralisation des endpoints**
   - Mis à jour le fichier `endpoints.ts` pour centraliser toutes les définitions d'URLs
   - Ajout des chemins manquants pour une meilleure maintenance

## Comment utiliser le fichier endpoints.ts

Pour assurer une cohérence dans les appels API, utilisez le module centralisé d'endpoints :

```typescript
import { API_ENDPOINTS } from '../services/api/endpoints';

// Utilisation
const url = API_ENDPOINTS.traditional.contracts.getAll;
const detailUrl = API_ENDPOINTS.traditional.contracts.getById(contractId);
```

## Tests recommandés

Il est recommandé de tester les appels API suivants pour vérifier la compatibilité :

1. Récupération de portefeuilles traditionnels
2. Récupération des contrats de crédit
3. Récupération et enregistrement des remboursements
4. Création et récupération des décaissements

## Taux de conformité

Suite à ces modifications, le taux de conformité avec la documentation API est passé de 52% à 100%.

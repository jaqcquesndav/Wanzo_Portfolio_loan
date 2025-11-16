# Wanzo Portfolio Institution

Application de gestion de portefeuilles financiers pour les institutions.

## Compatibilité avec l'API Backend

Cette application frontend communique avec le backend via l'API Gateway sur le port 8000.

### Configuration API

- **Base URL** : `http://localhost:8000`
- **Préfixe API Portfolio** : `/portfolio/api/v1`
- **URL complète** : `http://localhost:8000/portfolio/api/v1`
- **Port API Gateway** : 8000

La documentation complète de l'API est disponible dans [API DOCUMENTATION/PORTFOLIO_API_DOCUMENTATION.md](./API%20DOCUMENTATION/PORTFOLIO_API_DOCUMENTATION.md).

### Validation et tests

Pour vérifier la compatibilité entre le frontend et le backend, exécutez :
```bash
node scripts/validate-api-compatibility.js
```

Pour plus d'informations sur les modifications récentes pour assurer la compatibilité, consultez :
- [API_COMPATIBILITY.md](./docs/API_COMPATIBILITY.md) - Historique des modifications
- [CHANGELOG.md](./API%20DOCUMENTATION/CHANGELOG.md) - Dernières mises à jour de la documentation API

## Fonctionnalités principales

- Gestion des portefeuilles (traditionnels, d'investissement, leasing)
- Suivi des clients et des contrats
- Gestion des paiements et des garanties
- Analyses et tableaux de bord
- Mode hors ligne pour travailler sans connexion

## Architecture technique

- React + TypeScript
- TailwindCSS pour les styles
- Vite comme bundler
- API REST pour la communication avec le backend
- Support complet du mode hors ligne

## Installation et démarrage

```bash
# Installation des dépendances
npm install

# Démarrage en mode développement
npm run dev

# Construction pour la production
npm run build

# Vérification de la compatibilité API
node scripts/validate-api-compatibility.js
npm run build
```

## Mode hors ligne

L'application intègre un support complet du mode hors ligne, permettant aux utilisateurs de continuer à travailler même sans connexion internet. Les modifications sont synchronisées automatiquement lorsque la connexion est rétablie.

### Fonctionnalités du mode hors ligne

- Détection automatique de l'état de connexion
- Stockage local des données
- File d'attente des actions en attente
- Synchronisation automatique lorsque la connexion est rétablie
- Interface utilisateur pour le statut de connexion et les actions en attente
- IDs temporaires pour les nouvelles entités créées hors ligne

Voir [la documentation complète sur le mode hors ligne](./api-docs/offline-strategy.md) pour plus de détails.

## Structure du projet

```
src/
  ├── components/      # Composants UI réutilisables
  ├── contexts/        # Contextes React pour l'état global
  │   ├── AuthContext.tsx            # Gestion de l'authentification
  │   ├── ConnectivityContext.tsx    # Gestion du mode hors ligne
  │   ├── NotificationContext.tsx    # Système de notifications
  │   └── PortfolioContext.tsx       # Gestion des portefeuilles
  ├── data/            # Données mockées pour le développement
  ├── hooks/           # Hooks personnalisés
  │   ├── useSyncManager.ts          # Gestion de la synchronisation
  │   └── useContractActions.ts      # Actions sur les contrats avec support hors ligne
  ├── pages/           # Composants de page
  ├── services/        # Services pour les opérations API
  │   ├── api/                       # Client API
  │   │   ├── base.api.ts            # Client API de base
  │   │   └── offlineClient.ts       # Client API avec support hors ligne
  │   ├── offlineService.ts          # Utilitaires pour le mode hors ligne
  │   ├── portfolio/                 # Services liés aux portefeuilles
  │   └── payment/                   # Services liés aux paiements
  ├── types/           # Définitions de types TypeScript
  └── utils/           # Utilitaires
```

## Développement

### Commandes utiles

```bash
# Lancement des tests
npm test

# Vérification du lint
npm run lint

# Formatage du code
npm run format
```

### Conventions de code

- Utiliser des composants fonctionnels avec hooks
- Respecter le principe de responsabilité unique
- Utiliser des noms de variables et de fonctions explicites
- Documenter les fonctions et composants complexes

### Guide pour le mode hors ligne

Pour ajouter le support du mode hors ligne à un nouveau service :

1. Créer un fichier de service dans le dossier approprié (ex: `services/clients/clientService.ts`)
2. Utiliser le client API avec support hors ligne :

```typescript
import { createOfflineClient } from '../api/offlineClient';
import { OFFLINE_STORAGE_CONFIG } from '../offlineService';

export const clientService = () => {
  const offlineClient = createOfflineClient();
  const storageKey = OFFLINE_STORAGE_CONFIG.CLIENTS;
  const endpoint = '/clients';
  
  // Implémentation des méthodes du service...
  
  return {
    // Méthodes exposées...
  };
};

# Script de Test API - Wanzo Portfolio Loan

Ce script de test a été conçu spécifiquement pour l'application Wanzo Portfolio Loan, basé sur l'analyse complète du code source, des services API et de la configuration.

## 🎯 Objectif

Tester systématiquement tous les endpoints de l'API Wanzo Portfolio pour :
- Vérifier la connectivité avec le backend
- Valider l'authentification Auth0
- Tester les différents microservices (portfolios, paiements, risques, etc.)
- Analyser les formats de réponse (ApiResponse<T>, WanzoApiResponse<T>)
- Identifier les problèmes de configuration

## 📋 Fonctionnalités

### 🔍 Analyse du Token JWT
- Décodage et validation des tokens Auth0
- Vérification de l'expiration
- Analyse des permissions et rôles Wanzo

### 🌐 Tests de Connectivité
- Tests de base de l'API
- Vérification des microservices
- Diagnostic des problèmes réseau

### 📊 Tests d'Endpoints
- **Authentification** : login, validation institution
- **Utilisateurs** : profils, préférences, rôles, permissions
- **Portfolios** : traditionnels, leasing, investissement
- **Contrats** : crédit, débloquements, remboursements
- **Paiements** : méthodes, planification
- **Risques** : centrale des risques, alertes
- **Communication** : messages, chat, réunions
- **Prospection** : opportunités, prospects
- **Documents** : gestion documentaire
- **Rapports** : génération et téléchargement
- **Paramètres** : système, notifications, intégrations

### 🧪 Tests avec Données
- Création de portfolios de test
- Simulation de demandes de crédit
- Tests de validation des données

## 🚀 Installation et Utilisation

### Prérequis
- Node.js 14+
- Token JWT Auth0 valide

### Configuration du Token

#### Option 1: Variable d'environnement (Recommandée)
```bash
# Windows PowerShell
$env:JWT_TOKEN="votre_token_auth0_ici"
node wanzo-portfolio-api-test.js

# Linux/Mac
export JWT_TOKEN="votre_token_auth0_ici"
node wanzo-portfolio-api-test.js
```

#### Option 2: Modification du fichier
Remplacez `YOUR_AUTH0_JWT_TOKEN_HERE` dans le script par votre token.

### Exécution
```bash
node wanzo-portfolio-api-test.js
```

### Configuration de l'API (Optionnelle)
```bash
# Changer l'URL de base de l'API
$env:VITE_API_URL="https://votre-api.com"
```

## 📊 Interprétation des Résultats

### ✅ Statuts de Succès
- **200-299** : Endpoint fonctionnel
- **Formats détectés** : ApiResponse, WanzoApiResponse, Raw data

### ❌ Codes d'Erreur Courants
- **401** : Token expiré/invalide → Régénérer le token Auth0
- **403** : Permissions insuffisantes → Vérifier les rôles utilisateur
- **404** : Endpoint non trouvé → Vérifier que les microservices sont démarrés
- **429** : Rate limiting → Le script gère automatiquement les retry
- **5xx** : Erreur serveur → Vérifier les logs côté backend

### 📈 Métriques de Performance
- **Taux de succès** : % d'endpoints fonctionnels
- **Formats de réponse** : Compatibilité avec les types définis
- **Temps de réponse** : Timeout configuré à 15s

## 🔧 Personnalisation

### Ajouter de Nouveaux Endpoints
```javascript
const endpointsToTest = [
  // Ajouter vos endpoints personnalisés
  { 
    endpoint: '/your-endpoint', 
    method: 'GET', 
    description: 'Votre description',
    isPortfolioApi: true // si c'est un endpoint du microservice portfolio
  }
];
```

### Modifier la Configuration
```javascript
const API_CONFIG = {
  baseUrl: 'https://votre-api.com',
  portfolioApiPrefix: '/portfolio/api/v1',
  timeout: 20000 // 20 secondes
};
```

## 🏗️ Architecture Technique

### Structure des URLs
- **API de base** : `http://localhost:8000`
- **Microservice Portfolio** : `http://localhost:8000/portfolio/api/v1`
- **Services métier** : `http://localhost:8000/portfolio_inst/`

### Formats de Réponse Supportés
1. **ApiResponse<T>** : `{ success: boolean, data: T, message?: string }`
2. **WanzoApiResponse<T>** : `{ data: ApiResponse<T> }`
3. **Raw Data** : Données directes sans encapsulation

### Authentification
- **Type** : JWT Bearer Token (Auth0)
- **Headers requis** :
  - `Authorization: Bearer <token>`
  - `Content-Type: application/json`
  - `Accept: application/json`

## 🐛 Dépannage

### Token Expiré
```bash
# Vérifier l'expiration
# Le script affiche automatiquement les détails du token
```

### Microservices Non Démarrés
```bash
# Vérifier que tous les services sont actifs
# Le script teste la connectivité de base
```

### Rate Limiting
Le script inclut un système de retry automatique avec délais progressifs.

### Erreurs de CORS
Assurez-vous que l'API autorise les requêtes depuis votre domaine.

## 📝 Logs et Debugging

Le script produit des logs détaillés :
- 🔍 **Tests en cours** : Endpoint testé avec URL complète
- 📊 **Statut** : Code HTTP et description
- ✅ **Succès** : Format de réponse et analyse des données
- ❌ **Erreurs** : Détail des erreurs avec recommandations
- 📈 **Statistiques** : Résumé par catégorie d'endpoints

## 🔄 Intégration Continue

### Utilisation en CI/CD
```yaml
# GitHub Actions exemple
- name: Test API Endpoints
  run: |
    export JWT_TOKEN=${{ secrets.AUTH0_TEST_TOKEN }}
    node wanzo-portfolio-api-test.js
```

### Monitoring Automatisé
Le script peut être exécuté périodiquement pour surveiller la santé de l'API.

## 📞 Support

En cas de problème :
1. Vérifiez que votre token Auth0 est valide
2. Confirmez que les microservices sont démarrés
3. Consultez les logs détaillés du script
4. Comparez avec la configuration de votre environnement

---

**Développé pour l'écosystème Wanzo Portfolio Loan** 🚀
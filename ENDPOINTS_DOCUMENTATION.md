# Documentation des Endpoints API

> **Version**: 1.0.0  
> **Base URL**: `http://localhost:8000/portfolio/api/v1`  
> **Date de mise à jour**: 4 novembre 2025

Cette documentation centralise tous les endpoints utilisés dans l'application Wanzo Portfolio.

## Table des matières

- [Configuration](#configuration)
- [Authentification](#authentification)
- [Utilisateurs](#utilisateurs)
- [Portefeuilles](#portefeuilles)
- [Portefeuilles Traditionnels](#portefeuilles-traditionnels)
- [Prospection](#prospection)
- [Communication](#communication)
- [Paramètres](#paramètres)
- [Tableau de Bord](#tableau-de-bord)

---

## Configuration

### Base URL et Headers
```typescript
const API_CONFIG = {
  baseUrl: 'http://localhost:8000/portfolio/api/v1',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
};
```

### Variables d'environnement
- `VITE_API_URL`: URL de base de l'API (défaut: `http://localhost:8000/portfolio/api/v1`)

---

## Authentification

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/auth/login` | Connexion utilisateur |
| POST | `/auth/logout` | Déconnexion utilisateur |
| POST | `/auth/refresh` | Rafraîchissement du token |
| POST | `/auth/validate-institution` | Validation d'institution |

---

## Utilisateurs

### Gestion des utilisateurs
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/users` | Liste de tous les utilisateurs |
| GET | `/users/{id}` | Détails d'un utilisateur |
| POST | `/users` | Création d'un utilisateur |
| PUT | `/users/{id}` | Mise à jour d'un utilisateur |
| DELETE | `/users/{id}` | Suppression d'un utilisateur |
| GET | `/users/me` | Profil de l'utilisateur connecté |
| PUT | `/users/me/preferences` | Préférences utilisateur |
| POST | `/users/{id}/reset-password` | Réinitialisation du mot de passe |

### Portefeuilles utilisateur
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/users/{userId}/portfolios` | Assigner un portefeuille |
| DELETE | `/users/{userId}/portfolios/{portfolioId}` | Retirer un portefeuille |

### Rôles et permissions
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/users/roles` | Liste des rôles |
| GET | `/users/permissions` | Liste des permissions |
| GET | `/users/activity` | Journal d'activité |

---

## Portefeuilles

### Gestion générale
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/portfolios` | Liste des portefeuilles |
| GET | `/portfolios/{id}` | Détails d'un portefeuille |
| POST | `/portfolios` | Création d'un portefeuille |
| PUT | `/portfolios/{id}` | Mise à jour d'un portefeuille |
| DELETE | `/portfolios/{id}` | Suppression d'un portefeuille |
| GET | `/portfolios/{id}/metrics` | Métriques d'un portefeuille |

### Produits financiers
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/portfolios/{portfolioId}/products` | Produits du portefeuille |
| POST | `/portfolios/{portfolioId}/products` | Création de produit |
| PUT | `/portfolios/{portfolioId}/products/{productId}` | Mise à jour de produit |
| DELETE | `/portfolios/{portfolioId}/products/{productId}` | Suppression de produit |

---

## Portefeuilles Traditionnels

### Gestion principale
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/portfolios/traditional` | Liste des portefeuilles traditionnels |
| GET | `/portfolios/traditional/{id}` | Détails d'un portefeuille traditionnel |
| POST | `/portfolios/traditional` | Création d'un portefeuille traditionnel |
| PUT | `/portfolios/traditional/{id}` | Mise à jour d'un portefeuille traditionnel |
| DELETE | `/portfolios/traditional/{id}` | Suppression d'un portefeuille traditionnel |
| POST | `/portfolios/traditional/{id}/close` | Fermeture d'un portefeuille |
| GET | `/portfolios/traditional/{id}/products` | Produits du portefeuille |

### Contrats de crédit
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/portfolios/traditional/credit-contracts` | Liste des contrats de crédit |
| GET | `/portfolios/traditional/credit-contracts/{id}` | Détails d'un contrat |
| POST | `/portfolios/traditional/credit-contracts/from-request` | Création depuis demande |

### Demandes de crédit
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/portfolios/traditional/credit-requests` | Liste des demandes |
| GET | `/portfolios/traditional/credit-requests/{id}` | Détails d'une demande |
| POST | `/portfolios/traditional/credit-requests` | Création de demande |
| PUT | `/portfolios/traditional/credit-requests/{id}` | Mise à jour de demande |
| DELETE | `/portfolios/traditional/credit-requests/{id}` | Suppression de demande |

### Déblocages
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/portfolios/traditional/disbursements` | Liste des déblocages |
| GET | `/portfolios/traditional/disbursements/{id}` | Détails d'un déblocage |
| POST | `/portfolios/traditional/disbursements` | Création de déblocage |

### Remboursements
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/portfolios/traditional/repayments` | Liste des remboursements |
| GET | `/portfolios/traditional/repayments/{id}` | Détails d'un remboursement |
| POST | `/portfolios/traditional/repayments` | Enregistrement de remboursement |

### Échéanciers de paiement
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/portfolios/traditional/payment-schedules` | Liste des échéanciers |
| GET | `/portfolios/traditional/payment-schedules/{id}` | Détails d'un échéancier |
| GET | `/portfolios/traditional/payment-schedules/by-contract/{contractId}` | Échéancier par contrat |

### Documents
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/portfolios/traditional/documents` | Liste des documents |
| GET | `/portfolios/traditional/documents/{id}` | Détails d'un document |
| POST | `/portfolios/traditional/documents` | Upload de document |
| DELETE | `/portfolios/traditional/documents/{id}` | Suppression de document |

---

## Prospection

> **Note**: La prospection inclut maintenant la consultation des entreprises (lecture seule), 
> la gestion des opportunités et des leads. Les entreprises sont fournies par le backend système.

### Entreprises (lecture seule)
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/companies` | Liste des entreprises disponibles |
| GET | `/companies/{id}` | Détails d'une entreprise |
| GET | `/companies/{id}/financials` | Données financières |
| GET | `/companies/{id}/valuation` | Évaluation de l'entreprise |

---

## Communication

### Messages et Chat
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/messages` | Liste des messages |
| GET | `/messages/{id}` | Détails d'un message |
| POST | `/messages` | Envoi de message |
| GET | `/chat/conversations` | Liste des conversations |
| GET | `/chat/messages` | Messages d'une conversation |
| POST | `/chat/messages` | Envoi de message chat |

---

## Paramètres

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/settings` | Paramètres généraux |
| GET | `/settings/system` | Paramètres système |
| GET | `/settings/notifications` | Paramètres de notifications |
| GET | `/settings/security` | Paramètres de sécurité |
| GET | `/settings/appearance` | Paramètres d'apparence |
| GET | `/settings/integrations` | Paramètres d'intégrations |

---

## Tableau de Bord

### Métriques et conformité
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/dashboard` | Vue d'ensemble du tableau de bord |
| GET | `/metrics/ohada` | Métriques de conformité OHADA |
| GET | `/metrics/portfolio/{portfolioId}` | Métriques d'un portefeuille |
| GET | `/metrics/global` | Métriques globales institution |
| GET | `/compliance/summary` | Résumé de conformité |
| GET | `/risk/central-bank` | Données centrale des risques |
| GET | `/risk/portfolios/{id}` | Analyse des risques d'un portefeuille |

### Préférences utilisateur
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/preferences/{userId}` | Préférences utilisateur |
| PUT | `/preferences/{userId}/widget/{widgetId}` | Mise à jour de widget |
| POST | `/preferences/{userId}/reset` | Réinitialisation des préférences |
| POST | `/preferences/{userId}/backup` | Sauvegarde des préférences |
| POST | `/preferences/{userId}/restore/{backupId}` | Restauration des préférences |

---

## Codes de Réponse HTTP

| Code | Description |
|------|-------------|
| 200 | Succès |
| 201 | Créé avec succès |
| 204 | Supprimé avec succès |
| 400 | Requête invalide |
| 401 | Non autorisé |
| 403 | Accès interdit |
| 404 | Ressource non trouvée |
| 409 | Conflit |
| 422 | Données invalides |
| 500 | Erreur serveur |

---

## Notes de Migration et Simplification Architecturale

### Changements majeurs v1.0.0 :
- **portfolioId**: Tous les endpoints utilisent maintenant `portfolioId` (camelCase) pour la conformité API
- **Suppression complète**: Endpoints investment, leasing, funding supprimés 
- **Architecture simplifiée**: Focus uniquement sur les portefeuilles traditionnels
- **Entreprises en lecture seule**: Intégrées dans la prospection, gérées par le backend système
- **Gestion des risques intégrée**: Fusionnée dans le tableau de bord
- **Institutions simplifiées**: Une seule institution par déploiement
- **Communication rationalisée**: Messages et chat uniquement
- **Équipements supprimés**: Non nécessaires pour les portefeuilles traditionnels

### Modèle d'usage :
- **Une institution** utilise l'application avec ses **utilisateurs** et leurs **rôles**
- **Portefeuilles traditionnels** uniquement (crédit, microfinance)
- **Entreprises fournies** par le backend (lecture seule)
- **Prospection intégrée** pour consulter et qualifier les entreprises
- **Sauvegarde locale** avec synchronisation automatique hors ligne

---

## Changelog

### Version 1.0.0 (4 novembre 2025)
- Documentation simplifiée et centrée sur l'usage réel
- Suppression des modules investment, leasing, équipements
- Intégration gestion des risques dans le dashboard
- Entreprises en lecture seule dans la prospection
- Architecture mono-institution
- Communication simplifiée (messages + chat)
- Ajout de la synchronisation hors ligne
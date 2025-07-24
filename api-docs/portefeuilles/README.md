# Documentation de l'API des Portefeuilles

Ce document sert de point d'entrée pour toute la documentation des API liées aux portefeuilles dans Wanzo Portfolio Institution.

## Types de Portefeuilles

L'API Wanzo Portfolio Institution prend en charge trois types principaux de portefeuilles:

1. **[Portefeuilles Traditionnels](./traditionnel/README.md)** - Pour la gestion des portefeuilles de crédit classiques
2. **[Portefeuilles d'Investissement](./investissement/README.md)** - Pour la gestion des portefeuilles d'actifs financiers et d'investissement
3. **[Portefeuilles de Leasing](./leasing/README.md)** - Pour la gestion des portefeuilles immobiliers et de leasing

## Structure Commune

Chaque type de portefeuille partage une structure d'API similaire pour les opérations de base:

- **Création de portefeuille** - `POST /portfolio_inst/portfolios/{type}`
- **Récupération d'un portefeuille** - `GET /portfolio_inst/portfolios/{type}/{id}`
- **Mise à jour d'un portefeuille** - `PUT /portfolio_inst/portfolios/{type}/{id}`
- **Suppression d'un portefeuille** - `DELETE /portfolio_inst/portfolios/{type}/{id}`
- **Liste des portefeuilles** - `GET /portfolio_inst/portfolios/{type}`

Où `{type}` peut être `traditional`, `investment` ou `leasing`.

## Spécificités par Type

Chaque type de portefeuille dispose de modules spécifiques adaptés à sa nature:

### Portefeuille Traditionnel
- [Demandes de financement](./traditionnel/demandes/README.md)
- [Contrats de crédit](./traditionnel/contrats/README.md)
- [Virements](./traditionnel/virements/README.md)
- [Remboursements](./traditionnel/remboursements/README.md)
- [Garanties](./traditionnel/garanties/README.md)
- [Produits financiers](./traditionnel/produits/README.md)
- [Paramètres](./traditionnel/parametres/README.md)

### Portefeuille de Leasing
- [Demandes de leasing](./leasing/demandes/README.md)
- [Contrats de leasing](./leasing/contrats/README.md)
- [Incidents](./leasing/incidents/README.md)
- [Maintenance](./leasing/maintenance/README.md)
- [Paiements](./leasing/paiements/README.md)
- [Équipements](./leasing/equipements/README.md)
- [Paramètres](./leasing/parametres/README.md)

### Portefeuille d'Investissement
- [Marché](./investissement/marche/README.md)
- [Actifs](./investissement/actifs/README.md)
- [Souscriptions](./investissement/souscriptions/README.md)
- [Valorisation](./investissement/valorisation/README.md)
- [Paramètres](./investissement/parametres/README.md)

## Modèles de Données Communs

### Portefeuille
| Champ | Type | Description |
|-------|------|-------------|
| id | string | Identifiant unique du portefeuille |
| name | string | Nom du portefeuille |
| type | string | Type de portefeuille ('traditional', 'leasing', 'investment') |
| status | string | Statut du portefeuille ('active', 'inactive', 'archived') |
| description | string | Description détaillée |
| currency | string | Devise principale (code ISO) |
| totalValue | number | Valeur totale du portefeuille |
| createdAt | string | Date de création (format ISO) |
| updatedAt | string | Date de dernière modification (format ISO) |
| settings | object | Paramètres spécifiques au portefeuille |
| stats | object | Statistiques du portefeuille (optionnel) |

## Points d'accès communs

### Obtenir tous les portefeuilles
```
GET /portfolio_inst/portfolios
```

### Obtenir un portefeuille par ID
```
GET /portfolio_inst/portfolios/:id
```

### Créer un nouveau portefeuille
```
POST /portfolio_inst/portfolios
```

### Mettre à jour un portefeuille
```
PUT /portfolio_inst/portfolios/:id
```

### Archiver un portefeuille
```
PUT /portfolio_inst/portfolios/:id/archive
```

### Supprimer un portefeuille
```
DELETE /portfolio_inst/portfolios/:id
```
- Contrats de crédit
- Virements
- Remboursements
- Garanties
- Paramètres

### Portefeuille d'Investissement
- Marché
- Actifs
- Souscriptions
- Valorisation
- Paramètres

### Portefeuille de Leasing
- Demandes
- Contrats
- Incidents
- Maintenance
- Paiements
- Paramètres

## Authentification

Tous les endpoints des portefeuilles nécessitent une authentification. Consultez la [documentation d'authentification](../utilisateurs/README.md) pour plus de détails.

## Formats des Réponses

Toutes les réponses suivent le format standard:

```json
{
  "success": true,
  "data": { ... }
}
```

En cas d'erreur:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Description de l'erreur"
  }
}
```

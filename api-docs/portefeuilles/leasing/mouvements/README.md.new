# Gestion des Mouvements d'Équipements

Ce document décrit les endpoints pour le suivi des mouvements d'équipements dans les portefeuilles de leasing.

## Liste des mouvements

Récupère la liste des mouvements d'équipements avec pagination et filtrage.

**Endpoint** : `GET /portfolio_inst/portfolios/leasing/{portfolioId}/movements`
**Paramètres de requête** :
- `page` (optionnel) : Numéro de la page (défaut : 1)
- `limit` (optionnel) : Nombre de mouvements par page (défaut : 10, max : 100)
- `equipment_id` (optionnel) : Filtre par équipement
- `type` (optionnel) : Filtre par type de mouvement (in, out, transfer, return)
- `user_id` (optionnel) : Filtre par utilisateur responsable
- `dateFrom` (optionnel) : Filtre par date (minimum)
- `dateTo` (optionnel) : Filtre par date (maximum)
- `location` (optionnel) : Filtre par lieu (from_location ou to_location)
- `sortBy` (optionnel) : Trier par (date, equipment_id, type)
- `sortOrder` (optionnel) : Ordre de tri (asc, desc)

**Réponse réussie** (200 OK) :

```json
{
  "success": true,
  "data": [
    {
      "id": "mov1",
      "equipment_id": "eq1",
      "equipment_name": "Tractopelle JCB 3CX",
      "type": "out",
      "date": "2025-07-10T09:00:00Z",
      "from_location": "Dépôt central",
      "to_location": "Chantier A",
      "user_id": "user1",
      "user_name": "Jean Dupont",
      "notes": "Sortie pour location",
      "created_at": "2025-07-10T09:00:00Z",
      "updated_at": "2025-07-10T09:00:00Z"
    }
  ],
  "meta": {
    "total": 12,
    "page": 1,
    "limit": 10,
    "totalPages": 2
  }
}
```

## Détails d'un mouvement

Récupère les détails d'un mouvement spécifique.

**Endpoint** : `GET /portfolio_inst/portfolios/leasing/{portfolioId}/movements/{movementId}`

**Réponse réussie** (200 OK) :

```json
{
  "success": true,
  "data": {
    "id": "mov1",
    "equipment_id": "eq1",
    "equipment": {
      "id": "eq1",
      "name": "Tractopelle JCB 3CX",
      "category": "engin_chantier",
      "model": "3CX",
      "imageUrl": "https://api.wanzo.com/images/equipments/jcb-3cx.jpg"
    },
    "type": "out",
    "date": "2025-07-10T09:00:00Z",
    "from_location": "Dépôt central",
    "to_location": "Chantier A",
    "user_id": "user1",
    "user": {
      "id": "user1",
      "name": "Jean Dupont",
      "email": "jean.dupont@example.com"
    },
    "notes": "Sortie pour location",
    "created_at": "2025-07-10T09:00:00Z",
    "updated_at": "2025-07-10T09:00:00Z",
    "associated_reservation": {
      "id": "res1",
      "start_date": "2025-07-10T09:00:00Z",
      "end_date": "2025-07-12T18:00:00Z"
    },
    "associated_contract": null
  }
}
```

## Enregistrer un mouvement

Enregistre un nouveau mouvement d'équipement.

**Endpoint** : `POST /portfolio_inst/portfolios/leasing/{portfolioId}/movements`
**Corps de la requête** :

```json
{
  "equipment_id": "eq1",
  "type": "return",
  "date": "2025-07-12T18:00:00Z",
  "from_location": "Chantier A",
  "to_location": "Dépôt central",
  "user_id": "user1",
  "notes": "Retour après location",
  "reservation_id": "res1"
}
```

**Réponse réussie** (201 Created) :

```json
{
  "success": true,
  "data": {
    "id": "mov3",
    "message": "Mouvement enregistré avec succès"
  }
}
```

## Mettre à jour un mouvement

Modifie les détails d'un mouvement existant.

**Endpoint** : `PUT /portfolio_inst/portfolios/leasing/{portfolioId}/movements/{movementId}`
**Corps de la requête** :

```json
{
  "date": "2025-07-12T19:30:00Z",
  "notes": "Retour après location (retard de 1h30)"
}
```

**Réponse réussie** (200 OK) :

```json
{
  "success": true,
  "message": "Mouvement mis à jour avec succès"
}
```

## Supprimer un mouvement

Supprime un enregistrement de mouvement.

**Endpoint** : `DELETE /portfolio_inst/portfolios/leasing/{portfolioId}/movements/{movementId}`

**Réponse réussie** (200 OK) :

```json
{
  "success": true,
  "message": "Mouvement supprimé avec succès"
}
```

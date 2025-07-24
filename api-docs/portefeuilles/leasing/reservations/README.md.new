# Gestion des Réservations d'Équipements

Ce document décrit les endpoints pour la gestion des réservations d'équipements dans les portefeuilles de leasing.

## Liste des réservations

Récupère la liste des réservations d'équipements avec pagination et filtrage.

**Endpoint** : `GET /portfolio_inst/portfolios/leasing/{portfolioId}/reservations`
**Paramètres de requête** :
- `page` (optionnel) : Numéro de la page (défaut : 1)
- `limit` (optionnel) : Nombre de réservations par page (défaut : 10, max : 100)
- `equipment_id` (optionnel) : Filtre par équipement
- `user_id` (optionnel) : Filtre par utilisateur
- `status` (optionnel) : Filtre par statut (pending, confirmed, cancelled, completed)
- `startDateFrom` (optionnel) : Filtre par date de début (minimum)
- `startDateTo` (optionnel) : Filtre par date de début (maximum)
- `endDateFrom` (optionnel) : Filtre par date de fin (minimum)
- `endDateTo` (optionnel) : Filtre par date de fin (maximum)
- `sortBy` (optionnel) : Trier par (start_date, end_date, created_at)
- `sortOrder` (optionnel) : Ordre de tri (asc, desc)

**Réponse réussie** (200 OK) :

```json
{
  "success": true,
  "data": [
    {
      "id": "res1",
      "equipment_id": "eq1",
      "equipment_name": "Tractopelle JCB 3CX",
      "user_id": "user1",
      "user_name": "Jean Dupont",
      "start_date": "2025-07-10T09:00:00Z",
      "end_date": "2025-07-12T18:00:00Z",
      "status": "confirmed",
      "created_at": "2025-07-01T10:00:00Z",
      "updated_at": "2025-07-01T10:00:00Z",
      "notes": "Réservation pour chantier A"
    }
  ],
  "meta": {
    "total": 8,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

## Détails d'une réservation

Récupère les détails d'une réservation spécifique.

**Endpoint** : `GET /portfolio_inst/portfolios/leasing/{portfolioId}/reservations/{reservationId}`

**Réponse réussie** (200 OK) :

```json
{
  "success": true,
  "data": {
    "id": "res1",
    "equipment_id": "eq1",
    "equipment": {
      "id": "eq1",
      "name": "Tractopelle JCB 3CX",
      "category": "engin_chantier",
      "model": "3CX",
      "imageUrl": "https://api.wanzo.com/images/equipments/jcb-3cx.jpg"
    },
    "user_id": "user1",
    "user": {
      "id": "user1",
      "name": "Jean Dupont",
      "email": "jean.dupont@example.com",
      "phone": "+243123456789"
    },
    "start_date": "2025-07-10T09:00:00Z",
    "end_date": "2025-07-12T18:00:00Z",
    "status": "confirmed",
    "created_at": "2025-07-01T10:00:00Z",
    "updated_at": "2025-07-01T10:00:00Z",
    "notes": "Réservation pour chantier A",
    "location": "Chantier A, Kinshasa",
    "associated_contract": null
  }
}
```

## Créer une réservation

Crée une nouvelle réservation d'équipement.

**Endpoint** : `POST /portfolio_inst/portfolios/leasing/{portfolioId}/reservations`
**Corps de la requête** :

```json
{
  "equipment_id": "eq1",
  "user_id": "user1",
  "start_date": "2025-08-15T09:00:00Z",
  "end_date": "2025-08-20T18:00:00Z",
  "notes": "Réservation pour chantier B",
  "location": "Chantier B, Lubumbashi"
}
```

**Réponse réussie** (201 Created) :

```json
{
  "success": true,
  "data": {
    "id": "res3",
    "status": "pending",
    "message": "Réservation créée avec succès"
  }
}
```

## Mettre à jour une réservation

Modifie les détails d'une réservation existante.

**Endpoint** : `PUT /portfolio_inst/portfolios/leasing/{portfolioId}/reservations/{reservationId}`
**Corps de la requête** :

```json
{
  "start_date": "2025-08-16T09:00:00Z",
  "end_date": "2025-08-21T18:00:00Z",
  "notes": "Réservation modifiée pour chantier B",
  "status": "confirmed"
}
```

**Réponse réussie** (200 OK) :

```json
{
  "success": true,
  "message": "Réservation mise à jour avec succès"
}
```

## Annuler une réservation

Annule une réservation existante.

**Endpoint** : `PATCH /portfolio_inst/portfolios/leasing/{portfolioId}/reservations/{reservationId}/cancel`
**Corps de la requête** :

```json
{
  "cancellation_reason": "Projet reporté"
}
```

**Réponse réussie** (200 OK) :

```json
{
  "success": true,
  "message": "Réservation annulée avec succès"
}
```

## Supprimer une réservation

Supprime une réservation du système.

**Endpoint** : `DELETE /portfolio_inst/portfolios/leasing/{portfolioId}/reservations/{reservationId}`

**Réponse réussie** (200 OK) :

```json
{
  "success": true,
  "message": "Réservation supprimée avec succès"
}
```

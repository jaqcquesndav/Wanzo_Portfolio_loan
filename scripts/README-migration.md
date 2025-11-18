# 🔄 Migration des Statuts de Disbursement

## Contexte

Suite à la mise en conformité à 100% avec la documentation API (Nov 16, 2025), les statuts de disbursement ont été convertis du **français** vers l'**anglais** pour respecter l'enum `DisbursementStatus` défini dans `API DOCUMENTATION/validation_workflow.md`.

### Changements de Statuts

| Ancien Statut (FR)      | Nouveau Statut (EN) | Description              |
|-------------------------|---------------------|--------------------------|
| `en attente`            | `pending`           | En attente de validation |
| `validé`                | `approved`          | Validé/Approuvé          |
| `en_cours_execution`    | `processing`        | En cours d'exécution     |
| `exécuté` / `effectué`  | `completed`         | Exécuté/Terminé          |
| `rejeté`                | `rejected`          | Rejeté                   |
| `annulé`                | `canceled`          | Annulé                   |
| `échoué`                | `failed`            | Échoué                   |
| `en_erreur`             | `failed`            | En erreur → Échoué       |
| -                       | `draft`             | Brouillon (nouveau)      |

## 📋 Instructions de Migration

### Option 1: Migration Automatique (Navigateur)

1. **Ouvrir l'application** dans votre navigateur
2. **Ouvrir la console** (F12 ou Ctrl+Shift+I)
3. **Copier/coller** le contenu de `scripts/migrate-disbursement-status.ts` dans la console
4. **Exécuter** la fonction:
   ```javascript
   migrateDisbursementStatus()
   ```

### Option 2: Migration lors du Chargement de l'App

Ajouter le script de migration au démarrage de l'application:

```typescript
// src/main.tsx ou src/App.tsx
import { migrateDisbursementStatus } from './scripts/migrate-disbursement-status';

// Exécuter la migration au démarrage (une seule fois)
if (localStorage.getItem('MIGRATION_DISBURSEMENT_STATUS_DONE') !== 'true') {
  migrateDisbursementStatus();
  localStorage.setItem('MIGRATION_DISBURSEMENT_STATUS_DONE', 'true');
}
```

### Option 3: Migration Manuelle

Si vous préférez migrer manuellement les données:

```javascript
// 1. Récupérer les disbursements
const disbursements = JSON.parse(localStorage.getItem('TRADITIONAL_DISBURSEMENTS') || '[]');

// 2. Mapper les statuts
const statusMap = {
  'en attente': 'pending',
  'effectué': 'completed',
  'validé': 'approved',
  'rejeté': 'rejected',
  'annulé': 'canceled',
  'échoué': 'failed',
  'en_attente': 'pending',
  'exécuté': 'completed',
  'en_cours_execution': 'processing',
  'en_erreur': 'failed'
};

// 3. Migrer
const migrated = disbursements.map(d => ({
  ...d,
  status: statusMap[d.status] || 'pending'
}));

// 4. Sauvegarder
localStorage.setItem('TRADITIONAL_DISBURSEMENTS', JSON.stringify(migrated));
```

## 🔍 Vérification Post-Migration

### Vérifier les Statuts Migrés

```javascript
const disbursements = JSON.parse(localStorage.getItem('TRADITIONAL_DISBURSEMENTS') || '[]');
const statuses = disbursements.map(d => d.status);
const uniqueStatuses = [...new Set(statuses)];

console.log('Statuts uniques après migration:', uniqueStatuses);
// Devrait afficher uniquement: ['draft', 'pending', 'approved', 'rejected', 'processing', 'completed', 'failed', 'canceled']
```

### Vérifier l'Affichage dans l'UI

1. Accéder à la page des virements/disbursements
2. Vérifier que tous les statuts s'affichent correctement:
   - ✅ **Brouillon** (gris)
   - ⏳ **En attente** (jaune)
   - ✅ **Approuvé** (bleu)
   - ❌ **Rejeté** (rouge)
   - 🔄 **En traitement** (bleu)
   - ✅ **Effectué** (vert)
   - ❌ **Échoué** (rouge)
   - ⛔ **Annulé** (gris)

## 💾 Sauvegarde et Restauration

### Créer une Sauvegarde Manuelle

```javascript
// Avant migration
const backup = localStorage.getItem('TRADITIONAL_DISBURSEMENTS');
localStorage.setItem('DISBURSEMENTS_BACKUP_MANUAL', backup);
console.log('✅ Sauvegarde créée: DISBURSEMENTS_BACKUP_MANUAL');
```

### Restaurer depuis une Sauvegarde

```javascript
// Lister les sauvegardes disponibles
Object.keys(localStorage)
  .filter(k => k.startsWith('DISBURSEMENTS_BACKUP_'))
  .forEach(k => console.log(k));

// Restaurer une sauvegarde spécifique
const backupKey = 'DISBURSEMENTS_BACKUP_2025-11-18T...';
const backup = localStorage.getItem(backupKey);
if (backup) {
  localStorage.setItem('TRADITIONAL_DISBURSEMENTS', backup);
  console.log('✅ Données restaurées depuis', backupKey);
}
```

## ⚠️ Impacts et Considérations

### Breaking Changes

- Les anciens statuts français ne sont plus supportés
- Les composants UI n'affichent plus les anciens statuts
- Les filtres de recherche utilisent les nouveaux statuts

### Compatibilité Backend

Si votre backend utilise encore les anciens statuts français:

1. **Option A**: Adapter le backend pour utiliser les statuts anglais (recommandé)
2. **Option B**: Créer un adapter côté frontend:

```typescript
// src/adapters/disbursementAdapter.ts
export function adaptDisbursementFromBackend(backendData: any) {
  return {
    ...backendData,
    status: statusMap[backendData.status] || 'pending'
  };
}

export function adaptDisbursementToBackend(frontendData: any) {
  const reverseMap = {
    'pending': 'en_attente',
    'completed': 'exécuté',
    // ... etc
  };
  return {
    ...frontendData,
    status: reverseMap[frontendData.status] || 'en_attente'
  };
}
```

### Base de Données

Si vos données sont dans une base de données (PostgreSQL, MongoDB, etc.):

```sql
-- PostgreSQL
UPDATE disbursements 
SET status = CASE 
  WHEN status = 'en attente' THEN 'pending'
  WHEN status = 'effectué' THEN 'completed'
  WHEN status = 'validé' THEN 'approved'
  WHEN status = 'rejeté' THEN 'rejected'
  WHEN status = 'annulé' THEN 'canceled'
  WHEN status = 'échoué' THEN 'failed'
  WHEN status = 'en_cours_execution' THEN 'processing'
  WHEN status = 'en_erreur' THEN 'failed'
  ELSE status
END;
```

```javascript
// MongoDB
db.disbursements.updateMany(
  { status: 'en attente' },
  { $set: { status: 'pending' } }
);
db.disbursements.updateMany(
  { status: 'effectué' },
  { $set: { status: 'completed' } }
);
// ... etc pour chaque statut
```

## 📊 Rapport de Migration

Le script génère automatiquement un rapport indiquant:
- ✅ Nombre de disbursements migrés
- 📈 Répartition par statut avant/après
- ⚠️ Statuts inconnus détectés
- 💾 Localisation de la sauvegarde

Exemple de sortie:

```
🚀 Migration des statuts de disbursement

💾 Sauvegarde créée: DISBURSEMENTS_BACKUP_2025-11-18T14-30-00-000Z

   ✓ DISB-TRAD-20250702-0001: "en attente" → "pending"
   ✓ DISB-TRAD-20250629-0002: "effectué" → "completed"
   ✓ DISB-TRAD-20250615-0003: "effectué" → "completed"

✅ Migré 3 disbursements de la liste globale

📊 Rapport de migration:
════════════════════════════════════
Total disbursements: 3

Répartition par statut:
  completed         2 (66.7%)
  pending           1 (33.3%)
════════════════════════════════════

✅ Migration terminée avec succès!
```

## 🆘 Support

En cas de problème:
1. Vérifier les sauvegardes dans `localStorage` (clés `DISBURSEMENTS_BACKUP_*`)
2. Consulter la console navigateur pour les messages d'erreur
3. Restaurer depuis une sauvegarde si nécessaire

## 📚 Références

- **Documentation API**: `API DOCUMENTATION/validation_workflow.md` (lignes 165-190)
- **Type Disbursement**: `src/types/disbursement.ts`
- **Enum DisbursementStatus**: Défini dans la documentation officielle
- **Conformité**: 100% conforme aux spécifications API (Nov 16, 2025)

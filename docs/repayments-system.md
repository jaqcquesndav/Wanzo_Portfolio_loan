# Documentation - Système de Gestion des Remboursements

## Aperçu

Le système de gestion des remboursements permet le suivi et la gestion des paiements effectués dans le cadre des contrats de prêt. Cette documentation décrit les fonctionnalités principales, l'architecture et l'utilisation du système.

## Concepts clés

### 1. Séparation Échéances vs Remboursements

Le système distingue clairement deux concepts :

- **Échéances** : Planification théorique des paiements prévus selon le contrat. Elles représentent "l'idéal".
- **Remboursements** : Événements de paiement réels effectués par les clients. Ils représentent "la réalité".

Cette séparation permet d'analyser efficacement les écarts entre ce qui était prévu et ce qui s'est réellement passé.

### 2. Comparaison sans couplage fort

Les remboursements ne sont pas directement liés aux échéances dans la structure de données. À la place, le système utilise une approche de comparaison qui permet :

- L'analyse des remboursements par rapport aux échéances
- Le calcul de statistiques comme le glissement et le pourcentage restant
- Une flexibilité pour gérer des scénarios complexes (paiements partiels, en avance, en retard)

## Architecture technique

### Services d'API

#### `payment.api.ts`

Ce service gère toutes les opérations liées aux remboursements :

- Récupération des remboursements par contrat
- Création, mise à jour et suppression de remboursements
- Gestion des pièces justificatives (téléchargement, récupération)

#### `dataService.ts`

Ce service fournit des fonctionnalités de gestion des données :

- Méthode `comparePaymentsWithSchedule` : Compare les remboursements aux échéances
- Accès aux données locales (localStorage) comme fallback
- Calcul des statistiques (montant restant, pourcentage, glissement)

### Hook personnalisé

#### `useRepaymentsManager`

Ce hook centralise toute la logique de gestion des remboursements :

```typescript
const {
  payments,           // Liste des remboursements
  loading,            // État de chargement
  error,              // Message d'erreur éventuel
  refreshPayments,    // Recharger les données
  uploadSupportingDocument,   // Télécharger une pièce justificative
  downloadSupportingDocument, // Récupérer une pièce justificative
  addPayment,         // Ajouter un remboursement
  updatePayment,      // Mettre à jour un remboursement
  deletePayment,      // Supprimer un remboursement
  compareWithSchedule // Comparer avec les échéances
} = useRepaymentsManager(contractId);
```

### Composant d'interface

#### `EnhancedRepaymentsTable`

Ce composant utilise le hook `useRepaymentsManager` pour :

- Afficher les remboursements avec toutes les nouvelles colonnes
- Gérer les filtres et la recherche
- Permettre les actions (téléchargement de pièces justificatives, etc.)
- Visualiser le glissement et le pourcentage restant

## Nouvelles fonctionnalités

### 1. Pièces justificatives

Les utilisateurs peuvent désormais :
- Télécharger une pièce justificative pour chaque remboursement
- Consulter et télécharger les pièces existantes
- Voir l'état de disponibilité des pièces dans le tableau

### 2. Indicateurs de suivi

Deux nouveaux indicateurs ont été ajoutés :

- **Pourcentage restant** : Indique le pourcentage du montant qui reste à payer pour l'échéance associée
- **Glissement** : Mesure en jours l'écart entre la date prévue et la date réelle de paiement
  - Positif : paiement en retard
  - Négatif : paiement en avance
  - Zéro : paiement à temps

### 3. Référence de transaction

Un champ de référence de transaction a été ajouté pour faciliter le rapprochement avec les opérations bancaires.

## Utilisation de l'API

### Comparaison des remboursements avec les échéances

```typescript
// Dans un composant React
import { useRepaymentsManager } from '../hooks/useRepaymentsManager';

function MyComponent({ contractId }) {
  const { compareWithSchedule } = useRepaymentsManager();
  
  // Obtenir la comparaison
  const comparison = compareWithSchedule(contractId);
  
  // Utiliser les données...
}
```

### Téléchargement d'une pièce justificative

```typescript
import { useRepaymentsManager } from '../hooks/useRepaymentsManager';

function MyComponent() {
  const { uploadSupportingDocument } = useRepaymentsManager();
  
  const handleFileUpload = async (paymentId, file) => {
    const result = await uploadSupportingDocument(paymentId, file);
    if (result) {
      // Succès
    }
  };
  
  // ...
}
```

## Conseils d'implémentation

1. Utilisez toujours le hook `useRepaymentsManager` pour gérer les remboursements
2. Pour visualiser la relation avec les échéances, utilisez la méthode `compareWithSchedule`
3. Préférez le composant `EnhancedRepaymentsTable` au composant standard pour bénéficier de toutes les nouvelles fonctionnalités

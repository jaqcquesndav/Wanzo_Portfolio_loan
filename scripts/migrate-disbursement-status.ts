/**
 * Script de migration des statuts de disbursement
 * Convertit les anciens statuts français vers les nouveaux statuts anglais conformes à la documentation
 * 
 * Exécution: npx ts-node scripts/migrate-disbursement-status.ts
 */

interface OldDisbursement {
  id: string;
  status: string;
  [key: string]: unknown;
}

interface NewDisbursement extends OldDisbursement {
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'processing' | 'completed' | 'failed' | 'canceled';
}

/**
 * Mapping des anciens statuts français vers les nouveaux statuts anglais
 */
const STATUS_MIGRATION_MAP: Record<string, NewDisbursement['status']> = {
  // Anciens statuts français avec espaces
  'en attente': 'pending',
  'effectué': 'completed',
  'validé': 'approved',
  'rejeté': 'rejected',
  'annulé': 'canceled',
  'échoué': 'failed',
  
  // Anciens statuts français avec underscores (variantes uniques seulement)
  'en_attente': 'pending',
  'en_cours_execution': 'processing',
  'exécuté': 'completed',
  'en_erreur': 'failed',
  
  // Statuts déjà en anglais (maintien)
  'draft': 'draft',
  'pending': 'pending',
  'approved': 'approved',
  'rejected': 'rejected',
  'processing': 'processing',
  'completed': 'completed',
  'failed': 'failed',
  'canceled': 'canceled',
};

/**
 * Clés de storage à migrer
 */
const STORAGE_KEYS = {
  DISBURSEMENTS: 'TRADITIONAL_DISBURSEMENTS',
  CONTRACT_PREFIX: 'TRADITIONAL_CONTRACT_',
};

/**
 * Migre un disbursement individuel
 */
function migrateDisbursement(disbursement: OldDisbursement): NewDisbursement {
  const oldStatus = disbursement.status;
  const newStatus = STATUS_MIGRATION_MAP[oldStatus] || 'pending'; // Fallback sur 'pending'
  
  if (!STATUS_MIGRATION_MAP[oldStatus]) {
    console.warn(`⚠️  Statut inconnu "${oldStatus}" pour disbursement ${disbursement.id}, converti en "pending"`);
  } else if (oldStatus !== newStatus) {
    console.log(`   ✓ ${disbursement.id}: "${oldStatus}" → "${newStatus}"`);
  }
  
  return {
    ...disbursement,
    status: newStatus,
  };
}

/**
 * Migre tous les disbursements dans localStorage
 */
function migrateLocalStorageDisbursements(): number {
  let migratedCount = 0;
  
  // 1. Migrer la liste globale des disbursements
  const disbursementsJson = localStorage.getItem(STORAGE_KEYS.DISBURSEMENTS);
  if (disbursementsJson) {
    try {
      const disbursements: OldDisbursement[] = JSON.parse(disbursementsJson);
      const migratedDisbursements = disbursements.map(migrateDisbursement);
      localStorage.setItem(STORAGE_KEYS.DISBURSEMENTS, JSON.stringify(migratedDisbursements));
      migratedCount += disbursements.length;
      console.log(`✅ Migré ${disbursements.length} disbursements de la liste globale`);
    } catch (error) {
      console.error('❌ Erreur lors de la migration de la liste globale:', error);
    }
  }
  
  // 2. Migrer les disbursements associés aux contrats
  const contractKeys = Object.keys(localStorage).filter(key => 
    key.startsWith(STORAGE_KEYS.CONTRACT_PREFIX) && key.endsWith('_DISBURSEMENTS')
  );
  
  contractKeys.forEach(key => {
    const contractDisbursementsJson = localStorage.getItem(key);
    if (contractDisbursementsJson) {
      try {
        const contractDisbursements: OldDisbursement[] = JSON.parse(contractDisbursementsJson);
        const migratedContractDisbursements = contractDisbursements.map(migrateDisbursement);
        localStorage.setItem(key, JSON.stringify(migratedContractDisbursements));
        console.log(`✅ Migré ${contractDisbursements.length} disbursements pour ${key.replace(STORAGE_KEYS.CONTRACT_PREFIX, '').replace('_DISBURSEMENTS', '')}`);
      } catch (error) {
        console.error(`❌ Erreur lors de la migration de ${key}:`, error);
      }
    }
  });
  
  return migratedCount;
}

/**
 * Génère un rapport de migration
 */
function generateMigrationReport(): void {
  const disbursementsJson = localStorage.getItem(STORAGE_KEYS.DISBURSEMENTS);
  
  if (!disbursementsJson) {
    console.log('\n📊 Aucune donnée de disbursement trouvée dans localStorage');
    return;
  }
  
  const disbursements: NewDisbursement[] = JSON.parse(disbursementsJson);
  const statusCounts: Record<string, number> = {};
  
  disbursements.forEach(d => {
    statusCounts[d.status] = (statusCounts[d.status] || 0) + 1;
  });
  
  console.log('\n📊 Rapport de migration:');
  console.log('════════════════════════════════════');
  console.log(`Total disbursements: ${disbursements.length}`);
  console.log('\nRépartition par statut:');
  Object.entries(statusCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([status, count]) => {
      const percentage = ((count / disbursements.length) * 100).toFixed(1);
      console.log(`  ${status.padEnd(15)} ${count.toString().padStart(3)} (${percentage}%)`);
    });
  console.log('════════════════════════════════════\n');
}

/**
 * Crée une sauvegarde avant migration
 */
function createBackup(): void {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupKey = `DISBURSEMENTS_BACKUP_${timestamp}`;
  
  const disbursementsJson = localStorage.getItem(STORAGE_KEYS.DISBURSEMENTS);
  if (disbursementsJson) {
    localStorage.setItem(backupKey, disbursementsJson);
    console.log(`💾 Sauvegarde créée: ${backupKey}\n`);
  }
}

/**
 * Point d'entrée principal
 */
function main(): void {
  console.log('🚀 Migration des statuts de disbursement\n');
  console.log('Anciens statuts (FR) → Nouveaux statuts (EN)');
  console.log('═══════════════════════════════════════════════\n');
  
  // Créer une sauvegarde
  createBackup();
  
  // Effectuer la migration
  const migratedCount = migrateLocalStorageDisbursements();
  
  if (migratedCount === 0) {
    console.log('\n⚠️  Aucune donnée à migrer trouvée dans localStorage');
    console.log('Cela peut être normal si:');
    console.log('  - Aucun disbursement n\'a encore été créé');
    console.log('  - Les données sont stockées dans une base de données externe');
    console.log('  - La migration a déjà été effectuée\n');
    return;
  }
  
  // Générer le rapport
  generateMigrationReport();
  
  console.log('✅ Migration terminée avec succès!\n');
  console.log('💡 Note: Pour restaurer depuis la sauvegarde:');
  console.log('   1. Ouvrir la console du navigateur (F12)');
  console.log('   2. Exécuter: const backup = localStorage.getItem("DISBURSEMENTS_BACKUP_...")');
  console.log('   3. Exécuter: localStorage.setItem("TRADITIONAL_DISBURSEMENTS", backup)\n');
}

// Exécution si appelé en tant que script Node.js
if (typeof window === 'undefined') {
  console.error('❌ Ce script doit être exécuté dans le navigateur (console F12)');
  console.log('\n📋 Instructions:');
  console.log('  1. Ouvrir l\'application dans le navigateur');
  console.log('  2. Ouvrir la console (F12)');
  console.log('  3. Copier/coller le contenu de ce fichier');
  console.log('  4. Exécuter: main()\n');
} else {
  // Si exécuté dans le navigateur, exposer la fonction globalement
  (window as unknown as { migrateDisbursementStatus: typeof main }).migrateDisbursementStatus = main;
  console.log('✅ Script de migration chargé!');
  console.log('📋 Pour lancer la migration, exécutez: migrateDisbursementStatus()\n');
}

// Export pour utilisation en tant que module
export { main as migrateDisbursementStatus, STATUS_MIGRATION_MAP };

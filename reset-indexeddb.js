// Utilitaire pour effacer la base IndexedDB 'portfolio-db' côté navigateur
// Ouvrez la console du navigateur (F12), collez ce script et exécutez-le
(function() {
  const req = indexedDB.deleteDatabase('portfolio-db');
  req.onsuccess = function() { console.log('✅ Base portfolio-db supprimée. Rechargez la page.'); };
  req.onerror = function(e) { console.error('❌ Erreur suppression IndexedDB:', e); };
  req.onblocked = function() { console.warn('⚠️ Suppression bloquée. Fermez les autres onglets.'); };
})();

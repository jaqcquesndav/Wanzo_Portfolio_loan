// guaranteeInitializer.ts
import { mockGuarantees } from '../data/mockGuarantees';
import { Guarantee } from '../types/guarantee';

// Constantes pour les clés de stockage et les identifiants
const STORAGE_KEY = 'wanzo_guarantees';
const GUARANTEE_LOG_KEY = 'wanzo_guarantee_access_logs';
const PROBLEMATIC_GUARANTEE_ID = 'G001';
const PROBLEMATIC_PORTFOLIO_ID = 'trad-1';
const PROBLEMATIC_PATH = `/app/traditional/trad-1/guarantees/G001`;

/**
 * Fonction à appeler pour forcer l'initialisation des garanties
 * dans le localStorage au chargement de l'application
 */
export function forceInitializeGuarantees(): void {
  try {
    console.log('🔍 Vérification des données de garanties...');
    
    // Vérifier si les garanties existent déjà dans le localStorage
    const existingGuarantees = localStorage.getItem(STORAGE_KEY);
    
    // Si les garanties n'existent pas ou sont vides, les initialiser
    if (!existingGuarantees || JSON.parse(existingGuarantees).length === 0) {
      console.log('🔄 Initialisation forcée des données de garanties...');
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mockGuarantees));
      console.log('✅ Données de garanties initialisées avec succès!');
      
      // Log de débogage pour vérifier les données initialisées
      const initializedData = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      console.log(`📊 ${initializedData.length} garanties initialisées`);
      
      // Vérifier si la garantie G001 existe dans les données initialisées
      const g001 = initializedData.find((g: Guarantee) => g.id === PROBLEMATIC_GUARANTEE_ID && g.portfolioId === PROBLEMATIC_PORTFOLIO_ID);
      if (g001) {
        console.log(`✅ La garantie ${PROBLEMATIC_GUARANTEE_ID} du portfolio ${PROBLEMATIC_PORTFOLIO_ID} est présente dans les données initialisées`);
        console.log(`📝 Détails de la garantie problématique:`, JSON.stringify(g001, null, 2));
      } else {
        console.warn(`⚠️ La garantie ${PROBLEMATIC_GUARANTEE_ID} du portfolio ${PROBLEMATIC_PORTFOLIO_ID} n'est PAS présente dans les données initialisées`);
        console.warn(`⚠️ Chemin problématique: ${PROBLEMATIC_PATH}`);
      }
    } else {
      console.log('✅ Les données de garanties existent déjà dans le localStorage');
      
      // Vérifier si la garantie G001 existe dans les données existantes
      const existingData = JSON.parse(existingGuarantees);
      console.log(`📊 ${existingData.length} garanties existantes dans le localStorage`);
      
      const g001 = existingData.find((g: Guarantee) => g.id === PROBLEMATIC_GUARANTEE_ID && g.portfolioId === PROBLEMATIC_PORTFOLIO_ID);
      if (g001) {
        console.log(`✅ La garantie ${PROBLEMATIC_GUARANTEE_ID} du portfolio ${PROBLEMATIC_PORTFOLIO_ID} est présente dans les données existantes`);
        console.log(`📝 Détails de la garantie problématique:`, JSON.stringify(g001, null, 2));
      } else {
        console.warn(`⚠️ La garantie ${PROBLEMATIC_GUARANTEE_ID} du portfolio ${PROBLEMATIC_PORTFOLIO_ID} n'est PAS présente dans les données existantes`);
        console.warn(`⚠️ Chemin problématique: ${PROBLEMATIC_PATH}`);
        // Tentative d'ajout automatique
        ensureG001Exists();
      }
    }
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation forcée des garanties:', error);
    
    // Enregistrer l'erreur dans les logs d'accès
    logGuaranteeEvent('error', PROBLEMATIC_GUARANTEE_ID, PROBLEMATIC_PORTFOLIO_ID, String(error));
  }
}

/**
 * Fonction pour enregistrer les événements liés aux garanties dans les logs d'accès
 * Permet de traquer les erreurs et les accès aux garanties problématiques
 */
export function logGuaranteeEvent(
  eventType: 'check' | 'add' | 'access' | 'error' | 'click', 
  guaranteeId: string, 
  portfolioId: string,
  errorDetails?: string
): void {
  try {
    // Définir l'interface pour les événements de log
    interface GuaranteeLogEvent {
      timestamp: string;
      eventType: 'check' | 'add' | 'access' | 'error' | 'click';
      guaranteeId: string;
      portfolioId: string;
      errorDetails?: string;
      url?: string;
      path?: string;
    }
    
    // Récupérer les logs existants ou initialiser un tableau vide
    const existingLogs = localStorage.getItem(GUARANTEE_LOG_KEY);
    const logs: GuaranteeLogEvent[] = existingLogs ? JSON.parse(existingLogs) : [];
    
    // Créer un nouvel événement de log
    const logEvent: GuaranteeLogEvent = {
      timestamp: new Date().toISOString(),
      eventType,
      guaranteeId,
      portfolioId,
      errorDetails,
      url: window.location.href,
      path: window.location.pathname
    };
    
    // Ajouter l'événement aux logs existants
    logs.push(logEvent);
    
    // Limiter à 100 derniers logs pour éviter de surcharger le localStorage
    const trimmedLogs = logs.slice(-100);
    
    // Sauvegarder les logs dans le localStorage
    localStorage.setItem(GUARANTEE_LOG_KEY, JSON.stringify(trimmedLogs));
    
    // Afficher dans la console pour le débogage
    console.log(`📝 Log d'événement garantie:`, logEvent);
    
    // Si c'est une erreur ou un clic sur la garantie problématique, afficher plus de détails
    if ((eventType === 'error' || eventType === 'click') && 
        guaranteeId === PROBLEMATIC_GUARANTEE_ID && 
        portfolioId === PROBLEMATIC_PORTFOLIO_ID) {
      console.warn(`⚠️ Événement sur la garantie problématique ${PROBLEMATIC_GUARANTEE_ID}:`, logEvent);
      console.warn(`⚠️ Chemin problématique: ${PROBLEMATIC_PATH}`);
      console.warn(`⚠️ Chemin actuel: ${window.location.pathname}`);
      
      // Diagnostiquer les routes React Router
      console.log('🔍 Diagnostic des routes React Router:');
      console.log(`- URL actuelle: ${window.location.href}`);
      console.log(`- Chemin problématique attendu: ${PROBLEMATIC_PATH}`);
    }
  } catch (error) {
    console.error('❌ Erreur lors de l\'enregistrement du log d\'événement:', error);
  }
}

/**
 * Fonction pour traquer les clics sur une garantie spécifique
 * À appeler dans le gestionnaire d'événements onClick des lignes de garantie
 */
export function trackGuaranteeClick(guaranteeId: string, portfolioId: string): void {
  // Enregistrer l'événement de clic
  logGuaranteeEvent('click', guaranteeId, portfolioId);
  
  // Si c'est la garantie problématique, effectuer des vérifications supplémentaires
  if (guaranteeId === PROBLEMATIC_GUARANTEE_ID && portfolioId === PROBLEMATIC_PORTFOLIO_ID) {
    console.log(`🔍 Clic sur la garantie problématique ${guaranteeId} du portfolio ${portfolioId}`);
    console.log(`🔍 Chemin de navigation attendu: ${PROBLEMATIC_PATH}`);
    
    // Vérifier si la garantie existe
    const exists = checkGuaranteeExists(guaranteeId, portfolioId);
    
    if (!exists) {
      console.warn(`⚠️ La garantie ${guaranteeId} n'existe pas dans les données, tentative d'ajout automatique...`);
      ensureG001Exists();
    }
    
    // Vérifier la structure des routes React Router
    console.log('📊 Diagnostic de navigation:');
    console.log(`- URL avant navigation: ${window.location.href}`);
    console.log(`- Chemin attendu après navigation: ${PROBLEMATIC_PATH}`);
    
    // Surveiller les erreurs de navigation pendant les prochaines secondes
    const originalConsoleError = console.error;
    console.error = function(...args: unknown[]) {
      // Log original
      originalConsoleError.apply(console, args);
      
      // Capture des erreurs React Router
      const errorString = args.map(arg => String(arg)).join(' ');
      if (errorString.includes('No route matches URL') && errorString.includes(PROBLEMATIC_PATH)) {
        console.warn(`🚨 ERREUR DE ROUTE DÉTECTÉE: ${errorString}`);
        console.warn(`🚨 Erreur de navigation vers ${PROBLEMATIC_PATH}`);
        logGuaranteeEvent('error', guaranteeId, portfolioId, errorString);
      }
    };
    
    // Restaurer la fonction console.error après 5 secondes
    setTimeout(() => {
      console.error = originalConsoleError;
    }, 5000);
  }
}

/**
 * Fonction pour afficher un résumé des logs d'accès aux garanties
 * Utile pour le débogage
 */
export function displayGuaranteeLogs(): void {
  try {
    const logsData = localStorage.getItem(GUARANTEE_LOG_KEY);
    if (!logsData) {
      console.log('📝 Aucun log d\'accès aux garanties trouvé.');
      return;
    }
    
    // Définir l'interface pour les événements de log
    interface GuaranteeLogEvent {
      timestamp: string;
      eventType: 'check' | 'add' | 'access' | 'error' | 'click';
      guaranteeId: string;
      portfolioId: string;
      errorDetails?: string;
      url?: string;
      path?: string;
    }
    
    const logs = JSON.parse(logsData) as GuaranteeLogEvent[];
    console.log(`📊 Résumé des logs d'accès aux garanties (${logs.length} entrées):`);
    
    // Filtrer les erreurs
    const errors = logs.filter(log => log.eventType === 'error');
    if (errors.length > 0) {
      console.warn(`⚠️ ${errors.length} erreurs détectées:`);
      errors.forEach((error: GuaranteeLogEvent, index: number) => {
        console.warn(`  ${index + 1}. [${error.timestamp}] ${error.guaranteeId}/${error.portfolioId}: ${error.errorDetails}`);
      });
    }
    
    // Filtrer les accès à la garantie problématique
    const problematicAccess = logs.filter(log => 
      log.guaranteeId === PROBLEMATIC_GUARANTEE_ID && 
      log.portfolioId === PROBLEMATIC_PORTFOLIO_ID
    );
    
    if (problematicAccess.length > 0) {
      console.log(`🔍 ${problematicAccess.length} accès à la garantie problématique G001:`);
      problematicAccess.forEach((access: GuaranteeLogEvent, index: number) => {
        console.log(`  ${index + 1}. [${access.timestamp}] ${access.eventType} - Path: ${access.path}`);
      });
    }
  } catch (error) {
    console.error('❌ Erreur lors de l\'affichage des logs d\'accès:', error);
  }
}
export function checkGuaranteeExists(guaranteeId: string, portfolioId: string): boolean {
  try {
    const guaranteesData = localStorage.getItem(STORAGE_KEY);
    if (!guaranteesData) {
      console.warn(`❌ Aucune garantie trouvée dans le localStorage (${STORAGE_KEY})`);
      return false;
    }
    
    const guarantees = JSON.parse(guaranteesData);
    const exists = guarantees.some((g: Guarantee) => g.id === guaranteeId && g.portfolioId === portfolioId);
    
    if (guaranteeId === PROBLEMATIC_GUARANTEE_ID && portfolioId === PROBLEMATIC_PORTFOLIO_ID) {
      if (exists) {
        console.log(`✅ Vérification: La garantie ${guaranteeId} du portfolio ${portfolioId} existe bien dans le localStorage`);
      } else {
        console.warn(`⚠️ Vérification: La garantie ${guaranteeId} du portfolio ${portfolioId} n'existe PAS dans le localStorage`);
        console.warn(`⚠️ Chemin problématique qui pourrait échouer: ${PROBLEMATIC_PATH}`);
      }
    }
    
    return exists;
  } catch (error) {
    console.error('❌ Erreur lors de la vérification de l\'existence de la garantie:', error);
    return false;
  }
}

/**
 * Fonction pour ajouter manuellement la garantie G001 si elle n'existe pas
 */
export function ensureG001Exists(): void {
  try {
    if (!checkGuaranteeExists(PROBLEMATIC_GUARANTEE_ID, PROBLEMATIC_PORTFOLIO_ID)) {
      console.log(`⚠️ La garantie ${PROBLEMATIC_GUARANTEE_ID} n'existe pas, ajout manuel...`);
      
      const g001: Guarantee = {
        id: PROBLEMATIC_GUARANTEE_ID,
        company: 'PME Agro Sarl',
        type: 'Hypothèque',
        value: 20000000,
        status: 'active',
        created_at: '2025-07-01T10:00:00Z',
        requestId: 'REQ-TRAD-20250701-0001',
        portfolioId: PROBLEMATIC_PORTFOLIO_ID,
        contractId: 'CONT-20230509-0001',
        contractReference: 'CRDT-100000',
        details: {
          description: 'Terrain agricole avec bâtiments d\'exploitation',
          location: 'Zone industrielle Sud, Parcelle 24',
          reference: 'HYPO-2025-001',
          coverage: 100
        }
      };
      
      const guaranteesData = localStorage.getItem(STORAGE_KEY);
      const guarantees = guaranteesData ? JSON.parse(guaranteesData) : [];
      guarantees.push(g001);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(guarantees));
      
      console.log(`✅ Garantie ${PROBLEMATIC_GUARANTEE_ID} ajoutée avec succès!`);
      console.log(`📝 Détails de la garantie ajoutée:`, JSON.stringify(g001, null, 2));
      
      // Enregistrer l'événement d'ajout dans les logs d'accès
      logGuaranteeEvent('add', PROBLEMATIC_GUARANTEE_ID, PROBLEMATIC_PORTFOLIO_ID);
    } else {
      console.log(`✅ La garantie ${PROBLEMATIC_GUARANTEE_ID} existe déjà`);
      
      // Enregistrer l'événement de vérification dans les logs d'accès
      logGuaranteeEvent('check', PROBLEMATIC_GUARANTEE_ID, PROBLEMATIC_PORTFOLIO_ID);
    }
  } catch (error) {
    console.error(`❌ Erreur lors de l'ajout manuel de la garantie ${PROBLEMATIC_GUARANTEE_ID}:`, error);
    
    // Enregistrer l'erreur dans les logs d'accès
    logGuaranteeEvent('error', PROBLEMATIC_GUARANTEE_ID, PROBLEMATIC_PORTFOLIO_ID, String(error));
  }
}

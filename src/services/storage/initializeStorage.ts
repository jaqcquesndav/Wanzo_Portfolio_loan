// src/services/storage/initializeStorage.ts
import { centraleRisqueStorageService } from './centraleRisqueStorage';
import { guaranteeStorageService } from './guaranteeStorage';
import { companyStorageService } from './companyStorage';

/**
 * Initialise toutes les données de stockage de l'application
 */
export async function initializeAllStorageData(): Promise<void> {
  try {
    console.log('🔄 Initialisation des données de stockage...');
    
    // Initialiser les données d'entreprises
    await companyStorageService.initializeDefaultData();
    
    // Initialiser les données de garanties
    await guaranteeStorageService.initializeDefaultData();
    
    // Initialiser les données de la centrale de risque
    await centraleRisqueStorageService.initializeDefaultData();
    
    console.log('✅ Toutes les données de stockage ont été initialisées avec succès!');
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation des données de stockage:', error);
    throw error;
  }
}

/**
 * Vérifie si les données de stockage sont initialisées
 */
export function isStorageInitialized(): boolean {
  return Boolean(
    localStorage.getItem('wanzo_companies') &&
    localStorage.getItem('wanzo_guarantees') &&
    localStorage.getItem('wanzo_centrale_risque_credits') &&
    localStorage.getItem('wanzo_centrale_risque_leasing') &&
    localStorage.getItem('wanzo_centrale_risque_investments')
  );
}

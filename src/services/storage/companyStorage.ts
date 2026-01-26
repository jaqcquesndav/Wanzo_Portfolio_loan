// src/services/storage/companyStorage.ts
import { isProduction, allowMockData } from '../../config/environment';
import type { CompanyData } from '../../data/companies/index';

// Clés de stockage pour les entreprises
export const COMPANY_STORAGE_KEYS = {
  COMPANIES: 'wanzo_companies'
};

// Import dynamique des mocks (uniquement en développement)
const getMockCompanies = async (): Promise<CompanyData[]> => {
  if (isProduction || !allowMockData) {
    return [];
  }
  const { mockCompanies } = await import('../../data/companies');
  return mockCompanies;
};

/**
 * Service pour la gestion des données d'entreprises dans le localStorage
 * 
 * ⚠️ En PRODUCTION:
 * - Les données viennent exclusivement du backend via l'API
 * - Le localStorage sert uniquement de cache temporaire
 * - Les mocks ne sont JAMAIS utilisés
 */
class CompanyStorageService {
  /**
   * Initialise les données par défaut des entreprises
   * ⚠️ En production, cette méthode ne fait rien
   */
  async initializeDefaultData(): Promise<void> {
    // En production, ne pas initialiser de données mock
    if (isProduction || !allowMockData) {
      console.log('[PROD] CompanyStorageService.initializeDefaultData() - utilisation du backend uniquement');
      return;
    }
    
    try {
      // Vérifier si les données existent déjà
      const companyData = localStorage.getItem(COMPANY_STORAGE_KEYS.COMPANIES);
      
      // Initialiser les données d'entreprises si nécessaire
      if (!companyData) {
        const mockCompanies = await getMockCompanies();
        if (mockCompanies.length === 0) {
          console.log('[DEV] Pas de données mock disponibles');
          return;
        }
        
        // Adapter les données mockées pour inclure les propriétés manquantes
        const adaptedCompanies = mockCompanies.map(company => ({
          ...company,
          industry: company.sector, // Utiliser sector comme fallback pour industry
          legalForm: 'SARL' // Valeur par défaut pour legalForm
        }));
        
        localStorage.setItem(COMPANY_STORAGE_KEYS.COMPANIES, JSON.stringify(adaptedCompanies));
        console.log('[DEV] ✅ Données d\'entreprises initialisées');
      }
    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation des données d\'entreprises:', error);
      throw error;
    }
  }
  
  /**
   * Récupère toutes les données d'entreprises
   */
  async getCompanies(): Promise<CompanyData[]> {
    try {
      const storedData = localStorage.getItem(COMPANY_STORAGE_KEYS.COMPANIES);
      return storedData ? JSON.parse(storedData) : [];
    } catch (error) {
      console.error('Erreur lors de la récupération des données d\'entreprises:', error);
      return [];
    }
  }
  
  /**
   * Récupère une entreprise par son ID
   */
  async getCompanyById(companyId: string): Promise<CompanyData | undefined> {
    try {
      const allData = await this.getCompanies();
      return allData.find(company => company.id === companyId);
    } catch (error) {
      console.error(`Erreur lors de la récupération de l'entreprise ${companyId}:`, error);
      return undefined;
    }
  }
  
  /**
   * Recherche des entreprises par terme de recherche
   */
  async searchCompanies(searchTerm: string): Promise<CompanyData[]> {
    try {
      if (!searchTerm) return this.getCompanies();
      
      const allData = await this.getCompanies();
      const searchTermLower = searchTerm.toLowerCase();
      
      return allData.filter(company => 
        company.id.toLowerCase().includes(searchTermLower) || 
        company.name.toLowerCase().includes(searchTermLower)
      );
    } catch (error) {
      console.error(`Erreur lors de la recherche d'entreprises avec le terme "${searchTerm}":`, error);
      return [];
    }
  }
}

// Exporter l'instance du service
export const companyStorageService = new CompanyStorageService();

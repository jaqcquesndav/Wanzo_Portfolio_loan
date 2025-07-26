/**
 * Service d'initialisation et de validation des données
 * 
 * Ce service centralise la validation et l'initialisation des données critiques
 * dans l'application. Il permet de vérifier l'intégrité des données au démarrage
 * et offre des méthodes pour initialiser ou réinitialiser les données si nécessaire.
 */

import { guaranteeService } from '../guaranteeService';
import { Guarantee } from '../../types/guarantee';

/**
 * Classe de service pour la validation des données
 */
export class DataValidationService {
  /**
   * Vérifie l'intégrité des données de garanties
   * 
   * @returns {Promise<{ valid: boolean, issues: string[] }>} Résultat de la validation
   */
  async validateGuaranteeData(): Promise<{ valid: boolean, issues: string[] }> {
    const issues: string[] = [];
    
    try {
      const guarantees = await guaranteeService.getAllGuarantees();
      
      // Vérifier que les données de garanties existent
      if (!guarantees || guarantees.length === 0) {
        issues.push('Aucune garantie trouvée dans le système.');
      }
      
      // Vérifier que les garanties contiennent les champs obligatoires
      const invalidGuarantees = guarantees.filter((g: Guarantee) => !this.isValidGuarantee(g));
      if (invalidGuarantees.length > 0) {
        issues.push(`${invalidGuarantees.length} garantie(s) avec des données incomplètes.`);
      }
      
      // Vérifier que les portfolioId référencés existent
      const portfolioIds = [...new Set(guarantees.map((g: Guarantee) => g.portfolioId))];
      if (portfolioIds.includes('')) {
        issues.push('Certaines garanties n\'ont pas de portfolioId.');
      }
      
      return {
        valid: issues.length === 0,
        issues
      };
    } catch (error) {
      return {
        valid: false,
        issues: [`Erreur lors de la validation des données: ${error}`]
      };
    }
  }
  
  /**
   * Vérifie si une garantie contient tous les champs obligatoires
   * 
   * @param {Guarantee} guarantee - La garantie à valider
   * @returns {boolean} True si la garantie est valide
   * @private
   */
  private isValidGuarantee(guarantee: Guarantee): boolean {
    return (
      !!guarantee.id &&
      !!guarantee.company &&
      !!guarantee.type &&
      !!guarantee.value &&
      !!guarantee.status &&
      !!guarantee.created_at &&
      !!guarantee.portfolioId
    );
  }
  
  /**
   * Répare les données de garanties si nécessaire
   * 
   * @returns {Promise<{ success: boolean, message: string }>} Résultat de la réparation
   */
  async repairGuaranteeData(): Promise<{ success: boolean, message: string }> {
    try {
      // Réinitialiser les données de garanties
      const success = await guaranteeService.resetToMockData();
      
      return {
        success,
        message: success
          ? 'Les données de garanties ont été réinitialisées avec succès.'
          : 'Échec de la réinitialisation des données de garanties.'
      };
    } catch (error) {
      return {
        success: false,
        message: `Erreur lors de la réparation des données: ${error}`
      };
    }
  }
}

// Singleton instance
export const dataValidationService = new DataValidationService();

// src/utils/exportModern.ts
import { CreditContract } from '../types/credit';
import type { CreditContractPDFRef } from '../components/credit/CreditContractPDF';

// Type pour les données additionnelles qui ne sont pas dans CreditContract
export interface CreditContractExportAddData {
  institutionName: string;
  institutionLogo?: string;
  institutionAddress?: string;
  institutionContact?: string;
  portfolioName: string;
  portfolioManager?: string;
  scheduleData?: {
    number: number;
    dueDate: string;
    principal: number;
    interest: number;
    total: number;
    status: string;
  }[];
}

/**
 * Exporte un contrat de crédit au format PDF en utilisant l'approche moderne (composant React + html2canvas)
 * Cette fonction peut être appelée depuis n'importe quel composant React
 * 
 * @param contract Le contrat de crédit à exporter
 * @param additionalData Données additionnelles pour l'export (institution, portefeuille, échéancier)
 * @returns Promise avec le résultat de l'opération
 */
export const exportCreditContractToPDF = async (
  contract: CreditContract,
  additionalData: CreditContractExportAddData
): Promise<{ success: boolean; message?: string }> => {
  try {
    // Importer dynamiquement le composant pour éviter des problèmes de dépendances circulaires
    const { default: CreditContractPDFComponent } = await import('../components/credit/CreditContractPDF');
    
    // Créer une div temporaire pour rendre le composant
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '-9999px';
    document.body.appendChild(container);
    
    // Importer React et ReactDOM dynamiquement
    const React = await import('react');
    const ReactDOM = await import('react-dom');
    
    // Créer une référence pour accéder à la méthode downloadPDF du composant
    const componentRef = React.createRef<CreditContractPDFRef>();
    
    try {
      // Rendre le composant dans la div temporaire
      ReactDOM.render(
        React.createElement(CreditContractPDFComponent, {
          ref: componentRef,
          contract,
          additionalData
        }),
        container
      );
      
      // Attendre que le composant soit rendu
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Appeler la méthode downloadPDF du composant
      const result = componentRef.current?.downloadPDF ? await componentRef.current.downloadPDF() : false;
      
      return {
        success: result,
        message: result ? undefined : 'Échec de la génération du PDF'
      };
    } finally {
      // Nettoyer la div temporaire
      ReactDOM.unmountComponentAtNode(container);
      document.body.removeChild(container);
    }
  } catch (error) {
    console.error('Erreur lors de la génération du PDF:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Erreur inconnue lors de la génération du PDF'
    };
  }
};

// Réexporter les autres fonctions d'export pour maintenir la compatibilité avec le code existant
export { exportToExcel, exportToPDF, exportPaymentOrderToPDF } from './export';

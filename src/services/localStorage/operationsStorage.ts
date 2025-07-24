import type { PortfolioOperation } from '../../components/dashboard/RecentOperationsTable';
import { getRecentOperations } from '../dashboard/operationsService';
import type { PortfolioType } from '../../types/portfolio';
import { dashboardApi } from '../api/shared/dashboard.api';

const OPERATIONS_STORAGE_KEY = 'wanzo_portfolio_operations';

/**
 * Fonction qui convertit un type d'activité de l'API en type d'opération
 */
const mapActivityTypeToOperationType = (activityType: string): 'disbursement' | 'repayment' | 'request' | 'contract' | 'guarantee' | 'rental' | 'return' | 'maintenance' | 'payment' | 'incident' | 'subscription' | 'redemption' | 'valuation' | 'dividend' | 'transaction' => {
  switch (activityType) {
    case 'portfolio_created':
      return 'transaction';
    case 'funding_request':
      return 'request';
    case 'payment':
      return 'payment';
    case 'risk_alert':
      return 'incident';
    case 'contract_signed':
      return 'contract';
    default:
      return 'transaction';
  }
};

/**
 * Fonction qui détermine le statut d'une opération en fonction du type d'activité
 */
const mapActivityStatusToOperationStatus = (activityType: string): 'completed' | 'pending' | 'failed' | 'planned' => {
  switch (activityType) {
    case 'portfolio_created':
    case 'contract_signed':
      return 'completed';
    case 'funding_request':
      return 'pending';
    case 'risk_alert':
      return 'pending';
    default:
      return 'completed';
  }
};

/**
 * Type pour les activités de l'API du dashboard
 */
interface DashboardActivity {
  id: string;
  type: 'portfolio_created' | 'funding_request' | 'payment' | 'risk_alert' | 'contract_signed';
  entityId: string;
  title: string;
  description: string;
  timestamp: string;
  portfolioType?: PortfolioType;
}

/**
 * Fonction qui détermine le type de portefeuille en fonction de l'activité
 */
const determinePortfolioType = (activity: DashboardActivity): PortfolioType => {
  // Cette fonction devrait idéalement utiliser des données de l'activité pour déterminer le type
  // Ici nous faisons une implémentation simple basée sur l'ID ou d'autres attributs
  
  if (activity.portfolioType) {
    return activity.portfolioType;
  }
  
  // Fallback: essayer de déterminer par l'ID
  const id = activity.entityId?.toLowerCase() || '';
  if (id.includes('trad') || id.includes('credit')) return 'traditional';
  if (id.includes('invest')) return 'investment';
  if (id.includes('lease')) return 'leasing';
  
  // Par défaut
  return 'traditional';
};

/**
 * Sauvegarde les opérations dans le localStorage
 */
export const saveOperations = (operations: PortfolioOperation[], portfolioType?: PortfolioType): void => {
  try {
    const key = portfolioType 
      ? `${OPERATIONS_STORAGE_KEY}_${portfolioType}` 
      : OPERATIONS_STORAGE_KEY;
    
    localStorage.setItem(key, JSON.stringify(operations));
  } catch (error: unknown) {
    console.error('Erreur lors de la sauvegarde des opérations:', error);
  }
};

/**
 * Récupère les opérations depuis le localStorage
 */
export const getOperationsFromStorage = (portfolioType?: PortfolioType): PortfolioOperation[] => {
  try {
    const key = portfolioType 
      ? `${OPERATIONS_STORAGE_KEY}_${portfolioType}` 
      : OPERATIONS_STORAGE_KEY;
    
    const storedData = localStorage.getItem(key);
    if (!storedData) return [];
    
    return JSON.parse(storedData) as PortfolioOperation[];
  } catch (error: unknown) {
    console.error('Erreur lors de la récupération des opérations:', error);
    return [];
  }
};

/**
 * Charge les opérations depuis le backend ou le service simulé,
 * puis les stocke dans localStorage
 */
export const loadAndStoreOperations = async (portfolioType?: PortfolioType): Promise<PortfolioOperation[]> => {
  try {
    // Essayer de charger depuis une API backend d'abord
    // Si ce n'est pas disponible ou échoue, utiliser le service de simulation
    let operations: PortfolioOperation[] = [];
    
    try {
      // Dans une vraie application, ceci serait une vérification de connectivité
      // et un appel API
      const isOnline = navigator.onLine;
      
      if (isOnline) {
        // Tentative d'appel API backend
        try {
          // Utiliser le service API du dashboard existant
          const dashboardData = await dashboardApi.getDashboardData();
          
          // Transformer les données d'activité récente en opérations
          if (dashboardData && dashboardData.recentActivity) {
            operations = dashboardData.recentActivity
              .map(activity => {
                // Déterminer le type de portefeuille
                const portfolioType = determinePortfolioType(activity);
                
                // Données de base communes à tous les types d'opérations
                const baseOperation = {
                  id: activity.id,
                  amount: 0, // À définir selon le type d'activité
                  date: activity.timestamp,
                  status: mapActivityStatusToOperationStatus(activity.type),
                  portfolioId: activity.entityId,
                  portfolioName: 'Portfolio', // À remplacer par le nom réel si disponible
                  clientName: '',
                  description: activity.description,
                };
                
                // Créer l'opération selon le type de portefeuille
                if (portfolioType === 'traditional') {
                  return {
                    ...baseOperation,
                    type: mapActivityTypeToOperationType(activity.type) as 'disbursement' | 'repayment' | 'request' | 'contract' | 'guarantee',
                    portfolioType: 'traditional' as const
                  };
                } else if (portfolioType === 'leasing') {
                  return {
                    ...baseOperation,
                    type: mapActivityTypeToOperationType(activity.type) as 'rental' | 'return' | 'maintenance' | 'payment' | 'incident',
                    equipmentId: activity.entityId, // Fallback, à remplacer par la vraie valeur si disponible
                    equipmentName: 'Équipement', // Valeur par défaut
                    portfolioType: 'leasing' as const
                  };
                } else {
                  return {
                    ...baseOperation,
                    type: mapActivityTypeToOperationType(activity.type) as 'subscription' | 'redemption' | 'valuation' | 'dividend' | 'transaction',
                    assetId: activity.entityId, // Fallback, à remplacer par la vraie valeur si disponible
                    assetName: 'Actif', // Valeur par défaut
                    portfolioType: 'investment' as const
                  };
                }
              })
              .filter(op => !portfolioType || op.portfolioType === portfolioType);
            
            // Retourner les opérations de l'API
            return operations;
          }
        } catch (apiError) {
          console.warn('Erreur lors de l\'appel à l\'API:', apiError);
          throw new Error('API non disponible');
        }
      } else {
        throw new Error('Hors ligne');
      }
    } catch {
      // En cas d'échec de l'API, utiliser le service de simulation
      operations = await getRecentOperations(portfolioType);
    }
    
    // Sauvegarder dans localStorage
    saveOperations(operations, portfolioType);
    
    return operations;
  } catch (error: unknown) {
    console.error('Erreur lors du chargement des opérations:', error);
    
    // En cas d'échec total, essayer de récupérer les données depuis localStorage
    return getOperationsFromStorage(portfolioType);
  }
};

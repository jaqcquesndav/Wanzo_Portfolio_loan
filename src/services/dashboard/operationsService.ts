import type { PortfolioType } from '../../types/portfolio';
import type { PortfolioOperation } from '../../components/dashboard/RecentOperationsTable';
import { 
  getDisbursements,
  getRepayments, 
  getFundingRequests,
  getCreditContracts,
  getGuarantees
} from '../localStorage/mockStorage';

/**
 * Fonction d'aide pour mapper les différents statuts vers un format unifié
 */
const mapStatus = (status: string): 'completed' | 'pending' | 'failed' | 'planned' => {
  switch (status.toLowerCase()) {
    case 'effectué':
    case 'payé':
    case 'completed':
    case 'resolved':
    case 'active':
      return 'completed';
    case 'en attente':
    case 'à venir':
    case 'pending':
    case 'open':
    case 'in_progress':
      return 'pending';
    case 'failed':
    case 'cancelled':
    case 'rejected':
      return 'failed';
    case 'planned':
    case 'scheduled':
    case 'upcoming':
    case 'future':
      return 'planned';
    default:
      return 'pending';
  }
};

/**
 * Récupère les données des opérations des portefeuilles traditionnels
 * et les normalise dans un format unifié
 */
export const getRecentOperations = async (portfolioType?: PortfolioType): Promise<PortfolioOperation[]> => {
  let operations: PortfolioOperation[] = [];
  
  // Opérations pour les portefeuilles traditionnels
  if (!portfolioType || portfolioType === 'traditional') {
    // Virements
    const disbursementOps = getDisbursements().map((item) => ({
      id: item.id,
      type: 'disbursement' as const,
      amount: item.amount,
      date: item.date,
      status: mapStatus(item.status),
      portfolioId: item.portfolioId,
      portfolioName: item.portfolioId, // à remplacer par le nom réel
      clientName: item.company,
      contractId: item.contractReference,
      requestId: item.requestId,
      description: `Virement à ${item.company}`,
      portfolioType: 'traditional' as const
    }));
    
    // Remboursements
    const repaymentOps = getRepayments().map((item) => ({
      id: item.id,
      type: 'repayment' as const,
      amount: item.amount,
      date: item.dueDate, // Utiliser la date d'échéance
      status: mapStatus(item.status),
      portfolioId: item.portfolioId,
      portfolioName: item.portfolioId, // à remplacer par le nom réel
      clientName: item.company,
      contractId: item.contractReference,
      description: `Remboursement de ${item.company}`,
      portfolioType: 'traditional' as const
    }));
    
    // Demandes de financement
    const requestOps = getFundingRequests().map((item) => ({
      id: item.id,
      type: 'request' as const,
      amount: item.amount,
      date: item.created_at || new Date().toISOString(),
      status: mapStatus(item.status),
      portfolioId: item.portfolioId,
      portfolioName: item.portfolioId, // à remplacer par le nom réel
      clientName: item.company,
      description: `Demande de ${item.amount} XOF`,
      portfolioType: 'traditional' as const
    }));
    
    // Contrats de crédit
    const contractOps = getCreditContracts().map((item) => ({
      id: item.id,
      type: 'contract' as const,
      amount: item.amount,
      date: item.startDate,
      status: mapStatus(item.status),
      portfolioId: item.portfolioId,
      portfolioName: item.portfolioId, // à remplacer par le nom réel
      clientName: item.memberName,
      contractId: item.id,
      description: `Contrat - ${item.duration || 12} mois à ${item.interestRate || 5}%`,
      portfolioType: 'traditional' as const
    }));
    
    // Garanties
    const guaranteeOps = getGuarantees().map((item) => ({
      id: item.id,
      type: 'guarantee' as const,
      amount: item.value,
      date: item.created_at,
      status: mapStatus(item.status),
      portfolioId: item.portfolioId,
      portfolioName: item.portfolioId, // à remplacer par le nom réel
      clientName: item.company,
      contractId: item.contractId,
      description: `Garantie - ${item.type}`,
      portfolioType: 'traditional' as const
    }));
    
    operations = [...operations, ...disbursementOps, ...repaymentOps, ...requestOps, ...contractOps, ...guaranteeOps];
  }
  
  // Trier par date décroissante (plus récent d'abord)
  return operations.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

/**
 * Récupère les dernières opérations pour un portefeuille spécifique
 */
export const getPortfolioOperations = async (portfolioId: string): Promise<PortfolioOperation[]> => {
  const allOperations = await getRecentOperations();
  return allOperations.filter(op => op.portfolioId === portfolioId);
};

/**
 * Récupère un résumé des opérations par type pour le tableau de bord
 */
export const getOperationsSummary = async (portfolioType?: PortfolioType) => {
  const operations = await getRecentOperations(portfolioType);
  
  const summary = {
    today: {
      count: 0,
      amount: 0
    },
    pending: {
      count: 0,
      amount: 0
    },
    completed: {
      count: 0,
      amount: 0
    },
    failed: {
      count: 0,
      amount: 0
    }
  };
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  operations.forEach(op => {
    const opDate = new Date(op.date);
    opDate.setHours(0, 0, 0, 0);
    
    // Opérations du jour
    if (opDate.getTime() === today.getTime()) {
      summary.today.count++;
      summary.today.amount += op.amount;
    }
    
    // Par statut
    switch (op.status) {
      case 'pending':
        summary.pending.count++;
        summary.pending.amount += op.amount;
        break;
      case 'completed':
        summary.completed.count++;
        summary.completed.amount += op.amount;
        break;
      case 'failed':
        summary.failed.count++;
        summary.failed.amount += op.amount;
        break;
    }
  });
  
  return summary;
};

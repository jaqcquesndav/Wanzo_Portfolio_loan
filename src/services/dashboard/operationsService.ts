import type { PortfolioType } from '../../types/portfolio';
import type { PortfolioOperation } from '../../components/dashboard/RecentOperationsTable';
import { 
  getDisbursements,
  getRepayments, 
  getLeasingTransactions,
  getInvestmentTransactions,
  getLeasingMovements,
  getFundingRequests,
  getCreditContracts,
  getGuarantees,
  getLeasingContracts,
  getIncidents,
  getLeasingPayments,
  getAssets,
  getSubscriptions,
  getValuations
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
 * Fonction d'aide pour mapper les types de leasing
 */
const mapLeasingType = (type: string): 'rental' | 'return' | 'maintenance' | 'payment' | 'incident' => {
  switch (type.toLowerCase()) {
    case 'location':
    case 'rental':
      return 'rental';
    case 'retour':
    case 'return':
      return 'return';
    case 'maintenance':
      return 'maintenance';
    case 'paiement':
    case 'payment':
      return 'payment';
    case 'incident':
      return 'incident';
    default:
      return 'rental';
  }
};

/**
 * Récupère les données des opérations de tous les types de portefeuilles
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
  
  // Opérations pour les portefeuilles leasing
  if (!portfolioType || portfolioType === 'leasing') {
    // Transactions de leasing
    const leasingTransactionOps = getLeasingTransactions().map((item) => ({
      id: item.id,
      type: mapLeasingType(item.type || 'rental'),
      amount: item.amount,
      date: item.date,
      status: mapStatus(item.status),
      portfolioId: item.portfolioId,
      portfolioName: item.portfolioId,
      clientName: "Client", // Valeur par défaut
      equipmentId: item.equipmentId,
      equipmentName: "Équipement", // Valeur par défaut
      description: `Location - Équipement`,
      portfolioType: 'leasing' as const
    }));
    
    // Contrats de leasing
    const leasingContractOps = getLeasingContracts().map((item) => ({
      id: item.id,
      type: 'rental' as const,
      amount: item.monthly_payment || 0,
      date: item.start_date,
      status: mapStatus(item.status),
      portfolioId: "lease-1", // Valeur par défaut
      portfolioName: "Leasing", // Valeur par défaut
      clientName: item.client_name,
      equipmentId: item.equipment_id,
      equipmentName: "Équipement " + item.equipment_id, // Valeur par défaut
      description: `Contrat - Équipement ${item.equipment_id}`,
      portfolioType: 'leasing' as const
    }));
    
    // Mouvements d'équipements
    const leasingMovementOps = getLeasingMovements().map((item) => ({
      id: item.id,
      type: (item.type === 'return' ? 'return' : 'rental') as 'return' | 'rental',
      amount: 0, // Les mouvements n'ont pas nécessairement un montant
      date: item.date,
      status: 'completed' as const,
      portfolioId: "lease-1", // Valeur par défaut
      portfolioName: "Leasing", // Valeur par défaut
      clientName: "Client", // Valeur par défaut
      equipmentId: item.equipment_id,
      equipmentName: "Équipement " + item.equipment_id, // Valeur par défaut
      description: `Mouvement - ${item.type === 'return' ? 'Entrée' : 'Sortie'}`,
      portfolioType: 'leasing' as const
    }));
    
    // Incidents
    const incidentOps = getIncidents().map((item) => ({
      id: item.id,
      type: 'incident' as const,
      amount: item.cost || 0,
      date: item.date,
      status: mapStatus(item.status),
      portfolioId: item.portfolioId,
      portfolioName: item.portfolioName || 'Leasing',
      clientName: item.clientName,
      equipmentId: item.equipmentId,
      equipmentName: item.equipmentName,
      description: item.description?.substring(0, 30) + '...',
      portfolioType: 'leasing' as const
    }));
    
    // Paiements de leasing
    const leasingPaymentOps = getLeasingPayments().map((item) => ({
      id: item.id,
      type: 'payment' as const,
      amount: item.amount,
      date: item.date,
      status: mapStatus(item.status),
      portfolioId: item.portfolioId,
      portfolioName: item.portfolioName || 'Leasing',
      clientName: item.clientName,
      equipmentId: item.equipmentId,
      equipmentName: item.equipmentName,
      description: item.paymentMethod ? `Paiement ${item.paymentMethod}` : 'Paiement leasing',
      portfolioType: 'leasing' as const
    }));
    
    operations = [...operations, ...leasingTransactionOps, ...leasingContractOps, ...leasingMovementOps, ...incidentOps, ...leasingPaymentOps];
  }
  
  // Opérations pour les portefeuilles d'investissement
  if (!portfolioType || portfolioType === 'investment') {
    // Transactions d'investissement
    const investmentTransactionOps = getInvestmentTransactions().map((item) => ({
      id: item.id,
      type: 'transaction' as const,
      amount: item.amount,
      date: item.date,
      status: mapStatus(item.status),
      portfolioId: item.portfolioId,
      portfolioName: "Investissement", // Valeur par défaut
      clientName: "Client investissement", // Valeur par défaut
      assetId: "asset-" + item.id, // Générer un ID basé sur l'ID de la transaction
      assetName: "Actif", // Valeur par défaut
      description: "Transaction", // Valeur par défaut
      portfolioType: 'investment' as const
    }));
    
    // Actifs
    const assetOps = getAssets().map((item) => ({
      id: item.id,
      type: 'transaction' as const,
      amount: item.currentValue || 0,
      date: item.lastValuationDate,
      status: 'completed' as const,
      portfolioId: item.portfolioId,
      portfolioName: item.portfolioName,
      clientName: 'Clients multiples',
      assetId: item.id,
      assetName: item.name,
      description: `Actif - ${item.name}`,
      portfolioType: 'investment' as const
    }));
    
    // Souscriptions
    const subscriptionOps = getSubscriptions().map((item) => ({
      id: item.id,
      type: (item.type === 'subscription' ? 'subscription' : 'redemption') as 'subscription' | 'redemption',
      amount: item.amount,
      date: item.date,
      status: mapStatus(item.status),
      portfolioId: item.portfolioId,
      portfolioName: item.portfolioName,
      clientName: item.clientName,
      assetId: item.assetId,
      assetName: item.assetName,
      description: item.type === 'subscription' ? `Souscription - ${item.units} unités` : `Rachat - ${item.units} unités`,
      portfolioType: 'investment' as const
    }));
    
    // Valorisations
    const valuationOps = getValuations().map((item) => ({
      id: item.id,
      type: 'valuation' as const,
      amount: item.value,
      date: item.date,
      status: 'completed' as const,
      portfolioId: item.portfolioId,
      portfolioName: item.portfolioName,
      clientName: 'Valorisation système',
      assetId: item.assetId,
      assetName: item.assetName,
      description: `Valorisation - ${(item.change) > 0 ? '+' : ''}${item.change}%`,
      portfolioType: 'investment' as const
    }));
    
    operations = [...operations, ...investmentTransactionOps, ...assetOps, ...subscriptionOps, ...valuationOps];
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

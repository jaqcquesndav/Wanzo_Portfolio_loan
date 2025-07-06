import type { OperationType, OperationStep } from '../../../types/operations';

// Étapes pour les crédits
const CREDIT_STEPS: OperationStep[] = [
  {
    id: 'submission',
    label: 'Soumission',
    status: 'pending',
    description: 'Dépôt de la demande de crédit'
  },
  {
    id: 'document_review',
    label: 'Revue documentaire',
    status: 'pending',
    description: 'Vérification des documents fournis'
  },
  {
    id: 'credit_analysis',
    label: 'Analyse crédit',
    status: 'pending',
    requiresToken: true,
    description: 'Évaluation de la solvabilité'
  },
  {
    id: 'risk_assessment',
    label: 'Évaluation des risques',
    status: 'pending',
    description: 'Analyse des risques'
  },
  {
    id: 'committee_approval',
    label: 'Comité de crédit',
    status: 'pending',
    requiresToken: true,
    description: 'Validation par le comité'
  },
  {
    id: 'disbursement',
    label: 'Décaissement',
    status: 'pending',
    requiresToken: true,
    description: 'Mise à disposition des fonds'
  },
  {
    id: 'monitoring',
    label: 'Suivi',
    status: 'pending',
    description: 'Suivi des remboursements'
  },
  {
    id: 'repayment',
    label: 'Remboursement',
    status: 'pending',
    description: 'Gestion des échéances'
  },
  {
    id: 'closure',
    label: 'Clôture',
    status: 'pending',
    requiresToken: true,
    description: 'Clôture du crédit'
  }
];

// Étapes pour le leasing
const LEASING_STEPS: OperationStep[] = [
  {
    id: 'request',
    label: 'Demande',
    status: 'pending',
    description: 'Demande de leasing'
  },
  {
    id: 'equipment_selection',
    label: 'Sélection équipement',
    status: 'pending',
    description: 'Choix de l\'équipement'
  },
  {
    id: 'supplier_validation',
    label: 'Validation fournisseur',
    status: 'pending',
    requiresToken: true,
    description: 'Vérification du fournisseur'
  },
  {
    id: 'financial_analysis',
    label: 'Analyse financière',
    status: 'pending',
    description: 'Évaluation financière'
  },
  {
    id: 'contract_approval',
    label: 'Approbation contrat',
    status: 'pending',
    requiresToken: true,
    description: 'Validation du contrat'
  },
  {
    id: 'equipment_delivery',
    label: 'Livraison',
    status: 'pending',
    description: 'Livraison de l\'équipement'
  },
  {
    id: 'payment_monitoring',
    label: 'Suivi paiements',
    status: 'pending',
    description: 'Suivi des loyers'
  },
  {
    id: 'maintenance',
    label: 'Maintenance',
    status: 'pending',
    description: 'Suivi maintenance'
  },
  {
    id: 'end_contract',
    label: 'Fin de contrat',
    status: 'pending',
    requiresToken: true,
    description: 'Gestion fin de contrat'
  },
  {
    id: 'transfer_ownership',
    label: 'Transfert propriété',
    status: 'pending',
    requiresToken: true,
    description: 'Option d\'achat ou restitution'
  }
];

// Étapes pour l'investissement
const INVESTMENT_STEPS: OperationStep[] = [
  {
    id: 'initial_contact',
    label: 'Contact initial',
    status: 'pending',
    description: 'Premier contact avec l\'entreprise'
  },
  {
    id: 'preliminary_review',
    label: 'Revue préliminaire',
    status: 'pending',
    description: 'Analyse préliminaire'
  },
  {
    id: 'due_diligence',
    label: 'Due Diligence',
    status: 'pending',
    requiresToken: true,
    description: 'Audit complet'
  },
  {
    id: 'valuation',
    label: 'Valorisation',
    status: 'pending',
    description: 'Évaluation de l\'entreprise'
  },
  {
    id: 'investment_committee',
    label: 'Comité d\'investissement',
    status: 'pending',
    requiresToken: true,
    description: 'Validation du comité'
  },
  {
    id: 'term_sheet',
    label: 'Term Sheet',
    status: 'pending',
    description: 'Négociation des termes'
  },
  {
    id: 'legal_documentation',
    label: 'Documentation légale',
    status: 'pending',
    description: 'Préparation des documents'
  },
  {
    id: 'closing',
    label: 'Closing',
    status: 'pending',
    requiresToken: true,
    description: 'Finalisation de l\'investissement'
  },
  {
    id: 'portfolio_monitoring',
    label: 'Suivi portefeuille',
    status: 'pending',
    description: 'Suivi de la participation'
  },
  {
    id: 'board_participation',
    label: 'Participation CA',
    status: 'pending',
    description: 'Participation au conseil'
  },
  {
    id: 'exit_preparation',
    label: 'Préparation sortie',
    status: 'pending',
    description: 'Planification de la sortie'
  },
  {
    id: 'exit_execution',
    label: 'Exécution sortie',
    status: 'pending',
    requiresToken: true,
    description: 'Réalisation de la sortie'
  }
];

export const getOperationSteps = (type: OperationType): OperationStep[] => {
  switch (type) {
    case 'credit':
      return CREDIT_STEPS;
    case 'leasing':
      return LEASING_STEPS;
    case 'investment':
    case 'equity':
      return INVESTMENT_STEPS;
    default:
      return CREDIT_STEPS;
  }
};
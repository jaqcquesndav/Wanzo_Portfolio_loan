// Types et interfaces pour le module de crédit
export type GuaranteeType = {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt?: string;
};

export type GuaranteeAccount = {
  id: string;
  guaranteeTypeId: string;
  currency: string;
  accountNumber: string;
  createdAt: string;
  updatedAt?: string;
};

export type PhysicalGuarantor = {
  id: string;
  firstName: string;
  lastName: string;
  idType: 'passport' | 'nationalId' | 'drivingLicense' | 'other';
  idNumber: string;
  gender: 'male' | 'female' | 'other';
  profession: string;
  employer?: string;
  address: string;
  photoUrl?: string;
  signatureUrl?: string;
  createdAt: string;
  updatedAt?: string;
};

export type LegalGuarantor = {
  id: string;
  name: string;
  registrationNumber: string;
  registrationDate: string;
  address: string;
  createdAt: string;
  updatedAt?: string;
};

export type Guarantor = PhysicalGuarantor | LegalGuarantor;

export type Guarantee = {
  id: string;
  creditRequestId: string;
  guarantorId: string;
  guaranteeTypeId: string;
  ownerName: string;
  value: number;
  currency: string;
  description: string;
  depositDate?: string;
  depositorName?: string;
  journalId?: string;
  withdrawalDate?: string;
  recipientName?: string;
  withdrawalJournalId?: string;
  status: 'pending' | 'deposited' | 'withdrawn' | 'released';
  createdAt: string;
  updatedAt?: string;
};

/**
 * Document attaché à une demande de crédit
 */
export type CreditDocument = {
  id: string;
  name: string;
  type: 'business_plan' | 'financial_statements' | 'identity_document' | 'proof_of_address' | 'tax_certificate' | 'bank_statements' | 'project_file' | 'guarantee_document' | 'other';
  url: string;
  size?: number; // Taille en bytes
  mimeType?: string; // Type MIME (application/pdf, image/jpeg, etc.)
  uploadedBy?: string; // ID de l'utilisateur qui a uploadé
  uploadedAt: string; // Date d'upload (ISO 8601)
  description?: string;
};

export type CreditRequestStatus = 
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'pending'
  | 'analysis'
  | 'approved'
  | 'rejected'
  | 'canceled'
  | 'disbursed'
  | 'active'
  | 'closed'
  | 'defaulted'
  | 'restructured'
  | 'consolidated'
  | 'in_litigation';

export type CreditPeriodicity = 
  | 'daily'
  | 'weekly'
  | 'biweekly'
  | 'monthly'
  | 'quarterly'
  | 'semiannual'
  | 'annual';

/**
 * Métadonnées de synchronisation avec gestion-commerciale
 */
export type CreditRequestMetadata = {
  sourceRequestId?: string;            // ID de la demande source (gestion commerciale)
  syncedFrom?: string;                 // Service source (ex: 'gestion_commerciale')
  businessInformation?: any;           // Informations commerciales
  financialInformation?: any;          // Informations financières
  creditScore?: any;                   // Score de crédit
  firstSyncAt?: string;                // Date de première synchronisation (ISO 8601)
  lastSyncAt?: string;                 // Date de dernière synchronisation (ISO 8601)
};

// Type d'échéancier/amortissement (3 valeurs - conformes documentation)
export type ScheduleType = 
  | 'constant'     // Échéances constantes (amortissement linéaire)
  | 'degressive'   // Échéances dégressives
  | 'progressive'; // Échéances progressives

export type CreditRequest = {
  id: string;
  memberId: string;
  productId: string;
  receptionDate: string;
  requestAmount: number;
  currency: string; // Code devise ISO 4217 (CDF, USD, XOF, EUR, XAF)
  periodicity: CreditPeriodicity;
  interestRate: number;
  reason: string;
  scheduleType: ScheduleType;
  schedulesCount: number;
  deferredPaymentsCount: number;
  gracePeriod?: number;
  financingPurpose: string;
  creditManagerId: string;
  status: CreditRequestStatus;
  isGroup: boolean;
  groupId?: string;
  distributions?: CreditDistribution[];
  documents?: CreditDocument[]; // Documents et pièces jointes associés à la demande
  rejectionReason?: string;
  portfolioId?: string; // ID du portefeuille associé - AJOUTÉ pour conformité
  metadata?: CreditRequestMetadata; // Métadonnées pour synchronisation avec gestion-commerciale - Structure complète conforme
  createdAt: string;
  updatedAt?: string;
};

export type CreditDistribution = {
  id: string;
  creditRequestId: string;
  memberId: string;
  amount: number;
  createdAt: string;
};

export type Endorser = {
  id: string;
  creditRequestId: string;
  memberId: string;
  accountNumber: string;
  guaranteeAmount: number;
  createdAt: string;
};

export type CreditAnalysis = {
  id: string;
  creditRequestId: string;
  financialData: {
    income: number;
    expenses: number;
    existingDebts: number;
    assets: number;
  };
  creditAssessment: {
    debtToIncomeRatio: number;
    creditScore: number;
    repaymentCapacity: number;
    riskLevel: 'low' | 'medium' | 'high';
  };
  recommendation: 'approve' | 'reject' | 'pending';
  comments: string;
  analyzedBy: string;
  analyzedAt: string;
  createdAt: string;
  updatedAt?: string;
};

export type CreditDisbursement = {
  id: string;
  creditRequestId: string;
  portfolioId?: string;
  amount: number;
  currency?: string;
  disbursementDate: string;
  disbursedBy: string;
  isBatchDisbursement: boolean;
  batchId?: string;
  isDrawdown: boolean;
  drawdownAmount?: number;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  
  // Méthode de paiement
  paymentMethod: 'bank_transfer' | 'mobile_money' | 'check' | 'cash';
  
  // Compte source (compte du portefeuille)
  sourceAccount: {
    accountType: 'bank' | 'mobile_money';
    accountId: string;
    accountNumber?: string;
    accountName?: string;
    bankName?: string;
    provider?: string;
    phoneNumber?: string;
    balanceBefore?: number;
    balanceAfter?: number;
  };
  
  // Compte destination (bénéficiaire)
  destinationAccount: {
    accountType: 'bank' | 'mobile_money';
    accountNumber?: string;
    accountName?: string;
    bankName?: string;
    provider?: string;
    phoneNumber?: string;
    companyName?: string;
  };
  
  // Références
  externalReference?: string;
  transactionId?: string;
  
  // Ancien champ pour compatibilité
  accountNumber?: string;
  
  createdAt: string;
  updatedAt?: string;
};

export type AmortizationSchedule = {
  id: string;
  creditRequestId: string;
  schedules: AmortizationScheduleItem[];
  totalInterest: number;
  totalPrincipal: number;
  totalAmount: number;
  generatedAt: string;
  modifiedAt?: string;
  isManual: boolean;
  isRescheduled: boolean;
  isPostponed: boolean;
  rescheduledFrom?: string;
  postponedFrom?: string;
  createdAt: string;
  updatedAt?: string;
};

export type AmortizationScheduleItem = {
  id: string;
  scheduleId: string;
  paymentNumber: number;
  dueDate: string;
  principal: number;
  interest: number;
  totalAmount: number;
  remainingPrincipal: number;
  status: 'pending' | 'paid' | 'partial' | 'late' | 'defaulted';
  actualPaymentDate?: string;
  actualPaymentAmount?: number;
  createdAt: string;
  updatedAt?: string;
};

export type CreditFee = {
  id: string;
  creditRequestId: string;
  portfolioId?: string;
  feeType: 'application' | 'processing' | 'disbursement' | 'insurance' | 'administration' | 'custom';
  customName?: string;
  amount: number;
  currency?: string;
  paymentMethod: 'cash' | 'bank_transfer' | 'mobile_money' | 'deduction';
  
  // Traçabilité du compte
  accountType?: 'bank' | 'mobile_money';
  accountId?: string;
  accountNumber?: string;
  
  // Détails du compte de paiement
  paymentAccount?: {
    accountType: 'bank' | 'mobile_money';
    accountId?: string;
    accountNumber?: string;
    accountName?: string;
    bankName?: string;
    provider?: string;
    phoneNumber?: string;
  };
  
  isPaid: boolean;
  paidAmount?: number;
  paidDate?: string;
  externalReference?: string;
  createdAt: string;
  updatedAt?: string;
};

export type CreditRepayment = {
  id: string;
  creditId: string;
  portfolioId?: string;
  amount: number;
  currency?: string;
  principalAmount: number;
  interestAmount: number;
  penaltyAmount: number;
  savingsAmount: number;
  commissionAmount: number;
  paymentDate: string;
  paymentMethod: 'cash' | 'bank_transfer' | 'mobile_money' | 'check' | 'guarantee';
  
  // Traçabilité du compte
  accountType?: 'bank' | 'mobile_money';
  accountId?: string; // ID du BankAccount ou MobileMoneyAccount
  
  // Détails du compte source (payeur)
  sourceAccount?: {
    accountType: 'bank' | 'mobile_money';
    accountNumber?: string;
    accountName?: string;
    bankName?: string;
    provider?: string;
    phoneNumber?: string;
    companyName?: string;
  };
  
  // Détails du compte destination (portefeuille)
  destinationAccount?: {
    accountType: 'bank' | 'mobile_money';
    accountId: string;
    accountNumber?: string;
    accountName?: string;
    bankName?: string;
    provider?: string;
    phoneNumber?: string;
    balanceBefore?: number;
    balanceAfter?: number;
  };
  
  // Références
  externalReference?: string;
  transactionId?: string;
  
  isEarlyRepayment: boolean;
  isBatchRepayment: boolean;
  batchId?: string;
  createdAt: string;
  updatedAt?: string;
};

export type CreditTreatment = {
  id: string;
  creditId: string;
  treatmentType: 'distress_transfer' | 'loss_transfer' | 'downgrade' | 'exit';
  previousStatus: CreditRequestStatus;
  newStatus: CreditRequestStatus;
  delayBracket?: string;
  treatmentDate: string;
  treatedBy: string;
  isBatchTreatment: boolean;
  batchId?: string;
  reason: string;
  createdAt: string;
  updatedAt?: string;
};

export type CreditLitigation = {
  id: string;
  creditId: string;
  transferDate: string;
  transferredBy: string;
  isBatchTransfer: boolean;
  batchId?: string;
  commitments: CreditLitigationCommitment[];
  status: 'open' | 'closed' | 'recovered';
  closureDate?: string;
  closedBy?: string;
  createdAt: string;
  updatedAt?: string;
};

export type CreditLitigationCommitment = {
  id: string;
  litigationId: string;
  commitmentDate: string;
  commitmentAmount: number;
  actualPaymentDate?: string;
  actualPaymentAmount?: number;
  status: 'pending' | 'fulfilled' | 'partial' | 'failed';
  notes: string;
  createdAt: string;
  updatedAt?: string;
};

export type CreditAccounting = {
  id: string;
  creditId: string;
  operationType: 'disbursement' | 'repayment' | 'fee' | 'penalty' | 'writeoff' | 'cancellation';
  operationId: string;
  journalId: string;
  accountingDate: string;
  amount: number;
  isProcessed: boolean;
  processedDate?: string;
  processedBy?: string;
  createdAt: string;
  updatedAt?: string;
};

export type CreditCancellation = {
  id: string;
  creditId: string;
  cancellationType: 'approval' | 'disbursement' | 'operation';
  operationId?: string;
  reason: string;
  cancelledBy: string;
  cancellationDate: string;
  isAccounted: boolean;
  accountingId?: string;
  createdAt: string;
  updatedAt?: string;
};

export type CreditReportType =
  | 'credit_statement'
  | 'request_form'
  | 'follow_up_form'
  | 'contract'
  | 'custom_contract'
  | 'requests_list'
  | 'approved_credits_list'
  | 'disbursed_credits_list'
  | 'minutes'
  | 'outstanding_credits'
  | 'portfolio_accounting_gap'
  | 'justificative_statement'
  | 'important_debtors'
  | 'downgrade_list'
  | 'repayment_record'
  | 'global_credits_situation'
  | 'repaid_credits_summary'
  | 'batch_repayments_situation'
  | 'global_repayments_situation'
  | 'monthly_payment_balance'
  | 'interest_situation'
  | 'penalty_situation'
  | 'unpaid_situation'
  | 'credit_synthesis_situation'
  | 'monthly_repayments_situation'
  | 'downgraded_credits_situation'
  | 'credit_evolution'
  | 'loss_recoveries'
  | 'credit_history'
  | 'reminder_letter'
  | 'repayment_planning'
  | 'maturity_schedule'
  | 'attached_debt'
  | 'detailed_aged_balance'
  | 'analytical_aged_balance'
  | 'late_credits'
  | 'stratification_statement'
  | 'portfolio_summary'
  | 'monthly_savers_indicator'
  | 'monthly_borrowers_indicator'
  | 'credit_by_sector'
  | 'recovery_situation'
  | 'remaining_schedule_situation'
  | 'risk_provision_situation'
  | 'ongoing_credits_situation'
  | 'activity_sector_codification'
  | 'member_type_codification'
  | 'collection_form'
  | 'financing_purpose_concordance';

export type CreditReport = {
  id: string;
  reportType: CreditReportType;
  parameters: Record<string, unknown>;
  generatedBy: string;
  generatedAt: string;
  fileUrl?: string;
  createdAt: string;
};

// Note: CreditContract interface has been moved to src/types/credit-contract.ts
// to avoid conflicts and provide a unified interface

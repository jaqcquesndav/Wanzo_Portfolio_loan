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

export type CreditRequest = {
  id: string;
  memberId: string;
  productId: string;
  receptionDate: string;
  requestAmount: number;
  periodicity: CreditPeriodicity;
  interestRate: number;
  reason: string;
  scheduleType: 'constant' | 'degressive';
  schedulesCount: number;
  deferredPaymentsCount: number;
  gracePeriod?: number;
  financingPurpose: string;
  creditManagerId: string;
  status: CreditRequestStatus;
  isGroup: boolean;
  groupId?: string;
  distributions?: CreditDistribution[];
  rejectionReason?: string;
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
  accountNumber: string;
  amount: number;
  disbursementDate: string;
  disbursedBy: string;
  isBatchDisbursement: boolean;
  batchId?: string;
  isDrawdown: boolean;
  drawdownAmount?: number;
  status: 'pending' | 'completed' | 'cancelled';
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
  feeType: 'application' | 'processing' | 'disbursement' | 'insurance' | 'administration' | 'custom';
  customName?: string;
  amount: number;
  paymentMethod: 'cash' | 'transfer' | 'deduction';
  accountNumber?: string;
  isPaid: boolean;
  paidAmount?: number;
  paidDate?: string;
  createdAt: string;
  updatedAt?: string;
};

export type CreditRepayment = {
  id: string;
  creditId: string;
  amount: number;
  principalAmount: number;
  interestAmount: number;
  penaltyAmount: number;
  savingsAmount: number;
  commissionAmount: number;
  paymentDate: string;
  paymentMethod: 'cash' | 'transfer' | 'guarantee';
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

// Type complet pour les contrats de crédit
export type CreditContract = {
  id: string;
  reference: string;
  creditRequestId: string;
  memberId: string;
  memberName: string;
  productId: string;
  productName: string;
  portfolioId: string;
  amount: number;
  disbursedAmount: number;
  remainingAmount: number;
  interestRate: number;
  startDate: string;
  endDate: string;
  lastPaymentDate?: string;
  nextPaymentDate?: string;
  status: 'active' | 'closed' | 'defaulted' | 'suspended' | 'in_litigation';
  delinquencyDays: number;
  riskClass: 'standard' | 'watch' | 'substandard' | 'doubtful' | 'loss';
  guaranteesTotalValue: number;
  guaranteeId?: string; // ID de la garantie principale associée au contrat
  scheduleId: string;
  documentUrl?: string;
  consolidatedFrom?: string[];
  isConsolidated: boolean;
  consolidatedTo?: string;
  duration?: number; // Durée du crédit en mois
  gracePeriod?: number; // Période de grâce en mois
  amortization_method?: 'linear' | 'degressive' | 'progressive' | 'balloon'; // Méthode d'amortissement du crédit
  createdAt: string;
  updatedAt?: string;
  lastUpdated?: string; // Dernière mise à jour du contrat
};

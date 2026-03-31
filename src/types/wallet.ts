// src/types/wallet.ts
// Types alignés sur les réponses réelles de l'API wallet/README.md (Janvier 2026)

export type WalletStatus = 'active' | 'suspended' | 'frozen' | 'closed';

export type WalletTransactionType =
  | 'credit_disbursement'
  | 'credit_repayment'
  | 'deposit'
  | 'withdrawal'
  | 'fee'
  | 'internal_transfer'
  | 'refund'
  | 'settlement'
  | 'reversal'      // kept for backward-compat with stored data
  | 'adjustment';   // kept for backward-compat with stored data

export type WalletTransactionStatus =
  | 'completed'
  | 'pending'
  | 'pending_approval'
  | 'approved'
  | 'processing'
  | 'failed'
  | 'rejected'
  | 'canceled'
  | 'cancelled'   // alias backend (double-l)
  | 'frozen'
  | 'refunded'
  | 'expired';

export type MobileMoneyTelecom = 'AM' | 'OM' | 'MP' | 'AF';

// ─── Wallet institution ───────────────────────────────────────────────────────
// Conforme à GET /wallet/my-wallet

export interface WalletLimits {
  dailyLimit: number;
  monthlyLimit: number;
  singleTransactionLimit: number;
  minimumBalance: number;
}

export interface WalletKyc {
  verified: boolean;
  level: string;
}

export interface InstitutionWallet {
  id: string;
  reference: string;
  ownerType: string;        // "portfolio"
  ownerId: string;          // portfolioId résolu depuis le JWT
  ownerName: string;
  currency: string;
  balance: number;
  availableBalance: number;
  frozenBalance: number;    // anciennement pendingBalance
  status: WalletStatus;
  limits?: WalletLimits;
  kyc?: WalletKyc;
  suspendedBy?: string;
  suspendedReason?: string;
  suspendedAt?: string;
  createdAt: string;
  updatedAt?: string;
}

// ─── Solde ─────────────────────────────────────────────────────────────────
// Conforme à GET /wallet/balance
// Réponse réelle: { totalBalance, availableBalance, frozenBalance, currency, wallets? }

export interface WalletBalance {
  totalBalance: number;
  availableBalance: number;
  frozenBalance: number;
  currency: string;
  wallets?: InstitutionWallet[];
}

// ─── Dashboard ─────────────────────────────────────────────────────────────
// Conforme à GET /wallet/dashboard
// Réponse réelle: { pendingApproval, frozenTransactions, todayCompletedCount, todayVolume[] }

export interface WalletDashboardVolumeEntry {
  currency: string;
  volume: string | number;
}

export interface WalletDashboard {
  pendingApproval:    number;
  frozenTransactions: number;
  todayCompletedCount: number;
  todayVolume:        WalletDashboardVolumeEntry[];
}

// ─── Transaction ────────────────────────────────────────────────────────────
// Conforme à GET /wallet/transactions/list

export interface WalletTransaction {
  id: string;
  reference: string;
  type: WalletTransactionType;
  status: WalletTransactionStatus;
  sourceWalletId: string;
  destinationWalletId?: string;
  amount: number;
  fees?: number;
  netAmount?: number;
  currency: string;
  contractId?: string;
  companyId?: string;
  creditRequestId?: string;
  disbursementId?: string;
  repaymentId?: string;
  description?: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
  createdAt: string;
  completedAt?: string;
  updatedAt?: string;
}

export interface WalletTransactionListMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface WalletTransactionListResponse {
  data: WalletTransaction[];
  meta: WalletTransactionListMeta;
}

// ─── Filtres ────────────────────────────────────────────────────────────────

export interface WalletTransactionFilters {
  walletId?: string;
  type?: WalletTransactionType;
  status?: WalletTransactionStatus;
  page?: number;
  limit?: number;
}

// ─── Payloads ───────────────────────────────────────────────────────────────

export interface WalletDepositPayload {
  amount: number;
  clientPhone: string;
  telecom: MobileMoneyTelecom;
  currency?: string;
  description?: string;
}

export interface WalletWithdrawalPayload {
  amount: number;
  clientPhone: string;
  telecom: MobileMoneyTelecom;
  currency?: string;
  description?: string;
}

export interface WalletApproveTransactionPayload {
  notes?: string;
}

export interface WalletRejectTransactionPayload {
  reason: string;
}

export interface WalletStatusUpdatePayload {
  status: WalletStatus;
  reason: string; // REQUIS côté backend (@IsNotEmpty())
}

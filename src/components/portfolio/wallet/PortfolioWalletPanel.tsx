// src/components/portfolio/wallet/PortfolioWalletPanel.tsx
import React, { useState, useEffect } from 'react';
import {
  Wallet,
  ArrowDownCircle,
  ArrowUpCircle,
  CheckCircle,
  XCircle,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Clock,
  AlertCircle,
  CreditCard,
  Banknote,
  ArrowRightLeft,
  RotateCcw,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import { Input } from '../../ui/Input';
import { Label } from '../../ui/Label';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../../ui/Table';
import { useWallet } from '../../../hooks/useWallet';
import { useCurrencyContext } from '../../../hooks/useCurrencyContext';
import type {
  WalletTransaction,
  WalletTransactionType,
  WalletTransactionStatus,
  WalletDepositPayload,
  WalletWithdrawalPayload,
  MobileMoneyTelecom,
} from '../../../types/wallet';

// ─── helpers ────────────────────────────────────────────────────────────────────

const TX_TYPE_LABELS: Record<WalletTransactionType, string> = {
  credit_disbursement: 'Décaissement',
  credit_repayment:    'Remboursement',
  deposit:             'Dépôt',
  withdrawal:          'Retrait',
  fee:                 'Frais',
  internal_transfer:   'Transfert interne',
  refund:              'Remboursement',
  settlement:          'Règlement',
  reversal:            'Annulation',
  adjustment:          'Ajustement',
};

const TX_TYPE_ICONS: Record<WalletTransactionType, React.ReactNode> = {
  credit_disbursement: <ArrowUpCircle   className="h-4 w-4 text-red-500"    />,
  credit_repayment:    <ArrowDownCircle className="h-4 w-4 text-green-500"  />,
  deposit:             <ArrowDownCircle className="h-4 w-4 text-green-500"  />,
  withdrawal:          <ArrowUpCircle   className="h-4 w-4 text-orange-500" />,
  fee:                 <CreditCard      className="h-4 w-4 text-red-400"    />,
  internal_transfer:   <ArrowRightLeft  className="h-4 w-4 text-blue-400"   />,
  refund:              <RotateCcw       className="h-4 w-4 text-green-400"  />,
  settlement:          <CheckCircle     className="h-4 w-4 text-teal-400"   />,
  reversal:            <RotateCcw       className="h-4 w-4 text-gray-400"   />,
  adjustment:          <ArrowRightLeft  className="h-4 w-4 text-gray-400"   />,
};

/** Credit (incoming) types → green; Debit (outgoing) → red/orange */
const TX_AMOUNT_CLS: Record<WalletTransactionType, string> = {
  credit_repayment:    'text-green-600 dark:text-green-400',
  deposit:             'text-green-600 dark:text-green-400',
  reversal:            'text-green-600 dark:text-green-400',
  refund:              'text-green-600 dark:text-green-400',
  settlement:          'text-green-600 dark:text-green-400',
  credit_disbursement: 'text-red-600   dark:text-red-400',
  withdrawal:          'text-orange-600 dark:text-orange-400',
  fee:                 'text-red-500   dark:text-red-400',
  internal_transfer:   'text-blue-600  dark:text-blue-400',
  adjustment:          'text-gray-700  dark:text-gray-300',
};

const TX_STATUS_CONFIG: Record<
  WalletTransactionStatus,
  { label: string; variant: 'success' | 'warning' | 'error' | 'secondary' | 'primary' | 'danger' }
> = {
  completed:        { label: 'Complétée',          variant: 'success'   },
  pending:          { label: 'En attente',          variant: 'warning'   },
  pending_approval: { label: 'Approbation requise', variant: 'warning'   },
  failed:           { label: 'Échouée',             variant: 'error'     },
  rejected:         { label: 'Rejetée',             variant: 'danger'    },
  canceled:         { label: 'Annulée',             variant: 'secondary' },
};

const WALLET_CURRENCIES = ['CDF', 'USD', 'XOF'] as const;
type WalletCurrency = typeof WALLET_CURRENCIES[number];

const TELECOM_OPTIONS: { value: MobileMoneyTelecom; label: string; color: string }[] = [
  { value: 'OM', label: 'Orange Money',   color: '#FF6600' },
  { value: 'MP', label: 'M-Pesa',         color: '#00A651' },
  { value: 'AM', label: 'Airtel Money',   color: '#E40521' },
  { value: 'AF', label: 'Africell Money', color: '#702082' },
];

// ─── Modal dépôt / retrait ────────────────────────────────────────────────────────

interface MobileMoneyModalProps {
  mode: 'deposit' | 'withdrawal';
  isSubmitting: boolean;
  onConfirm: (payload: WalletDepositPayload | WalletWithdrawalPayload) => Promise<void>;
  onClose: () => void;
  /** Compte Mobile Money par défaut du portefeuille (autofill) */
  defaultPhone?:       string;
  defaultTelecom?:     MobileMoneyTelecom;
  defaultAccountName?: string;
  defaultCurrency?:    string;
}

function MobileMoneyModal({
  mode, isSubmitting, onConfirm, onClose,
  defaultPhone, defaultTelecom, defaultAccountName, defaultCurrency,
}: MobileMoneyModalProps) {
  const [amount, setAmount]           = useState('');
  const [phone, setPhone]             = useState(defaultPhone ?? '');
  const [telecom, setTelecom]         = useState<MobileMoneyTelecom>(defaultTelecom ?? 'OM');
  const [description, setDescription] = useState('');
  const [currency, setCurrency]       = useState<WalletCurrency>(
    (WALLET_CURRENCIES as readonly string[]).includes(defaultCurrency ?? '') ? (defaultCurrency as WalletCurrency) : 'CDF'
  );

  const isDeposit = mode === 'deposit';

  const headerBg  = isDeposit
    ? 'bg-gradient-to-r from-green-600 to-emerald-500'
    : 'bg-gradient-to-r from-orange-500 to-amber-500';
  const headerIcon = isDeposit
    ? <ArrowDownCircle className="h-7 w-7 text-white" />
    : <ArrowUpCircle   className="h-7 w-7 text-white" />;
  const title = isDeposit ? 'Dépôt Mobile Money' : 'Retrait Mobile Money';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm({
      amount: Number(amount),
      clientPhone: phone,
      telecom,
      currency,
      description: description || undefined,
    });
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      role="dialog" aria-modal="true" aria-label={title}
    >
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* ── header coloré ── */}
        <div className={`${headerBg} px-6 py-5 flex items-center gap-3`}>
          <div className="bg-white/20 rounded-full p-2">{headerIcon}</div>
          <div>
            <h2 className="text-lg font-bold text-white">{title}</h2>
            <p className="text-white/80 text-xs mt-0.5">
              {isDeposit ? 'Créditez votre wallet via Mobile Money' : 'Retirez des fonds vers Mobile Money'}
            </p>
          </div>
        </div>

        {/* ── formulaire ── */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* devise */}
          <div>
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Devise</Label>
            <div className="mt-1.5 grid grid-cols-3 gap-2">
              {WALLET_CURRENCIES.map((cur) => (
                <button
                  key={cur}
                  type="button"
                  onClick={() => setCurrency(cur)}
                  className={`rounded-lg border-2 py-2 text-sm font-bold transition-all ${
                    currency === cur
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 shadow-sm'
                      : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                >
                  {cur}
                </button>
              ))}
            </div>
          </div>

          {/* montant */}
          <div>
            {defaultAccountName && (
              <div className="flex items-center gap-2 rounded-xl bg-[#e6f3f8] dark:bg-[#197ca8]/20 border border-[#197ca8]/30 px-3 py-2">
                <span className="text-xs font-medium text-[#197ca8] dark:text-[#1e90c3]">
                  Compte par défaut :
                </span>
                <span className="text-xs text-gray-700 dark:text-gray-300 font-semibold">
                  {defaultAccountName}
                </span>
              </div>
            )}

            <Label htmlFor="wallet-amount" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Montant <span className="text-gray-400 font-normal">({currency})</span>
            </Label>
            <div className="relative mt-1.5">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium text-sm select-none">
                {currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'XOF' ? 'CFA' : 'FC'}
              </span>
              <Input
                id="wallet-amount"
                type="number"
                min={1}
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="5 000 000"
                className="pl-10 font-mono text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {/* opérateur */}
          <div>
            <Label htmlFor="wallet-telecom" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Opérateur Mobile Money
            </Label>
            <div className="mt-1.5 grid grid-cols-4 gap-2">
              {TELECOM_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setTelecom(opt.value)}
                  className={`rounded-lg border-2 px-2 py-2.5 text-xs font-semibold transition-all ${
                    telecom === opt.value
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 shadow-sm'
                      : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-gray-300'
                  }`}
                >
                  {opt.label.split(' ')[0]}
                  <br />
                  <span className="font-normal opacity-70">{opt.label.split(' ')[1] ?? ''}</span>
                </button>
              ))}
            </div>
          </div>

          {/* téléphone */}
          <div>
            <Label htmlFor="wallet-phone" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Numéro de téléphone
            </Label>
            <Input
              id="wallet-phone"
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+243 8XX XXX XXX"
              className="mt-1.5"
            />
          </div>

          {/* description */}
          <div>
            <Label htmlFor="wallet-desc" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Description <span className="text-gray-400 font-normal">(optionnelle)</span>
            </Label>
            <Input
              id="wallet-desc"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex : Approvisionnement capital de prêt"
              className="mt-1.5"
            />
          </div>

          {/* actions */}
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting} className="flex-1">
              Annuler
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting || !amount || !phone}
              isLoading={isSubmitting}
              className={`flex-1 ${isDeposit ? 'bg-green-600 hover:bg-green-700' : 'bg-orange-500 hover:bg-orange-600'} text-white border-0`}
            >
              {isDeposit ? 'Confirmer le dépôt' : 'Confirmer le retrait'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Modal rejet ──────────────────────────────────────────────────────────────────

interface RejectModalProps {
  isSubmitting: boolean;
  onConfirm: (reason: string) => Promise<void>;
  onClose: () => void;
}

function RejectModal({ isSubmitting, onConfirm, onClose }: RejectModalProps) {
  const [reason, setReason] = useState('');

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      role="dialog" aria-modal="true" aria-label="Rejeter la transaction"
    >
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        {/* header */}
        <div className="bg-gradient-to-r from-red-600 to-rose-500 px-6 py-5 flex items-center gap-3">
          <div className="bg-white/20 rounded-full p-2">
            <XCircle className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Rejeter la transaction</h2>
            <p className="text-white/80 text-xs mt-0.5">Cette action est irréversible</p>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <Label htmlFor="reject-reason" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Motif du rejet <span className="text-red-500">*</span>
            </Label>
            <textarea
              id="reject-reason"
              rows={3}
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Expliquez la raison du rejet..."
              className="mt-1.5 w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2.5 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none transition"
            />
          </div>
          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting} className="flex-1">
              Annuler
            </Button>
            <Button
              type="button"
              variant="danger"
              disabled={!reason.trim() || isSubmitting}
              isLoading={isSubmitting}
              onClick={() => onConfirm(reason)}
              className="flex-1"
            >
              Confirmer le rejet
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Composant principal ────────────────────────────────────────────────────────

/** Helpers: convertit le nom de l'opérateur API en code télécom du modal */
export function providerToTelecom(provider: string): MobileMoneyTelecom {
  const p = provider?.toLowerCase() ?? '';
  if (p.includes('orange'))   return 'OM';
  if (p.includes('mpesa') || p.includes('m-pesa') || p.includes('vodacom')) return 'MP';
  if (p.includes('airtel'))   return 'AM';
  if (p.includes('africell')) return 'AF';
  return 'OM';
}

interface DefaultMobileAccount {
  phone:       string;
  telecom:     MobileMoneyTelecom;
  accountName: string;
  currency:    string;
}

interface PortfolioWalletPanelProps {
  portfolioId: string;
  /** Compte Mobile Money par défaut du portefeuille (lu depuis portfolio.mobile_money_accounts) */
  defaultMobileAccount?: DefaultMobileAccount;
}

export function PortfolioWalletPanel({ portfolioId, defaultMobileAccount }: PortfolioWalletPanelProps) {
  const {
    wallet,
    balance,
    dashboard,
    pendingCount,
    transactions,
    isLoading,
    isLoadingTransactions,
    error,
    fetchTransactions,
    approveTransaction,
    rejectTransaction,
    deposit,
    withdrawal,
    refresh,
  } = useWallet(portfolioId);

  const { formatAmount } = useCurrencyContext();

  const [txTypeFilter,   setTxTypeFilter]   = useState('');
  const [txStatusFilter, setTxStatusFilter] = useState('');
  const [modalMode,      setModalMode]      = useState<'deposit' | 'withdrawal' | null>(null);
  const [rejectTargetId, setRejectTargetId] = useState<string | null>(null);
  const [isSubmitting,   setIsSubmitting]   = useState(false);
  const [currentPage,    setCurrentPage]    = useState(1);
  const [balanceIndex,   setBalanceIndex]   = useState(0);
  const PAGE_SIZE = 20;

  // ── walletId ────────────────────────────────────────────────────────────────────
  const walletId = wallet?.id;

  const applyFilters = (page = 1) => {
    setCurrentPage(page);
    fetchTransactions({
      walletId,
      type:   (txTypeFilter   || undefined) as WalletTransactionType | undefined,
      status: (txStatusFilter || undefined) as WalletTransactionStatus | undefined,
      page,
      limit: PAGE_SIZE,
    });
  };

  const handleResetFilters = () => {
    setTxTypeFilter('');
    setTxStatusFilter('');
    setCurrentPage(1);
    fetchTransactions({ walletId, page: 1, limit: PAGE_SIZE });
  };

  // ── Actions ────────────────────────────────────────────────────────────────────

  const handleMobileMoneyConfirm = async (payload: WalletDepositPayload | WalletWithdrawalPayload) => {
    setIsSubmitting(true);
    try {
      if (modalMode === 'deposit') await deposit(payload as WalletDepositPayload);
      else                          await withdrawal(payload as WalletWithdrawalPayload);
      setModalMode(null);
      refresh();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApprove = async (tx: WalletTransaction) => {
    setIsSubmitting(true);
    try   { await approveTransaction(tx.id); }
    finally { setIsSubmitting(false); }
  };

  const handleReject = async (reason: string) => {
    if (!rejectTargetId) return;
    setIsSubmitting(true);
    try {
      await rejectTransaction(rejectTargetId, reason);
      setRejectTargetId(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Auto-rotate balance currency ────────────────────────────────────────────
  useEffect(() => {
    const summaries = balance?.summary ?? [];
    if (summaries.length <= 1) return;
    const timer = setInterval(
      () => setBalanceIndex(i => (i + 1) % summaries.length),
      4000,
    );
    return () => clearInterval(timer);
  }, [balance]);

  // ── Loading / error states ─────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* skeleton hero */}
        <div className="h-36 bg-gradient-to-r from-blue-600 to-indigo-600 animate-pulse" />
        <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-xl bg-gray-100 dark:bg-gray-700 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error && !wallet) {
    return (
      <div className="rounded-2xl border border-red-100 dark:border-red-900/40 bg-red-50 dark:bg-red-900/20 p-8 text-center">
        <AlertCircle className="h-10 w-10 text-red-400 mx-auto mb-3" />
        <p className="text-red-600 dark:text-red-400 font-medium mb-4">{error}</p>
        <Button variant="outline" size="sm" onClick={refresh}>
          <RefreshCw className="h-4 w-4 mr-2" /> Réessayer
        </Button>
      </div>
    );
  }

  const allSummaries   = balance?.summary ?? [];
  const activeSummary  = allSummaries.length > 0 ? allSummaries[balanceIndex % allSummaries.length] : null;
  const totalBalance   = activeSummary?.totalBalance   ?? wallet?.balance          ?? 0;
  const availBalance   = activeSummary?.totalAvailable ?? wallet?.availableBalance ?? 0;
  const frozenBalance  = activeSummary?.totalFrozen    ?? wallet?.frozenBalance    ?? 0;
  const currency       = activeSummary?.currency       ?? wallet?.currency         ?? 'CDF';

  /** Format a wallet amount in its native currency (no conversion). */
  const formatRawAmount = (amount: number) =>
    new Intl.NumberFormat('fr-FR', {
      maximumFractionDigits: (currency === 'USD' || currency === 'XOF') ? 2 : 0,
    }).format(amount);

  // Désactiver uniquement si le wallet est explicitement suspendu ou clôturé
  const walletActive = !wallet?.status || !['suspended', 'closed', 'blocked'].includes(wallet.status);

  // dashboard stats — alignés sur le vrai format API (pendingApproval, frozenTransactions, todayCompletedCount, todayVolume)
  const completedToday = dashboard?.todayCompletedCount ?? 0;
  const pendingTx      = dashboard?.pendingApproval    ?? 0;
  const frozenTx       = dashboard?.frozenTransactions ?? 0;
  const todayVolume    = (dashboard?.todayVolume ?? []).reduce(
    (acc, v) => acc + parseFloat(String(v.volume ?? 0)),
    0,
  );

  return (
    <div className="space-y-5">

      {/* ══════════════════════════════════════════════
          HERO — Solde principal + actions rapides
      ══════════════════════════════════════════════ */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#156088] via-[#197ca8] to-[#1e90c3] shadow-lg">
        {/* motif décoratif */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full border-[20px] border-white" />
          <div className="absolute bottom-0 left-20 h-28 w-28 rounded-full border-[16px] border-white" />
        </div>

        <div className="relative px-6 pt-6 pb-5">
          {/* header row */}
          <div className="flex items-start justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className="bg-white/20 rounded-xl p-2">
                <Wallet className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-white/70 text-xs uppercase tracking-wider">Portefeuille</p>
                <p className="text-white font-semibold text-sm leading-tight">
                  {wallet?.ownerName ?? 'Wallet Institution'}
                </p>
              </div>
              {wallet?.status && wallet.status !== 'active' && (
                <span className="ml-2 bg-red-500/30 text-red-100 text-xs font-medium px-2.5 py-0.5 rounded-full capitalize">
                  {wallet.status}
                </span>
              )}
            </div>
            <button
              onClick={refresh}
              title="Actualiser"
              className="bg-white/10 hover:bg-white/20 text-white rounded-lg p-2 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>

          {/* solde principal */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-1">
              <p className="text-white/60 text-xs uppercase tracking-wider">Solde total</p>
              {allSummaries.length > 1 && (
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setBalanceIndex(i => (i - 1 + allSummaries.length) % allSummaries.length)}
                    className="bg-white/10 hover:bg-white/25 text-white rounded p-0.5 transition-colors"
                    title="Devise précédente"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </button>
                  <span className="text-white/50 text-xs tabular-nums">
                    {balanceIndex + 1}&thinsp;/&thinsp;{allSummaries.length}
                  </span>
                  <button
                    type="button"
                    onClick={() => setBalanceIndex(i => (i + 1) % allSummaries.length)}
                    className="bg-white/10 hover:bg-white/25 text-white rounded p-0.5 transition-colors"
                    title="Devise suivante"
                  >
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>
            <p className="text-4xl font-bold text-white tracking-tight leading-none">
              {formatRawAmount(totalBalance)}
            </p>
            <p className="text-white/60 text-sm mt-1">{currency}</p>
            {allSummaries.length > 1 && (
              <div className="flex gap-1.5 mt-2">
                {allSummaries.map((s, i) => (
                  <button
                    key={s.currency}
                    type="button"
                    onClick={() => setBalanceIndex(i)}
                    title={s.currency}
                    className={`h-1.5 rounded-full transition-all ${
                      i === balanceIndex ? 'w-5 bg-white' : 'w-1.5 bg-white/40 hover:bg-white/65'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* actions */}
          <div className="flex gap-3">
            <button
              onClick={() => setModalMode('deposit')}
              disabled={!walletActive}
              className="flex-1 flex items-center justify-center gap-2 bg-white text-[#197ca8] font-semibold rounded-xl py-2.5 px-4 text-sm hover:bg-[#e6f3f8] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow"
            >
              <ArrowDownCircle className="h-4 w-4 text-green-600" />
              Dépôt
            </button>
            <button
              onClick={() => setModalMode('withdrawal')}
              disabled={!walletActive}
              className="flex-1 flex items-center justify-center gap-2 bg-white/20 hover:bg-white/30 text-white font-semibold rounded-xl py-2.5 px-4 text-sm active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-white/30"
            >
              <ArrowUpCircle className="h-4 w-4 text-orange-300" />
              Retrait
            </button>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          SOLDES — Disponible / Gelé
      ══════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Disponible */}
        <div className="rounded-2xl border border-green-100 dark:border-green-900/40 bg-green-50 dark:bg-green-900/20 p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="bg-green-100 dark:bg-green-800/50 rounded-lg p-1.5">
              <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
            <p className="text-xs font-medium text-green-700 dark:text-green-400 uppercase tracking-wide">Disponible</p>
          </div>
          <p className="text-2xl font-bold text-green-700 dark:text-green-300">{formatRawAmount(availBalance)}</p>
          <p className="text-xs text-green-600/70 dark:text-green-500 mt-0.5">{currency} · prêt à l'emploi</p>
        </div>

        {/* Gelé / en cours */}
        <div className="rounded-2xl border border-amber-100 dark:border-amber-900/40 bg-amber-50 dark:bg-amber-900/20 p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="bg-amber-100 dark:bg-amber-800/50 rounded-lg p-1.5">
              <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
            <p className="text-xs font-medium text-amber-700 dark:text-amber-400 uppercase tracking-wide">Gelé / En cours</p>
          </div>
          <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">{formatRawAmount(frozenBalance)}</p>
          <p className="text-xs text-amber-600/70 dark:text-amber-500 mt-0.5">{currency} · en attente de validation</p>
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          KPIs — Métriques dashboard
      ══════════════════════════════════════════════ */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            label: 'Complétées aujourd\u2019hui',
            value: String(completedToday),
            icon: <ArrowRightLeft className="h-4 w-4 text-blue-500" />,
            bg: 'bg-blue-50 dark:bg-blue-900/20',
            border: 'border-blue-100 dark:border-blue-900/40',
            text: 'text-blue-700 dark:text-blue-300',
          },
          {
            label: 'Approbation requise',
            value: String(pendingTx),
            icon: <Clock className="h-4 w-4 text-amber-500" />,
            bg: 'bg-amber-50 dark:bg-amber-900/20',
            border: 'border-amber-100 dark:border-amber-900/40',
            text: 'text-amber-700 dark:text-amber-300',
          },
          {
            label: 'Transactions gelées',
            value: String(frozenTx),
            icon: <TrendingDown className="h-4 w-4 text-red-500" />,
            bg: 'bg-red-50 dark:bg-red-900/20',
            border: 'border-red-100 dark:border-red-900/40',
            text: 'text-red-700 dark:text-red-300',
          },
          {
            label: 'Volume du jour',
            value: formatRawAmount(todayVolume),
            icon: <TrendingUp className="h-4 w-4 text-green-500" />,
            bg: 'bg-green-50 dark:bg-green-900/20',
            border: 'border-green-100 dark:border-green-900/40',
            text: 'text-green-700 dark:text-green-300',
          },
        ].map(({ label, value, icon, bg, border, text }) => (
          <div key={label} className={`rounded-xl border ${bg} ${border} p-4`}>
            <div className={`flex items-center gap-1.5 mb-2`}>
              {icon}
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{label}</p>
            </div>
            <p className={`text-lg font-bold ${text} leading-none`}>{value}</p>
          </div>
        ))}
      </div>

      {/* ══════════════════════════════════════════════
          TRANSACTIONS
      ══════════════════════════════════════════════ */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
        {/* toolbar */}
        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 mr-1">
            <Banknote className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">Transactions</span>
            {pendingCount > 0 && (
              <span className="bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 text-xs font-semibold px-2 py-0.5 rounded-full">
                {pendingCount} en attente
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 ml-auto">
            <div className="relative">
              <SlidersHorizontal className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
              <select
                value={txTypeFilter}
                onChange={(e) => setTxTypeFilter(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
              >
                <option value="">Tous les types</option>
                {(Object.keys(TX_TYPE_LABELS) as WalletTransactionType[]).map((t) => (
                  <option key={t} value={t}>{TX_TYPE_LABELS[t]}</option>
                ))}
              </select>
            </div>

            <select
              value={txStatusFilter}
              onChange={(e) => setTxStatusFilter(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
            >
              <option value="">Tous les statuts</option>
              {(Object.keys(TX_STATUS_CONFIG) as WalletTransactionStatus[]).map((s) => (
                <option key={s} value={s}>{TX_STATUS_CONFIG[s].label}</option>
              ))}
            </select>

            <Button
              variant="primary"
              size="sm"
              onClick={() => applyFilters(1)}
            >
              Filtrer
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetFilters}
            >
              Réinitialiser
            </Button>
          </div>
        </div>

        {/* contenu */}
        {isLoadingTransactions ? (
          <div className="py-16 text-center">
            <div className="inline-flex items-center gap-3 text-gray-400">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500" />
              <span className="text-sm">Chargement des transactions…</span>
            </div>
          </div>
        ) : transactions.length === 0 ? (
          <div className="py-16 text-center">
            <div className="mx-auto bg-gray-100 dark:bg-gray-700 rounded-full h-16 w-16 flex items-center justify-center mb-4">
              <Banknote className="h-7 w-7 text-gray-400" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 font-medium">Aucune transaction trouvée</p>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
              Effectuez votre premier dépôt pour commencer
            </p>
            <Button
              variant="primary"
              size="md"
              onClick={() => setModalMode('deposit')}
              disabled={!walletActive}
              className="mt-5"
              icon={<ArrowDownCircle className="h-4 w-4" />}
            >
              Effectuer un dépôt
            </Button>
          </div>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableHeader className="text-xs">Référence</TableHeader>
                <TableHeader className="text-xs">Type</TableHeader>
                <TableHeader className="text-xs">Montant</TableHeader>
                <TableHeader className="text-xs">Statut</TableHeader>
                <TableHeader className="text-xs">Date</TableHeader>
                <TableHeader className="text-xs text-center">Actions</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {transactions.map((tx) => {
                const cfg = TX_STATUS_CONFIG[tx.status] ?? { label: tx.status, variant: 'secondary' as const };
                const isPendingApproval = tx.status === 'pending_approval';
                const amtCls = TX_AMOUNT_CLS[tx.type] ?? 'text-gray-700 dark:text-gray-300';
                const isCredit = ['deposit', 'credit_repayment', 'reversal'].includes(tx.type);
                return (
                  <TableRow key={tx.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    {/* référence */}
                    <TableCell>
                      <span className="font-mono text-xs text-gray-500 dark:text-gray-400">{tx.reference}</span>
                    </TableCell>
                    {/* type */}
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        {TX_TYPE_ICONS[tx.type]}
                        <span className="text-xs text-gray-700 dark:text-gray-300">{TX_TYPE_LABELS[tx.type] ?? tx.type}</span>
                      </div>
                    </TableCell>
                    {/* montant */}
                    <TableCell>
                      <span className={`text-sm font-semibold ${amtCls}`}>
                        {isCredit ? '+' : '-'}&nbsp;{formatAmount(tx.amount)}
                        <span className="text-xs font-normal text-gray-400 ml-1">{tx.currency}</span>
                      </span>
                    </TableCell>
                    {/* statut */}
                    <TableCell>
                      <Badge variant={cfg.variant} className="text-xs whitespace-nowrap">{cfg.label}</Badge>
                    </TableCell>
                    {/* date */}
                    <TableCell>
                      <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                        {new Date(tx.createdAt).toLocaleDateString('fr-FR', {
                          day: '2-digit', month: 'short', year: 'numeric',
                        })}
                        <span className="block text-gray-400">
                          {new Date(tx.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </span>
                    </TableCell>
                    {/* actions */}
                    <TableCell className="text-center">
                      {isPendingApproval ? (
                        <div className="inline-flex items-center gap-2">
                          <button
                            onClick={() => handleApprove(tx)}
                            disabled={isSubmitting}
                            title="Approuver"
                            className="bg-green-50 hover:bg-green-100 dark:bg-green-900/30 dark:hover:bg-green-900/50 text-green-600 disabled:opacity-50 rounded-lg p-1.5 transition-colors"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setRejectTargetId(tx.id)}
                            disabled={isSubmitting}
                            title="Rejeter"
                            className="bg-red-50 hover:bg-red-100 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-500 disabled:opacity-50 rounded-lg p-1.5 transition-colors"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-gray-300 dark:text-gray-600">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}

        {/* pagination */}
        {transactions.length > 0 && (
          <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <span className="text-xs text-gray-400">Page {currentPage}</span>
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage <= 1}
                onClick={() => applyFilters(currentPage - 1)}
                className="flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <ChevronLeft className="h-3.5 w-3.5" /> Précédent
              </button>
              <button
                disabled={transactions.length < PAGE_SIZE}
                onClick={() => applyFilters(currentPage + 1)}
                className="flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Suivant <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Modals ──────────────────────────────────────────────────────────── */}
      {modalMode && (
        <MobileMoneyModal
          mode={modalMode}
          isSubmitting={isSubmitting}
          onConfirm={handleMobileMoneyConfirm}
          onClose={() => setModalMode(null)}
          defaultPhone={defaultMobileAccount?.phone}
          defaultTelecom={defaultMobileAccount?.telecom}
          defaultAccountName={defaultMobileAccount?.accountName}
          defaultCurrency={defaultMobileAccount?.currency ?? wallet?.currency}
        />
      )}
      {rejectTargetId && (
        <RejectModal
          isSubmitting={isSubmitting}
          onConfirm={handleReject}
          onClose={() => setRejectTargetId(null)}
        />
      )}
    </div>
  );
}

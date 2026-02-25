// src/components/portfolio/wallet/PortfolioWalletPanel.tsx
import React, { useState } from 'react';
import {
  Wallet,
  ArrowDownCircle,
  ArrowUpCircle,
  CheckCircle,
  XCircle,
  RefreshCw,
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
  credit_repayment: 'Remboursement',
  deposit: 'Dépôt',
  withdrawal: 'Retrait',
  fee: 'Frais',
  reversal: 'Annulation',
  adjustment: 'Ajustement',
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

const TELECOM_OPTIONS: { value: MobileMoneyTelecom; label: string }[] = [
  { value: 'OM', label: 'Orange Money' },
  { value: 'MP', label: 'M-Pesa' },
  { value: 'AM', label: 'Airtel Money' },
  { value: 'AF', label: 'Africell Money' },
];

// ─── Modal dépôt / retrait ────────────────────────────────────────────────────────

interface MobileMoneyModalProps {
  mode: 'deposit' | 'withdrawal';
  isSubmitting: boolean;
  onConfirm: (payload: WalletDepositPayload | WalletWithdrawalPayload) => Promise<void>;
  onClose: () => void;
}

function MobileMoneyModal({ mode, isSubmitting, onConfirm, onClose }: MobileMoneyModalProps) {
  const [amount, setAmount]           = useState('');
  const [phone, setPhone]             = useState('');
  const [telecom, setTelecom]         = useState<MobileMoneyTelecom>('OM');
  const [description, setDescription] = useState('');

  const isDeposit = mode === 'deposit';
  const title     = isDeposit ? 'Dépôt Mobile Money' : 'Retrait Mobile Money';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm({ amount: Number(amount), clientPhone: phone, telecom, currency: 'CDF', description: description || undefined });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" role="dialog" aria-modal="true" aria-label={title}>
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full mx-4">
        <div className="p-5 border-b dark:border-gray-700">
          <h2 className="text-lg font-semibold">{title}</h2>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <Label htmlFor="wallet-amount">Montant (CDF)</Label>
            <Input id="wallet-amount" type="number" min={1} required value={amount}
              onChange={(e) => setAmount(e.target.value)} placeholder="Ex : 5 000 000" className="mt-1" />
          </div>
          <div>
            <Label htmlFor="wallet-phone">Numéro Mobile Money</Label>
            <Input id="wallet-phone" type="tel" required value={phone}
              onChange={(e) => setPhone(e.target.value)} placeholder="Ex : +243812345678" className="mt-1" />
          </div>
          <div>
            <Label htmlFor="wallet-telecom">Opérateur</Label>
            <select id="wallet-telecom" value={telecom} onChange={(e) => setTelecom(e.target.value as MobileMoneyTelecom)}
              className="mt-1 w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
              {TELECOM_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>
          <div>
            <Label htmlFor="wallet-desc">Description (optionnelle)</Label>
            <Input id="wallet-desc" type="text" value={description}
              onChange={(e) => setDescription(e.target.value)} placeholder="Ex : Approvisionnement capital de prêt" className="mt-1" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>Annuler</Button>
            <Button type="submit" variant="primary" disabled={isSubmitting} isLoading={isSubmitting}>
              {isDeposit ? 'Déposer' : 'Retirer'}
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" role="dialog" aria-modal="true" aria-label="Rejeter la transaction">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-sm w-full mx-4">
        <div className="p-5 border-b dark:border-gray-700">
          <h2 className="text-lg font-semibold">Rejeter la transaction</h2>
        </div>
        <div className="p-5 space-y-3">
          <div>
            <Label htmlFor="reject-reason">Motif du rejet <span className="text-red-500">*</span></Label>
            <textarea
              id="reject-reason"
              rows={3}
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Expliquez la raison du rejet..."
              className="mt-1 w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>Annuler</Button>
            <Button type="button" variant="danger" disabled={!reason.trim() || isSubmitting}
              isLoading={isSubmitting} onClick={() => onConfirm(reason)}>Rejeter</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Composant principal ────────────────────────────────────────────────────────

interface PortfolioWalletPanelProps {
  portfolioId: string;
}

export function PortfolioWalletPanel({ portfolioId }: PortfolioWalletPanelProps) {
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
  const PAGE_SIZE = 20;

  // ── Filters ────────────────────────────────────────────────────────────────────

  // walletId passé explicitement pour isoler les transactions du portefeuille courant
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

  // ── Render ─────────────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
        <p className="mt-2 text-gray-500 text-sm">Chargement du wallet...</p>
      </div>
    );
  }

  if (error && !wallet) {
    return (
      <div className="text-center py-8 text-red-500">
        <p className="mb-3">{error}</p>
        <Button variant="outline" size="sm" onClick={refresh}>Réessayer</Button>
      </div>
    );
  }

  const mainSummary    = balance?.summary?.[0];
  const totalBalance   = mainSummary?.totalBalance    ?? wallet?.balance          ?? 0;
  const availBalance   = mainSummary?.totalAvailable  ?? wallet?.availableBalance ?? 0;
  const frozenBalance  = mainSummary?.totalFrozen     ?? wallet?.frozenBalance    ?? 0;
  const currency       = mainSummary?.currency        ?? wallet?.currency         ?? 'CDF';
  const walletActive   = wallet?.status === 'active' || !wallet;

  return (
    <div className="bg-white dark:bg-gray-800 shadow overflow-hidden">

      {/* ── En-tête ─────────────────────────────────────────────────────────── */}
      <div className="p-4 flex flex-wrap items-center justify-between gap-3 border-b dark:border-gray-700">
        <div className="flex items-center gap-2">
          <Wallet className="h-5 w-5 text-gray-500" />
          <h2 className="text-lg font-medium">{wallet?.ownerName ?? 'Wallet Institution'}</h2>
          {pendingCount > 0 && <Badge variant="warning">{pendingCount} en attente</Badge>}
          {wallet?.status && wallet.status !== 'active' && (
            <Badge variant="danger" className="capitalize">{wallet.status}</Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setModalMode('withdrawal')} disabled={!walletActive}>
            <ArrowUpCircle className="h-4 w-4 mr-1 text-orange-500" />Retrait
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setModalMode('deposit')} disabled={!walletActive}>
            <ArrowDownCircle className="h-4 w-4 mr-1 text-green-600" />Dépôt
          </Button>
          <Button variant="outline" size="sm" onClick={refresh} title="Actualiser">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* ── Soldes ──────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x dark:divide-gray-700 border-b dark:border-gray-700">
        {[
          { label: 'Solde total',  value: totalBalance,  cls: 'text-gray-900 dark:text-white' },
          { label: 'Disponible',   value: availBalance,  cls: 'text-green-700 dark:text-green-400' },
          { label: 'Gelé / cours', value: frozenBalance, cls: 'text-yellow-700 dark:text-yellow-400' },
        ].map(({ label, value, cls }) => (
          <div key={label} className="p-4">
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">{label}</p>
            <p className={`text-xl font-semibold ${cls}`}>
              {formatAmount(value)} <span className="text-sm font-normal text-gray-400">{currency}</span>
            </p>
          </div>
        ))}
      </div>

      {/* ── Métriques dashboard ──────────────────────────────────────────────── */}
      {dashboard && (
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x dark:divide-gray-700 border-b dark:border-gray-700 text-sm">
          {[
            { label: 'Transactions', value: String(dashboard.totalTransactions) },
            { label: 'En attente',   value: String((dashboard.byStatus?.pending ?? 0) + (dashboard.byStatus?.pending_approval ?? 0)) },
            { label: 'Décaissé',     value: `${formatAmount(dashboard.byType?.credit_disbursement?.volume ?? 0)} ${currency}` },
            { label: 'Remboursé',    value: `${formatAmount(dashboard.byType?.credit_repayment?.volume ?? 0)} ${currency}` },
          ].map(({ label, value }) => (
            <div key={label} className="p-3">
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-0.5">{label}</p>
              <p className="font-medium text-gray-800 dark:text-gray-200">{value}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── Filtres ─────────────────────────────────────────────────────────── */}
      <div className="p-4 flex flex-wrap items-center gap-3 border-b dark:border-gray-700">
        <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Transactions</span>
        <select value={txTypeFilter} onChange={(e) => setTxTypeFilter(e.target.value)}
          className="border rounded-md px-2 py-1 text-sm bg-white dark:bg-gray-700 dark:border-gray-600 appearance-none">
          <option value="">Tous les types</option>
          {(Object.keys(TX_TYPE_LABELS) as WalletTransactionType[]).map((t) => (
            <option key={t} value={t}>{TX_TYPE_LABELS[t]}</option>
          ))}
        </select>
        <select value={txStatusFilter} onChange={(e) => setTxStatusFilter(e.target.value)}
          className="border rounded-md px-2 py-1 text-sm bg-white dark:bg-gray-700 dark:border-gray-600 appearance-none">
          <option value="">Tous les statuts</option>
          {(Object.keys(TX_STATUS_CONFIG) as WalletTransactionStatus[]).map((s) => (
            <option key={s} value={s}>{TX_STATUS_CONFIG[s].label}</option>
          ))}
        </select>
        <Button variant="outline" size="sm" onClick={() => applyFilters(1)}>Filtrer</Button>
        <Button variant="ghost"   size="sm" onClick={handleResetFilters}>Réinitialiser</Button>
      </div>

      {/* ── Tableau ────────────────────────────────────────────────────────── */}
      {isLoadingTransactions ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
          <p className="mt-2 text-gray-500 text-sm">Chargement des transactions...</p>
        </div>
      ) : transactions.length === 0 ? (
        <div className="text-center py-10 text-gray-400 dark:text-gray-500">
          <Wallet className="h-10 w-10 mx-auto mb-2 opacity-30" />
          <p className="text-sm">Aucune transaction trouvée</p>
        </div>
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableHeader>Référence</TableHeader>
              <TableHeader>Type</TableHeader>
              <TableHeader>Montant</TableHeader>
              <TableHeader>Statut</TableHeader>
              <TableHeader>Date</TableHeader>
              <TableHeader className="text-center">Actions</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions.map((tx) => {
              const cfg = TX_STATUS_CONFIG[tx.status] ?? { label: tx.status, variant: 'secondary' as const };
              const isPendingApproval = tx.status === 'pending_approval';
              return (
                <TableRow key={tx.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <TableCell className="font-mono text-xs text-gray-500 dark:text-gray-400">{tx.reference}</TableCell>
                  <TableCell className="text-sm">{TX_TYPE_LABELS[tx.type] ?? tx.type}</TableCell>
                  <TableCell className="text-sm font-medium">{formatAmount(tx.amount)} {tx.currency}</TableCell>
                  <TableCell><Badge variant={cfg.variant}>{cfg.label}</Badge></TableCell>
                  <TableCell className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    {new Date(tx.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </TableCell>
                  <TableCell className="text-center">
                    {isPendingApproval ? (
                      <div className="inline-flex items-center gap-2">
                        <button onClick={() => handleApprove(tx)} disabled={isSubmitting} title="Approuver"
                          className="text-green-600 hover:text-green-800 disabled:opacity-50">
                          <CheckCircle className="h-4 w-4" />
                        </button>
                        <button onClick={() => setRejectTargetId(tx.id)} disabled={isSubmitting} title="Rejeter"
                          className="text-red-500 hover:text-red-700 disabled:opacity-50">
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

      {/* ── Pagination ──────────────────────────────────────────────────────── */}
      {transactions.length > 0 && (
        <div className="p-3 flex justify-end items-center gap-2 border-t dark:border-gray-700">
          <Button variant="outline" size="sm" disabled={currentPage <= 1} onClick={() => applyFilters(currentPage - 1)}>Précédent</Button>
          <span className="text-sm text-gray-500 px-2">Page {currentPage}</span>
          <Button variant="outline" size="sm" disabled={transactions.length < PAGE_SIZE} onClick={() => applyFilters(currentPage + 1)}>Suivant</Button>
        </div>
      )}

      {/* ── Modals ──────────────────────────────────────────────────────────── */}
      {modalMode && (
        <MobileMoneyModal mode={modalMode} isSubmitting={isSubmitting}
          onConfirm={handleMobileMoneyConfirm} onClose={() => setModalMode(null)} />
      )}
      {rejectTargetId && (
        <RejectModal isSubmitting={isSubmitting} onConfirm={handleReject} onClose={() => setRejectTargetId(null)} />
      )}
    </div>
  );
}

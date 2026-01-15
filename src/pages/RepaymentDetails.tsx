import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Button } from '../components/ui/Button';
import { ConfirmModal } from '../components/ui/ConfirmModal';
// import { HistoryTimeline } from '../components/common/HistoryTimeline';
import { Breadcrumb } from '../components/common/Breadcrumb';
import { useNotification } from '../contexts/useNotification';
import type { Repayment } from '../components/portfolio/traditional/RepaymentsTable';
// TODO: Replace with real data fetching logic
import { mockRepayments } from '../data/mockRepayments';
import { DetailsSkeleton } from '../components/ui/DetailsSkeleton';

export default function RepaymentDetails({ id: propId }: { id?: string, onClose?: () => void }) {
  const { repaymentId, portfolioId } = useParams();
  const id = propId || repaymentId;
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [repayment, setRepayment] = useState<Repayment | null>(null);
  const [loading, setLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    // Simuler un délai de chargement
    setLoading(true);
    const timer = setTimeout(() => {
      // Recherche stricte : id + portfolioId
      const found = mockRepayments.find((r) => r.id === id && r.portfolioId === portfolioId);
      setRepayment(found || null);
      setLoading(false);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [id, portfolioId]);

  if (loading) {
    return <DetailsSkeleton showBreadcrumb={true} variant="default" infoSections={2} rowsPerSection={4} />;
  }

  if (!repayment) {
    return (
      <div className="p-8 text-center text-gray-500 dark:text-gray-400">
        Remboursement introuvable.
        <Button className="ml-4" onClick={() => navigate(-1)}>Retour</Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <Breadcrumb items={[
        { label: 'Dashboard', href: '/app/dashboard' },
        { label: 'Remboursements', href: '/app/traditional/repayments' },
        { label: `Remboursement #${repayment.id}` }
      ]} />
      <h1 className="text-2xl font-bold mb-2">Détail du remboursement</h1>
      
      {/* Section principale */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-6 space-y-4">
        <div className="flex justify-between items-center border-b dark:border-gray-700 pb-4">
          <div>
            <h2 className="text-lg font-semibold">{repayment.company}</h2>
            <p className="text-gray-600 dark:text-gray-400">{repayment.product}</p>
          </div>
          <div className="text-right">
            <p className="text-xl font-bold">{repayment.amount.toLocaleString()} FCFA</p>
            <div className={`text-sm px-2 py-1 rounded-full inline-block ${
              repayment.status === 'payé' 
                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' 
                : repayment.status === 'retard'
                ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
            }`}>
              {repayment.status === 'payé' 
                ? 'Payé' 
                : repayment.status === 'retard'
                ? 'En retard'
                : 'À venir'}
            </div>
          </div>
        </div>

        {/* Référence du contrat et échéance */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="text-md font-semibold mb-2">Référence du contrat</h3>
            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
              <p className="font-mono">{repayment.contractReference}</p>
            </div>
          </div>
          <div>
            <h3 className="text-md font-semibold mb-2">Échéance</h3>
            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
              <p>{new Date(repayment.dueDate).toLocaleDateString()}</p>
              {repayment.installmentNumber && repayment.totalInstallments && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Échéance {repayment.installmentNumber} sur {repayment.totalInstallments}
                </p>
              )}
            </div>
          </div>
        </div>
        
        {/* Détails du paiement */}
        <div className="mb-6">
          <h3 className="text-md font-semibold mb-2">Détails du paiement</h3>
          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <span className="text-sm text-gray-600 dark:text-gray-400 block">Principal</span>
                <span className="font-medium">{repayment.principal?.toLocaleString()} FCFA</span>
              </div>
              <div>
                <span className="text-sm text-gray-600 dark:text-gray-400 block">Intérêts</span>
                <span className="font-medium">{repayment.interest?.toLocaleString()} FCFA</span>
              </div>
              {repayment.penalties && (
                <div>
                  <span className="text-sm text-red-600 dark:text-red-400 block">Pénalités</span>
                  <span className="font-medium text-red-600">{repayment.penalties.toLocaleString()} FCFA</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Informations de la transaction si payé */}
        {repayment.status === 'payé' && (
          <div className="mb-6">
            <h3 className="text-md font-semibold mb-2">Informations de la transaction</h3>
            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md space-y-2">
              {repayment.paymentDate && (
                <div className="grid grid-cols-2">
                  <span className="text-gray-600 dark:text-gray-400">Date de paiement:</span>
                  <span>{new Date(repayment.paymentDate).toLocaleDateString()}</span>
                </div>
              )}
              {repayment.valueDate && (
                <div className="grid grid-cols-2">
                  <span className="text-gray-600 dark:text-gray-400">Date de valeur:</span>
                  <span>{new Date(repayment.valueDate).toLocaleDateString()}</span>
                </div>
              )}
              {repayment.transactionReference && (
                <div className="grid grid-cols-2">
                  <span className="text-gray-600 dark:text-gray-400">Réf. Transaction:</span>
                  <span className="font-mono">{repayment.transactionReference}</span>
                </div>
              )}
              {repayment.paymentMethod && (
                <div className="grid grid-cols-2">
                  <span className="text-gray-600 dark:text-gray-400">Méthode:</span>
                  <span className="capitalize">{repayment.paymentMethod}</span>
                </div>
              )}
              {repayment.paymentReference && (
                <div className="grid grid-cols-2">
                  <span className="text-gray-600 dark:text-gray-400">Référence paiement:</span>
                  <span className="font-mono">{repayment.paymentReference}</span>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Informations bancaires si payé */}
        {repayment.status === 'payé' && repayment.creditAccount && repayment.debitAccount && (
          <div className="mt-6">
            <h3 className="text-md font-semibold mb-2">Informations bancaires</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Compte débité (client) */}
              <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                <h4 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Compte débité (Client)</h4>
                <div className="space-y-2">
                  <div>
                    <span className="text-xs text-gray-600 dark:text-gray-400 block">Titulaire</span>
                    <span className="font-medium">{repayment.debitAccount.accountName}</span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-600 dark:text-gray-400 block">Numéro de compte</span>
                    <span className="font-mono">{repayment.debitAccount.accountNumber}</span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-600 dark:text-gray-400 block">Banque</span>
                    <span>{repayment.debitAccount.bankName}</span>
                  </div>
                  {repayment.debitAccount.bankCode && (
                    <div>
                      <span className="text-xs text-gray-600 dark:text-gray-400 block">Code banque</span>
                      <span className="font-mono">{repayment.debitAccount.bankCode}</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Compte crédité (institution) */}
              <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                <h4 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Compte crédité (Institution)</h4>
                <div className="space-y-2">
                  <div>
                    <span className="text-xs text-gray-600 dark:text-gray-400 block">Titulaire</span>
                    <span className="font-medium">{repayment.creditAccount.accountName}</span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-600 dark:text-gray-400 block">Numéro de compte</span>
                    <span className="font-mono">{repayment.creditAccount.accountNumber}</span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-600 dark:text-gray-400 block">Banque</span>
                    <span>{repayment.creditAccount.bankName}</span>
                  </div>
                  <div className="flex space-x-4">
                    <div>
                      <span className="text-xs text-gray-600 dark:text-gray-400 block">Code banque</span>
                      <span className="font-mono">{repayment.creditAccount.bankCode}</span>
                    </div>
                    {repayment.creditAccount.branchCode && (
                      <div>
                        <span className="text-xs text-gray-600 dark:text-gray-400 block">Code agence</span>
                        <span className="font-mono">{repayment.creditAccount.branchCode}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="flex gap-4">
        <Button onClick={() => setShowConfirm(true)} disabled={repayment.status !== 'à venir'}>Marquer comme payé</Button>
        <Button onClick={() => navigate(-1)} variant="ghost">Retour</Button>
      </div>
      <h2 className="text-lg font-semibold mt-8">Historique des interactions</h2>
      {/* Historique non disponible sur Repayment mock, à implémenter si besoin */}
      {/* <HistoryTimeline history={repayment.history || []} /> */}
      <ConfirmModal
        open={showConfirm}
        title="Confirmer le paiement"
        message="Voulez-vous vraiment marquer ce remboursement comme payé ?"
        onConfirm={() => {
          setShowConfirm(false);
          // TODO: update status in DB
          showNotification('Remboursement marqué comme payé', 'success');
        }}
        onCancel={() => setShowConfirm(false)}
      />
    </div>
  );
}

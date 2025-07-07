import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Button } from '../components/ui/Button';
import { ConfirmModal } from '../components/ui/ConfirmModal';
// import { HistoryTimeline } from '../components/common/HistoryTimeline';
import { Breadcrumb } from '../components/common/Breadcrumb';
import { useNotification } from '../contexts/NotificationContext';
import type { Repayment } from '../components/portfolio/traditional/RepaymentsTable';
// TODO: Replace with real data fetching logic
import { mockRepayments } from '../data/mockRepayments';

export default function RepaymentDetails({ id: propId }: { id?: string, onClose?: () => void }) {
  const { repaymentId, portfolioId } = useParams();
  const id = propId || repaymentId;
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [repayment, setRepayment] = useState<Repayment | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    // Recherche stricte : id + portfolioId
    const found = mockRepayments.find((r) => r.id === id && r.portfolioId === portfolioId);
    setRepayment(found || null);
  }, [id, portfolioId]);

  if (!repayment) {
    return (
      <div className="p-8 text-center text-gray-500">
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
      <div className="bg-white dark:bg-gray-800 rounded-lg border p-4 space-y-2">
        <div><b>Montant :</b> {repayment.amount}</div>
        <div><b>Statut :</b> {repayment.status}</div>
        <div><b>Échéance :</b> {repayment.dueDate}</div>
        <div><b>Entreprise :</b> {repayment.company}</div>
        <div><b>Produit :</b> {repayment.product}</div>
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

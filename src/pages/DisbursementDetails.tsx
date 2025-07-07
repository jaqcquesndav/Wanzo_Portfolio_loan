import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Button } from '../components/ui/Button';
import { ConfirmModal } from '../components/ui/ConfirmModal';
// import { HistoryTimeline } from '../components/common/HistoryTimeline';
import { Breadcrumb } from '../components/common/Breadcrumb';
import { useNotification } from '../contexts/NotificationContext';
// TODO: Replace with real data fetching logic
import { mockDisbursements } from '../data/mockDisbursements';
import type { Disbursement } from '../components/portfolio/traditional/DisbursementsTable';

export default function DisbursementDetails({ id: propId }: { id?: string }) {
  const { disbursementId, portfolioId } = useParams();
  const id = propId || disbursementId;
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [disbursement, setDisbursement] = useState<Disbursement | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    // Recherche stricte : id + portfolioId
    const found = mockDisbursements.find((d) => d.id === id && d.portfolioId === portfolioId);
    setDisbursement(found || null);
  }, [id, portfolioId]);

  if (!disbursement) {
    return (
      <div className="p-8 text-center text-gray-500">
        Décaissement introuvable.
        <Button className="ml-4" onClick={() => navigate(-1)}>Retour</Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <Breadcrumb items={[
        { label: 'Dashboard', href: '/app/dashboard' },
        { label: 'Décaissements', href: '/app/traditional/disbursements' },
        { label: `Décaissement #${disbursement.id}` }
      ]} />
      <h1 className="text-2xl font-bold mb-2">Détail du décaissement</h1>
      <div className="bg-white dark:bg-gray-800 rounded-lg border p-4 space-y-2">
        <div><b>Montant :</b> {disbursement.amount}</div>
        <div><b>Entreprise :</b> {disbursement.company}</div>
        <div><b>Produit :</b> {disbursement.product}</div>
        <div><b>Statut :</b> {disbursement.status}</div>
        <div><b>Date :</b> {disbursement.date}</div>
      </div>
      <div className="flex gap-4">
        <Button onClick={() => setShowConfirm(true)} disabled={disbursement.status !== 'en attente'}>Confirmer</Button>
        <Button onClick={() => navigate(-1)} variant="ghost">Retour</Button>
      </div>
      <h2 className="text-lg font-semibold mt-8">Historique des interactions</h2>
      {/* Historique non disponible sur Disbursement mock, à implémenter si besoin */}
      {/* <HistoryTimeline history={disbursement.history || []} /> */}
      <ConfirmModal
        open={showConfirm}
        title="Confirmer le décaissement"
        message="Voulez-vous vraiment confirmer ce décaissement ?"
        onConfirm={() => {
          setShowConfirm(false);
          // TODO: update status in DB
          showNotification('Décaissement confirmé', 'success');
        }}
        onCancel={() => setShowConfirm(false)}
      />
    </div>
  );
}

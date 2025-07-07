import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Button } from '../components/ui/Button';
import { ConfirmModal } from '../components/ui/ConfirmModal';
// import { HistoryTimeline } from '../components/common/HistoryTimeline';
import { Breadcrumb } from '../components/common/Breadcrumb';
import { useNotification } from '../contexts/NotificationContext';
// TODO: Replace with real data fetching logic
import { mockGuarantees } from '../data/mockGuarantees';
import type { Guarantee } from '../components/portfolio/traditional/GuaranteesTable';

export default function GuaranteeDetails({ id: propId }: { id?: string, onClose?: () => void }) {
  const { guaranteeId, portfolioId } = useParams();
  const id = propId || guaranteeId;
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [guarantee, setGuarantee] = useState<Guarantee | null>(null);
  const [showRelease, setShowRelease] = useState(false);
  const [showSeize, setShowSeize] = useState(false);

  useEffect(() => {
    // Recherche stricte : id + portfolioId
    const found = mockGuarantees.find((g) => g.id === id && g.portfolioId === portfolioId);
    setGuarantee(found || null);
  }, [id, portfolioId]);

  if (!guarantee) {
    return (
      <div className="p-8 text-center text-gray-500">
        Garantie introuvable.
        <Button className="ml-4" onClick={() => navigate(-1)}>Retour</Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <Breadcrumb items={[
        { label: 'Dashboard', href: '/app/dashboard' },
        { label: 'Garanties', href: '/app/traditional/guarantees' },
        { label: `Garantie #${guarantee.id}` }
      ]} />
      <h1 className="text-2xl font-bold mb-2">Détail de la garantie</h1>
      <div className="bg-white dark:bg-gray-800 rounded-lg border p-4 space-y-2">
        <div><b>Type :</b> {guarantee.type}</div>
        <div><b>Valeur :</b> {guarantee.value}</div>
        <div><b>Statut :</b> {guarantee.status}</div>
        <div><b>Date :</b> {guarantee.created_at}</div>
        <div><b>Entreprise :</b> {guarantee.company}</div>
      </div>
      <div className="flex gap-4">
        <Button onClick={() => setShowRelease(true)} disabled={guarantee.status !== 'active'}>Mainlevée</Button>
        <Button onClick={() => setShowSeize(true)} variant="outline" disabled={guarantee.status !== 'active'}>Saisir</Button>
        <Button onClick={() => navigate(-1)} variant="ghost">Retour</Button>
      </div>
      <h2 className="text-lg font-semibold mt-8">Historique des interactions</h2>
      {/* Historique non disponible sur Guarantee mock, à implémenter si besoin */}
      {/* <HistoryTimeline history={guarantee.history || []} /> */}
      <ConfirmModal
        open={showRelease}
        title="Confirmer la mainlevée"
        message="Voulez-vous vraiment effectuer la mainlevée de cette garantie ?"
        onConfirm={() => {
          setShowRelease(false);
          // TODO: update status in DB
          showNotification('Mainlevée effectuée', 'success');
        }}
        onCancel={() => setShowRelease(false)}
        confirmLabel="Mainlevée"
      />
      <ConfirmModal
        open={showSeize}
        title="Confirmer la saisie"
        message="Voulez-vous vraiment saisir cette garantie ?"
        onConfirm={() => {
          setShowSeize(false);
          // TODO: update status in DB
          showNotification('Garantie saisie', 'success');
        }}
        onCancel={() => setShowSeize(false)}
        confirmLabel="Saisir"
      />
    </div>
  );
}

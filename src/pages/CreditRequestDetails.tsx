import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Button } from '../components/ui/Button';
import { ConfirmModal } from '../components/ui/ConfirmModal';
// import { HistoryTimeline } from '../components/common/HistoryTimeline';
import { useNotification } from '../contexts/NotificationContext';
// TODO: Replace with real data fetching logic
import { mockFundingRequests } from '../data/mockFundingRequests';
import type { FundingRequest } from '../components/portfolio/traditional/FundingRequestsTable';

export default function CreditRequestDetails({ id: propId }: { id?: string, onClose?: () => void }) {
  const { requestId, portfolioId } = useParams();
  const id = propId || requestId;
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [request, setRequest] = useState<FundingRequest | null>(null);
  const [showValidate, setShowValidate] = useState(false);
  const [showRefuse, setShowRefuse] = useState(false);

  useEffect(() => {
    // Recherche stricte : id + portfolioId
    const found = mockFundingRequests.find((r) => r.id === id && r.portfolioId === portfolioId);
    setRequest(found || null);
  }, [id, portfolioId]);

  if (!request) {
    return (
      <div className="p-8 text-center text-gray-500">
        Demande introuvable.
        <Button className="ml-4" onClick={() => navigate(-1)}>Retour</Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold mb-2">Détail de la demande de crédit PME</h1>
      <div className="bg-white dark:bg-gray-800 rounded-lg border p-4 space-y-2">
        <div><b>Entreprise :</b> {request.company}</div>
        <div><b>Produit :</b> {request.product}</div>
        <div><b>Montant :</b> {request.amount.toLocaleString()} FCFA</div>
        <div><b>Statut :</b> {request.status}</div>
        <div><b>Date de création :</b> {new Date(request.created_at).toLocaleDateString()}</div>
      </div>
      <div className="flex gap-4">
        <Button onClick={() => setShowValidate(true)} disabled={request.status !== 'en attente'}>Valider</Button>
        <Button onClick={() => setShowRefuse(true)} variant="outline" disabled={request.status !== 'en attente'}>Refuser</Button>
        <Button onClick={() => navigate(-1)} variant="ghost">Retour</Button>
      </div>
      {/* Modals de validation/refus */}
      <ConfirmModal
        open={showValidate}
        title="Confirmer la validation"
        message="Voulez-vous vraiment valider cette demande de crédit ?"
        onConfirm={() => {
          setShowValidate(false);
          // TODO: update status in DB
          showNotification('Demande validée', 'success');
        }}
        onCancel={() => setShowValidate(false)}
      />
      <ConfirmModal
        open={showRefuse}
        title="Confirmer le refus"
        message="Voulez-vous vraiment refuser cette demande de crédit ?"
        onConfirm={() => {
          setShowRefuse(false);
          // TODO: update status in DB
          showNotification('Demande refusée', 'success');
        }}
        onCancel={() => setShowRefuse(false)}
        confirmLabel="Refuser"
      />
    </div>
  );
}

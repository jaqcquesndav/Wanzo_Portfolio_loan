import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Button } from '../components/ui/Button';
import { ConfirmModal } from '../components/ui/ConfirmModal';
// import { HistoryTimeline } from '../components/common/HistoryTimeline';
import { useNotification } from '../contexts/NotificationContext';
import { creditRequestApi } from '../services/api/traditional/credit-request.api';
import type { CreditRequest } from '../types/credit';

export default function CreditRequestDetails({ id: propId }: { id?: string, onClose?: () => void }) {
  const { requestId, portfolioId } = useParams();
  const id = propId || requestId;
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [request, setRequest] = useState<CreditRequest | null>(null);
  const [showValidate, setShowValidate] = useState(false);
  const [showRefuse, setShowRefuse] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCreditRequest() {
      if (!id) return;
      
      try {
        setLoading(true);
        const result = await creditRequestApi.getRequestById(id);
        setRequest(result || null);
      } catch (error) {
        console.error("Error fetching credit request:", error);
        showNotification("Erreur lors du chargement de la demande de crédit", "error");
      } finally {
        setLoading(false);
      }
    }
    
    fetchCreditRequest();
  }, [id, portfolioId, showNotification]);

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-primary rounded-full mx-auto"></div>
        <p className="mt-2 text-gray-500">Chargement de la demande...</p>
      </div>
    );
  }

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
        <div><b>ID du membre :</b> {request.memberId}</div>
        <div><b>Produit ID :</b> {request.productId}</div>
        <div><b>Montant :</b> {request.requestAmount.toLocaleString()} FCFA</div>
        <div><b>Statut :</b> {request.status}</div>
        <div><b>Date de création :</b> {new Date(request.createdAt).toLocaleDateString()}</div>
        <div><b>Taux d'intérêt :</b> {request.interestRate}%</div>
        <div><b>Périodicité :</b> {request.periodicity}</div>
        <div><b>Raison :</b> {request.reason}</div>
      </div>
      <div className="flex gap-4">
        <Button onClick={() => setShowValidate(true)} disabled={request.status !== 'pending'}>Valider</Button>
        <Button onClick={() => setShowRefuse(true)} variant="outline" disabled={request.status !== 'pending'}>Refuser</Button>
        <Button onClick={() => navigate(-1)} variant="ghost">Retour</Button>
      </div>
      {/* Modals de validation/refus */}
      <ConfirmModal
        open={showValidate}
        title="Confirmer la validation"
        message="Voulez-vous vraiment valider cette demande de crédit ?"
        onConfirm={async () => {
          try {
            setShowValidate(false);
            await creditRequestApi.updateRequestStatus(request.id, 'approved');
            showNotification('Demande validée', 'success');
            // Recharger les données
            const updated = await creditRequestApi.getRequestById(request.id);
            setRequest(updated || null);
          } catch (error) {
            console.error("Error updating request status:", error);
            showNotification('Erreur lors de la validation de la demande', 'error');
          }
        }}
        onCancel={() => setShowValidate(false)}
      />
      <ConfirmModal
        open={showRefuse}
        title="Confirmer le refus"
        message="Voulez-vous vraiment refuser cette demande de crédit ?"
        onConfirm={async () => {
          try {
            setShowRefuse(false);
            await creditRequestApi.updateRequestStatus(request.id, 'rejected');
            showNotification('Demande refusée', 'success');
            // Recharger les données
            const updated = await creditRequestApi.getRequestById(request.id);
            setRequest(updated || null);
          } catch (error) {
            console.error("Error updating request status:", error);
            showNotification('Erreur lors du refus de la demande', 'error');
          }
        }}
        onCancel={() => setShowRefuse(false)}
        confirmLabel="Refuser"
      />
    </div>
  );
}

import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Button } from '../components/ui/Button';
import { ConfirmModal } from '../components/ui/ConfirmModal';
// import { HistoryTimeline } from '../components/common/HistoryTimeline';
import { Breadcrumb } from '../components/common/Breadcrumb';
import { useNotification } from '../contexts/useNotification';
// TODO: Replace with real data fetching logic
import { mockDisbursements } from '../data/mockDisbursements';
import type { Disbursement } from '../types/disbursement';

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
      
      {/* Section principale */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border p-6 space-y-4">
        <div className="flex justify-between items-center border-b pb-4">
          <div>
            <h2 className="text-lg font-semibold">{disbursement.company}</h2>
            <p className="text-gray-600 dark:text-gray-400">{disbursement.product}</p>
          </div>
          <div className="text-right">
            <p className="text-xl font-bold">{disbursement.amount.toLocaleString()} FCFA</p>
            <div className={`text-sm px-2 py-1 rounded-full inline-block ${
              disbursement.status === 'effectué' 
                ? 'bg-green-100 text-green-700' 
                : 'bg-yellow-100 text-yellow-700'
            }`}>
              {disbursement.status === 'effectué' ? 'Effectué' : 'En attente'}
            </div>
          </div>
        </div>

        {/* Référence du contrat */}
        <div className="mb-6">
          <h3 className="text-md font-semibold mb-2">Référence du contrat</h3>
          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
            <p className="font-mono">{disbursement.contractReference}</p>
          </div>
        </div>
        
        {/* Informations de la transaction */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-md font-semibold mb-2">Informations de la transaction</h3>
            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md space-y-2">
              <div className="grid grid-cols-2">
                <span className="text-gray-600 dark:text-gray-400">Date:</span>
                <span>{new Date(disbursement.date).toLocaleDateString()}</span>
              </div>
              {disbursement.transactionReference && (
                <div className="grid grid-cols-2">
                  <span className="text-gray-600 dark:text-gray-400">Réf. Transaction:</span>
                  <span className="font-mono">{disbursement.transactionReference}</span>
                </div>
              )}
              {disbursement.executionDate && (
                <div className="grid grid-cols-2">
                  <span className="text-gray-600 dark:text-gray-400">Date d'exécution:</span>
                  <span>{new Date(disbursement.executionDate).toLocaleDateString()}</span>
                </div>
              )}
              {disbursement.valueDate && (
                <div className="grid grid-cols-2">
                  <span className="text-gray-600 dark:text-gray-400">Date de valeur:</span>
                  <span>{new Date(disbursement.valueDate).toLocaleDateString()}</span>
                </div>
              )}
              {disbursement.paymentMethod && (
                <div className="grid grid-cols-2">
                  <span className="text-gray-600 dark:text-gray-400">Méthode:</span>
                  <span className="capitalize">{disbursement.paymentMethod}</span>
                </div>
              )}
            </div>
          </div>
          
          <div>
            <h3 className="text-md font-semibold mb-2">Détails additionnels</h3>
            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md space-y-2">
              {disbursement.description && (
                <div className="grid grid-cols-1">
                  <span className="text-gray-600 dark:text-gray-400">Motif du paiement:</span>
                  <span className="mt-1">{disbursement.description}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Informations bancaires */}
        <div className="mt-6">
          <h3 className="text-md font-semibold mb-2">Informations bancaires</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Compte débité */}
            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
              <h4 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Compte débité (Institution)</h4>
              <div className="space-y-2">
                <div>
                  <span className="text-xs text-gray-600 dark:text-gray-400 block">Titulaire</span>
                  <span className="font-medium">{disbursement.debitAccount?.accountName}</span>
                </div>
                <div>
                  <span className="text-xs text-gray-600 dark:text-gray-400 block">Numéro de compte</span>
                  <span className="font-mono">{disbursement.debitAccount?.accountNumber}</span>
                </div>
                <div>
                  <span className="text-xs text-gray-600 dark:text-gray-400 block">Banque</span>
                  <span>{disbursement.debitAccount?.bankName}</span>
                </div>
                <div className="flex space-x-4">
                  <div>
                    <span className="text-xs text-gray-600 dark:text-gray-400 block">Code banque</span>
                    <span className="font-mono">{disbursement.debitAccount?.bankCode}</span>
                  </div>
                  {disbursement.debitAccount?.branchCode && (
                    <div>
                      <span className="text-xs text-gray-600 dark:text-gray-400 block">Code agence</span>
                      <span className="font-mono">{disbursement.debitAccount.branchCode}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Compte bénéficiaire */}
            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
              <h4 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Compte crédité (Bénéficiaire)</h4>
              <div className="space-y-2">
                <div>
                  <span className="text-xs text-gray-600 dark:text-gray-400 block">Entreprise</span>
                  <span className="font-medium">{disbursement.beneficiary?.companyName || disbursement.company}</span>
                </div>
                <div>
                  <span className="text-xs text-gray-600 dark:text-gray-400 block">Titulaire</span>
                  <span>{disbursement.beneficiary?.accountName}</span>
                </div>
                <div>
                  <span className="text-xs text-gray-600 dark:text-gray-400 block">Numéro de compte</span>
                  <span className="font-mono">{disbursement.beneficiary?.accountNumber}</span>
                </div>
                <div>
                  <span className="text-xs text-gray-600 dark:text-gray-400 block">Banque</span>
                  <span>{disbursement.beneficiary?.bankName}</span>
                </div>
                {disbursement.beneficiary?.swiftCode && (
                  <div>
                    <span className="text-xs text-gray-600 dark:text-gray-400 block">Code SWIFT</span>
                    <span className="font-mono">{disbursement.beneficiary.swiftCode}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
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

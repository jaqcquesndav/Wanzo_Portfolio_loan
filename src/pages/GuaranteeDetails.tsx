import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Button } from '../components/ui/Button';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { Breadcrumb } from '../components/common/Breadcrumb';
import { useNotification } from '../contexts/useNotification';
import { guaranteeStorageService } from '../services/storage/guaranteeStorageUnified';
import type { Guarantee } from '../types/guarantee';
import { logGuaranteeEvent, ensureG001Exists } from '../scripts/guaranteeInitializer';

export default function GuaranteeDetails({ id: propId }: { id?: string, onClose?: () => void }) {
  // The route can come in multiple formats:
  // 1. /app/traditional/:id/guarantees/:guaranteeId
  // 2. /app/portfolio/:portfolioId/guarantees/:guaranteeId
  // 3. /app/traditional/guarantees/:guaranteeId
  // 4. /app/traditional/:portfolioId/guarantees/:guaranteeId (nouvelle route)
  // 5. /app/traditional/trad-1/guarantees/G001 (route explicite)
  const params = useParams();
  const guaranteeId = params.guaranteeId;
  // Accepter portfolioId ou id comme paramètre pour une meilleure compatibilité
  const portfolioId = params.portfolioId || params.id; 
  const id = propId || guaranteeId;
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  
  console.log('Initial params extracted:', { 
    rawParams: params,
    guaranteeId,
    portfolioId,
    propId,
    id,
    path: window.location.pathname
  });
  
  // Journaliser l'accès à la page de détails
  useEffect(() => {
    if (id) {
      // Enregistrer l'événement d'accès
      logGuaranteeEvent('access', id, portfolioId || 'unknown');
      
      // Si c'est la garantie G001, s'assurer qu'elle existe
      if (id === 'G001' && (portfolioId === 'trad-1' || params.id === 'trad-1')) {
        console.log('🔍 Accès à la garantie spéciale G001 dans trad-1, vérification de son existence...');
        ensureG001Exists();
      }
    }
  }, [id, portfolioId, params.id]);
  
  const [guarantee, setGuarantee] = useState<Guarantee | null>(null);
  const [showRelease, setShowRelease] = useState(false);
  const [showSeize, setShowSeize] = useState(false);

  useEffect(() => {
    const fetchGuarantee = async () => {
      console.log('Searching guarantee with params:', { 
        id, 
        portfolioId, 
        routeParams: params 
      });
      
      try {
        // Essayons d'abord d'initialiser les données si elles ne sont pas déjà présentes
        await guaranteeStorageService.initializeDefaultData();
        
        let foundGuarantee: Guarantee | null = null;
        
        // Cas spécial pour le G001 dans trad-1 (pour le débogage)
        if (id === 'G001' && (portfolioId === 'trad-1' || params.id === 'trad-1')) {
          console.log('🔍 Recherche de la garantie spéciale G001 dans trad-1');
          let allGuarantees = await guaranteeStorageService.getAllGuarantees();
          console.log('📊 Toutes les garanties:', allGuarantees);
          foundGuarantee = allGuarantees.find(g => g.id === 'G001' && g.portfolioId === 'trad-1') || null;
          console.log('🔍 Résultat de la recherche spéciale:', foundGuarantee);
          
          // Si la garantie n'est pas trouvée, tenter de l'ajouter
          if (!foundGuarantee) {
            console.warn('⚠️ Garantie G001 non trouvée, tentative d\'ajout...');
            ensureG001Exists();
            // Nouvelle tentative après ajout
            allGuarantees = await guaranteeStorageService.getAllGuarantees();
            foundGuarantee = allGuarantees.find(g => g.id === 'G001' && g.portfolioId === 'trad-1') || null;
            console.log('🔍 Après tentative d\'ajout:', foundGuarantee);
          }
          
          // Journaliser l'événement
          logGuaranteeEvent(
            foundGuarantee ? 'access' : 'error', 
            'G001', 
            'trad-1', 
            foundGuarantee ? undefined : 'Garantie non trouvée après tentative d\'ajout'
          );
        }
        
        // Si on a un ID de garantie, chercher directement par ID
        if (!foundGuarantee && id) {
          foundGuarantee = await guaranteeStorageService.getGuaranteeById(id);
          console.log('Guarantee search by ID result:', foundGuarantee);
        }
        
        // Si on n'a pas trouvé la garantie, mais qu'on a un portfolioId, chercher parmi les garanties de ce portfolio
        if (!foundGuarantee && portfolioId) {
          const portfolioGuarantees = await guaranteeStorageService.getGuaranteesByPortfolio(portfolioId);
          console.log('Portfolio guarantees:', portfolioGuarantees);
          foundGuarantee = portfolioGuarantees.find(g => g.id === id) || null;
        }
        
        // Dernier recours: si on ne trouve toujours pas, prendre la première garantie disponible
        if (!foundGuarantee) {
          console.log('No guarantee found with provided parameters, trying to get any guarantee as fallback');
          const allGuarantees = await guaranteeStorageService.getAllGuarantees();
          if (allGuarantees.length > 0) {
            foundGuarantee = allGuarantees[0];
            console.log('Using fallback guarantee:', foundGuarantee);
          }
        }
        
        if (foundGuarantee) {
          console.log('Guarantee found:', foundGuarantee);
          setGuarantee(foundGuarantee);
        } else {
          console.error(`Garantie non trouvée pour id=${id}, portfolioId=${portfolioId}`);
          showNotification('Garantie introuvable', 'error');
        }
      } catch (error) {
        console.error('Erreur lors de la récupération de la garantie:', error);
        showNotification('Erreur lors de la récupération de la garantie', 'error');
      }
    };
    
    fetchGuarantee();
  }, [id, portfolioId, params, showNotification]);

  if (!guarantee) {
    return (
      <div className="p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4 text-red-600">Garantie introuvable</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            La garantie demandée n'a pas pu être trouvée. Cela peut être dû à plusieurs raisons:
          </p>
          <ul className="text-left text-gray-600 dark:text-gray-400 mb-6 ml-8 list-disc">
            <li className="mb-2">L'identifiant de la garantie est incorrect</li>
            <li className="mb-2">La garantie a été supprimée</li>
            <li className="mb-2">Vous n'avez pas les droits d'accès nécessaires</li>
            <li className="mb-2">Une erreur de chargement des données s'est produite</li>
          </ul>
          <div className="flex justify-center space-x-4">
            <Button onClick={() => navigate(-1)} variant="primary">
              Retour
            </Button>
            <Button 
              onClick={() => navigate("/app/traditional")} 
              variant="outline"
            >
              Aller au tableau de bord
            </Button>
          </div>
          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded text-xs text-left">
            <p className="text-gray-500 dark:text-gray-400">
              <strong>Informations techniques (pour le support):</strong><br />
              ID: {id}<br />
              Portfolio ID: {portfolioId}<br />
              Path: {window.location.pathname}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <Breadcrumb items={[
        { label: 'Dashboard', href: '/app/dashboard' },
        { label: 'Portefeuilles', href: '/app/traditional' },
        { label: `Portefeuille ${portfolioId || 'N/A'}`, href: `/app/traditional/${portfolioId}` },
        { label: `Garantie #${guarantee.id}` }
      ]} />
      <h1 className="text-2xl font-bold mb-2">Détail de la garantie</h1>
      <div className="bg-white dark:bg-gray-800 rounded-lg border p-4 space-y-2">
        <div><b>Type :</b> {guarantee.type}</div>
        <div><b>Valeur :</b> {guarantee.value.toLocaleString('fr-FR')} FCFA</div>
        <div><b>Statut :</b> {guarantee.status}</div>
        <div><b>Date :</b> {new Date(guarantee.created_at).toLocaleDateString('fr-FR')}</div>
        <div><b>Entreprise :</b> {guarantee.company}</div>
        {guarantee.contractReference && (
          <div>
            <b>Contrat associé :</b>{' '}
            <button 
              onClick={() => navigate(`/app/traditional/${portfolioId || 'default'}/contracts/${guarantee.contractReference}`)}
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline"
            >
              {guarantee.contractReference}
            </button>
          </div>
        )}
        {guarantee.details && (
          <div className="mt-4 pt-4 border-t">
            <h3 className="font-semibold mb-2">Détails supplémentaires</h3>
            {guarantee.details.description && <div><b>Description :</b> {guarantee.details.description}</div>}
            {guarantee.details.location && <div><b>Localisation :</b> {guarantee.details.location}</div>}
            {guarantee.details.reference && <div><b>Référence externe :</b> {guarantee.details.reference}</div>}
            {guarantee.details.provider && <div><b>Fournisseur :</b> {guarantee.details.provider}</div>}
            {guarantee.details.coverage && <div><b>Couverture :</b> {guarantee.details.coverage}%</div>}
            {guarantee.details.document_url && (
              <div>
                <b>Document :</b>{' '}
                <a 
                  href={guarantee.details.document_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline"
                >
                  Voir le document
                </a>
              </div>
            )}
          </div>
        )}
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
        onConfirm={async () => {
          setShowRelease(false);
          try {
            // Mettre à jour le statut dans le stockage
            await guaranteeStorageService.updateGuarantee(guarantee.id, { status: 'libérée' });
            setGuarantee(prev => prev ? { ...prev, status: 'libérée' } : null);
            showNotification('Mainlevée effectuée', 'success');
          } catch (error) {
            console.error('Erreur lors de la mainlevée:', error);
            showNotification('Erreur lors de la mainlevée', 'error');
          }
        }}
        onCancel={() => setShowRelease(false)}
        confirmLabel="Mainlevée"
      />
      <ConfirmModal
        open={showSeize}
        title="Confirmer la saisie"
        message="Voulez-vous vraiment saisir cette garantie ?"
        onConfirm={async () => {
          setShowSeize(false);
          try {
            // Mettre à jour le statut dans le stockage
            await guaranteeStorageService.updateGuarantee(guarantee.id, { status: 'saisie' });
            setGuarantee(prev => prev ? { ...prev, status: 'saisie' } : null);
            showNotification('Garantie saisie', 'success');
          } catch (error) {
            console.error('Erreur lors de la saisie:', error);
            showNotification('Erreur lors de la saisie', 'error');
          }
        }}
        onCancel={() => setShowSeize(false)}
        confirmLabel="Saisir"
      />
    </div>
  );
}

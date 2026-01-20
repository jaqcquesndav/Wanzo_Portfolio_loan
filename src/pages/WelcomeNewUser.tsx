import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { useNotification } from '../contexts/useNotification';
// ✅ Utilisation des hooks React Query professionnels
import { useCreatePortfolioMutation } from '../hooks/queries';
import { CreatePortfolioModal, type PortfolioModalData } from '../components/portfolio/CreatePortfolioModal';
import { useAppContextStore } from '../stores/appContextStore';

export default function WelcomeNewUser() {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { institutionId, user } = useAppContextStore();
  
  // ✅ Mutation React Query avec invalidation automatique du cache
  const createPortfolioMutation = useCreatePortfolioMutation();

  const handleCreatePortfolio = async (data: PortfolioModalData) => {
    try {
      // ✅ Utilisation de la mutation React Query
      const newPortfolio = await createPortfolioMutation.mutateAsync({
        ...data,
        manager_id: user?.id || 'default-manager',
        institution_id: institutionId || 'default-institution',
      });
      showNotification('Portefeuille créé avec succès', 'success');
      setShowCreateModal(false);
      navigate(`/app/traditional/${newPortfolio.id}`);
    } catch (error) {
      console.error('Erreur lors de la création du portefeuille:', error);
      showNotification('Erreur lors de la création du portefeuille', 'error');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 sm:p-8 max-w-2xl w-full text-center">
        <h1 className="text-3xl font-bold text-primary mb-6">
          Bienvenue sur votre plateforme de gestion de portefeuilles
        </h1>
        
        <p className="text-gray-600 dark:text-gray-300 mb-8 text-lg">
          Pour commencer, vous devez créer votre premier portefeuille traditionnel.
          Cela vous permettra de gérer vos crédits, vos remboursements et vos garanties.
        </p>
        
        <div className="mb-8">
          <img 
            src="/assets/welcome-illustration.svg" 
            alt="Illustration de bienvenue" 
            className="max-w-md mx-auto"
            onError={(e) => e.currentTarget.style.display = 'none'} // Fallback si l'image n'existe pas
          />
        </div>
        
        <Button 
          size="lg"
          onClick={() => setShowCreateModal(true)}
          className="text-lg px-8 py-3"
        >
          Créer mon premier portefeuille
        </Button>
        
        <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">
          Vous pourrez ensuite personnaliser votre portefeuille et ajouter des opérations.
        </p>
      </div>
      
      {showCreateModal && (
        <CreatePortfolioModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreatePortfolio}
        />
      )}
    </div>
  );
}

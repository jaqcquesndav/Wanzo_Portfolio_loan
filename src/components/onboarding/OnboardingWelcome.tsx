/**
 * OnboardingWelcome - Composant d'accueil pour les nouveaux utilisateurs
 * 
 * Ce composant s'affiche quand un utilisateur est connecté mais n'a pas encore
 * de portefeuille. Il le guide pour créer son premier portefeuille et comprendre
 * les fonctionnalités de la plateforme.
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Briefcase, 
  Settings, 
  Users, 
  PieChart, 
  FileText, 
  Shield,
  ArrowRight,
  CheckCircle,
  Plus,
  Sparkles
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { CreatePortfolioModal, type PortfolioModalData } from '../portfolio/CreatePortfolioModal';
import { useCreatePortfolioMutation } from '../../hooks/queries';
import { useNotification } from '../../contexts/useNotification';
import { useAppContextStore } from '../../stores/appContextStore';

interface OnboardingWelcomeProps {
  /** Nom de l'utilisateur pour personnaliser le message */
  userName?: string;
  /** Callback optionnel après création du premier portefeuille */
  onPortfolioCreated?: (portfolioId: string) => void;
}

export const OnboardingWelcome: React.FC<OnboardingWelcomeProps> = ({ 
  userName,
  onPortfolioCreated
}) => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { institutionId, user } = useAppContextStore();
  
  const createPortfolioMutation = useCreatePortfolioMutation();

  const handleCreatePortfolio = async (data: PortfolioModalData) => {
    try {
      // S'assurer que les champs requis sont présents
      const portfolioData = {
        name: data.name || 'Mon premier portefeuille',
        description: data.description || '',
        target_amount: data.target_amount || 0,
        target_return: data.target_return || 0,
        target_sectors: data.target_sectors || [],
        risk_profile: data.risk_profile || 'moderate',
        manager_id: user?.id || 'default-manager',
        institution_id: institutionId || 'default-institution',
        currency: data.currency || 'USD',
        ...(data.bank_account && { bank_account: data.bank_account }),
        ...(data.mobile_money_account && { mobile_money_account: data.mobile_money_account }),
      };
      
      const newPortfolio = await createPortfolioMutation.mutateAsync(portfolioData);
      showNotification('🎉 Félicitations ! Votre premier portefeuille a été créé avec succès !', 'success');
      setShowCreateModal(false);
      
      if (onPortfolioCreated) {
        onPortfolioCreated(newPortfolio.id);
      }
      
      // Naviguer vers le nouveau portefeuille
      navigate(`/app/traditional/${newPortfolio.id}`);
    } catch (error) {
      console.error('Erreur lors de la création du portefeuille:', error);
      showNotification('Erreur lors de la création du portefeuille', 'error');
    }
  };

  // Étapes du guide de démarrage
  const onboardingSteps = [
    {
      icon: Briefcase,
      title: 'Créer un portefeuille',
      description: 'Créez votre premier portefeuille pour organiser vos crédits et prêts.',
      action: () => setShowCreateModal(true),
      actionLabel: 'Créer maintenant',
      isPrimary: true
    },
    {
      icon: Settings,
      title: 'Configurer les paramètres',
      description: 'Personnalisez les produits financiers, taux d\'intérêt et conditions.',
      action: () => navigate('/app/traditional/settings'),
      actionLabel: 'Configurer'
    },
    {
      icon: Users,
      title: 'Gérer les utilisateurs',
      description: 'Invitez votre équipe et définissez les rôles et permissions.',
      action: () => navigate('/app/traditional/users'),
      actionLabel: 'Gérer'
    }
  ];

  // Fonctionnalités disponibles
  const features = [
    {
      icon: PieChart,
      title: 'Dashboard analytique',
      description: 'Tableaux de bord conformes aux normes OHADA/BCEAO'
    },
    {
      icon: FileText,
      title: 'Gestion des crédits',
      description: 'Suivi complet des demandes, contrats et remboursements'
    },
    {
      icon: Shield,
      title: 'Centrale des risques',
      description: 'Évaluation et suivi des risques de crédit'
    }
  ];

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* En-tête de bienvenue */}
      <div className="text-center mb-8 max-w-2xl">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
          <Sparkles className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-3">
          Bienvenue{userName ? `, ${userName}` : ''} ! 👋
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Vous êtes prêt à commencer avec Wanzo Portfolio. 
          Créez votre premier portefeuille pour gérer vos crédits et suivre vos performances.
        </p>
      </div>

      {/* Carte principale - Créer un portefeuille */}
      <Card className="w-full max-w-3xl mb-8 border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Briefcase className="w-6 h-6 text-primary" />
            </div>
            Commencez par créer votre premier portefeuille
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Un portefeuille vous permet de regrouper et gérer vos crédits selon différents critères :
            secteurs d'activité, niveaux de risque, types de produits financiers, etc.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Gestion des crédits
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Suivi des remboursements
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Reporting OHADA
            </div>
          </div>

          <Button
            size="lg"
            onClick={() => setShowCreateModal(true)}
            icon={<Plus className="w-5 h-5" />}
            className="w-full sm:w-auto"
          >
            Créer mon premier portefeuille
          </Button>
        </CardContent>
      </Card>

      {/* Actions secondaires */}
      <div className="w-full max-w-3xl mb-8">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Ou explorez ces options
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {onboardingSteps.slice(1).map((step, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer group">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg group-hover:bg-primary/10 transition-colors">
                    <step.icon className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                      {step.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                      {step.description}
                    </p>
                    <button
                      onClick={step.action}
                      className="inline-flex items-center text-sm text-primary hover:text-primary/80 font-medium"
                    >
                      {step.actionLabel}
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Fonctionnalités disponibles */}
      <div className="w-full max-w-3xl">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 text-center">
          Ce que vous pouvez faire avec Wanzo Portfolio
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="text-center p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50"
            >
              <div className="inline-flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg mb-3">
                <feature.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                {feature.title}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Modal de création */}
      {showCreateModal && (
        <CreatePortfolioModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreatePortfolio}
        />
      )}
    </div>
  );
};

export default OnboardingWelcome;

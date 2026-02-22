// src/pages/NoInstitutionPage.tsx
// Page affichée quand un utilisateur authentifié n'a pas d'institution associée.
// Accessible via /institution/required

import { Building2, LogOut, RefreshCw, ExternalLink } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useAuth } from '../contexts/useAuth';
import { auth0Service } from '../services/api/auth/auth0Service';

export default function NoInstitutionPage() {
  const { logout, refreshContext, isLoading } = useAuth();

  const handleLogout = () => {
    logout(); // nettoie l'état React
    auth0Service.performFullLogout(); // invalide la session Auth0 et revient sur /
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center space-y-5">
        {/* Icône */}
        <div className="flex justify-center">
          <div className="rounded-full bg-yellow-100 dark:bg-yellow-900/30 p-4">
            <Building2 className="h-10 w-10 text-yellow-600 dark:text-yellow-400" />
          </div>
        </div>

        {/* Titre */}
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
          Aucune institution associée
        </h1>

        {/* Explication */}
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Votre compte est authentifié mais n'est lié à aucune institution financière.
          <br />
          Pour accéder à l'application, votre compte doit être rattaché à une institution
          enregistrée sur la plateforme Wanzo.
        </p>

        <hr className="border-gray-200 dark:border-gray-700" />

        {/* Actions */}
        <div className="space-y-3">
          {/* Lien vers wanzo.com pour créer/associer une institution */}
          <a
            href="https://wanzzo.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full rounded-md bg-primary text-white px-4 py-2 text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
            Créer ou associer une institution sur Wanzo
          </a>

          {/* Réessayer (rechargement du contexte depuis /users/me) */}
          <Button
            variant="outline"
            className="w-full"
            onClick={refreshContext}
            isLoading={isLoading}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Vérifier à nouveau
          </Button>

          {/* Déconnexion */}
          <Button
            variant="ghost"
            className="w-full text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Se déconnecter
          </Button>
        </div>

        <p className="text-xs text-gray-400 dark:text-gray-500">
          Si vous pensez qu'il s'agit d'une erreur, contactez votre administrateur
          ou le support Wanzo.
        </p>
      </div>
    </div>
  );
}

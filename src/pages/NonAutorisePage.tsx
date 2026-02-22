/**
 * Page d'accès refusé / non autorisé.
 *
 * Utilisée dans deux cas :
 *  - reason === 'no_institution'  : compte authentifié sans institution liée
 *  - reason === 'role_not_allowed': rôle de l'utilisateur insuffisant pour cette app
 *  - (défaut)                     : permissions manquantes pour la page demandée
 *
 * Navigation vers cette page :
 *   navigate('/non-autorise', { state: { reason: 'role_not_allowed' } })
 *   navigate('/non-autorise', { state: { reason: 'no_institution' } })
 */

import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Building2, ShieldAlert, LogOut, Home, ExternalLink, RefreshCw } from 'lucide-react';
import { useAuth } from '../contexts/useAuth';
import { auth0Service } from '../services/api/auth/auth0Service';

interface LocationState {
  reason?: 'role_not_allowed' | 'no_institution' | string;
}

export function NonAutorisePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { refreshContext, isLoading } = useAuth();

  const state = location.state as LocationState | null;
  const reason = state?.reason;

  const isRoleNotAllowed = reason === 'role_not_allowed';
  const isNoInstitution = reason === 'no_institution';

  const handleLogout = () => {
    // Utilise auth0Service pour invalider la session Auth0 et revenir sur la page de login
    auth0Service.performFullLogout();
  };

  // --- Contenu dynamique selon le motif ---
  const icon = isNoInstitution
    ? <Building2 className="mx-auto h-16 w-16 text-yellow-500 dark:text-yellow-400" />
    : <ShieldAlert className="mx-auto h-16 w-16 text-red-500 dark:text-red-400" />;

  const title = isNoInstitution
    ? t('auth.nonAutorisePage.noInstitutionTitle', 'Aucune institution associée')
    : t('auth.nonAutorisePage.title', 'Accès Non Autorisé');

  const bgAccent = isNoInstitution
    ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700'
    : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700';

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 px-4">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md max-w-md w-full">
        <div className="text-center">

          {/* Icône */}
          <div className="mb-4">{icon}</div>

          {/* Titre */}
          <h1 className={`text-2xl font-bold mb-4 ${
            isNoInstitution
              ? 'text-yellow-600 dark:text-yellow-400'
              : 'text-red-600 dark:text-red-400'
          }`}>
            {title}
          </h1>

          {/* Message contextuel */}
          {isNoInstitution ? (
            <div className={`rounded-lg border p-4 mb-6 text-sm text-left ${bgAccent}`}>
              <p className="text-gray-700 dark:text-gray-300 mb-2">
                {t('auth.nonAutorisePage.noInstitutionMessage',
                  'Votre compte est authentifié mais n\'est lié à aucune institution financière enregistrée sur la plateforme Wanzo.')}
              </p>
              <p className="text-gray-500 dark:text-gray-400 text-xs">
                {t('auth.nonAutorisePage.noInstitutionHelp',
                  'Pour accéder à l\'application, votre compte doit être rattaché à une institution. Créez ou rejoignez une institution sur wanzo.io.')}
              </p>
            </div>
          ) : isRoleNotAllowed ? (
            <>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {t('auth.nonAutorisePage.roleNotAllowed',
                  "Votre rôle ne permet pas d'accéder à cette application.")}
              </p>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
                {t('auth.nonAutorisePage.contactAdmin',
                  'Contactez votre administrateur si vous pensez que ceci est une erreur.')}
              </p>
            </>
          ) : (
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {t('auth.nonAutorisePage.message',
                "Vous n'avez pas les permissions nécessaires pour accéder à cette page. Veuillez contacter votre administrateur si vous pensez que ceci est une erreur.")}
            </p>
          )}

          {/* Actions */}
          <div className="flex flex-col space-y-3">

            {/* Lien Wanzo.io pour créer/rejoindre une institution */}
            {isNoInstitution && (
              <a
                href="https://wanzzo.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition-colors text-sm font-medium"
              >
                <ExternalLink className="h-4 w-4" />
                {t('auth.nonAutorisePage.createInstitution',
                  'Créer ou associer une institution sur Wanzo')}
              </a>
            )}

            {/* Vérifier à nouveau (rechargement du contexte depuis /users/me) */}
            {isNoInstitution && (
              <button
                onClick={refreshContext}
                disabled={isLoading}
                className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                {t('auth.nonAutorisePage.retry', 'Vérifier à nouveau')}
              </button>
            )}

            {/* Retour au dashboard (uniquement si pas de cas bloquant) */}
            {!isRoleNotAllowed && !isNoInstitution && (
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
              >
                <Home className="h-4 w-4" />
                {t('auth.nonAutorisePage.backToDashboard', 'Retour au Dashboard')}
              </button>
            )}

            {/* Déconnexion */}
            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm"
            >
              <LogOut className="h-4 w-4" />
              {t('auth.nonAutorisePage.logout', 'Se déconnecter')}
            </button>
          </div>

          <p className="mt-6 text-xs text-gray-400 dark:text-gray-500">
            {t('auth.nonAutorisePage.footer',
              'Si vous pensez qu\'il s\'agit d\'une erreur, contactez le support Wanzo.')}
          </p>
        </div>
      </div>
    </div>
  );
}

export default NonAutorisePage;

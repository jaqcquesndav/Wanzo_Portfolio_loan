// src/components/auth/ProtectedRoute.tsx
// Guard global pour toutes les routes /app/*
// Vérifie : authentification + présence d'une institution

import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/useAuth';
import { Spinner } from '../ui/Spinner';

/**
 * Protège toutes les routes enfants.
 *
 * Règles :
 *  - loading           → spinner plein écran (attendre la résolution du contexte)
 *  - unauthenticated   → redirect vers / (page de login)
 *  - no_institution    → redirect vers /institution/required (page dédiée)
 *  - error             → redirect vers / avec param d'erreur
 *  - authenticated     → accès accordé (Outlet)
 *  - demo_mode         → accès accordé (Outlet) — mode démo activé consciemment
 */
export function ProtectedRoute() {
  const { contextStatus, isLoading } = useAuth();

  // Toujours attendre la résolution avant de décider
  if (isLoading || contextStatus === 'loading') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 gap-4">
        <Spinner size="lg" />
        <p className="text-sm text-gray-500 dark:text-gray-400">Vérification de l'accès…</p>
      </div>
    );
  }

  if (contextStatus === 'unauthenticated') {
    // Pas de token / session expirée → retour à la page de connexion
    return <Navigate to="/" replace />;
  }

  if (contextStatus === 'no_institution') {
    // Compte authentifié mais aucune institution associée
    return <Navigate to="/institution/required" replace />;
  }

  if (contextStatus === 'error') {
    // Erreur API non récupérée → retour login avec indicateur
    return <Navigate to="/?auth_error=1" replace />;
  }

  // contextStatus === 'authenticated' | 'demo_mode'
  return <Outlet />;
}

export default ProtectedRoute;
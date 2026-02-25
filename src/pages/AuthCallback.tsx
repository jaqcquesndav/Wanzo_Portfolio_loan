import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoadingScreen } from '../components/ui/LoadingScreen';
import { auth0Service } from '../services/api/auth/auth0Service';
import { userApi } from '../services/api/shared/user.api';
import { useAppContextStore } from '../stores/appContextStore';
import { useAuth } from '../contexts/useAuth';

// Flag global pour éviter le double échange de token (React StrictMode)
let isTokenExchangeInProgress = false;

// Fonction exportée pour réinitialiser le flag lors de la déconnexion
export function resetTokenExchangeFlag() {
  isTokenExchangeInProgress = false;
}

export default function AuthCallback() {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('Finalisation de votre connexion...');
  const { setContext: setGlobalContext } = useAppContextStore();
  const { updateAuthState } = useAuth();
  const hasProcessedRef = useRef(false);

  useEffect(() => {
    async function handleAuth() {
      // Protection contre le double rendu de React StrictMode
      // Le code d'autorisation Auth0 ne peut être utilisé qu'une seule fois
      if (hasProcessedRef.current || isTokenExchangeInProgress) {
        console.log('⏭️ Échange de token déjà en cours ou traité, skip...');
        return;
      }
      
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      const state = params.get('state');
      const error = params.get('error');
      const errorDescription = params.get('error_description');
      
      // Vérifier d'abord si Auth0 a renvoyé une erreur
      if (error) {
        console.error('Erreur Auth0:', error, errorDescription);
        setErrorMessage(`Erreur d'authentification: ${error}`);
        setErrorDetails(errorDescription || 'Aucun détail disponible');
        return;
      }
      
      const storedState = auth0Service.getState();
      const codeVerifier = auth0Service.getCodeVerifier();
      
      // Log pour debug
      console.log('🔍 Paramètres de callback:', {
        codeExists: !!code,
        stateExists: !!state,
        storedStateExists: !!storedState,
        stateMatch: state === storedState,
        codeVerifierExists: !!codeVerifier
      });
      
      if (!code || !state || state !== storedState || !codeVerifier) {
        console.error('Erreur d\'authentification: paramètres manquants ou invalides');
        setErrorMessage('Session d\'authentification expirée ou invalide');
        setErrorDetails('Les données de session ont peut-être expiré. Veuillez réessayer de vous connecter.');
        return;
      }
      
      // Exchange code for tokens
      const domain = import.meta.env.VITE_AUTH0_DOMAIN;
      const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID;
      const audience = import.meta.env.VITE_AUTH0_AUDIENCE;
      const redirectUri = `${window.location.origin}/auth/callback`;
      
      console.log('🔐 Configuration Auth0:', { domain, clientId: clientId?.substring(0, 8) + '...', audience });
      
      try {
        // Marquer que l'échange est en cours (protection StrictMode)
        isTokenExchangeInProgress = true;
        hasProcessedRef.current = true;
        
        // Marquer qu'on est en cours d'authentification (pour éviter la redirection 401)
        sessionStorage.setItem('auth_callback_in_progress', 'true');
        
        setStatusMessage('Échange des tokens...');
        console.log('Échange du code contre des tokens...');
        
        const tokenRequestBody = {
          grant_type: 'authorization_code',
          client_id: clientId,
          code_verifier: codeVerifier,
          code,
          redirect_uri: redirectUri,
          audience
        };
        
        console.log('📤 Requête /oauth/token:', {
          url: `https://${domain}/oauth/token`,
          redirectUri,
          codeVerifierLength: codeVerifier?.length,
          codeLength: code?.length,
          audience
        });
        
        const res = await fetch(`https://${domain}/oauth/token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(tokenRequestBody)
        });
        
        const data = await res.json();
        
        console.log('📥 Réponse Auth0 /oauth/token:', {
          hasAccessToken: !!data.access_token,
          hasIdToken: !!data.id_token,
          error: data.error,
          errorDescription: data.error_description,
          status: res.status
        });
        
        // Vérifier si Auth0 a renvoyé une erreur dans la réponse
        if (data.error) {
          console.error('❌ Erreur Auth0 token exchange:', data);
          setErrorMessage(`Erreur Auth0: ${data.error}`);
          setErrorDetails(data.error_description || 'Échec de l\'échange du code d\'autorisation');
          return;
        }
        
        if (data.access_token) {
          console.log('✅ Token récupéré avec succès!');
          
          // Stocker les tokens avec le service Auth0
          auth0Service.saveTokens(
            data.access_token,
            data.id_token,
            data.refresh_token
          );
          
          // Récupérer le profil utilisateur Auth0 (basique)
          try {
            setStatusMessage('Récupération du profil Auth0...');
            console.log('Récupération du profil utilisateur Auth0...');
            const userRes = await fetch(`https://${domain}/userinfo`, {
              headers: { Authorization: `Bearer ${data.access_token}` }
            });
            
            if (userRes.ok) {
              const auth0User = await userRes.json();
              auth0Service.saveUser(auth0User);
              console.log('✅ Profil Auth0 récupéré:', auth0User.email);
            }
          } catch (userInfoError) {
            console.error('Erreur lors de la récupération du profil Auth0:', userInfoError);
            // Continue despite userinfo fetch error
          }
          
          // CRITIQUE: Charger le contexte complet depuis /users/me
          setStatusMessage('Chargement de votre contexte...');
          console.log('🔄 Chargement du contexte depuis /users/me...');
          
          try {
            const meResponse = await userApi.getCurrentUserWithInstitution();
            console.log('📦 Réponse brute /users/me:', meResponse);
            
            // Gérer la double-enveloppe: le backend peut retourner { data: { user, institution, ... } }
            // ou directement { user, institution, ... } selon la configuration de l'API
            const responseData = (meResponse as { data?: unknown }).data || meResponse;
            const { user: userData, institution: institutionData, auth0Id, role, permissions } = responseData as {
              user: typeof meResponse.user;
              institution: typeof meResponse.institution;
              auth0Id: string;
              role: string;
              permissions: string[];
            };
            
            console.log('📦 Données extraites après parsing:', { userData, institutionData, auth0Id });
            
            // Log détaillé pour le debugging
            console.log('👤 Données utilisateur:', {
              id: userData?.id,
              name: userData?.name,
              firstName: userData?.firstName,
              lastName: userData?.lastName,
              email: userData?.email,
              institutionId: userData?.institutionId,
              role: userData?.role
            });
            console.log('🏢 Données institution:', {
              id: institutionData?.id,
              name: institutionData?.name,
              type: institutionData?.type,
              metadata: (institutionData as Record<string, unknown>)?.metadata
            });
            
            // Construire le nom complet si nécessaire (API peut retourner firstName/lastName au lieu de name)
            const firstName = userData?.firstName || userData?.givenName || '';
            const lastName = userData?.lastName || userData?.familyName || '';
            const fullName = userData?.name || `${firstName} ${lastName}`.trim() || userData?.email?.split('@')[0] || 'Utilisateur';
            
            // Construire l'utilisateur avec le nom correctement mappé
            const mappedUser = {
              ...userData,
              name: fullName,
              givenName: firstName,
              familyName: lastName,
              role: role || userData.role,
              permissions
            };
            
            // Vérifier si l'utilisateur a une institution
            // L'institution peut être fournie directement ou via userData.institutionId
            const hasInstitution = (institutionData && institutionData.id) || userData?.institutionId;
            const effectiveInstitutionId = institutionData?.id || userData?.institutionId;
            
            if (hasInstitution) {
              // Institution présente - synchroniser avec le store global
              console.log('✅ Contexte chargé avec institution:', institutionData?.name || userData?.institutionId);
              
              setGlobalContext({
                user: mappedUser,
                institution: institutionData,
                institutionId: effectiveInstitutionId,  // EXPLICITE: pour que le store ait l'ID
                auth0Id,
                permissions: permissions || []
              });

              // ── CORRECTIF DOUBLE-LOGIN ─────────────────────────────────────────────
              // Mettre à jour le React state d'AuthContext AVANT de naviguer.
              // Sans ça, ProtectedRoute lirait contextStatus='unauthenticated' (défini
              // par checkAuth qui s'est exécuté avant que le token soit disponible) et
              // redirigerait vers '/', forçant l'utilisateur à se connecter deux fois.
              updateAuthState(
                mappedUser,
                institutionData,
                effectiveInstitutionId ?? null,
                auth0Id,
                permissions || []
              );
              // ──────────────────────────────────────────────────────────────────────
              
              // Nettoyer les données temporaires et rediriger
              auth0Service.clearAuthTemp();
              localStorage.removeItem('wanzo_no_institution');
              console.log('🚀 Redirection vers /app/traditional');
              navigate('/app/traditional');
              
            } else {
              // Pas d'institution — accès refusé immédiatement, pas de mode démo silencieux
              console.warn('⚠️ Utilisateur authentifié mais SANS institution — accès refusé');

              // Stocker les infos utilisateur pour que NoInstitutionPage puisse afficher son nom/email
              if (userData) {
                setGlobalContext({
                  user: mappedUser,
                  institution: null,
                  auth0Id,
                  permissions: permissions || []
                });
              }

              auth0Service.clearAuthTemp();
              localStorage.setItem('wanzo_no_institution', 'true');

              // ── CORRECTIF DOUBLE-LOGIN ─────────────────────────────────────────────
              updateAuthState(mappedUser, null, null, auth0Id, permissions || []);
              // ──────────────────────────────────────────────────────────────────────

              // Rediriger directement vers la page "institution requise" — ne jamais entrer dans l'app
              console.log('🚫 Redirection vers /institution/required (pas d\'institution)');
              navigate('/institution/required', { replace: true });
            }

          } catch (meError) {
            console.error('❌ Erreur /users/me:', meError);

            // En cas d'erreur backend, on refuse l'accès plutôt que de laisser entrer silencieusement
            const auth0User = auth0Service.getUser();
            if (auth0User) {
              console.log('🔄 Fallback: stockage des données Auth0 locales sans accès app');
              setGlobalContext({
                user: auth0User,
                institution: null,
                auth0Id: auth0User.id,
                permissions: auth0User.permissions || []
              });
            }

            // Marquer le backend comme indisponible
            localStorage.setItem('wanzo_no_institution', 'true');
            localStorage.setItem('wanzo_backend_unavailable', 'true');
            
            auth0Service.clearAuthTemp();
            // ── CORRECTIF DOUBLE-LOGIN ─────────────────────────────────────────────
            if (auth0User) {
              updateAuthState(
                auth0User as Parameters<typeof updateAuthState>[0],
                null,
                null,
                auth0User.id ?? '',
                (auth0User.permissions as string[]) || []
              );
            }
            // ──────────────────────────────────────────────────────────────────────
            console.log('� Redirection vers /institution/required (backend indisponible)');
            navigate('/institution/required', { replace: true });
          }
          
        } else {
          // Token non reçu - afficher l'erreur Auth0 avec plus de détails
          console.error('❌ Token non reçu. Réponse Auth0:', data);
          console.error('❌ Détails de la requête:', {
            domain,
            redirectUri,
            codeVerifierLength: codeVerifier?.length,
            codeLength: code?.length
          });
          setErrorMessage('Impossible de récupérer le token d\'accès');
          setErrorDetails(
            data.error_description || 
            data.error || 
            `Statut HTTP: ${res.status}. Vérifiez la console pour plus de détails.`
          );
        }
      } catch (error) {
        console.error('❌ Erreur lors de la connexion à Auth0:', error);
        setErrorMessage('Erreur de connexion');
        setErrorDetails(error instanceof Error ? error.message : 'Une erreur inattendue s\'est produite');
      } finally {
        // Nettoyage du flag d'auth en cours
        isTokenExchangeInProgress = false;
        sessionStorage.removeItem('auth_callback_in_progress');
      }
    }
    
    handleAuth();
  }, [navigate, setGlobalContext]);

  // Fonction pour réessayer la connexion
  const handleRetry = () => {
    // Nettoyer les données temporaires avant de réessayer
    auth0Service.clearAuthTemp();
    localStorage.removeItem('wanzo_no_institution');
    localStorage.removeItem('wanzo_backend_unavailable');
    navigate('/');
  };

  if (errorMessage) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-red-50 dark:bg-gray-900">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-red-700 dark:text-red-400">Erreur d'authentification</h1>
          </div>
          
          <p className="text-gray-700 dark:text-gray-300 mb-2">{errorMessage}</p>
          
          {errorDetails && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded">
              {errorDetails}
            </p>
          )}
          
          <div className="space-y-2">
            <button 
              onClick={handleRetry}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors"
            >
              Réessayer la connexion
            </button>
            <button 
              onClick={() => navigate('/')}
              className="w-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-medium py-2 px-4 rounded transition-colors"
            >
              Retour à l'accueil
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <LoadingScreen message={statusMessage} />;
}

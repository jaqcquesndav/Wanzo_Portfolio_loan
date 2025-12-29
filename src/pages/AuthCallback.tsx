import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoadingScreen } from '../components/ui/LoadingScreen';
import { auth0Service } from '../services/api/auth/auth0Service';
import { userApi } from '../services/api/shared/user.api';
import { useAppContextStore } from '../stores/appContextStore';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('Finalisation de votre connexion...');
  const { setContext: setGlobalContext } = useAppContextStore();

  useEffect(() => {
    async function handleAuth() {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      const state = params.get('state');
      const storedState = auth0Service.getState();
      const codeVerifier = auth0Service.getCodeVerifier();
      
      if (!code || !state || state !== storedState || !codeVerifier) {
        console.error('Erreur d\'authentification: paramètres manquants ou invalides', {
          codeExists: !!code,
          stateExists: !!state,
          storedStateExists: !!storedState,
          stateMatch: state === storedState,
          codeVerifierExists: !!codeVerifier
        });
        setErrorMessage('Erreur d\'authentification: paramètres manquants ou invalides');
        return;
      }
      
      // Exchange code for tokens
      const domain = import.meta.env.VITE_AUTH0_DOMAIN;
      const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID;
      const redirectUri = `${window.location.origin}/auth/callback`;
      
      try {
        setStatusMessage('Échange des tokens...');
        console.log('Échange du code contre des tokens...');
        
        const res = await fetch(`https://${domain}/oauth/token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            grant_type: 'authorization_code',
            client_id: clientId,
            code_verifier: codeVerifier,
            code,
            redirect_uri: redirectUri,
            audience: import.meta.env.VITE_AUTH0_AUDIENCE
          })
        });
        
        const data = await res.json();
        
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
              console.log('✅ Profil Auth0 récupéré');
            }
          } catch (error) {
            console.error('Erreur lors de la récupération du profil Auth0:', error);
            // Continue despite userinfo fetch error
          }
          
          // CRITIQUE: Charger le contexte complet depuis /users/me
          setStatusMessage('Chargement de votre contexte...');
          console.log('🔄 Chargement du contexte depuis /users/me...');
          
          try {
            const meResponse = await userApi.getCurrentUserWithInstitution();
            const { user: userData, institution: institutionData, auth0Id, role, permissions } = meResponse;
            
            // Vérifier si l'utilisateur a une institution
            if (institutionData && institutionData.id) {
              // Institution présente - synchroniser avec le store global
              console.log('✅ Contexte chargé avec institution:', institutionData.name);
              
              setGlobalContext({
                user: { ...userData, role: role || userData.role, permissions },
                institution: institutionData,
                auth0Id,
                permissions: permissions || []
              });
              
              // Nettoyer les données temporaires et rediriger
              auth0Service.clearAuthTemp();
              console.log('🚀 Redirection vers /app/traditional');
              navigate('/app/traditional');
              
            } else {
              // Pas d'institution - rediriger avec un flag
              console.warn('⚠️ Utilisateur sans institution');
              auth0Service.clearAuthTemp();
              
              // Stocker l'info que l'utilisateur n'a pas d'institution
              localStorage.setItem('wanzo_no_institution', 'true');
              
              // Rediriger vers l'app - le composant gérera l'affichage du choix
              console.log('🚀 Redirection vers /app/traditional (sans institution)');
              navigate('/app/traditional');
            }
            
          } catch (meError) {
            console.error('❌ Erreur /users/me:', meError);
            
            // En cas d'erreur API, on redirige quand même vers l'app
            // L'AuthContext gérera le fallback
            auth0Service.clearAuthTemp();
            console.log('🚀 Redirection vers /app/traditional (fallback)');
            navigate('/app/traditional');
          }
          
        } else {
          console.error('Erreur lors de la récupération du token:', data);
          setErrorMessage('Erreur lors de la récupération du token.');
        }
      } catch (error) {
        console.error('Erreur lors de la connexion à Auth0:', error);
        setErrorMessage('Erreur lors de la connexion à Auth0.');
      }
    }
    
    handleAuth();
  }, [navigate, setGlobalContext]);

  if (errorMessage) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-red-50">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
          <h1 className="text-xl font-bold text-red-700 mb-4">Erreur d'authentification</h1>
          <p className="text-gray-700 mb-6">{errorMessage}</p>
          <button 
            onClick={() => navigate('/')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  return <LoadingScreen message={statusMessage} />;
}

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLoading } from '../components/ui/AppLoading';
import { auth0Service } from '../services/auth/auth0Service';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
      const redirectUri = import.meta.env.VITE_AUTH0_REDIRECT_URI;
      
      try {
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
          console.log('Token récupéré avec succès!');
          
          // Stocker les tokens avec le service Auth0
          auth0Service.saveTokens(
            data.access_token,
            data.id_token,
            data.refresh_token
          );
          
          // Récupérer le profil utilisateur Auth0
          try {
            console.log('Récupération du profil utilisateur...');
            const userRes = await fetch(`https://${domain}/userinfo`, {
              headers: { Authorization: `Bearer ${data.access_token}` }
            });
            
            if (userRes.ok) {
              const user = await userRes.json();
              // Sauvegarder les informations utilisateur avec le service Auth0
              auth0Service.saveUser(user);
              console.log('Profil utilisateur récupéré avec succès!');
            }
          } catch (error) {
            console.error('Erreur lors de la récupération du profil utilisateur:', error);
            // Continue despite userinfo fetch error
          }
          
          // Nettoyer les données d'authentification temporaires
          auth0Service.clearAuthTemp();
          
          // Redirect to app
          const portfolioType = localStorage.getItem('portfolioType') || 'leasing';
          console.log(`Redirection vers /app/${portfolioType}...`);
          navigate(`/app/${portfolioType}`);
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
  }, [navigate]);

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

  return <AppLoading message="Finalisation de votre connexion..." />;
}

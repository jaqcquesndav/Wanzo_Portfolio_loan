import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    async function handleAuth() {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      const state = params.get('state');
      const storedState = localStorage.getItem('auth0_state');
      const codeVerifier = localStorage.getItem('auth0_code_verifier');
      if (!code || !state || state !== storedState || !codeVerifier) {
        alert('Erreur d\'authentification.');
        return;
      }
      // Exchange code for tokens
      const domain = import.meta.env.VITE_AUTH0_DOMAIN;
      const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID;
      const redirectUri = import.meta.env.VITE_AUTH0_REDIRECT_URI;
      try {
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
          localStorage.setItem('token', data.access_token);
          if (data.id_token) localStorage.setItem('id_token', data.id_token);
          if (data.refresh_token) localStorage.setItem('refresh_token', data.refresh_token);
          // Optionally decode id_token for roles/permissions
          // Redirect to app
          const portfolioType = localStorage.getItem('portfolioType') || 'leasing';
          navigate(`/app/${portfolioType}`);
        } else {
          alert('Erreur lors de la récupération du token.');
        }
      } catch {
        alert('Erreur lors de la connexion à Auth0.');
      }
    }
    handleAuth();
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="text-lg">Connexion en cours...</div>
    </div>
  );
}

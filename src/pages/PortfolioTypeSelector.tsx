import { usePortfolioContext } from '../contexts/usePortfolioContext';
import { auth0Service } from '../services/api/auth/auth0Service';
import { Shield, Lock, ArrowRight } from '../components/ui/icons';
import { MultiSegmentSpinner } from '../components/ui/MultiSegmentSpinner';
import { useState } from 'react';

export default function PortfolioTypeSelector() {
  const { setPortfolioType } = usePortfolioContext();
  const [isLoading, setIsLoading] = useState(false);

  // PKCE code challenge generation utility
  function base64URLEncode(str: ArrayBuffer) {
    return btoa(String.fromCharCode(...new Uint8Array(str)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }

  async function sha256(plain: string) {
    const encoder = new TextEncoder();
    const data = encoder.encode(plain);
    return await window.crypto.subtle.digest('SHA-256', data);
  }

  async function handleSelect(type: string) {
    setIsLoading(true);
    
    try {
      setPortfolioType(type as 'traditional');
      localStorage.setItem('portfolioType', type);

      // PKCE
      const codeVerifier = base64URLEncode(window.crypto.getRandomValues(new Uint8Array(32)).buffer);
      const codeChallenge = base64URLEncode(await sha256(codeVerifier));
      auth0Service.saveCodeVerifier(codeVerifier);

      const domain = import.meta.env.VITE_AUTH0_DOMAIN;
      const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID;
      const audience = import.meta.env.VITE_AUTH0_AUDIENCE;
      const redirectUri = import.meta.env.VITE_AUTH0_REDIRECT_URI;
      const state = Math.random().toString(36).substring(2);
      auth0Service.saveState(state);

      const params = new URLSearchParams({
        client_id: clientId,
        response_type: 'code',
        redirect_uri: redirectUri,
        audience,
        scope: 'openid profile email',
        state,
        code_challenge: codeChallenge,
        code_challenge_method: 'S256',
      });
      
      // Redirection vers Auth0
      window.location.href = `https://${domain}/authorize?${params.toString()}`;
    } catch (error) {
      console.error('Erreur lors de la connexion Auth0:', error);
      setIsLoading(false);
    }
  }

  return (
    <div className="container mx-auto min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary-light to-primary-light/50">
      <div className="max-w-md w-full mx-auto">
        {/* Logo et titre */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestion des portefeuilles de crédit</h1>
          <p className="text-gray-600">Connectez-vous de manière sécurisée pour accéder à votre tableau de bord</p>
        </div>

        {/* Carte de connexion Auth0 */}
        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Finance Traditionnelle</h2>
            <p className="text-gray-600 text-sm">Portefeuille bancaire, crédit, épargne, etc.</p>
          </div>

          <button
            onClick={() => handleSelect('traditional')}
            disabled={isLoading}
            className={`w-full font-semibold py-4 px-6 rounded-lg transition-all duration-200 flex items-center justify-center space-x-3 shadow-md transform ${
              isLoading 
                ? 'bg-primary/60 cursor-not-allowed' 
                : 'bg-primary hover:bg-primary-hover hover:shadow-lg hover:-translate-y-0.5'
            } text-white group`}
          >
            {isLoading ? (
              <>
                <MultiSegmentSpinner size="small" />
                <span>Redirection vers Auth0...</span>
              </>
            ) : (
              <>
                <Lock className="w-5 h-5 group-hover:animate-pulse" />
                <span>Se connecter avec Auth0</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
              </>
            )}
          </button>

          <div className="mt-6 text-center">
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
              <Shield className="w-4 h-4 text-green-500" />
              <span>Connexion sécurisée par Auth0</span>
            </div>
          </div>

          <div className="mt-4 text-xs text-gray-400 text-center">
            <div className="flex items-center justify-center space-x-1">
              <span>🔒</span>
              <span>Chiffrement SSL de niveau bancaire</span>
            </div>
          </div>
        </div>

        {/* Informations supplémentaires */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Première connexion ? Votre compte sera créé automatiquement</p>
        </div>
      </div>
    </div>
  );
}

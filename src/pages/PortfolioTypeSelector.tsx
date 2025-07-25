import { usePortfolioContext } from '../contexts/usePortfolioContext';
import { auth0Service } from '../services/api/auth/auth0Service';

const choices = [
  { type: 'traditional', label: 'Finance Traditionnelle', description: 'Portefeuille bancaire, cr�dit, �pargne, etc.' }
];

export default function PortfolioTypeSelector() {
  const { setPortfolioType } = usePortfolioContext();

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
    setPortfolioType(type as 'traditional');
    localStorage.setItem('portfolioType', type);

    // PKCE
    const codeVerifier = base64URLEncode(window.crypto.getRandomValues(new Uint8Array(32)));
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
    window.location.href = `https://${domain}/authorize?${params.toString()}`;
  }

  return (
    <div className="container mx-auto min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <h1 className="text-2xl font-bold mb-8">Gestion des portefeuilles de cr�dit</h1>
      <div className="grid grid-cols-1 gap-8">
        {choices.map(choice => (
          <button
            key={choice.type}
            onClick={() => handleSelect(choice.type)}
            className="bg-white shadow-md rounded-lg p-6 hover:bg-primary hover:text-white border border-gray-200 transition-all"
          >
            <div className="text-lg font-semibold mb-2">{choice.label}</div>
            <div className="text-sm text-gray-500">{choice.description}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

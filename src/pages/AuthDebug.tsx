/**
 * Page de diagnostic Auth0
 * Accessible via /auth/debug pour aider à résoudre les problèmes d'authentification
 */
import { useState, useEffect } from 'react';
import { auth0Service } from '../services/api/auth/auth0Service';
import { useAppContextStore } from '../stores/appContextStore';

export default function AuthDebug() {
  const [envVars, setEnvVars] = useState<Record<string, string | undefined>>({});
  const [storageData, setStorageData] = useState<Record<string, string | null>>({});
  const appContext = useAppContextStore();
  
  useEffect(() => {
    // Récupérer les variables d'environnement Auth0
    setEnvVars({
      VITE_AUTH0_DOMAIN: import.meta.env.VITE_AUTH0_DOMAIN,
      VITE_AUTH0_CLIENT_ID: import.meta.env.VITE_AUTH0_CLIENT_ID ? 
        import.meta.env.VITE_AUTH0_CLIENT_ID.substring(0, 10) + '...' : undefined,
      VITE_AUTH0_AUDIENCE: import.meta.env.VITE_AUTH0_AUDIENCE,
      VITE_AUTH0_REDIRECT_URI: import.meta.env.VITE_AUTH0_REDIRECT_URI,
      VITE_API_URL: import.meta.env.VITE_API_URL,
    });
    
    // Récupérer les données de stockage
    setStorageData({
      'auth0_state': auth0Service.getState(),
      'auth0_code_verifier': auth0Service.getCodeVerifier() ? 'SET' : null,
      'auth0_access_token': auth0Service.getAccessToken() ? 'SET' : null,
      'wanzo_no_institution': localStorage.getItem('wanzo_no_institution'),
      'wanzo_backend_unavailable': localStorage.getItem('wanzo_backend_unavailable'),
      'portfolioType': localStorage.getItem('portfolioType'),
    });
  }, []);

  const clearAllAuth = () => {
    auth0Service.clearAuth();
    auth0Service.clearAuthTemp();
    localStorage.removeItem('wanzo_no_institution');
    localStorage.removeItem('wanzo_backend_unavailable');
    localStorage.removeItem('app-context-storage');
    window.location.reload();
  };

  const testBackendConnection = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/health`);
      const data = await response.json();
      alert(`Backend status: ${response.status}\n${JSON.stringify(data, null, 2)}`);
    } catch (error) {
      alert(`Backend error: ${error}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
          🔧 Auth0 Debug Page
        </h1>
        
        {/* Environment Variables */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Variables d'environnement
          </h2>
          <table className="w-full text-sm">
            <tbody>
              {Object.entries(envVars).map(([key, value]) => (
                <tr key={key} className="border-b dark:border-gray-700">
                  <td className="py-2 font-mono text-gray-600 dark:text-gray-400">{key}</td>
                  <td className={`py-2 font-mono ${value ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {value || '❌ NOT SET'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Storage Data */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Données de stockage
          </h2>
          <table className="w-full text-sm">
            <tbody>
              {Object.entries(storageData).map(([key, value]) => (
                <tr key={key} className="border-b dark:border-gray-700">
                  <td className="py-2 font-mono text-gray-600 dark:text-gray-400">{key}</td>
                  <td className={`py-2 font-mono ${value ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`}>
                    {value || '(empty)'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* App Context */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            App Context Store
          </h2>
          <table className="w-full text-sm">
            <tbody>
              <tr className="border-b dark:border-gray-700">
                <td className="py-2 font-mono text-gray-600 dark:text-gray-400">isContextLoaded</td>
                <td className={`py-2 font-mono ${appContext.isContextLoaded ? 'text-green-600' : 'text-red-600'}`}>
                  {String(appContext.isContextLoaded)}
                </td>
              </tr>
              <tr className="border-b dark:border-gray-700">
                <td className="py-2 font-mono text-gray-600 dark:text-gray-400">institutionId</td>
                <td className="py-2 font-mono text-gray-900 dark:text-white">
                  {appContext.institutionId || '(null)'}
                </td>
              </tr>
              <tr className="border-b dark:border-gray-700">
                <td className="py-2 font-mono text-gray-600 dark:text-gray-400">auth0Id</td>
                <td className="py-2 font-mono text-gray-900 dark:text-white">
                  {appContext.auth0Id || '(null)'}
                </td>
              </tr>
              <tr className="border-b dark:border-gray-700">
                <td className="py-2 font-mono text-gray-600 dark:text-gray-400">user.email</td>
                <td className="py-2 font-mono text-gray-900 dark:text-white">
                  {appContext.user?.email || '(null)'}
                </td>
              </tr>
              <tr className="border-b dark:border-gray-700">
                <td className="py-2 font-mono text-gray-600 dark:text-gray-400">isDemoMode</td>
                <td className={`py-2 font-mono ${appContext.isDemoMode ? 'text-yellow-600' : 'text-gray-400'}`}>
                  {String(appContext.isDemoMode)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        {/* Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Actions
          </h2>
          <div className="space-y-3">
            <button
              onClick={clearAllAuth}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded transition-colors"
            >
              🗑️ Effacer toutes les données d'auth
            </button>
            <button
              onClick={testBackendConnection}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors"
            >
              🔌 Tester la connexion au backend
            </button>
            <button
              onClick={() => window.location.href = '/'}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded transition-colors"
            >
              ← Retour à l'accueil
            </button>
          </div>
        </div>
        
        {/* Instructions */}
        <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-700">
          <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
            📋 Checklist de dépannage
          </h3>
          <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1 list-disc list-inside">
            <li>Vérifiez que VITE_AUTH0_DOMAIN et VITE_AUTH0_CLIENT_ID sont définis</li>
            <li>Vérifiez que l'URL de callback ({window.location.origin}/auth/callback) est enregistrée dans Auth0</li>
            <li>Essayez d'effacer les données d'auth et de vous reconnecter</li>
            <li>Vérifiez la console du navigateur pour plus de détails</li>
            <li>Si le backend n'est pas disponible, l'app fonctionne en mode dégradé</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

import { Button } from '../ui/Button';

interface ErrorDisplayProps {
  title?: string;
  message?: string;
  errorDetails?: string;
  onReset?: () => Promise<void>;
}

export function ErrorDisplay({
  title = "Erreur lors du chargement du portefeuille",
  message = "Le portefeuille demandé n'a pas pu être trouvé ou une erreur est survenue.",
  errorDetails,
  onReset
}: ErrorDisplayProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex flex-col items-center space-y-4 text-center">
        <div className="w-16 h-16 flex items-center justify-center rounded-full bg-red-100">
          <svg
            className="w-8 h-8 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
        </div>
        
        <h3 className="text-xl font-semibold text-gray-900">
          {title}
        </h3>
        
        <p className="text-gray-600">
          {message}
        </p>
        
        {errorDetails && (
          <div className="mt-4 p-3 bg-gray-100 rounded text-left w-full">
            <p className="text-sm font-medium text-gray-900 mb-1">Message d'erreur:</p>
            <p className="text-sm text-gray-700 font-mono">{errorDetails}</p>
          </div>
        )}
        
        {onReset && (
          <div className="mt-6">
            <p className="text-sm text-gray-600 mb-2">
              Si vous rencontrez des problèmes avec les données mock, vous pouvez essayer de les réinitialiser:
            </p>
            <Button onClick={onReset}>
              Réinitialiser les données
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AlertCircle, ArrowLeft, Home } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';

export const OperationNotFound: React.FC = () => {
  const navigate = useNavigate();
  const params = useParams();
  
  const { portfolioId, disbursementId, repaymentId, requestId, contractId, guaranteeId } = params;
  
  const operationType = disbursementId ? 'virement' :
                       repaymentId ? 'remboursement' :
                       requestId ? 'demande de crédit' :
                       contractId ? 'contrat' :
                       guaranteeId ? 'garantie' : 'opération';
  
  const operationId = disbursementId || repaymentId || requestId || contractId || guaranteeId;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="h-6 w-6 text-orange-600 dark:text-orange-400" />
          </div>
          <CardTitle className="text-xl text-gray-900 dark:text-white">
            {operationType.charAt(0).toUpperCase() + operationType.slice(1)} introuvable
          </CardTitle>
        </CardHeader>
        
        <CardContent className="text-center space-y-4">
          <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
            <p>
              La {operationType} <span className="font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-xs">{operationId}</span> 
              {portfolioId && (
                <>
                  {' '}du portefeuille <span className="font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-xs">{portfolioId}</span>
                </>
              )} 
              {' '}n'a pas pu être trouvée.
            </p>
            <p>
              Elle peut avoir été supprimée, déplacée, ou ne pas encore exister.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              onClick={() => navigate(-1)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour
            </Button>
            
            {portfolioId && (
              <Button
                onClick={() => navigate(`/app/traditional/${portfolioId}`)}
                variant="outline"
                className="flex items-center gap-2"
              >
                Voir le portefeuille
              </Button>
            )}
            
            <Button
              onClick={() => navigate('/app/traditional')}
              className="flex items-center gap-2"
            >
              <Home className="h-4 w-4" />
              Accueil
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OperationNotFound;
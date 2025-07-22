import { useParams, useNavigate } from 'react-router-dom';
import { useCreditContracts } from '../hooks/useCreditContracts';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Breadcrumb } from '../components/common/Breadcrumb';
import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { ConfigureContractForm } from '../components/portfolio/traditional/contract/ConfigureContractForm';
import { creditContractsStorageService } from '../services/storage/creditContractsStorage';
import { useNotification } from '../contexts/NotificationContext';
import { CreditContract } from '../types/credit';

// Fonction utilitaire pour le formatage des montants
const formatAmount = (amount: number) => {
  return new Intl.NumberFormat('fr-FR', { 
    style: 'currency', 
    currency: 'XAF',
    maximumFractionDigits: 0
  }).format(amount);
};

// Fonction utilitaire pour le formatage des dates
const formatDate = (dateString: string | undefined) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date);
};

// Configuration des status pour l'affichage
const statusConfig: Record<string, { label: string; variant: "success" | "secondary" | "danger" | "warning" }> = {
  'active': { label: 'Actif', variant: 'success' },
  'closed': { label: 'Clôturé', variant: 'secondary' },
  'defaulted': { label: 'En défaut', variant: 'danger' },
  'suspended': { label: 'Suspendu', variant: 'warning' },
  'in_litigation': { label: 'En contentieux', variant: 'danger' }
};

export default function CreditContractDetail() {
  const { portfolioId, contractId } = useParams();
  const navigate = useNavigate();
  const { contracts, loading, error, fetchContracts } = useCreditContracts(portfolioId || 'default');
  const [isConfigureModalOpen, setIsConfigureModalOpen] = useState(false);
  const { showNotification } = useNotification();
  
  // Trouver le contrat correspondant
  const contract = contracts.find(c => c.id === contractId);

  // Gestionnaire pour mettre à jour le contrat
  const handleUpdateContract = async (updatedData: Partial<CreditContract>) => {
    try {
      if (!contractId) return;
      
      await creditContractsStorageService.updateContract(contractId, updatedData);
      showNotification('Contrat mis à jour avec succès', 'success');
      fetchContracts(); // Rafraîchir les données pour afficher les modifications
    } catch (error) {
      console.error('Erreur lors de la mise à jour du contrat:', error);
      showNotification('Erreur lors de la mise à jour du contrat', 'error');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                <div className="h-5 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-50 p-4 rounded-md border border-red-200">
          <h3 className="text-lg font-medium text-red-800">Erreur</h3>
          <p className="mt-2 text-sm text-red-700">{error}</p>
          <Button 
            className="mt-4" 
            variant="outline" 
            onClick={() => navigate(`/app/traditional/${portfolioId || 'default'}`)}
          >
            Retour au portefeuille
          </Button>
        </div>
      </div>
    );
  }
  
  if (!contract) {
    return (
      <div className="container mx-auto p-6">
      <Breadcrumb 
        items={[
          { label: 'Portefeuilles', href: '/app/traditional' },
          { label: 'Traditionnel', href: '/app/traditional' },
          { label: `Portefeuille ${portfolioId ? portfolioId.slice(0, 8) : 'default'}`, href: `/app/traditional/${portfolioId || 'default'}` },
          { label: 'Contrat introuvable', href: '#' }
        ]} 
      />        <div className="bg-amber-50 p-4 rounded-md border border-amber-200 mt-4">
          <h3 className="text-lg font-medium text-amber-800">Contrat non trouvé</h3>
          <p className="mt-2 text-sm text-amber-700">
            Le contrat que vous recherchez n'existe pas ou a été supprimé.
          </p>
          <Button 
            className="mt-4" 
            variant="outline" 
            onClick={() => navigate(`/app/traditional/${portfolioId || 'default'}?tab=contracts`)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour aux contrats
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
    <Breadcrumb 
      items={[
        { label: 'Tableau de bord', href: '/app/traditional' },
        { label: 'Portefeuille', href: `/app/traditional/${portfolioId || 'default'}` },
        { label: 'Contrats', href: `/app/traditional/${portfolioId || 'default'}?tab=contracts` },
        { label: `${contract.reference}`, href: '#' }
      ]} 
    />      <div className="flex justify-between items-center my-6">
        <div>
          <h1 className="text-2xl font-bold">Contrat {contract.reference}</h1>
          <p className="text-gray-500">
            {contract.memberName} • {formatAmount(contract.amount)}
          </p>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline"
            onClick={() => navigate(`/app/traditional/${portfolioId || 'default'}/contracts/${contract.id}/schedule`)}
          >
            <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Voir l'échéancier
          </Button>
          <Button>
            <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            Exporter
          </Button>
        </div>
      </div>
      
      <Card className="p-6">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-xl font-semibold">Détails du contrat</h2>
          <Badge 
            variant={
              (statusConfig[contract.status] && statusConfig[contract.status].variant) 
                ? statusConfig[contract.status].variant 
                : "secondary"
            }
            className="text-sm"
          >
            {(statusConfig[contract.status] && statusConfig[contract.status].label) 
              ? statusConfig[contract.status].label 
              : contract.status}
          </Badge>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Référence</h3>
            <p className="font-mono text-lg">{contract.reference}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Client</h3>
            <p className="text-lg">{contract.memberName}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Produit</h3>
            <p className="text-lg">{contract.productName}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Montant</h3>
            <p className="text-lg">{formatAmount(contract.amount)}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Restant dû</h3>
            <p className="text-lg">{formatAmount(contract.remainingAmount)}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Taux d'intérêt</h3>
            <p className="text-lg">{contract.interestRate.toFixed(2)}%</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Date de début</h3>
            <p className="text-lg">{formatDate(contract.startDate)}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Date de fin</h3>
            <p className="text-lg">{formatDate(contract.endDate)}</p>
          </div>
          {contract.lastPaymentDate && (
            <div>
              <h3 className="text-sm font-medium text-gray-500">Dernier paiement</h3>
              <p className="text-lg">{formatDate(contract.lastPaymentDate)}</p>
            </div>
          )}
          {contract.nextPaymentDate && (
            <div>
              <h3 className="text-sm font-medium text-gray-500">Prochain paiement</h3>
              <p className="text-lg">{formatDate(contract.nextPaymentDate)}</p>
            </div>
          )}
          <div>
            <h3 className="text-sm font-medium text-gray-500">Valeur des garanties</h3>
            <p className="text-lg">{formatAmount(contract.guaranteesTotalValue)}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Classe de risque</h3>
            <p className="text-lg">{contract.riskClass}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          <Card className="p-4 bg-gray-50">
            <h3 className="text-lg font-medium mb-4">Actions sur le contrat</h3>
            <div className="grid grid-cols-2 gap-2">
              {contract.status === 'active' && (
                <>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setIsConfigureModalOpen(true)}
                  >
                    Configurer
                  </Button>
                  <Button variant="outline" size="sm">Suspendre</Button>
                  <Button variant="outline" size="sm">Clôturer</Button>
                  <Button variant="outline" size="sm" className="text-amber-600">Marquer en défaut</Button>
                  <Button variant="outline" size="sm" className="text-red-600">Mettre en contentieux</Button>
                </>
              )}
              {contract.status === 'suspended' && (
                <>
                  <Button variant="outline" size="sm">Réactiver</Button>
                  <Button variant="outline" size="sm">Clôturer</Button>
                </>
              )}
              {contract.status === 'defaulted' && (
                <>
                  <Button variant="outline" size="sm">Réactiver</Button>
                  <Button variant="outline" size="sm" className="text-red-600">Mettre en contentieux</Button>
                </>
              )}
              {contract.status === 'in_litigation' && (
                <Button variant="outline" size="sm">Réactiver</Button>
              )}
              {contract.status === 'closed' && (
                <Button variant="outline" size="sm">Réactiver</Button>
              )}
            </div>
          </Card>
          
          <Card className="p-4 bg-gray-50">
            <h3 className="text-lg font-medium mb-4">Documents associés</h3>
            <p className="text-gray-500 text-sm mb-4">Documents relatifs au contrat</p>
            <div className="space-y-2">
              <Button variant="outline" size="sm" className="w-full flex justify-between">
                Contrat original
                <span className="text-blue-600">Télécharger</span>
              </Button>
              <Button variant="outline" size="sm" className="w-full flex justify-between">
                Échéancier de remboursement
                <span className="text-blue-600">Télécharger</span>
              </Button>
              <Button variant="outline" size="sm" className="w-full flex justify-between">
                Historique des paiements
                <span className="text-blue-600">Télécharger</span>
              </Button>
            </div>
          </Card>
        </div>
      </Card>
      
      {/* Formulaire de configuration du contrat */}
      {contract && (
        <ConfigureContractForm 
          isOpen={isConfigureModalOpen}
          onClose={() => setIsConfigureModalOpen(false)}
          onSave={handleUpdateContract}
          contract={contract}
        />
      )}
    </div>
  );
}

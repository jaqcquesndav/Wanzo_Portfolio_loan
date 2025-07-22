import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCreditContracts } from '../../../../hooks/useCreditContracts';
import { Card } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { Breadcrumb } from '../../../../components/common/Breadcrumb';
import { ArrowLeft } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../../components/ui/Table';
import { Badge } from '../../../../components/ui/Badge';
import { CreditContract } from '../../../../types/credit';

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

// Types pour les éléments d'échéancier
interface ScheduleItem {
  id: string;
  dueDate: string;
  principal: number;
  interest: number;
  totalPayment: number;
  remainingBalance: number;
  status: 'paid' | 'due' | 'overdue' | 'pending';
}

interface CreditContractScheduleProps {
  contractId?: string;
}

export function CreditContractSchedule({ contractId: propContractId }: CreditContractScheduleProps) {
  const { portfolioId, contractId: urlContractId } = useParams();
  const navigate = useNavigate();
  const { contracts, loading, error } = useCreditContracts(portfolioId || 'default');
  
  // Utiliser le contractId du prop s'il est fourni, sinon utiliser celui de l'URL
  const effectiveContractId = propContractId || urlContractId;
  
  // État pour les éléments d'échéancier
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([]);
  
  // Trouver le contrat correspondant
  const contract = contracts.find((c: CreditContract) => c.id === effectiveContractId);

  // Générer des données d'échéancier simulées basées sur les détails du contrat
  useEffect(() => {
    if (contract) {
      const items: ScheduleItem[] = [];
      const startDate = new Date(contract.startDate);
      const endDate = new Date(contract.endDate);
      const amount = contract.amount;
      
      // Calculer la durée en mois entre la date de début et la date de fin
      const termInMonths = 
        (endDate.getFullYear() - startDate.getFullYear()) * 12 + 
        (endDate.getMonth() - startDate.getMonth());
      
      const rate = contract.interestRate || 0.1; // Taux d'intérêt annuel, par défaut 10%
      
      // Calcul simple d'un échéancier à amortissement constant
      const monthlyPrincipal = amount / termInMonths;
      let remainingBalance = amount;
      
      for (let i = 0; i < termInMonths; i++) {
        const dueDate = new Date(startDate);
        dueDate.setMonth(dueDate.getMonth() + i + 1);
        
        const monthlyInterest = remainingBalance * (rate / 12);
        const payment = monthlyPrincipal + monthlyInterest;
        remainingBalance -= monthlyPrincipal;
        
        // Déterminer le statut en fonction de la date d'échéance
        const now = new Date();
        let status: 'paid' | 'due' | 'overdue' | 'pending' = 'pending';
        
        if (dueDate < now) {
          // Simuler que les premières échéances sont payées
          if (i < 3) {
            status = 'paid';
          } else {
            status = 'overdue';
          }
        } else if (dueDate.getMonth() === now.getMonth() && dueDate.getFullYear() === now.getFullYear()) {
          status = 'due';
        }
        
        items.push({
          id: `schedule-${contract.id}-${i + 1}`,
          dueDate: dueDate.toISOString(),
          principal: monthlyPrincipal,
          interest: monthlyInterest,
          totalPayment: payment,
          remainingBalance: Math.max(0, remainingBalance),
          status
        });
      }
      
      setScheduleItems(items);
    }
  }, [contract]);

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-6"></div>
          <div className="h-64 bg-gray-200 rounded w-full"></div>
        </div>
      </div>
    );
  }
  
  if (error || !contract) {
    return (
      <div className="flex flex-col w-full">
        <Breadcrumb
          items={[
            { label: 'Accueil', href: '/app/dashboard' },
            { label: 'Portefeuilles', href: '/app/portfolio' },
            { label: 'Détails', href: `/app/portfolio/${portfolioId}` },
            { label: 'Contrats', href: `/app/portfolio/${portfolioId}/contracts` },
            { label: 'Échéancier', href: '#' }
          ]}
        />
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mt-4">
          <div className="flex items-center mb-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(-1)}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
            <h2 className="text-2xl font-bold">Échéancier de remboursement</h2>
          </div>
          <Card className="p-6 bg-gray-100 dark:bg-gray-700 mb-6">
            <p className="text-lg">Contrat non trouvé : {effectiveContractId}</p>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              {error || "Le contrat que vous recherchez n'existe pas ou n'est pas accessible."}
            </p>
          </Card>
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
          { label: contract.reference, href: `/app/portfolio/${portfolioId || 'default'}/contracts/${effectiveContractId}` },
          { label: 'Échéancier', href: '#' }
        ]} 
      />
      
      <div className="flex justify-between items-center my-6">
        <div>
          <h1 className="text-2xl font-bold">Échéancier - Contrat {contract.reference}</h1>
          <p className="text-gray-500">
            {contract.memberName} • {formatAmount(contract.amount)}
          </p>
        </div>
        <div className="flex space-x-2">
          <Button>
            <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            Exporter
          </Button>
          <Button 
            variant="outline" 
            onClick={() => navigate(`/app/portfolio/${portfolioId || 'default'}/contracts/${effectiveContractId}`)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour au contrat
          </Button>
        </div>
      </div>
      
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Tableau d'amortissement</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-50 p-4 rounded-md">
            <div className="text-sm text-gray-500">Capital</div>
            <div className="text-lg font-bold">{formatAmount(contract.amount)}</div>
          </div>
          <div className="bg-gray-50 p-4 rounded-md">
            <div className="text-sm text-gray-500">Taux d'intérêt</div>
            <div className="text-lg font-bold">{(contract.interestRate || 0.1) * 100}%</div>
          </div>
          <div className="bg-gray-50 p-4 rounded-md">
            <div className="text-sm text-gray-500">Durée</div>
            <div className="text-lg font-bold">
              {(() => {
                const startDate = new Date(contract.startDate);
                const endDate = new Date(contract.endDate);
                const months = (endDate.getFullYear() - startDate.getFullYear()) * 12 + 
                  (endDate.getMonth() - startDate.getMonth());
                return `${months} mois`;
              })()}
            </div>
          </div>
          <div className="bg-gray-50 p-4 rounded-md">
            <div className="text-sm text-gray-500">Date de début</div>
            <div className="text-lg font-bold">{formatDate(contract.startDate)}</div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <Table>
            <TableHead>
              <TableRow>
                <TableHeader>N°</TableHeader>
                <TableHeader>Date d'échéance</TableHeader>
                <TableHeader>Principal</TableHeader>
                <TableHeader>Intérêts</TableHeader>
                <TableHeader>Montant total</TableHeader>
                <TableHeader>Capital restant</TableHeader>
                <TableHeader>Statut</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {scheduleItems.map((item, index) => (
                <TableRow key={item.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{formatDate(item.dueDate)}</TableCell>
                  <TableCell>{formatAmount(item.principal)}</TableCell>
                  <TableCell>{formatAmount(item.interest)}</TableCell>
                  <TableCell className="font-bold">{formatAmount(item.totalPayment)}</TableCell>
                  <TableCell>{formatAmount(item.remainingBalance)}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={
                        item.status === 'paid' ? 'success' :
                        item.status === 'due' ? 'warning' :
                        item.status === 'overdue' ? 'danger' :
                        'secondary'
                      }
                    >
                      {item.status === 'paid' ? 'Payé' :
                       item.status === 'due' ? 'À payer' :
                       item.status === 'overdue' ? 'En retard' :
                       'À venir'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}

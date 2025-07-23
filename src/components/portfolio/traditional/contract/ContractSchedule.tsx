// components/portfolio/traditional/contract/ContractSchedule.tsx
import { useState, useEffect } from 'react';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../../../ui/Table';
import { Button } from '../../../ui/Button';
import { Calendar, Download, Printer } from 'lucide-react';

interface ScheduleInstallment {
  id: string;
  number: number;
  dueDate: string;
  amount: number;
  principal: number;
  interest: number;
  remainingBalance: number;
  status: 'paid' | 'pending' | 'overdue' | 'upcoming';
  paymentDate?: string;
}

// Fonction utilitaire pour le formatage des montants
const formatAmount = (amount: number) => {
  return new Intl.NumberFormat('fr-FR', { 
    style: 'currency', 
    currency: 'XAF',
    maximumFractionDigits: 0
  }).format(amount);
};

// Fonction utilitaire pour le formatage des dates
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

interface ContractScheduleProps {
  contractId: string;
}

export function ContractSchedule({ contractId }: ContractScheduleProps) {
  const [installments, setInstallments] = useState<ScheduleInstallment[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Dans une application réelle, vous feriez un appel API ici
    // Simulation de données pour la démo
    const generateMockSchedule = () => {
      setLoading(true);
      
      // Générer un échéancier simulé
      const today = new Date();
      const mockInstallments: ScheduleInstallment[] = [];
      
      const loanAmount = 10000000; // 10 millions XAF
      const interestRate = 0.12; // 12% par an
      const term = 24; // 24 mois
      
      let remainingBalance = loanAmount;
      const monthlyRate = interestRate / 12;
      const monthlyPayment = (loanAmount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -term));
      
      for (let i = 1; i <= term; i++) {
        const dueDate = new Date(today);
        dueDate.setMonth(dueDate.getMonth() + i);
        
        const interest = remainingBalance * monthlyRate;
        const principal = monthlyPayment - interest;
        remainingBalance -= principal;
        
        // Déterminer le statut
        let status: ScheduleInstallment['status'] = 'upcoming';
        let paymentDate: string | undefined = undefined;
        
        if (i <= 3) {
          status = 'paid';
          const paymentDt = new Date(dueDate);
          paymentDt.setDate(paymentDt.getDate() - Math.floor(Math.random() * 5));
          paymentDate = paymentDt.toISOString();
        } else if (i === 4) {
          status = 'overdue';
        } else if (i === 5) {
          status = 'pending';
        }
        
        mockInstallments.push({
          id: `installment-${i}`,
          number: i,
          dueDate: dueDate.toISOString(),
          amount: monthlyPayment,
          principal,
          interest,
          remainingBalance: Math.max(0, remainingBalance),
          status,
          paymentDate
        });
      }
      
      setInstallments(mockInstallments);
      setLoading(false);
    };
    
    generateMockSchedule();
  }, [contractId]);

  const handleExport = () => {
    // Logique d'export PDF ici
    alert('Fonctionnalité d\'export à implémenter');
  };
  
  const handlePrint = () => {
    window.print();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Échéancier de remboursement</h2>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Imprimer
          </Button>
        </div>
      </div>
      
      {loading ? (
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-full mb-4"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-200 rounded w-full mb-2"></div>
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHead>
              <TableRow>
                <TableHeader>N°</TableHeader>
                <TableHeader>Date d'échéance</TableHeader>
                <TableHeader>Montant</TableHeader>
                <TableHeader>Principal</TableHeader>
                <TableHeader>Intérêts</TableHeader>
                <TableHeader>Capital restant</TableHeader>
                <TableHeader>Statut</TableHeader>
                <TableHeader>Date de paiement</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {installments.map((installment) => (
                <TableRow key={installment.id}>
                  <TableCell>{installment.number}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                      {formatDate(installment.dueDate)}
                    </div>
                  </TableCell>
                  <TableCell>{formatAmount(installment.amount)}</TableCell>
                  <TableCell>{formatAmount(installment.principal)}</TableCell>
                  <TableCell>{formatAmount(installment.interest)}</TableCell>
                  <TableCell>{formatAmount(installment.remainingBalance)}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        installment.status === 'paid' ? 'bg-green-100 text-green-800' :
                        installment.status === 'overdue' ? 'bg-red-100 text-red-800' :
                        installment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {installment.status === 'paid' ? 'Payé' :
                       installment.status === 'overdue' ? 'En retard' :
                       installment.status === 'pending' ? 'En attente' :
                       'À venir'}
                    </span>
                  </TableCell>
                  <TableCell>
                    {installment.paymentDate 
                      ? formatDate(installment.paymentDate)
                      : '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

// components/portfolio/traditional/contract/ContractRepayments.tsx
import { useState, useEffect } from 'react';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../../../ui/Table';
import { Button } from '../../../ui/Button';
import { Search, Plus, Download, Filter } from 'lucide-react';
import { useCurrencyContext } from '../../../../hooks/useCurrencyContext';

interface Repayment {
  id: string;
  date: string;
  amount: number;
  type: 'principal' | 'interest' | 'fees' | 'penalty';
  method: 'cash' | 'transfer' | 'check' | 'mobile_money';
  reference: string;
  installmentNumber?: number;
  notes?: string;
}

// Fonction utilitaire pour le formatage des montants
// const formatAmount = (amount: number) => {
//   return new Intl.NumberFormat('fr-FR', { 
//     style: 'currency', 
//     currency: 'XAF',
//     maximumFractionDigits: 0
//   }).format(amount);
// };

// Fonction utilitaire pour le formatage des dates
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

interface ContractRepaymentsProps {
  contractId: string;
}

export function ContractRepayments({ contractId }: ContractRepaymentsProps) {
  const [repayments, setRepayments] = useState<Repayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { formatAmount } = useCurrencyContext();
  
  useEffect(() => {
    // Dans une application Réelle, vous feriez un appel API ici
    // Simulation de données pour la dûmo
    const fetchRepayments = () => {
      setLoading(true);
      
      // Générer des remboursements simulés
      setTimeout(() => {
        const mockRepayments: Repayment[] = [
          {
            id: 'rep-001',
            date: new Date(2025, 4, 5).toISOString(),
            amount: 500000,
            type: 'principal',
            method: 'transfer',
            reference: 'TR-20250505-001',
            installmentNumber: 1,
            notes: 'Paiement reçu à temps'
          },
          {
            id: 'rep-002',
            date: new Date(2025, 5, 6).toISOString(),
            amount: 500000,
            type: 'principal',
            method: 'mobile_money',
            reference: 'MM-20250606-002',
            installmentNumber: 2,
            notes: 'Paiement reçu à temps'
          },
          {
            id: 'rep-003',
            date: new Date(2025, 6, 8).toISOString(),
            amount: 470000,
            type: 'principal',
            method: 'cash',
            reference: 'CASH-20250708-003',
            installmentNumber: 3,
            notes: 'Paiement partiel'
          },
          {
            id: 'rep-004',
            date: new Date(2025, 6, 15).toISOString(),
            amount: 30000,
            type: 'principal',
            method: 'cash',
            reference: 'CASH-20250715-004',
            installmentNumber: 3,
            notes: 'Complément du paiement partiel'
          },
          {
            id: 'rep-005',
            date: new Date(2025, 6, 15).toISOString(),
            amount: 25000,
            type: 'penalty',
            method: 'cash',
            reference: 'CASH-20250715-005',
            installmentNumber: 3,
            notes: 'Pénalité pour paiement tardif'
          }
        ];
        
        setRepayments(mockRepayments);
        setLoading(false);
      }, 1000);
    };
    
    fetchRepayments();
  }, [contractId]);

  const filteredRepayments = repayments.filter(repayment => 
    repayment.reference.toLowerCase().includes(search.toLowerCase()) ||
    repayment.notes?.toLowerCase().includes(search.toLowerCase())
  );
  
  const totalAmount = repayments.reduce((sum, repayment) => sum + repayment.amount, 0);

  const handleAddRepayment = () => {
    // Logique d'ajout de remboursement ici
    alert('Fonctionnalité d\'ajout de remboursement à implémenter');
  };
  
  const handleExport = () => {
    // Logique d'export ici
    alert('Fonctionnalité d\'export à implémenter');
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Historique des remboursements</h2>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={handleAddRepayment}>
            <Plus className="h-4 w-4 mr-2" />
            Ajouter un remboursement
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
        </div>
      </div>
      
      <div className="flex justify-between items-center mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Rechercher..."
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filtrer
          </Button>
          <div className="text-sm font-medium">
            Total: {formatAmount(totalAmount)}
          </div>
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
                <TableHeader>Date</TableHeader>
                <TableHeader>Montant</TableHeader>
                <TableHeader>Type</TableHeader>
                <TableHeader>Méthode</TableHeader>
                <TableHeader>référence</TableHeader>
                <TableHeader>échéance</TableHeader>
                <TableHeader>Notes</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRepayments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    Aucun remboursement trouvé
                  </TableCell>
                </TableRow>
              ) : (
                filteredRepayments.map((repayment) => (
                  <TableRow key={repayment.id}>
                    <TableCell>{formatDate(repayment.date)}</TableCell>
                    <TableCell>{formatAmount(repayment.amount)}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          repayment.type === 'principal' ? 'bg-blue-100 text-blue-800' :
                          repayment.type === 'interest' ? 'bg-green-100 text-green-800' :
                          repayment.type === 'fees' ? 'bg-purple-100 text-purple-800' :
                          'bg-red-100 text-red-800'
                        }`}
                      >
                        {repayment.type === 'principal' ? 'Principal' :
                         repayment.type === 'interest' ? 'Intérêts' :
                         repayment.type === 'fees' ? 'Frais' :
                         'Pénalité'}
                      </span>
                    </TableCell>
                    <TableCell>
                      {repayment.method === 'cash' ? 'Espèces' :
                       repayment.method === 'transfer' ? 'Virement' :
                       repayment.method === 'check' ? 'Chèque' :
                       'Mobile Money'}
                    </TableCell>
                    <TableCell>{repayment.reference}</TableCell>
                    <TableCell>
                      {repayment.installmentNumber 
                        ? `échéance ${repayment.installmentNumber}`
                        : '-'}
                    </TableCell>
                    <TableCell>{repayment.notes || '-'}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}




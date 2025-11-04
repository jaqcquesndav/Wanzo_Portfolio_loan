// components/portfolio/traditional/contract/ContractGuarantees.tsx
import { useState, useEffect } from 'react';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../../../ui/Table';
import { Button } from '../../../ui/Button';
import { Eye, Plus, Download } from 'lucide-react';
import { Guarantee } from '../../../../types/guarantee';

// Fonction utilitaire pour le formatage des montants
const formatAmount = (amount: number) => {
  return new Intl.NumberFormat('fr-FR', { 
    style: 'currency', 
    currency: 'XAF',
    maximumFractionDigits: 0
  }).format(amount);
};

interface ContractGuaranteesProps {
  contractId: string;
}

export function ContractGuarantees({ contractId }: ContractGuaranteesProps) {
  const [guarantees, setGuarantees] = useState<Guarantee[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Dans une application Réelle, vous feriez un appel API ici
    // Simulation de données pour la dûmo
    const fetchGuarantees = () => {
      setLoading(true);
      
      // Essayer de Récupérer les garanties depuis le localStorage
      try {
        const storedGuarantees = localStorage.getItem('wanzo_guarantees');
        if (storedGuarantees) {
          const allGuarantees: Guarantee[] = JSON.parse(storedGuarantees);
          // Filtrer par contractId
          const contractGuarantees = allGuarantees.filter(g => g.contractId === contractId);
          setGuarantees(contractGuarantees);
        } else {
          // Garanties simulées si aucune n'est trouvée
          const mockGuarantees: Guarantee[] = [
            {
              id: 'G001',
              company: 'PME Agro Sarl',
              type: 'Hypothèque',
              value: 15000000,
              status: 'active',
              created_at: '2025-01-15T10:00:00Z',
              requestId: 'REQ-001',
              portfolioId: 'trad-1',
              contractId: contractId,
              contractReference: 'CRDT-100000',
              details: {
                description: 'Terrain agricole avec bâtiments',
                location: 'Zone Sud, Parcelle 24',
                reference: 'HYPO-2025-001',
                coverage: 100
              }
            },
            {
              id: 'G002',
              company: 'PME Agro Sarl',
              type: 'Caution personnelle',
              value: 5000000,
              status: 'active',
              created_at: '2025-01-15T10:00:00Z',
              requestId: 'REQ-001',
              portfolioId: 'trad-1',
              contractId: contractId,
              contractReference: 'CRDT-100000',
              details: {
                description: 'Caution du directeur',
                guarantor: 'Jean Dupont',
                reference: 'CAUT-2025-001',
                coverage: 50
              }
            }
          ];
          setGuarantees(mockGuarantees);
        }
      } catch (error) {
        console.error('Erreur lors de la Récupération des garanties:', error);
        setGuarantees([]);
      }
      
      setLoading(false);
    };
    
    fetchGuarantees();
  }, [contractId]);

  const totalValue = guarantees.reduce((sum, guarantee) => sum + guarantee.value, 0);

  const handleAddGuarantee = () => {
    // Logique d'ajout de garantie ici
    alert('Fonctionnalité d\'ajout de garantie à implémenter');
  };
  
  const handleViewDetails = (guaranteeId: string) => {
    // Rediriger vers la page de dûtails de la garantie
    alert(`Voir les dûtails de la garantie ${guaranteeId}`);
  };
  
  const handleExport = () => {
    // Logique d'export ici
    alert('Fonctionnalité d\'export à implémenter');
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Garanties associées</h2>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={handleAddGuarantee}>
            <Plus className="h-4 w-4 mr-2" />
            Ajouter une garantie
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
        </div>
      </div>
      
      {/* KPI - Valeur totale des garanties */}
      <div className="bg-blue-50 p-4 rounded-lg mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-sm font-medium text-blue-800">Valeur totale des garanties</h3>
            <p className="text-2xl font-bold text-blue-900">{formatAmount(totalValue)}</p>
          </div>
          <div className="text-sm text-blue-700">
            {guarantees.length} garantie{guarantees.length > 1 ? 's' : ''}
          </div>
        </div>
      </div>
      
      {loading ? (
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-full mb-4"></div>
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-200 rounded w-full mb-2"></div>
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHead>
              <TableRow>
                <TableHeader>Type</TableHeader>
                <TableHeader>Description</TableHeader>
                <TableHeader>Valeur</TableHeader>
                <TableHeader>Statut</TableHeader>
                <TableHeader>référence</TableHeader>
                <TableHeader>Date d'ajout</TableHeader>
                <TableHeader>Actions</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {guarantees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    Aucune garantie associée à ce contrat
                  </TableCell>
                </TableRow>
              ) : (
                guarantees.map((guarantee) => (
                  <TableRow key={guarantee.id}>
                    <TableCell>
                      <span className="font-medium">{guarantee.type}</span>
                    </TableCell>
                    <TableCell>
                      {guarantee.details?.description || '-'}
                    </TableCell>
                    <TableCell>{formatAmount(guarantee.value)}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          guarantee.status === 'active' ? 'bg-green-100 text-green-800' :
                          guarantee.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {guarantee.status === 'active' ? 'Active' :
                         guarantee.status === 'pending' ? 'En attente' :
                         guarantee.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      {guarantee.details?.reference || '-'}
                    </TableCell>
                    <TableCell>
                      {new Date(guarantee.created_at).toLocaleDateString('fr-FR')}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetails(guarantee.id)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        dûtails
                      </Button>
                    </TableCell>
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




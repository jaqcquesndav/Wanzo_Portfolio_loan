// src/pages/LeasingContractDetail.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { LeasingContractDetailsResponsive } from '../components/portfolio/leasing/contract/LeasingContractDetailsResponsive';
import { PageHeader, Button } from '../components/ui';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useNotification } from '../contexts/NotificationContext';
import { mockLeasingPortfolios } from '../data/mockLeasingPortfolios';
import { mockEquipments } from '../data/mockEquipments';

interface LeasingContract {
  id: string;
  equipment_id: string;
  equipment_name?: string;
  equipment_category?: string;
  equipment_manufacturer?: string;
  equipment_model?: string;
  client_id: string;
  client_name?: string;
  start_date: string;
  end_date: string;
  monthly_payment: number;
  interest_rate: number;
  maintenance_included: boolean;
  insurance_included: boolean;
  status: 'active' | 'pending' | 'completed' | 'terminated';
  residual_value?: number;
  total_value?: number;
  payments_made?: number;
  remaining_payments?: number;
  last_payment_date?: string;
  next_payment_date?: string;
  delinquency_days?: number;
}

export default function LeasingContractDetail() {
  const { id, contractId } = useParams<{ id: string; contractId: string }>();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [contract, setContract] = useState<LeasingContract | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simuler le chargement des données depuis une API
    const loadContract = async () => {
      try {
        setLoading(true);
        
        // Rechercher le contrat dans tous les portefeuilles
        let foundContract: LeasingContract | null = null;
        
        for (const portfolio of mockLeasingPortfolios) {
          const contract = portfolio.contracts.find(c => c.id === contractId);
          if (contract) {
            // Enrichir le contrat avec les détails de l'équipement
            const equipment = mockEquipments.find(e => e.id === contract.equipment_id) || 
                             portfolio.equipment_catalog.find(e => e.id === contract.equipment_id);
            
            foundContract = {
              ...contract,
              equipment_name: equipment?.name,
              equipment_category: equipment?.category,
              equipment_manufacturer: equipment?.manufacturer,
              equipment_model: equipment?.model,
              // Ajouter des données simulées pour les besoins du composant
              payments_made: Math.floor(Math.random() * 10),
              remaining_payments: Math.floor(Math.random() * 15) + 5,
              delinquency_days: Math.random() > 0.7 ? Math.floor(Math.random() * 30) : 0,
              residual_value: contract.monthly_payment * 3,
              client_name: `Client ${contract.client_id}`
            };
            break;
          }
        }
        
        if (foundContract) {
          setContract(foundContract);
        } else {
          showNotification('Contrat non trouvé', 'error');
          navigate('/leasing');
        }
      } catch (error) {
        console.error('Erreur lors du chargement du contrat:', error);
        showNotification('Erreur lors du chargement du contrat', 'error');
      } finally {
        setLoading(false);
      }
    };
    
    loadContract();
  }, [contractId, navigate, showNotification]);

  // Gestionnaire pour la mise à jour du contrat
  const handleUpdateContract = async (updatedData: Partial<LeasingContract>) => {
    try {
      // Simuler une requête API pour mettre à jour le contrat
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mettre à jour l'état local
      setContract(prev => prev ? { ...prev, ...updatedData } : null);
      
      // Sauvegarder dans localStorage pour persister les modifications
      const storedContracts = JSON.parse(localStorage.getItem('leasingContracts') || '[]');
      const updatedContracts = storedContracts.map((c: LeasingContract) => 
        c.id === contractId ? { ...c, ...updatedData } : c
      );
      localStorage.setItem('leasingContracts', JSON.stringify(updatedContracts));
      
      return Promise.resolve();
    } catch (error) {
      console.error('Erreur lors de la mise à jour du contrat:', error);
      return Promise.reject(error);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Chargement...</div>;
  }

  if (!contract) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h2 className="text-xl font-semibold mb-4">Contrat non trouvé</h2>
        <Button onClick={() => navigate(`/app/leasing/${id}?tab=contracts`)}>
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Retour aux contrats
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader
        title="Détail du contrat de leasing"
        description={`Référence: ${contract.id}`}
        actions={
          <Button variant="outline" onClick={() => navigate(`/app/leasing/${id}?tab=contracts`)}>
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Retour
          </Button>
        }
      />
      
      <div className="mt-6">
        <LeasingContractDetailsResponsive 
          contract={contract}
          onUpdateContract={handleUpdateContract}
        />
      </div>
    </div>
  );
}

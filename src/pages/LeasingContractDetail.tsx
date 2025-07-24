// src/pages/LeasingContractDetail.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { LeasingContractDetailsResponsive, EnrichedLeasingContract } from '../components/portfolio/leasing/contract/LeasingContractDetailsResponsive';
import { Button } from '../components/ui';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useNotification } from '../contexts/NotificationContext';
import { mockLeasingPortfolios } from '../data/mockLeasingPortfolios';
import { mockEquipments } from '../data/mockEquipments';
import { LeasingContract as BaseLeasingContract } from '../types/leasing';
import { Breadcrumb } from '../components/common/Breadcrumb';

export default function LeasingContractDetail() {
  const { id, contractId } = useParams<{ id: string; contractId: string }>();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [contract, setContract] = useState<EnrichedLeasingContract | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simuler le chargement des données depuis une API
    const loadContract = async () => {
      try {
        setLoading(true);
        
        // Rechercher le contrat dans tous les portefeuilles
        let foundContract: EnrichedLeasingContract | null = null;
        
        for (const portfolio of mockLeasingPortfolios) {
          const contract = portfolio.contracts.find(c => c.id === contractId);
          if (contract) {
            // Enrichir le contrat avec les détails de l'équipement
            const equipment = mockEquipments.find(e => e.id === contract.equipment_id) || 
                             portfolio.equipment_catalog.find(e => e.id === contract.equipment_id);
            
            // S'assurer que le statut est compatible avec ExtendedLeasingStatusType
            const safeStatus = contract.status === 'draft' ? 'pending' : contract.status;
            
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
              client_name: contract.client_name || `Client ${contract.client_id}`,
              status: safeStatus as 'active' | 'pending' | 'completed' | 'terminated'
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
  const handleUpdateContract = async (updatedData: Partial<EnrichedLeasingContract>) => {
    try {
      // Simuler une requête API pour mettre à jour le contrat
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mettre à jour l'état local
      setContract(prev => prev ? { ...prev, ...updatedData } : null);
      
      // Sauvegarder dans localStorage pour persister les modifications
      const storedContracts = JSON.parse(localStorage.getItem('leasingContracts') || '[]');
      const updatedContracts = storedContracts.map((c: BaseLeasingContract) => 
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
      <Breadcrumb 
        portfolioType="leasing"
        items={[
          { label: 'Portefeuilles Leasing', href: '/app/leasing' },
          { label: 'Détails du portefeuille', href: `/app/leasing/${id}` },
          { label: 'Détail du contrat' }
        ]}
      />
      
      <div className="flex justify-end mb-4">
        <Button variant="outline" onClick={() => navigate(`/app/leasing/${id}?tab=contracts`)}>
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Retour
        </Button>
      </div>
      
      <div className="mt-6">
        <LeasingContractDetailsResponsive 
          contract={contract}
          onUpdateContract={handleUpdateContract}
        />
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { LeasingContract } from '../../types/leasing';
import {
  getLeasingContracts,
  getLeasingContractById,
  updateLeasingContract
} from '../../services/leasing/leasingDataService';

export function useLeasingContractActions() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const viewDetails = (contract: LeasingContract) => {
    navigate(`/leasing/contracts/${contract.id}`);
  };

  const activateContract = async (contractId: string) => {
    setLoading(true);
    try {
      // Récupérer le contrat actuel
      const contract = getLeasingContractById(contractId);
      if (!contract) {
        toast.error('Contrat non trouvé');
        return false;
      }
      
      // Mettre à jour le statut
      const updatedContract = {
        ...contract,
        status: 'active' as const,
        activationDate: new Date().toISOString()
      };
      
      // Sauvegarder dans le localStorage
      updateLeasingContract(updatedContract);
      
      toast.success('Contrat de leasing activé');
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'activation:', error);
      toast.error('Erreur lors de l\'activation du contrat');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const terminateContract = async (contractId: string, reason: string) => {
    setLoading(true);
    try {
      // Récupérer le contrat actuel
      const contract = getLeasingContractById(contractId);
      if (!contract) {
        toast.error('Contrat non trouvé');
        return false;
      }
      
      // Mettre à jour le statut
      const updatedContract = {
        ...contract,
        status: 'terminated' as const,
        terminationDate: new Date().toISOString(),
        terminationReason: reason
      };
      
      // Sauvegarder dans le localStorage
      updateLeasingContract(updatedContract);
      
      toast.success('Contrat de leasing résilié');
      return true;
    } catch (error) {
      console.error('Erreur lors de la résiliation:', error);
      toast.error('Erreur lors de la résiliation du contrat');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const generateInvoice = async (contractId: string) => {
    setLoading(true);
    try {
      // Récupérer le contrat actuel
      const contract = getLeasingContractById(contractId);
      if (!contract) {
        toast.error('Contrat non trouvé');
        return false;
      }
      
      // Dans une application réelle, on générerait une facture ici
      // Pour simuler, on met juste à jour la date de prochaine facturation
      const nextInvoiceDate = new Date();
      nextInvoiceDate.setMonth(nextInvoiceDate.getMonth() + 1);
      
      const updatedContract = {
        ...contract,
        nextInvoiceDate: nextInvoiceDate.toISOString().split('T')[0]
      };
      
      // Sauvegarder dans le localStorage
      updateLeasingContract(updatedContract);
      
      toast.success('Facture générée avec succès');
      return true;
    } catch (error) {
      console.error('Erreur lors de la génération de facture:', error);
      toast.error('Erreur lors de la génération de la facture');
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  const orderEquipment = async (contractId: string) => {
    setLoading(true);
    try {
      // Récupérer le contrat actuel
      const contract = getLeasingContractById(contractId);
      if (!contract) {
        toast.error('Contrat non trouvé');
        return false;
      }
      
      // Mettre à jour le statut pour indiquer que l'équipement a été commandé
      const updatedContract = {
        ...contract,
        equipment_ordered: true,
        order_date: new Date().toISOString(),
        payment_initiated: true,
        payment_date: new Date().toISOString(),
        status: 'pending' as const
      };
      
      // Sauvegarder dans le localStorage
      updateLeasingContract(updatedContract);
      
      toast.success('Équipement commandé et ordre de paiement initié');
      
      // Ouvrir la page des paiements ou notifier l'utilisateur
      navigate(`/leasing/payments/${contractId}`);
      return true;
    } catch (error) {
      console.error('Erreur lors de la commande d\'équipement:', error);
      toast.error('Erreur lors de la commande de l\'équipement');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const scheduleMaintenanceVisit = async (contractId: string, date: string) => {
    setLoading(true);
    try {
      // Récupérer le contrat actuel
      const contract = getLeasingContractById(contractId);
      if (!contract) {
        toast.error('Contrat non trouvé');
        return false;
      }
      
      // Dans une application réelle, on programmerait une visite de maintenance ici
      // Pour simuler, on pourrait ajouter une propriété au contrat
      const updatedContract = {
        ...contract,
        maintenanceScheduled: true,
        maintenanceDate: date
      };
      
      // Sauvegarder dans le localStorage
      updateLeasingContract(updatedContract);
      
      toast.success('Visite de maintenance programmée pour le ' + new Date(date).toLocaleDateString());
      return true;
    } catch (error) {
      console.error('Erreur lors de la programmation de maintenance:', error);
      toast.error('Erreur lors de la programmation de la maintenance');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    contracts: getLeasingContracts(), // Toujours retourner les données à jour
    viewDetails,
    activateContract,
    terminateContract,
    generateInvoice,
    orderEquipment,
    scheduleMaintenanceVisit
  };
}

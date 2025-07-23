import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { LeasingRequest } from '../../types/leasing-request';
import { LeasingContract } from '../../types/leasing';
import {
  getLeasingRequests,
  updateLeasingRequest,
  addLeasingContract,
  generateContractId,
  getLeasingRequestById,
  getEquipmentById
} from '../../services/leasing/leasingDataService';

export function useLeasingRequestActions() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const viewDetails = (request: LeasingRequest) => {
    navigate(`/leasing/requests/${request.id}`);
  };

  const approveRequest = async (requestId: string) => {
    setLoading(true);
    try {
      // Récupérer la demande actuelle
      const request = getLeasingRequestById(requestId);
      if (!request) {
        toast.error('Demande non trouvée');
        return false;
      }
      
      // Mettre à jour le statut
      const updatedRequest = {
        ...request,
        status: 'approved' as const,
        status_date: new Date().toISOString()
      };
      
      // Sauvegarder dans le localStorage
      updateLeasingRequest(updatedRequest);
      
      // Créer automatiquement un contrat
      const success = await createContract(requestId);
      if (success) {
        toast.success('Demande approuvée et contrat créé - l\'équipement peut maintenant être commandé');
        return true;
      } else {
        toast.error('Demande approuvée mais erreur lors de la création du contrat');
        return false;
      }
    } catch (error) {
      console.error('Erreur lors de l\'approbation:', error);
      toast.error('Erreur lors de l\'approbation de la demande');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const rejectRequest = async (requestId: string, reason: string) => {
    setLoading(true);
    try {
      // Récupérer la demande actuelle
      const request = getLeasingRequestById(requestId);
      if (!request) {
        toast.error('Demande non trouvée');
        return false;
      }
      
      // Mettre à jour le statut
      const updatedRequest = {
        ...request,
        status: 'rejected' as const,
        status_date: new Date().toISOString(),
        rejectionReason: reason
      };
      
      // Sauvegarder dans le localStorage
      updateLeasingRequest(updatedRequest);
      
      toast.success('Demande de leasing rejetée');
      return true;
    } catch (error) {
      console.error('Erreur lors du rejet:', error);
      toast.error('Erreur lors du rejet de la demande');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const createContract = async (requestId: string, shouldNavigate = false) => {
    setLoading(true);
    try {
      // Récupérer la demande
      const request = getLeasingRequestById(requestId);
      if (!request) {
        toast.error('Demande non trouvée');
        return false;
      }
      
      // Récupérer les détails de l'équipement
      const equipment = getEquipmentById(request.equipment_id);
      if (!equipment) {
        toast.error('Équipement non trouvé');
        return false;
      }
      
      // Calculer la date de fin basée sur la durée demandée
      const startDate = new Date();
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + request.requested_duration);
      
      // Créer un nouveau contrat
      const newContractId = generateContractId();
      const newContract: LeasingContract = {
        id: newContractId,
        equipment_id: request.equipment_id,
        client_id: request.client_id,
        client_name: request.client_name,
        request_id: request.id,
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
        monthly_payment: request.monthly_budget,
        interest_rate: 4.5, // Exemple de taux
        maintenance_included: request.maintenance_included,
        insurance_included: request.insurance_included,
        status: 'pending',
        nextInvoiceDate: new Date(startDate.setMonth(startDate.getMonth() + 1)).toISOString().split('T')[0]
      };
      
      // Ajouter le contrat
      addLeasingContract(newContract);
      
      // Mettre à jour le statut de la demande
      const updatedRequest = {
        ...request,
        status: 'contract_created' as const,
        status_date: new Date().toISOString(),
        contract_id: newContractId
      };
      
      updateLeasingRequest(updatedRequest);
      
      toast.success('Contrat de leasing créé avec succès');
      
      // Ne naviguer que si explicitement demandé
      if (shouldNavigate) {
        navigate('/leasing/contracts');
      }
      return true;
    } catch (error) {
      console.error('Erreur lors de la création du contrat:', error);
      toast.error('Erreur lors de la création du contrat');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    requests: getLeasingRequests(), // Toujours retourner les données à jour
    viewDetails,
    approveRequest,
    rejectRequest,
    createContract
  };
}

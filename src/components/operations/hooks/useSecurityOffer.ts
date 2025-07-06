import { useState } from 'react';
import { useNotification } from '../../../contexts/NotificationContext';
import type { SecurityType } from '../../../types/securities';

export function useSecurityOffer() {
  const [showModal, setShowModal] = useState(false);
  const [selectedType, setSelectedType] = useState<SecurityType | null>(null);
  const { showNotification } = useNotification();

  const handleNewOffer = (type: SecurityType) => {
    setSelectedType(type);
    setShowModal(true);
  };

  const handleSubmit = async (data: any) => {
    try {
      // Ici, vous implémenteriez l'appel API pour créer l'offre
      await new Promise(resolve => setTimeout(resolve, 1000));
      showNotification('Offre créée avec succès', 'success');
      setShowModal(false);
    } catch (error) {
      showNotification('Erreur lors de la création de l\'offre', 'error');
    }
  };

  return {
    showModal,
    selectedType,
    handleNewOffer,
    handleSubmit,
    closeModal: () => setShowModal(false)
  };
}
// components/portfolio/traditional/contract/ConfigureContractForm.tsx
import { useState } from 'react';
import { Button } from '../../../ui/Button';
import { Input, Select } from '../../../ui/Form';
import { Modal } from '../../../ui/Modal';
import { CreditContract } from '../../../../types/credit';
import { useNotification } from '../../../../contexts/NotificationContext';

interface ConfigureContractFormProps {
  contract: CreditContract;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (data: Partial<CreditContract>) => Promise<void>;
}

export function ConfigureContractForm({ contract, isOpen, onClose, onUpdate }: ConfigureContractFormProps) {
  const [formData, setFormData] = useState({
    interestRate: contract.interestRate.toString(),
    startDate: contract.startDate || new Date().toISOString().split('T')[0],
    endDate: contract.endDate || new Date(new Date().setFullYear(new Date().getFullYear() + 2)).toISOString().split('T')[0],
    amortization_method: contract.amortization_method || 'linear',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showNotification } = useNotification();

  // Gestionnaire séparé pour les éléments input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Gestionnaire séparé pour les éléments select
  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const updatedData: Partial<CreditContract> = {
        interestRate: parseFloat(formData.interestRate),
        startDate: formData.startDate,
        endDate: formData.endDate,
        amortization_method: formData.amortization_method as 'linear' | 'degressive' | 'progressive' | 'balloon',
      };
      
      await onUpdate(updatedData);
      showNotification('Contrat configuré avec succès', 'success');
      onClose();
    } catch (error) {
      showNotification('Erreur lors de la configuration du contrat', 'error');
      console.error('Erreur:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Configuration du contrat">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Taux d'intérêt (%)
          </label>
          <Input
            type="number"
            step="0.01"
            name="interestRate"
            value={formData.interestRate}
            onChange={handleInputChange}
            required
            min="0"
            max="100"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date de début
          </label>
          <Input
            type="date"
            name="startDate"
            value={formData.startDate}
            onChange={handleInputChange}
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date de fin
          </label>
          <Input
            type="date"
            name="endDate"
            value={formData.endDate}
            onChange={handleInputChange}
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Méthode d'amortissement
          </label>
          <Select
            name="amortization_method"
            value={formData.amortization_method}
            onChange={handleSelectChange}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
          >
            <option value="linear">Linéaire (constant)</option>
            <option value="degressive">Dégressive</option>
            <option value="progressive">Progressive</option>
            <option value="balloon">Paiement ballon</option>
          </Select>
        </div>
        
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Annuler
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

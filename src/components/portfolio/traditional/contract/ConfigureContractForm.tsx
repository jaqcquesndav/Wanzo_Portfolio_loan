// components/portfolio/traditional/contract/ConfigureContractForm.tsx
import { useState } from 'react';
import { Button } from '../../../ui/Button';
import { Input, Select } from '../../../ui/Form';
import { Modal } from '../../../ui/Modal';
import { CreditContract } from '../../../../types/credit-contract';
import { useNotification } from '../../../../contexts/useNotification';

interface ConfigureContractFormProps {
  contract: CreditContract;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (data: Partial<CreditContract>) => Promise<void>;
}

export function ConfigureContractForm({ contract, isOpen, onClose, onUpdate }: ConfigureContractFormProps) {
  const [formData, setFormData] = useState({
    interest_rate: (contract.interest_rate || 0).toString(),
    start_date: contract.start_date || new Date().toISOString().split('T')[0],
    end_date: contract.end_date || new Date(new Date().setFullYear(new Date().getFullYear() + 2)).toISOString().split('T')[0],
    amortization_method: contract.amortization_method || 'linear',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showNotification } = useNotification();

  // Gestionnaire sépaRé pour les éléments input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Gestionnaire sépaRé pour les éléments select
  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const updatedData: Partial<CreditContract> = {
        interest_rate: parseFloat(formData.interest_rate),
        start_date: formData.start_date,
        end_date: formData.end_date,
        amortization_method: formData.amortization_method as 'linear' | 'degressive' | 'progressive' | 'balloon',
      };
      
      await onUpdate(updatedData);
      showNotification('Contrat configuRé© avec succé¨s', 'success');
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
            Taux d'inté©Réªt (%)
          </label>
          <Input
            type="number"
            step="0.01"
            name="interestRate"
            value={formData.interest_rate}
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
            value={formData.start_date}
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
            value={formData.end_date}
            onChange={handleInputChange}
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mé©thode d'amortissement
          </label>
          <Select
            name="amortization_method"
            value={formData.amortization_method}
            onChange={handleSelectChange}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
          >
            <option value="linear">Liné©aire (constant)</option>
            <option value="degressive">dû©gressive</option>
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





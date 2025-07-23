import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../../ui/Dialog';
import { Button } from '../../../ui/Button';
import { Input } from '../../../ui/Input';
import { Label } from '../../../ui/Label';
import { Select } from '../../../ui/Select';
import { CreditContract } from '../../../../types/credit';

interface ConfigureContractFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedContract: CreditContract) => void;
  contract: CreditContract;
}

export function ConfigureContractForm({ isOpen, onClose, onSave, contract }: ConfigureContractFormProps) {
  const [formData, setFormData] = useState<Partial<CreditContract>>({});

  useEffect(() => {
    if (contract) {
      setFormData({
        ...contract
      });
    }
  }, [contract]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...contract,
      ...formData
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Configuration du contrat</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Statut
              </Label>
              <Select 
                id="status" 
                name="status" 
                className="col-span-3"
                value={formData.status}
                onChange={handleInputChange}
              >
                <option value="active">Actif</option>
                <option value="suspended">Suspendu</option>
                <option value="closed">Clôturé</option>
                <option value="defaulted">En défaut</option>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="interestRate" className="text-right">
                Taux d'intérêt (%)
              </Label>
              <Input
                id="interestRate"
                name="interestRate"
                type="number"
                step="0.01"
                value={formData.interestRate}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="gracePeriod" className="text-right">
                Période de grâce (jours)
              </Label>
              <Input
                id="gracePeriod"
                name="gracePeriod"
                type="number"
                value={formData.gracePeriod}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit">Enregistrer</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

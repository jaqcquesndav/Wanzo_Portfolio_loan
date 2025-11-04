import { useState } from 'react';
import { GuaranteeType } from '../../../../types/credit';
import { Button } from '../../../ui/Button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../../ui/Dialog';
import { Input } from '../../../ui/Input';
import { Label } from '../../../../components/ui/Label';
import { Textarea } from '../../../ui/Textarea';

interface GuaranteeTypeFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (guaranteeType: Omit<GuaranteeType, 'id' | 'createdAt'>) => void;
  initialData?: GuaranteeType;
}

export function GuaranteeTypeForm({ isOpen, onClose, onSubmit, initialData }: GuaranteeTypeFormProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const guaranteeType = {
      name,
      description,
      updatedAt: initialData?.updatedAt ? new Date().toISOString() : undefined,
    };
    
    onSubmit(guaranteeType);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Modifier le type de garantie' : 'CRéer un type de garantie'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Nom <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="col-span-3"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting || !name}>
              {initialData ? 'Mettre à jour' : 'CRéer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


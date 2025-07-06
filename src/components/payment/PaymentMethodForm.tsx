import React from 'react';
import { CreditCard, Smartphone } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FormField, Input, Select } from '../ui/Form';
import { Button } from '../ui/Button';

const mobileMoneySchema = z.object({
  provider: z.enum(['airtel', 'orange', 'mpesa']),
  phoneNumber: z.string().min(9, 'Numéro de téléphone invalide'),
  pin: z.string().length(4, 'Le PIN doit contenir 4 chiffres')
});

const cardSchema = z.object({
  cardNumber: z.string().regex(/^[0-9]{16}$/, 'Numéro de carte invalide'),
  expiryDate: z.string().regex(/^(0[1-9]|1[0-2])\/([0-9]{2})$/, 'Date d\'expiration invalide'),
  cvv: z.string().regex(/^[0-9]{3,4}$/, 'CVV invalide'),
  cardType: z.enum(['visa', 'mastercard', 'paypal'])
});

type PaymentMethodFormData = {
  type: 'mobile_money' | 'card';
  details: z.infer<typeof mobileMoneySchema> | z.infer<typeof cardSchema>;
};

interface PaymentMethodFormProps {
  onSubmit: (data: PaymentMethodFormData) => Promise<void>;
  onCancel: () => void;
}

export function PaymentMethodForm({ onSubmit, onCancel }: PaymentMethodFormProps) {
  const [paymentType, setPaymentType] = React.useState<'mobile_money' | 'card'>('mobile_money');

  const mobileMoneyForm = useForm({
    resolver: zodResolver(mobileMoneySchema)
  });

  const cardForm = useForm({
    resolver: zodResolver(cardSchema)
  });

  const handleSubmit = async (formData: any) => {
    await onSubmit({
      type: paymentType,
      details: formData
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex space-x-4">
        <Button
          type="button"
          variant={paymentType === 'mobile_money' ? 'primary' : 'outline'}
          onClick={() => setPaymentType('mobile_money')}
          className="flex-1"
          icon={<Smartphone className="h-5 w-5" />}
        >
          Mobile Money
        </Button>
        <Button
          type="button"
          variant={paymentType === 'card' ? 'primary' : 'outline'}
          onClick={() => setPaymentType('card')}
          className="flex-1"
          icon={<CreditCard className="h-5 w-5" />}
        >
          Carte bancaire
        </Button>
      </div>

      {paymentType === 'mobile_money' ? (
        <form onSubmit={mobileMoneyForm.handleSubmit(handleSubmit)} className="space-y-4">
          <FormField label="Fournisseur" error={mobileMoneyForm.formState.errors.provider?.message}>
            <Select {...mobileMoneyForm.register('provider')}>
              <option value="airtel">Airtel Money</option>
              <option value="orange">Orange Money</option>
              <option value="mpesa">M-Pesa</option>
            </Select>
          </FormField>

          <FormField label="Numéro de téléphone" error={mobileMoneyForm.formState.errors.phoneNumber?.message}>
            <Input
              type="tel"
              placeholder="Ex: 0991234567"
              {...mobileMoneyForm.register('phoneNumber')}
            />
          </FormField>

          <FormField label="Code PIN" error={mobileMoneyForm.formState.errors.pin?.message}>
            <Input
              type="password"
              maxLength={4}
              placeholder="****"
              {...mobileMoneyForm.register('pin')}
            />
          </FormField>

          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Annuler
            </Button>
            <Button type="submit" loading={mobileMoneyForm.formState.isSubmitting}>
              Valider
            </Button>
          </div>
        </form>
      ) : (
        <form onSubmit={cardForm.handleSubmit(handleSubmit)} className="space-y-4">
          <FormField label="Type de carte" error={cardForm.formState.errors.cardType?.message}>
            <Select {...cardForm.register('cardType')}>
              <option value="visa">Visa</option>
              <option value="mastercard">Mastercard</option>
              <option value="paypal">PayPal</option>
            </Select>
          </FormField>

          <FormField label="Numéro de carte" error={cardForm.formState.errors.cardNumber?.message}>
            <Input
              type="text"
              placeholder="1234 5678 9012 3456"
              {...cardForm.register('cardNumber')}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 16);
                cardForm.setValue('cardNumber', value);
              }}
            />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Date d'expiration" error={cardForm.formState.errors.expiryDate?.message}>
              <Input
                type="text"
                placeholder="MM/YY"
                {...cardForm.register('expiryDate')}
                onChange={(e) => {
                  let value = e.target.value.replace(/\D/g, '');
                  if (value.length >= 2) {
                    value = value.slice(0, 2) + '/' + value.slice(2, 4);
                  }
                  cardForm.setValue('expiryDate', value);
                }}
              />
            </FormField>

            <FormField label="CVV" error={cardForm.formState.errors.cvv?.message}>
              <Input
                type="password"
                maxLength={4}
                placeholder="***"
                {...cardForm.register('cvv')}
              />
            </FormField>
          </div>

          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Annuler
            </Button>
            <Button type="submit" loading={cardForm.formState.isSubmitting}>
              Valider
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
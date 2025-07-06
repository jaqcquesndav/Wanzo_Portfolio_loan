import { useFormContext } from 'react-hook-form';
import { FormField, Input, Select } from '../ui/Form';
import { RDC_BANKS } from '../../types/bank';

export function BankAccountStep() {
  const { register, formState: { errors } } = useFormContext();
  // Helper to extract string error message
  const getError = (err: unknown) => {
    if (typeof err === 'string') return err;
    if (err && typeof err === 'object' && 'message' in err && typeof (err as { message?: unknown }).message === 'string') {
      return (err as { message: string }).message;
    }
    return undefined;
  };

  return (
    <div className="space-y-6">
      <FormField label="Banque" error={getError(errors?.bankName)}>
        <Select {...register('bankName', { required: 'Sélectionnez une banque' })}>
          <option value="">Sélectionner une banque</option>
          {RDC_BANKS.map((bank) => (
            <option key={bank.code} value={bank.name}>{bank.name}</option>
          ))}
        </Select>
      </FormField>
      <FormField label="Numéro de compte bancaire" error={getError(errors?.accountNumber)}>
        <Input {...register('accountNumber', { required: 'Numéro de compte requis' })} />
      </FormField>
      <FormField label="Titulaire du compte" error={getError(errors?.accountHolder)}>
        <Input {...register('accountHolder', { required: 'Titulaire requis' })} />
      </FormField>
      <FormField label="IBAN (optionnel)" error={getError(errors?.iban)}>
        <Input {...register('iban')} />
      </FormField>
      <FormField label="BIC/SWIFT (optionnel)" error={getError(errors?.bic)}>
        <Input {...register('bic')} />
      </FormField>
    </div>
  );
}

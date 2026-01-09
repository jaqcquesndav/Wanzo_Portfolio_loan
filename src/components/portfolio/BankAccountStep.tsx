// src/components/portfolio/BankAccountStep.tsx
/**
 * Étape 2 du formulaire de création : Association compte bancaire OU Mobile Money
 * Conforme aux pratiques bancaires RDC
 */
import { useFormContext, Controller } from 'react-hook-form';
import { FormField, Input, Select } from '../ui/Form';
import { RDC_BANKS } from '../../types/bank';
import { MOBILE_MONEY_PROVIDERS } from '../../types/mobileMoneyAccount';
import type { AccountType } from '../../types/portfolio';
import { useEffect } from 'react';
import { Building2, Smartphone, AlertTriangle } from 'lucide-react';

// Helper to extract string error message
const getError = (err: unknown) => {
  if (typeof err === 'string') return err;
  if (err && typeof err === 'object' && 'message' in err && typeof (err as { message?: unknown }).message === 'string') {
    return (err as { message: string }).message;
  }
  return undefined;
};

export function BankAccountStep() {
  const { register, watch, setValue, formState: { errors }, control } = useFormContext();
  
  // Type de compte sélectionné
  const accountType = watch('primary_account_type') as AccountType | undefined;
  
  // Réinitialiser les champs quand on change de type
  useEffect(() => {
    if (accountType === 'bank') {
      setValue('momo_provider', '');
      setValue('momo_phone', '');
      setValue('momo_name', '');
    } else if (accountType === 'mobile_money') {
      setValue('bankName', '');
      setValue('accountNumber', '');
      setValue('accountHolder', '');
      setValue('iban', '');
      setValue('bic', '');
    }
  }, [accountType, setValue]);

  return (
    <div className="space-y-6">
      {/* Sélection du type de compte */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
          Type de compte principal *
        </label>
        <div className="grid grid-cols-2 gap-4">
          <label 
            className={`
              flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all
              ${accountType === 'bank' 
                ? 'border-primary bg-primary/5 dark:bg-primary/10' 
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }
            `}
          >
            <input
              type="radio"
              value="bank"
              {...register('primary_account_type', { required: 'Sélectionnez un type de compte' })}
              className="w-4 h-4 text-primary"
            />
            <div className="flex items-center gap-3">
              <Building2 className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">Compte bancaire</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Banque locale ou internationale</p>
              </div>
            </div>
          </label>
          
          <label 
            className={`
              flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all
              ${accountType === 'mobile_money' 
                ? 'border-primary bg-primary/5 dark:bg-primary/10' 
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }
            `}
          >
            <input
              type="radio"
              value="mobile_money"
              {...register('primary_account_type', { required: 'Sélectionnez un type de compte' })}
              className="w-4 h-4 text-primary"
            />
            <div className="flex items-center gap-3">
              <Smartphone className="w-8 h-8 text-orange-600 dark:text-orange-400" />
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">Mobile Money</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Orange, M-Pesa, Airtel...</p>
              </div>
            </div>
          </label>
        </div>
        {errors.primary_account_type && (
          <p className="text-sm text-red-500">{getError(errors.primary_account_type)}</p>
        )}
      </div>

      {/* Formulaire compte bancaire */}
      {accountType === 'bank' && (
        <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg animate-in fade-in duration-200">
          <h4 className="font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" /> Informations bancaires
          </h4>
          
          <FormField label="Banque *" error={getError(errors?.bankName)}>
            <Select {...register('bankName', { required: accountType === 'bank' ? 'Sélectionnez une banque' : false })}>
              <option value="">Sélectionner une banque</option>
              {RDC_BANKS.map((bank) => (
                <option key={bank.code} value={bank.name}>{bank.name}</option>
              ))}
            </Select>
          </FormField>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Numéro de compte *" error={getError(errors?.accountNumber)}>
              <Input 
                {...register('accountNumber', { required: accountType === 'bank' ? 'Numéro de compte requis' : false })} 
                placeholder="Ex: 00001234567890"
              />
            </FormField>
            
            <FormField label="Titulaire du compte *" error={getError(errors?.accountHolder)}>
              <Input 
                {...register('accountHolder', { required: accountType === 'bank' ? 'Titulaire requis' : false })} 
                placeholder="Nom du titulaire"
              />
            </FormField>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="IBAN" error={getError(errors?.iban)}>
              <Input {...register('iban')} placeholder="Optionnel" />
            </FormField>
            <FormField label="BIC/SWIFT" error={getError(errors?.bic)}>
              <Input {...register('bic')} placeholder="Optionnel" />
            </FormField>
          </div>
        </div>
      )}

      {/* Formulaire Mobile Money */}
      {accountType === 'mobile_money' && (
        <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg animate-in fade-in duration-200">
          <h4 className="font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-orange-600" /> Informations Mobile Money
          </h4>
          
          <FormField label="Opérateur *" error={getError(errors?.momo_provider)}>
            <Select {...register('momo_provider', { required: accountType === 'mobile_money' ? 'Sélectionnez un opérateur' : false })}>
              <option value="">Sélectionner un opérateur</option>
              {MOBILE_MONEY_PROVIDERS.map((provider) => (
                <option key={provider.code} value={provider.code}>
                  {provider.name}
                </option>
              ))}
            </Select>
          </FormField>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Numéro de téléphone *" error={getError(errors?.momo_phone)}>
              <Input 
                {...register('momo_phone', { 
                  required: accountType === 'mobile_money' ? 'Numéro requis' : false,
                  pattern: {
                    value: /^(\+243|0)?[0-9]{9}$/,
                    message: 'Format invalide (ex: +243812345678)'
                  }
                })} 
                placeholder="+243 8XX XXX XXX"
              />
            </FormField>
            
            <FormField label="Nom du compte *" error={getError(errors?.momo_name)}>
              <Input 
                {...register('momo_name', { required: accountType === 'mobile_money' ? 'Nom requis' : false })} 
                placeholder="Nom enregistré sur le compte"
              />
            </FormField>
          </div>
        </div>
      )}

      {/* Note informative */}
      {accountType && (
        <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg text-sm text-amber-700 dark:text-amber-300">
          <p className="font-medium flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> Important</p>
          <p>
            {accountType === 'bank' 
              ? 'Ce compte bancaire sera utilisé pour toutes les opérations de décaissement et remboursement du portefeuille.'
              : 'Ce compte Mobile Money sera utilisé pour les opérations du portefeuille. Assurez-vous que le numéro est actif et vérifié.'
            }
          </p>
        </div>
      )}
    </div>
  );
}

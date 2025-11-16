import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { FormField, Input } from '../../ui/Form';
import { Button } from '../../ui/Button';
import { Switch } from '../../ui/Switch';
import { useNotification } from '../../../contexts/useNotification';
import { usersApi } from '../../../services/api/shared/users.api';

export function SecuritySettings() {
  const { showNotification } = useNotification();
  const { t } = useTranslation();
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  // Schéma de validation dynamique avec traductions
  const passwordSchema = z.object({
    currentPassword: z.string().min(8, t('errors.password.minLength', { min: 8 })),
    newPassword: z.string()
      .min(8, t('errors.password.minLength', { min: 8 }))
      .regex(/[A-Z]/, t('errors.password.uppercase'))
      .regex(/[a-z]/, t('errors.password.lowercase'))
      .regex(/[0-9]/, t('errors.password.number'))
      .regex(/[^A-Za-z0-9]/, t('errors.password.special')),
    confirmPassword: z.string()
  }).refine(data => data.newPassword === data.confirmPassword, {
    message: t('errors.password.match'),
    path: ['confirmPassword']
  });

  type PasswordFormData = z.infer<typeof passwordSchema>;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema)
  });

  const handlePasswordChange = async (data: PasswordFormData) => {
    try {
      await usersApi.changePassword(data.currentPassword, data.newPassword);
      showNotification(t('messages.passwordUpdated'), 'success');
      reset();
    } catch (err) {
      console.error('Password change error:', err);
      showNotification(t('messages.passwordError'), 'error');
    }
  };

  const handleTwoFactorToggle = async () => {
    try {
      if (!twoFactorEnabled) {
        // Envoyer un code par email
        await usersApi.sendTwoFactorCode();
        setIsVerifying(true);
        showNotification(t('messages.verificationSent'), 'success');
      } else {
        setTwoFactorEnabled(false);
        showNotification(t('messages.twoFactorDisabled'), 'success');
      }
    } catch (err) {
      console.error('Two factor toggle error:', err);
      showNotification(t('messages.settingsError'), 'error');
    }
  };

  const handleVerifyCode = async () => {
    try {
      // Vérifier le code
      await usersApi.verifyTwoFactorCode(verificationCode);
      setTwoFactorEnabled(true);
      setIsVerifying(false);
      showNotification(t('messages.twoFactorEnabled'), 'success');
    } catch (err) {
      console.error('Verification code error:', err);
      showNotification(t('messages.invalidCode'), 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          {t('settings.security.twoFactor')}
        </h2>
        
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">
              {t('settings.security.twoFactorDescription')}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {twoFactorEnabled ? t('settings.security.enabled') : t('settings.security.disabled')}
            </p>
          </div>
          <Switch
            checked={twoFactorEnabled}
            onChange={handleTwoFactorToggle}
          />
        </div>

        {isVerifying && (
          <div className="mt-4 space-y-4">
            <FormField label={t('settings.security.verificationCode')}>
              <div className="flex space-x-4">
                <Input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder={t('settings.security.verificationCode')}
                  maxLength={6}
                  className="flex-1"
                />
                <Button onClick={handleVerifyCode}>
                  {t('common.confirm')}
                </Button>
              </div>
            </FormField>
            <p className="text-sm text-gray-500">
              {t('messages.verificationSent')}
            </p>
          </div>
        )}
      </div>

      <div className="border-t dark:border-gray-700 pt-6">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          {t('settings.security.changePassword')}
        </h2>

        <form onSubmit={handleSubmit(handlePasswordChange)} className="space-y-4">
          <FormField label={t('settings.security.currentPassword')} error={errors.currentPassword?.message}>
            <Input
              type="password"
              {...register('currentPassword')}
              autoComplete="current-password"
            />
          </FormField>

          <FormField label={t('settings.security.newPassword')} error={errors.newPassword?.message}>
            <Input
              type="password"
              {...register('newPassword')}
              autoComplete="new-password"
            />
          </FormField>

          <FormField label={t('settings.security.confirmPassword')} error={errors.confirmPassword?.message}>
            <Input
              type="password"
              {...register('confirmPassword')}
              autoComplete="new-password"
            />
          </FormField>

          <Button type="submit" loading={isSubmitting}>
            {t('settings.security.updatePassword')}
          </Button>
        </form>
      </div>
    </div>
  );
}
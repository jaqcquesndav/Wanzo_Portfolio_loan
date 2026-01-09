import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { FormField, Input } from '../../ui/Form';
import { Button } from '../../ui/Button';
import { useNotification } from '../../../contexts/useNotification';
import { useAuth0 } from '@auth0/auth0-react';

export function SecuritySettings() {
  const { showNotification } = useNotification();
  const { t } = useTranslation();
  const { user } = useAuth0();

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

  const handlePasswordChange = async (_data: PasswordFormData) => {
    try {
      // Le changement de mot de passe est géré par Auth0
      // Rediriger vers la page de changement de mot de passe Auth0
      showNotification(t('messages.passwordChangeRedirect'), 'info');
      // Note: En production, utiliser auth0.changePassword() ou rediriger vers Auth0
      reset();
    } catch (err) {
      console.error('Password change error:', err);
      showNotification(t('messages.passwordError'), 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          {t('settings.security.twoFactor')}
        </h2>
        
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            {t('settings.security.twoFactorAuth0', 'L\'authentification à deux facteurs est gérée par Auth0. Vous pouvez la configurer depuis votre profil Auth0.')}
          </p>
          {user?.email && (
            <p className="text-sm text-blue-600 dark:text-blue-400 mt-2">
              {t('settings.security.connectedAs', 'Connecté en tant que')}: {user.email}
            </p>
          )}
        </div>
      </div>

      <div className="border-t dark:border-gray-700 pt-6">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          {t('settings.security.changePassword')}
        </h2>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
          <p className="text-sm text-yellow-700 dark:text-yellow-300">
            {t('settings.security.passwordAuth0', 'Le changement de mot de passe est géré par Auth0. Utilisez le lien "Mot de passe oublié" sur la page de connexion pour réinitialiser votre mot de passe.')}
          </p>
        </div>

        <form onSubmit={handleSubmit(handlePasswordChange)} className="space-y-4">
          <FormField label={t('settings.security.currentPassword')} error={errors.currentPassword?.message}>
            <Input
              type="password"
              {...register('currentPassword')}
              autoComplete="current-password"
              disabled
            />
          </FormField>

          <FormField label={t('settings.security.newPassword')} error={errors.newPassword?.message}>
            <Input
              type="password"
              {...register('newPassword')}
              autoComplete="new-password"
              disabled
            />
          </FormField>

          <FormField label={t('settings.security.confirmPassword')} error={errors.confirmPassword?.message}>
            <Input
              type="password"
              {...register('confirmPassword')}
              autoComplete="new-password"
              disabled
            />
          </FormField>

          <Button type="submit" loading={isSubmitting} disabled>
            {t('settings.security.updatePassword')}
          </Button>
        </form>
      </div>
    </div>
  );
}
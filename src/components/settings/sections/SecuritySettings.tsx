import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FormField, Input } from '../../ui/Form';
import { Button } from '../../ui/Button';
import { Switch } from '../../ui/Switch';
import { useNotification } from '../../../contexts/NotificationContext';
import { usersApi } from '../../../services/api/shared/users.api';

const passwordSchema = z.object({
  currentPassword: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
  newPassword: z.string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .regex(/[A-Z]/, 'Le mot de passe doit contenir au moins une majuscule')
    .regex(/[a-z]/, 'Le mot de passe doit contenir au moins une minuscule')
    .regex(/[0-9]/, 'Le mot de passe doit contenir au moins un chiffre')
    .regex(/[^A-Za-z0-9]/, 'Le mot de passe doit contenir au moins un caractère spécial'),
  confirmPassword: z.string()
}).refine(data => data.newPassword === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword']
});

type PasswordFormData = z.infer<typeof passwordSchema>;

export function SecuritySettings() {
  const { showNotification } = useNotification();
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
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
      showNotification('Mot de passe mis à jour avec succès', 'success');
      reset();
    } catch (err) {
      console.error('Password change error:', err);
      showNotification('Erreur lors de la mise à jour du mot de passe', 'error');
    }
  };

  const handleTwoFactorToggle = async () => {
    try {
      if (!twoFactorEnabled) {
        // Envoyer un code par email
        await usersApi.sendTwoFactorCode();
        setIsVerifying(true);
        showNotification('Un code de vérification a été envoyé à votre adresse email', 'success');
      } else {
        setTwoFactorEnabled(false);
        showNotification('Authentification à deux facteurs désactivée', 'success');
      }
    } catch (err) {
      console.error('Two factor toggle error:', err);
      showNotification('Erreur lors de la modification des paramètres', 'error');
    }
  };

  const handleVerifyCode = async () => {
    try {
      // Vérifier le code
      await usersApi.verifyTwoFactorCode(verificationCode);
      setTwoFactorEnabled(true);
      setIsVerifying(false);
      showNotification('Authentification à deux facteurs activée', 'success');
    } catch (err) {
      console.error('Verification code error:', err);
      showNotification('Code invalide', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Authentification à deux facteurs
        </h2>
        
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">
              Ajoutez une couche de sécurité supplémentaire à votre compte
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {twoFactorEnabled ? 'Activé' : 'Désactivé'}
            </p>
          </div>
          <Switch
            checked={twoFactorEnabled}
            onChange={handleTwoFactorToggle}
          />
        </div>

        {isVerifying && (
          <div className="mt-4 space-y-4">
            <FormField label="Code de vérification">
              <div className="flex space-x-4">
                <Input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="Entrez le code reçu par email"
                  maxLength={6}
                  className="flex-1"
                />
                <Button onClick={handleVerifyCode}>
                  Vérifier
                </Button>
              </div>
            </FormField>
            <p className="text-sm text-gray-500">
              Un code de vérification a été envoyé à votre adresse email. Veuillez le saisir ci-dessus.
            </p>
          </div>
        )}
      </div>

      <div className="border-t dark:border-gray-700 pt-6">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Changer le mot de passe
        </h2>

        <form onSubmit={handleSubmit(handlePasswordChange)} className="space-y-4">
          <FormField label="Mot de passe actuel" error={errors.currentPassword?.message}>
            <Input
              type="password"
              {...register('currentPassword')}
              autoComplete="current-password"
            />
          </FormField>

          <FormField label="Nouveau mot de passe" error={errors.newPassword?.message}>
            <Input
              type="password"
              {...register('newPassword')}
              autoComplete="new-password"
            />
          </FormField>

          <FormField label="Confirmer le mot de passe" error={errors.confirmPassword?.message}>
            <Input
              type="password"
              {...register('confirmPassword')}
              autoComplete="new-password"
            />
          </FormField>

          <Button type="submit" loading={isSubmitting}>
            Mettre à jour le mot de passe
          </Button>
        </form>
      </div>
    </div>
  );
}
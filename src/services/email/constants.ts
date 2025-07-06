export const EMAIL_CONFIG = {
  from: 'noreply@financeflow.com',
  replyTo: 'support@financeflow.com',
  templates: {
    newUser: {
      subject: 'Bienvenue sur FinanceFlow - Vos identifiants de connexion'
    },
    passwordReset: {
      subject: 'FinanceFlow - Réinitialisation de votre mot de passe'
    }
  }
} as const;
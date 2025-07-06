export const emailTemplates = {
  newUser: (name: string, email: string, password: string) => ({
    subject: 'Bienvenue sur FinanceFlow - Vos identifiants de connexion',
    html: `
      <h1>Bienvenue sur FinanceFlow, ${name}!</h1>
      <p>Votre compte a été créé avec succès. Voici vos identifiants de connexion:</p>
      <ul>
        <li><strong>Email:</strong> ${email}</li>
        <li><strong>Mot de passe temporaire:</strong> ${password}</li>
      </ul>
      <p>Pour des raisons de sécurité, nous vous recommandons de changer votre mot de passe
      lors de votre première connexion.</p>
      <p>Pour vous connecter, cliquez sur le lien ci-dessous:</p>
      <a href="${import.meta.env.VITE_APP_URL}/login" style="
        display: inline-block;
        background-color: #197ca8;
        color: white;
        padding: 10px 20px;
        text-decoration: none;
        border-radius: 5px;
        margin: 20px 0;
      ">Se connecter</a>
      <p>Si vous avez des questions, n'hésitez pas à contacter notre support.</p>
    `
  }),

  passwordReset: (name: string, email: string, password: string) => ({
    subject: 'FinanceFlow - Réinitialisation de votre mot de passe',
    html: `
      <h1>Bonjour ${name},</h1>
      <p>Votre mot de passe a été réinitialisé. Voici vos nouveaux identifiants:</p>
      <ul>
        <li><strong>Email:</strong> ${email}</li>
        <li><strong>Nouveau mot de passe:</strong> ${password}</li>
      </ul>
      <p>Pour des raisons de sécurité, nous vous recommandons de changer ce mot de passe
      dès votre prochaine connexion.</p>
      <a href="${import.meta.env.VITE_APP_URL}/login" style="
        display: inline-block;
        background-color: #197ca8;
        color: white;
        padding: 10px 20px;
        text-decoration: none;
        border-radius: 5px;
        margin: 20px 0;
      ">Se connecter</a>
    `
  })
};
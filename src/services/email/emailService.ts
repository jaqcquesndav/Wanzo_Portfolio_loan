import { emailTemplates } from './templates';
import type { EmailTemplate } from './types';
import { getAuthHeaders } from '../api/authHeaders';

class EmailService {
  private async sendEmail(to: string, subject: string, html: string): Promise<void> {
    try {
      // Simulate email sending in development
      if (import.meta.env.DEV) {
        console.log('Email sent:', { to, subject, html });
        return;
      }

      // In production, implement actual email sending with authentication
      const response = await fetch('/api/email/send', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ to, subject, html })
      });

      if (!response.ok) {
        throw new Error('Failed to send email');
      }
    } catch (error) {
      console.error('Email sending failed:', error);
      throw error;
    }
  }

  async sendNewUserCredentials(name: string, email: string, password: string): Promise<void> {
    const template = emailTemplates.newUser(name, email, password);
    await this.sendEmail(email, template.subject, template.html);
  }

  async sendPasswordReset(name: string, email: string, password: string): Promise<void> {
    const template = emailTemplates.passwordReset(name, email, password);
    await this.sendEmail(email, template.subject, template.html);
  }
}

export const emailService = new EmailService();
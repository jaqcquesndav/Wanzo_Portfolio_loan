export interface EmailTemplate {
  subject: string;
  html: string;
}

export interface EmailConfig {
  from: string;
  replyTo?: string;
  attachments?: EmailAttachment[];
}

export interface EmailAttachment {
  filename: string;
  content: string | Buffer;
  contentType: string;
}
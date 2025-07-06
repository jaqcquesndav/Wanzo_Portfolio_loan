export interface Message {
  id: string;
  sender: {
    id: string;
    name: string;
    institution: string;
    role: string;
  };
  receiver: {
    id: string;
    name: string;
    institution: string;
    role: string;
  };
  subject: string;
  content: string;
  attachments?: {
    name: string;
    size: string;
    type: string;
    url: string;
  }[];
  status: 'unread' | 'read' | 'archived';
  priority: 'high' | 'normal' | 'low';
  category: 'operation' | 'portfolio' | 'meeting' | 'general';
  operationId?: string;
  created_at: string;
  thread_id?: string;
  replies?: Message[];
}
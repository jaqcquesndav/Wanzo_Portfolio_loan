export interface Meeting {
  id: string;
  title: string;
  date: string;
  time: string;
  type: 'physical' | 'virtual';
  participants: {
    id: string;
    name: string;
    role: string;
    institution: string;
  }[];
  location?: string;
  meetingLink?: string;
  agenda?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  documents?: {
    name: string;
    type: string;
    url: string;
  }[];
  operationId?: string;
  notes?: string;
}
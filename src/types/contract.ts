// types/contract.ts
export interface ContractDocument {
  id: string;
  contractId: string;
  type: 'contract_original' | 'payment_schedule' | 'payment_history' | 'guarantee_documentation' | 'other';
  title: string;
  description?: string;
  fileName: string;
  fileUrl: string;
  fileSize: number; // Taille en octets
  fileType: string; // MIME type (ex: 'application/pdf')
  uploadDate: string;
  uploadedBy?: string;
}

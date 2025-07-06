export interface BankAccountInfo {
  bankName: string;
  bankCode?: string;
  accountNumber: string;
  iban?: string;
  bic?: string;
  accountHolder: string;
  country?: string;
}

export interface Bank {
  name: string;
  code: string;
  country?: string;
}

// Example RDC banks (à compléter selon besoin)
export const RDC_BANKS: Bank[] = [
  { name: 'Rawbank', code: 'RAW' },
  { name: 'Trust Merchant Bank', code: 'TMB' },
  { name: 'Equity Bank Congo', code: 'EBC' },
  { name: 'Access Bank', code: 'ACC' },
  { name: 'Ecobank', code: 'ECO' },
  { name: 'FBNBank', code: 'FBN' },
  { name: 'Banque Commerciale du Congo', code: 'BCDC' },
  { name: 'Afriland First Bank', code: 'AFB' },
  { name: 'Banque Internationale pour l’Afrique au Congo', code: 'BIAC' },
  { name: 'Banque de Crédit de Bujumbura', code: 'BCB' },
];

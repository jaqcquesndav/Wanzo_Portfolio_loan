// src/data/mockContractDocuments.ts
export interface PortfolioDocument {
  id: string;
  contractId: string;
  name: string;
  size: number;
  type: string;
  category: 'contract' | 'guarantee' | 'identity' | 'financial' | 'other';
  uploadDate: string;
  url: string;
  thumbnail?: string;
  description?: string;
}

// Données de démonstration pour les documents de contrat
export const mockContractDocuments: Record<string, PortfolioDocument[]> = {
  'contract-1': [
    {
      id: 'doc-1',
      contractId: 'contract-1',
      name: 'Contrat de prêt signé.pdf',
      size: 2500000,
      type: 'application/pdf',
      category: 'contract',
      uploadDate: '2023-02-15T10:30:00Z',
      url: '/documents/contract-1/contrat-pret.pdf',
      description: 'Contrat de prêt original signé par toutes les parties'
    },
    {
      id: 'doc-2',
      contractId: 'contract-1',
      name: 'Garantie hypothécaire.pdf',
      size: 1800000,
      type: 'application/pdf',
      category: 'guarantee',
      uploadDate: '2023-02-15T10:35:00Z',
      url: '/documents/contract-1/garantie-hypothecaire.pdf',
      description: 'Document de garantie hypothécaire'
    },
    {
      id: 'doc-3',
      contractId: 'contract-1',
      name: 'Pièce d\'identité.jpg',
      size: 750000,
      type: 'image/jpeg',
      category: 'identity',
      uploadDate: '2023-02-14T14:20:00Z',
      url: '/documents/contract-1/id-card.jpg',
      thumbnail: '/documents/contract-1/id-card-thumb.jpg',
      description: 'Pièce d\'identité du titulaire du contrat'
    },
    {
      id: 'doc-4',
      contractId: 'contract-1',
      name: 'Relevé bancaire.pdf',
      size: 1200000,
      type: 'application/pdf',
      category: 'financial',
      uploadDate: '2023-02-10T09:15:00Z',
      url: '/documents/contract-1/releve-bancaire.pdf',
      description: 'Relevé bancaire des 3 derniers mois'
    }
  ],
  'contract-2': [
    {
      id: 'doc-5',
      contractId: 'contract-2',
      name: 'Contrat de prêt.pdf',
      size: 2700000,
      type: 'application/pdf',
      category: 'contract',
      uploadDate: '2023-04-05T11:20:00Z',
      url: '/documents/contract-2/contrat-pret.pdf',
      description: 'Contrat de prêt original'
    },
    {
      id: 'doc-6',
      contractId: 'contract-2',
      name: 'Caution solidaire.pdf',
      size: 1500000,
      type: 'application/pdf',
      category: 'guarantee',
      uploadDate: '2023-04-05T11:25:00Z',
      url: '/documents/contract-2/caution-solidaire.pdf',
      description: 'Document de caution solidaire'
    }
  ],
  'contract-3': [
    {
      id: 'doc-7',
      contractId: 'contract-3',
      name: 'Contrat de prêt.pdf',
      size: 2900000,
      type: 'application/pdf',
      category: 'contract',
      uploadDate: '2023-06-20T16:40:00Z',
      url: '/documents/contract-3/contrat-pret.pdf',
      description: 'Contrat de prêt original'
    }
  ]
};

// Fonction pour persister les données dans le localStorage
export const saveContractDocumentsToLocalStorage = (documents: Record<string, PortfolioDocument[]>) => {
  localStorage.setItem('contractDocuments', JSON.stringify(documents));
};

// Fonction pour récupérer les données du localStorage
export const getContractDocumentsFromLocalStorage = (): Record<string, PortfolioDocument[]> => {
  const storedData = localStorage.getItem('contractDocuments');
  if (storedData) {
    return JSON.parse(storedData);
  }
  
  // Si aucune donnée n'est trouvée, sauvegarder et retourner les données mock
  saveContractDocumentsToLocalStorage(mockContractDocuments);
  return mockContractDocuments;
};

// Initialiser le localStorage si nécessaire
try {
  if (!localStorage.getItem('contractDocuments')) {
    saveContractDocumentsToLocalStorage(mockContractDocuments);
  }
} catch (error) {
  console.error('Erreur lors de l\'initialisation des données de documents:', error);
}

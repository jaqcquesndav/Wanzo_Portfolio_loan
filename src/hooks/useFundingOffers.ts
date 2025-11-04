import { useState, useEffect } from 'react';
import type { FundingOffer } from '../types/funding';

// Mock data - À remplacer par un appel API réel
const mockOffers: FundingOffer[] = [
  {
    id: '1',
    type: 'equity',
    title: 'Capital d\'amorçage',
    provider: 'Africa Venture Capital',
    description: 'Programme de financement pour les startups innovantes en phase de croissance',
    amount: { min: 50000000, max: 200000000 },
    duration: { min: 12, max: 36 },
    requirements: [
      'Entreprise existante depuis 2 ans minimum',
      'Chiffre d\'affaires > 100M FCFA',
      'Business plan détaillé',
      'Équipe de direction expérimentée'
    ]
  },
  // Ajoutez d'autres offres...
];

export function useFundingOffers() {
  const [offers, setOffers] = useState<FundingOffer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        // Simuler un appel API
        await new Promise(resolve => setTimeout(resolve, 1000));
        setOffers(mockOffers);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOffers();
  }, []);

  return { offers, isLoading, error };
}

import React from 'react';
import { FundingOfferCard } from './FundingOfferCard';
import { useFundingOffers } from '../../hooks/useFundingOffers';

interface FundingOffersListProps {
  searchTerm: string;
}

export function FundingOffersList({ searchTerm }: FundingOffersListProps) {
  const { offers, isLoading } = useFundingOffers();

  const filteredOffers = offers.filter(offer => 
    offer.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    offer.provider.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (filteredOffers.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow">
        <p className="text-gray-500">Aucune offre ne correspond à votre recherche</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {filteredOffers.map(offer => (
        <FundingOfferCard key={offer.id} offer={offer} />
      ))}
    </div>
  );
}
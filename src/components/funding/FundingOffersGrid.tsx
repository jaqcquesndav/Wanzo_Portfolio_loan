import React from 'react';
import { FundingOfferCard } from './FundingOfferCard';
import type { FundingOffer } from '../../types/funding';

interface FundingOffersGridProps {
  offers: FundingOffer[];
}

export function FundingOffersGrid({ offers }: FundingOffersGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {offers.map(offer => (
        <FundingOfferCard key={offer.id} offer={offer} />
      ))}
    </div>
  );
}
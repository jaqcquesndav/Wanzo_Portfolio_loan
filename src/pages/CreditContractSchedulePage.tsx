import React from 'react';
import { useParams } from 'react-router-dom';
import { CreditContractSchedule } from '../components/portfolio/traditional/credit-contract/CreditContractSchedule';

export default function CreditContractSchedulePage() {
  const { contractId } = useParams<{ contractId: string }>();
  
  if (!contractId) {
    return <div className="p-4">Référence de contrat manquante</div>;
  }
  
  return (
    <CreditContractSchedule contractId={contractId} />
  );
}

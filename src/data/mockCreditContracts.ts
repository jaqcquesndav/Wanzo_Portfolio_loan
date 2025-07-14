// src/data/mockCreditContracts.ts
import { CreditContract } from '../components/portfolio/traditional/CreditContractsTable';
import { mockFundingRequests } from './mockFundingRequests';

// Générer des données de contrats de crédit réalistes basées sur les demandes de financement
export const mockCreditContracts: CreditContract[] = mockFundingRequests
  .filter(request => request.status === 'validée' || request.status === 'décaissée')
  .map((request, index) => {
    const now = new Date();
    const startDate = new Date(now);
    startDate.setMonth(startDate.getMonth() - Math.floor(Math.random() * 12)); // Date de début aléatoire dans les 12 derniers mois
    
    const endDate = new Date(startDate);
    endDate.setFullYear(endDate.getFullYear() + 2 + Math.floor(Math.random() * 3)); // Durée de 2-5 ans
    
    const lastPaymentDate = new Date(now);
    lastPaymentDate.setMonth(lastPaymentDate.getMonth() - 1);
    
    const nextPaymentDate = new Date(now);
    nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);
    
    const totalInstallments = 24 + Math.floor(Math.random() * 36); // Entre 24 et 60 mensualités
    const elapsedMonths = Math.floor((now.getTime() - startDate.getTime()) / (30 * 24 * 60 * 60 * 1000));
    const remainingInstallments = Math.max(0, totalInstallments - elapsedMonths);
    const remainingAmount = (request.amount / totalInstallments) * remainingInstallments;
    
    const statuses: Array<CreditContract['status']> = ['actif', 'clôturé', 'en défaut', 'suspendu'];
    const status = index < mockFundingRequests.length * 0.7 
      ? 'actif' // 70% actifs 
      : statuses[Math.floor(Math.random() * statuses.length)];
    
    return {
      id: `CONT-${request.id.substring(4)}`,
      reference: `CRDT-${100000 + index}`,
      company: request.company,
      product: request.product,
      amount: request.amount,
      status: status,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      interestRate: 5 + Math.random() * 10, // Taux entre 5% et 15%
      remainingAmount: status === 'actif' ? remainingAmount : 0,
      createdAt: startDate.toISOString(),
      portfolioId: request.portfolioId,
      documentUrl: `https://example.com/contracts/${100000 + index}.pdf`,
      lastPaymentDate: status === 'actif' ? lastPaymentDate.toISOString() : undefined,
      nextPaymentDate: status === 'actif' ? nextPaymentDate.toISOString() : undefined,
    };
  });

export default mockCreditContracts;

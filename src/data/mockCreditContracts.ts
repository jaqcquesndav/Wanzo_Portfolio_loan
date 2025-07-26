// src/data/mockCreditContracts.ts
import { CreditContract } from '../types/credit';
import { mockCreditRequests } from './mockCreditRequests';

// Générer des données de contrats de crédit réalistes basées sur les demandes de crédit
export const mockCreditContracts: CreditContract[] = mockCreditRequests
  .filter(request => request.status === 'approved' || request.status === 'disbursed')
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
    const remainingAmount = (request.requestAmount / totalInstallments) * remainingInstallments;
    
    const statuses: Array<CreditContract['status']> = ['active', 'closed', 'defaulted', 'suspended'];
    const status = index < mockCreditRequests.length * 0.7 
      ? 'active' // 70% actifs 
      : statuses[Math.floor(Math.random() * statuses.length)];
    
    return {
      id: `CONT-${request.id.substring(4)}`,
      reference: `CRDT-${100000 + index}`,
      creditRequestId: `REQ-${100000 + index}`,
      memberId: `MEM-${100000 + index}`,
      memberName: request.memberId, // Updated from company to memberId
      productId: `PROD-${index % 5 + 1}`,
      productName: request.productId, // Updated from product to productId
      portfolioId: "default-portfolio", // Added a default value since portfolioId doesn't exist
      amount: request.requestAmount, // Updated from amount to requestAmount
      disbursedAmount: request.requestAmount, // Updated from amount to requestAmount
      remainingAmount: status === 'active' ? remainingAmount : 0,
      interestRate: 5 + Math.random() * 10, // Taux entre 5% et 15%
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      lastPaymentDate: status === 'active' ? lastPaymentDate.toISOString() : undefined,
      nextPaymentDate: status === 'active' ? nextPaymentDate.toISOString() : undefined,
      status: status,
      delinquencyDays: status === 'defaulted' ? 30 + Math.floor(Math.random() * 90) : 0,
      riskClass: status === 'defaulted' ? 'doubtful' : status === 'suspended' ? 'watch' : 'standard',
      guaranteesTotalValue: request.requestAmount * (0.5 + Math.random() * 0.5),
      scheduleId: `SCH-${100000 + index}`,
      documentUrl: `https://example.com/contracts/${100000 + index}.pdf`,
      isConsolidated: false,
      createdAt: startDate.toISOString(),
      updatedAt: status !== 'active' ? new Date().toISOString() : undefined
    };
  });

export default mockCreditContracts;

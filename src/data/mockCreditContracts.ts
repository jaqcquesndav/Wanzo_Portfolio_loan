// src/data/mockCreditContracts.ts
import { CreditContract } from '../types/credit-contract';
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
    
    const statuses: Array<CreditContract['status']> = ['active', 'completed', 'defaulted', 'suspended'];
    const status = index < mockCreditRequests.length * 0.7 
      ? 'active' // 70% actifs 
      : statuses[Math.floor(Math.random() * statuses.length)];
    
    return {
      id: `CONT-${request.id.substring(4)}`,
      portfolioId: "default-portfolio",
      client_id: `MEM-${100000 + index}`,
      company_name: request.memberId,
      product_type: request.productId,
      contract_number: `CRDT-${100000 + index}`,
      amount: request.requestAmount,
      interest_rate: 5 + Math.random() * 10, // Taux entre 5% et 15%
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
      status: status,
      amortization_method: 'linear' as const,
      terms: `${totalInstallments} mensualités`,
      created_at: startDate.toISOString(),
      updated_at: status !== 'active' ? new Date().toISOString() : startDate.toISOString(),
      
      // Legacy compatibility fields
      reference: `CRDT-${100000 + index}`,
      creditRequestId: `REQ-${100000 + index}`,
      memberId: `MEM-${100000 + index}`,
      memberName: request.memberId,
      productId: `PROD-${index % 5 + 1}`,
      productName: request.productId,
      disbursedAmount: request.requestAmount,
      remainingAmount: status === 'active' ? remainingAmount : 0,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      lastPaymentDate: status === 'active' ? lastPaymentDate.toISOString() : undefined,
      nextPaymentDate: status === 'active' ? nextPaymentDate.toISOString() : undefined,
      delinquencyDays: status === 'defaulted' ? 30 + Math.floor(Math.random() * 90) : 0,
      riskClass: status === 'defaulted' ? 'doubtful' : status === 'suspended' ? 'watch' : 'standard',
      guaranteesTotalValue: request.requestAmount * (0.5 + Math.random() * 0.5),
      scheduleId: `SCH-${100000 + index}`,
      documentUrl: `https://example.com/contracts/${100000 + index}.pdf`,
      isConsolidated: false,
      
      // UI compatibility fields
      risk_rating: Math.floor(Math.random() * 5) + 1,
      days_past_due: status === 'defaulted' ? 30 + Math.floor(Math.random() * 90) : 0,
      guarantee_amount: request.requestAmount * (0.5 + Math.random() * 0.5),
      term_months: totalInstallments,
      grace_period: Math.floor(Math.random() * 3)
    };
  });

export default mockCreditContracts;

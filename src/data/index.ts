// src/data/index.ts
// Re-export all mock data for easier imports

export * from './mockInvestmentData';
export * from './mockChatResponses';
export * from './mockCompanies';
export * from './mockCompanyDetails';
export * from './mockDisbursements';
export * from './mockFundingOffers';
export * from './mockFundingRequests';
export * from './mockGuarantees';

// Primary export for investment data - note that this file also exports:
// - mockInvestmentRequests
// - mockInvestmentTransactions
export * from './mockInvestment';

// Export everything from mockKPIDetails
export * from './mockKPIDetails';
export * from './mockLeasing';

// Export everything from mockLeasingTransactions
export * from './mockLeasingTransactions';
export * from './mockMarketSecurities';
export * from './mockOperations';
export * from './mockPMCompanies';
export * from './mockPortfolios';
export * from './mockRepayments';
export * from './mockReporting';
export * from './mockTraditionalPortfolios';
export * from './mockWorkflows';

export { default as useLoading } from './useLoading';
export { default as useGranularLoading } from './useGranularLoading';

// API Hooks
export { default as usePaymentSchedule } from './usePaymentSchedule';
export { useCreditContracts } from './useCreditContracts';
export { useContractSchedule } from './useContractSchedule';
export { default as useContractDocuments } from './useContractDocuments';
export { useContractActions } from './useContractActions';
export { useDisbursements } from './useDisbursements';

// User API Hooks
export { 
  useUsersApi, 
  useUserDetails, 
  useCurrentUser,
  useCurrentUserWithInstitution,
  useUserRolesAndPermissions,
  useUserActivity,
  useUserSessions,
  useUserPreferences,
  useChangeUserStatus
} from './useUsersApi';

// Context & Permission Hooks
export { useAppContext } from './useAppContext';
export type { UseAppContextResult } from './useAppContext';
export { usePermissions } from './usePermissions';

// Institution ID Management - Garantit la disponibilité de institutionId avec retry automatique
export { 
  useInstitutionId, 
  useIsInstitutionReady, 
  useWaitForInstitutionId 
} from './useInstitutionId';

// Centrale de Risque Hooks
export {
  useCreditRisk,
  useLeasingRisk,
  useInvestmentRisk,
  useSubmitRiskEntry,
  useRiskStatistics,
  useCompanyRiskProfile,
  useRiskSummary,
  useCentraleRisqueComplete,
  useRiskEntries,
  useIncidents,
  useAlerts,
  useCentraleRisqueStats,
  useEntityRiskSummary,
  useCentraleRisqueV2Page
} from './useCentraleRisqueApi';

// Risk Statistics Hooks (OHADA/BCC)
export {
  usePortfolioRiskStats,
  useContractDaysOverdue,
  useUpdateContractClassification,
  useUpdateAllClassifications,
  useRegulatoryThresholds,
  useActiveRiskAlerts,
  useRiskStatisticsPage,
  getRiskClassFromDaysOverdue,
  getProvisionRate
} from './useRiskStatistics';

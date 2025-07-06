export type ReportType = 'financial' | 'investment' | 'risk';
export type ReportStatus = 'draft' | 'final';

export interface Report {
  id: string;
  title: string;
  type: ReportType;
  date: string;
  size: string;
  status: ReportStatus;
}

export interface ReportFilters {
  type?: ReportType;
  startDate?: string;
  endDate?: string;
}
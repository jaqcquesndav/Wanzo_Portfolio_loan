import { apiClient } from './base.api';
import type { Company } from '../../types/company';

export const prospectionApi = {
  getCompanies: () => {
    return apiClient.get<Company[]>('/companies');
  },

  createCompany: (data: Partial<Company>) => {
    return apiClient.post<Company>('/companies', data);
  },

  updateCompany: (id: string, data: Partial<Company>) => {
    return apiClient.put<Company>(`/companies/${id}`, data);
  },

  createMeeting: (data: {
    companyId: string;
    type: 'physical' | 'virtual';
    date: string;
    time: string;
    location?: string;
    notes?: string;
  }) => {
    return apiClient.post('/meetings', data);
  },

  initiateContact: (companyId: string) => {
    return apiClient.post(`/companies/${companyId}/contact`);
  }
};
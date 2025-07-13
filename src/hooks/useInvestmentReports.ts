// src/hooks/useInvestmentReports.ts
import { useMemo, useState } from 'react';
import { mockInvestments, sectors, countries, stages, InvestmentReportData } from '../data';

// Define types for our filter and chart data
// These types are used in the return values of filterOptions and chartData
export type FilterOption = { id: string; label: string };
export type ChartDataItem = { name: string; value: number };

// Extended interface to include custom properties used in the hook
interface InvestmentItem extends InvestmentReportData {
  exitStatus?: string;         // Maps to status in the original data
  initialInvestment?: number;  // Maps to investmentAmount in the original data
  returnMultiple?: number;     // Maps to multiple in the original data
  holdingPeriod?: number;      // Calculated field
  jobsCreated?: number;        // Additional field
}

export const useInvestmentReports = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState({
    sectors: [] as string[],
    countries: [] as string[],
    stages: [] as string[],
    statuses: [] as string[],
    dateRange: {
      from: null as Date | null,
      to: null as Date | null,
    },
  });

  // Format data for filter options
  const filterOptions = useMemo(() => {
    const exitStatuses = ['Active', 'En cours de cession', 'Cédée', 'Dépréciation'];
    
    return {
      sectors: sectors.map((sector: string) => ({ id: sector, label: sector })),
      countries: countries.map((country: string) => ({ id: country, label: country })),
      stages: stages.map((stage: string) => ({ id: stage, label: stage })),
      statuses: exitStatuses.map((status: string) => ({ id: status, label: status })),
    };
  }, []);

  // Filter and search data
  const filteredData = useMemo(() => {
    return mockInvestments.filter((item: InvestmentItem) => {
      // Search term filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = 
          item.companyName.toLowerCase().includes(searchLower) ||
          item.sector.toLowerCase().includes(searchLower) ||
          item.country.toLowerCase().includes(searchLower) ||
          item.region.toLowerCase().includes(searchLower) ||
          item.stage.toLowerCase().includes(searchLower);
        
        if (!matchesSearch) return false;
      }
      
      // Sector filter
      if (activeFilters.sectors.length > 0 && !activeFilters.sectors.includes(item.sector)) {
        return false;
      }
      
      // Country filter
      if (activeFilters.countries.length > 0 && !activeFilters.countries.includes(item.country)) {
        return false;
      }
      
      // Stage filter
      if (activeFilters.stages.length > 0 && !activeFilters.stages.includes(item.stage)) {
        return false;
      }
      
      // Status filter
      if (activeFilters.statuses.length > 0 && !activeFilters.statuses.includes(item.exitStatus || item.status)) {
        return false;
      }
      
      // Date range filter
      const itemDate = new Date(item.investmentDate);
      if (activeFilters.dateRange.from && itemDate < activeFilters.dateRange.from) {
        return false;
      }
      if (activeFilters.dateRange.to && itemDate > activeFilters.dateRange.to) {
        return false;
      }
      
      return true;
    });
  }, [searchTerm, activeFilters]);

  // Calculate summary metrics
  const summaryMetrics = useMemo(() => {
    if (!filteredData.length) {
      return {
        totalInvestment: 0,
        totalCurrentValue: 0,
        averageMultiple: 0,
        averageIRR: 0,
        averageHoldingPeriod: 0,
        totalCompanies: 0,
        activeCompanies: 0,
        jobsCreated: 0,
        mostCommonSector: '',
        mostCommonCountry: '',
        exitedDeals: 0,
        lossPercentage: 0,
      };
    }

    const totalInvestment = filteredData.reduce((sum: number, item: InvestmentItem) => sum + (item.initialInvestment || item.investmentAmount || 0), 0);
    const totalCurrentValue = filteredData.reduce((sum: number, item: InvestmentItem) => sum + (item.currentValuation || 0), 0);
    
    const sectorCounts: Record<string, number> = {};
    const countryCounts: Record<string, number> = {};
    let activeCount = 0;
    let exitedDeals = 0;
    let lossCount = 0;
    
    filteredData.forEach((item: InvestmentItem) => {
      // Count sectors
      sectorCounts[item.sector] = (sectorCounts[item.sector] || 0) + 1;
      
      // Count countries
      countryCounts[item.country] = (countryCounts[item.country] || 0) + 1;
      
      // Count active investments
      if ((item.exitStatus || item.status) === 'Active') activeCount++;
      
      // Count exited deals
      if ((item.exitStatus || item.status) === 'Cédée') exitedDeals++;
      
      // Count losses
      if ((item.returnMultiple || item.multiple || 0) < 1) lossCount++;
    });
    
    const mostCommonSector = Object.entries(sectorCounts)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || '';
    
    const mostCommonCountry = Object.entries(countryCounts)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || '';
    
    return {
      totalInvestment,
      totalCurrentValue,
      averageMultiple: filteredData.reduce((sum: number, item: InvestmentItem) => sum + (item.returnMultiple || item.multiple || 0), 0) / filteredData.length,
      averageIRR: filteredData.reduce((sum: number, item: InvestmentItem) => sum + (item.irr || 0), 0) / filteredData.length,
      averageHoldingPeriod: filteredData.reduce((sum: number, item: InvestmentItem) => sum + (item.holdingPeriod || 0), 0) / filteredData.length,
      totalCompanies: filteredData.length,
      activeCompanies: activeCount,
      jobsCreated: filteredData.reduce((sum: number, item: InvestmentItem) => sum + (item.jobsCreated || 0), 0),
      mostCommonSector,
      mostCommonCountry,
      exitedDeals,
      lossPercentage: (lossCount / filteredData.length) * 100,
    };
  }, [filteredData]);

  // Prepare data for charts
  const chartData = useMemo(() => {
    // Sector distribution
    const sectorData = sectors.map((sector: string) => {
      const count = filteredData.filter((item: InvestmentItem) => item.sector === sector).length;
      return { name: sector, value: count };
    }).filter((item: { name: string, value: number }) => item.value > 0)
      .sort((a: { value: number }, b: { value: number }) => b.value - a.value);

    // Country distribution
    const countryData = countries.map((country: string) => {
      const count = filteredData.filter((item: InvestmentItem) => item.country === country).length;
      return { name: country, value: count };
    }).filter((item: { name: string, value: number }) => item.value > 0)
      .sort((a: { value: number }, b: { value: number }) => b.value - a.value);

    // Performance by stage
    const stagePerformance = stages.map((stage: string) => {
      const stageItems = filteredData.filter((item: InvestmentItem) => item.stage === stage);
      const avgMultiple = stageItems.length 
        ? stageItems.reduce((sum: number, item: InvestmentItem) => sum + (item.returnMultiple || item.multiple || 0), 0) / stageItems.length 
        : 0;
      return { name: stage, value: avgMultiple };
    }).filter((item: { name: string, value: number }) => item.value > 0);

    // Year distribution
    const yearCounts: Record<string, number> = {};
    filteredData.forEach((item: InvestmentItem) => {
      const year = item.investmentDate.split('-')[0];
      yearCounts[year] = (yearCounts[year] || 0) + 1;
    });
    
    const yearData = Object.entries(yearCounts)
      .map(([year, count]: [string, number]) => ({ name: year, value: count }))
      .sort((a: { name: string }, b: { name: string }) => a.name.localeCompare(b.name));

    return {
      sectorData,
      countryData,
      stagePerformance,
      yearData
    };
  }, [filteredData]);

  return {
    data: filteredData,
    searchTerm,
    setSearchTerm,
    activeFilters,
    setActiveFilters,
    filterOptions,
    summaryMetrics,
    chartData,
    allData: mockInvestments,
  };
};

// Extended type to include additional fields used in reports
interface ExtendedInvestmentReportData extends InvestmentReportData {
  exitStatus?: string;         // Maps to status in the original data
  initialInvestment?: number;  // Maps to investmentAmount in the original data
  returnMultiple?: number;     // Maps to multiple in the original data
  holdingPeriod?: number;      // Calculated field
  jobsCreated?: number;        // Additional field
  lastValuationDate?: string;  // Additional field
  legalStructure?: string;     // Additional field
  ohada?: boolean;             // Additional field
  riskLevel?: string;          // Maps to riskRating in the original data
}

export type InvestmentReportColumn = {
  header: string;
  accessorKey: keyof ExtendedInvestmentReportData;
  format?: 'currency' | 'percentage' | 'date' | 'number' | 'boolean';
};

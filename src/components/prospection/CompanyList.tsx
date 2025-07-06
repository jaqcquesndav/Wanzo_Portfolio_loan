import React from 'react';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../ui/Table';
// import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Eye } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import type { Company } from '../../types/company';

interface CompanyListProps {
  companies: Company[];
  // onContact: (company: Company) => void;
  // onScheduleMeeting: (company: Company) => void;
  onViewDetails: (company: Company) => void;
}

export function CompanyList({
  companies,
  // onContact,
  // onScheduleMeeting,
  onViewDetails
}: CompanyListProps) {
  // Fonctions de tendance (simulées)
  const getTrendIcon = (trend: number) => {
    if (trend > 0) {
      return <span title="En hausse" className="ml-1 text-green-500"><svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 7l-5 5-5-5"/><path d="M12 12V3"/></svg></span>;
    } else if (trend < 0) {
      return <span title="En baisse" className="ml-1 text-red-500"><svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M7 17l5-5 5 5"/><path d="M12 12v9"/></svg></span>;
    } else {
      return <span title="Stable" className="ml-1 text-gray-400"><svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 12h14"/></svg></span>;
    }
  };
  const getRandomTrend = () => [1, 0, -1][Math.floor(Math.random() * 3)];

  return (
    <div className="w-full overflow-x-auto">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm min-w-[900px]">
          <Table className="min-w-full">
            <TableHead>
              <TableRow>
                <TableHeader>Entreprise</TableHeader>
                <TableHeader>Secteur</TableHeader>
                <TableHeader>Employés</TableHeader>
                <TableHeader>Valeur (CA)</TableHeader>
                <TableHeader>Croissance</TableHeader>
                <TableHeader>MBE (EBITDA)</TableHeader>
                <TableHeader>Cote crédit</TableHeader>
                <TableHeader>Note ESG</TableHeader>
                <TableHeader align="right">Action</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {companies.map((company) => {
                const caTrend = getRandomTrend();
                const creditTrend = getRandomTrend();
                const mbeTrend = getRandomTrend();
                return (
                  <TableRow key={company.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {company.name}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{company.sector}</TableCell>
                    <TableCell>{company.employee_count}</TableCell>
                    <TableCell>
                      <span className="flex items-center">
                        {formatCurrency(company.annual_revenue)}
                        {getTrendIcon(caTrend)}
                      </span>
                    </TableCell>
                    <TableCell>{company.financial_metrics.revenue_growth}%</TableCell>
                    <TableCell>
                      <span className="flex items-center">
                        {company.financial_metrics.ebitda ? formatCurrency(company.financial_metrics.ebitda) : '-'}
                        {getTrendIcon(mbeTrend)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="flex items-center">
                        {company.financial_metrics.credit_score}
                        {getTrendIcon(creditTrend)}
                      </span>
                    </TableCell>
                    <TableCell>{company.esg_metrics?.esg_rating || '-'}</TableCell>
                    <TableCell align="right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewDetails(company)}
                        icon={<Eye className="h-4 w-4" />}
                      >
                        Voir détails
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
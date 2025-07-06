import React from 'react';
import { Building, Users, TrendingUp, MessageSquare, Calendar, Globe, Star, Leaf } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { formatCurrency } from '../../utils/formatters';
import type { Company } from '../../types/company';

interface CompanyCardProps {
  company: Company;
  onContact: (company: Company) => void;
  onScheduleMeeting: (company: Company) => void;
  onViewDetails: (company: Company) => void;
}

export function CompanyCard({
  company,
  onContact,
  onScheduleMeeting,
  onViewDetails
}: CompanyCardProps) {
  const getRatingColor = (rating: 'A' | 'B' | 'C' | 'D') => {
    switch (rating) {
      case 'A': return 'text-green-500';
      case 'B': return 'text-blue-500';
      case 'C': return 'text-yellow-500';
      case 'D': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getCreditScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-blue-500';
    if (score >= 40) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <Badge variant={company.status === 'active' ? 'success' : 'warning'}>
              {company.status}
            </Badge>
            <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">
              {company.name}
            </h3>
          </div>
          <Building className="h-6 w-6 text-gray-400" />
        </div>

        {/* Métriques clés */}
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Score Crédit
            </p>
            <p className={`text-lg font-semibold ${getCreditScoreColor(company.financial_metrics.credit_score)}`}>
              {company.financial_metrics.credit_score}/100
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Note Financière
            </p>
            <p className={`text-lg font-semibold ${getRatingColor(company.financial_metrics.financial_rating)}`}>
              {company.financial_metrics.financial_rating}
            </p>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {/* Secteur et site web */}
          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center">
              <Building className="h-4 w-4 mr-2" />
              {company.sector}
            </div>
            {company.website_url && (
              <a 
                href={company.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-primary hover:text-primary-dark"
              >
                <Globe className="h-4 w-4 mr-1" />
                Site web
              </a>
            )}
          </div>

          {/* Métriques financières */}
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <TrendingUp className="h-4 w-4 mr-2" />
            CA: {formatCurrency(company.annual_revenue)}
            <span className="mx-2">•</span>
            Croissance: {company.financial_metrics.revenue_growth}%
          </div>

          {/* Employés */}
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <Users className="h-4 w-4 mr-2" />
            {company.employee_count} employés
          </div>

          {/* Empreinte carbone */}
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <Leaf className="h-4 w-4 mr-2" />
            <span>Note ESG: </span>
            <div className="ml-2 flex space-x-2">
              <Badge variant="success">
                E: {company.esg_metrics.environmental_rating}
              </Badge>
              <Badge variant="primary">
                S: {company.esg_metrics.social_rating}
              </Badge>
              <Badge variant="warning">
                G: {company.esg_metrics.governance_rating}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-t dark:border-gray-600">
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onContact(company)}
            icon={<MessageSquare className="h-4 w-4" />}
          >
            Contacter
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onScheduleMeeting(company)}
            icon={<Calendar className="h-4 w-4" />}
          >
            RDV
          </Button>
          <Button
            className="flex-1"
            onClick={() => onViewDetails(company)}
          >
            Voir détails
          </Button>
        </div>
      </div>
    </div>
  );
}
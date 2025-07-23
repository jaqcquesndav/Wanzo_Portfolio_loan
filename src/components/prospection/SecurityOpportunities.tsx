import React from 'react';
import { DollarSign, Calendar, FileText } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { formatCurrency } from '../../utils/formatters';
import type { SecurityOpportunity } from '../../types/company';

interface SecurityOpportunitiesProps {
  opportunities: SecurityOpportunity[];
  onViewDetails: (opportunity: SecurityOpportunity) => void;
}

export function SecurityOpportunities({ opportunities, onViewDetails }: SecurityOpportunitiesProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Opportunités d'investissement</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {opportunities.map((opportunity, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
            <div className="flex justify-between items-start mb-4">
              <Badge variant={opportunity.type === 'bond' ? 'primary' : 'success'}>
                {opportunity.type === 'bond' ? 'Obligation' : 'Action'}
              </Badge>
              <Badge variant={
                opportunity.details.status === 'active' ? 'success' :
                opportunity.details.status === 'upcoming' ? 'warning' : 'error'
              }>
                {opportunity.details.status}
              </Badge>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Montant total</span>
                <span className="font-medium">{formatCurrency(opportunity.details.totalAmount, undefined, 'USD')}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Prix unitaire</span>
                <span className="font-medium">{formatCurrency(opportunity.details.unitPrice, undefined, 'USD')}</span>
              </div>

              {opportunity.type === 'bond' && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Taux d'intérêt</span>
                    <span className="font-medium">{opportunity.details.interestRate}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Échéance</span>
                    <span className="font-medium">{new Date(opportunity.details.maturityDate!).toLocaleDateString()}</span>
                  </div>
                </>
              )}

              {opportunity.type === 'share' && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Rendement div.</span>
                  <span className="font-medium">{opportunity.details.dividendYield}%</span>
                </div>
              )}
            </div>

            <div className="mt-4">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => onViewDetails(opportunity)}
              >
                Voir les détails
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// src/components/prospection/CompanyDetails.tsx
import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { useCurrencyContext } from '../../hooks/useCurrencyContext';
import type { Company as BaseCompany, SecurityOpportunity, CompanyDocument as CompanyDocType } from '../../types/company';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';

interface FinancialHighlights {
  [key: string]: number | string;
}
// Extend BaseCompany with custom fields and override conflicting types
interface Company extends Omit<BaseCompany, 'annual_revenue' | 'employee_count'> {
  annual_revenue?: number; // Make optional
  employee_count?: number; // Make optional
  founded?: number;
  employees?: number;
  financialHighlights?: FinancialHighlights;
  securities?: SecurityOpportunity[];
  documents?: CompanyDocType[];
  financial_documents?: {
    id: string;
    name: string;
    type: string;
    url: string;
    date: string;
  }[];
  leadership_team?: {
    id: string;
    name: string;
    title: string;
    photo?: string;
    linkedin?: string;
    gender?: 'male' | 'female' | 'other';
    bio?: string;
  }[];
  logo?: string;
  description?: string;
  creditRating?: string;
  esgScore?: string | number;
  industry?: string;
  legalForm?: string;
  rccm?: string;
  taxId?: string;
  natId?: string;
  address?: {
    street?: string;
    city?: string;
    country?: string;
  };
  contacts?: {
    email?: string;
    phone?: string;
  };
  socialMedia?: {
    website?: string;
    facebook?: string;
    linkedin?: string;
    twitter?: string;
    youtube?: string;
  };
  socialIcons?: {
    website?: React.ComponentType<{className?: string, size?: number}>;
    facebook?: React.ComponentType<{className?: string, size?: number}>;
    linkedin?: React.ComponentType<{className?: string, size?: number}>;
    twitter?: React.ComponentType<{className?: string, size?: number}>;
    youtube?: React.ComponentType<{className?: string, size?: number}>;
  };
  capital?: {
    amount?: number;
    currency?: string;
    isApplicable?: boolean;
  };
  presentation_video?: string;
  ceo?: {
    name?: string;
    gender?: 'male' | 'female' | 'other';
    title?: string;
    linkedin?: string;
    bio?: string;
    photo?: string;
  };
}

interface CompanyDetailsProps {
  company: Company;
  onClose: () => void;
}

export function CompanyDetails({
  company,
  onClose,
}: CompanyDetailsProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const modalRef = useRef<HTMLDivElement>(null);
  // Use currency context for formatting money values
  const { formatAmount } = useCurrencyContext();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    modalRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  if (!company) return null;

  // Helper function to format any monetary values using currency context
  const formatMonetaryValue = (value: number | undefined): string => {
    if (value === undefined) return '-';
    return formatAmount(value);
  };

  return (
    <div
      role="dialog"
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div ref={modalRef} className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* En-tête de la modal */}
        <div className="p-6 flex justify-between items-center border-b dark:border-gray-700">
          <div className="flex items-center space-x-4">
            <img
              src={company.logo || '/default-logo.png'}
              alt={`${company.name} logo`}
              className="w-16 h-16 rounded-lg object-contain border shadow"
            />
            <div>
              <Badge variant="success" className="mb-1">
                {company.status === 'active' ? 'Actif' : 'Inactif'}
              </Badge>
              <h2 id="modal-title" className="text-2xl font-bold text-gray-900 dark:text-white">
                {company.name}
              </h2>
            </div>
          </div>
          <div className="flex space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              aria-label="Fermer"
              className="ml-2"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        {/* Use the existing component structure, but ensure monetary values use the currency formatter */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="overview" currentValue={activeTab} onValueChange={setActiveTab}>Aperçu</TabsTrigger>
            <TabsTrigger value="documents" currentValue={activeTab} onValueChange={setActiveTab}>Documents</TabsTrigger>
            <TabsTrigger value="leadership" currentValue={activeTab} onValueChange={setActiveTab}>Direction</TabsTrigger>
          </TabsList>
          
          {/* Content with formatAmount for monetary values */}
          <TabsContent value="overview" currentValue={activeTab} className="p-4">
            <div>
              {company.annual_revenue !== undefined && (
                <div className="mt-2">
                  <span className="font-medium">Chiffre d'affaires annuel:</span> {formatMonetaryValue(company.annual_revenue)}
                </div>
              )}
              
              {company.capital?.amount !== undefined && company.capital.isApplicable !== false && (
                <div className="mt-2">
                  <span className="font-medium">Capital:</span> {formatMonetaryValue(company.capital.amount)}
                </div>
              )}
              
              {company.financial_metrics?.ebitda !== undefined && (
                <div className="mt-2">
                  <span className="font-medium">EBITDA:</span> {formatMonetaryValue(company.financial_metrics.ebitda)}
                </div>
              )}
            </div>
          </TabsContent>
          
          {/* Other tabs content with children */}
          <TabsContent value="documents" currentValue={activeTab} className="p-4">
            <div>
              <p>Documents de l'entreprise seront affichés ici</p>
            </div>
          </TabsContent>
          
          <TabsContent value="leadership" currentValue={activeTab} className="p-4">
            <div>
              <p>Équipe de direction sera affichée ici</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

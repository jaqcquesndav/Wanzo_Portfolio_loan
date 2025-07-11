import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { formatCurrency } from '../../utils/formatters';
import type { Company as BaseCompany, SecurityOpportunity, CompanyDocument as CompanyDocType } from '../../types/company';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import { CompanyDocuments } from './CompanyDocuments';

interface FinancialHighlights {
  [key: string]: number | string;
}
interface Company extends BaseCompany {
  founded?: number;
  employees?: number;
  financialHighlights?: FinancialHighlights;
  securities?: SecurityOpportunity[];
  documents?: CompanyDocType[];
  logo?: string;
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
  capital?: {
    amount?: number;
    currency?: string;
    isApplicable?: boolean;
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

  return (
    <div
      role="dialog"
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div ref={modalRef} className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* En-tête de la modal */}
        <div className="p-6 flex justify-between items-start border-b dark:border-gray-700">
          <div>
            <Badge variant={company.status === 'active' ? 'success' : 'warning'}>
              {company.status === 'active' ? 'Actif' : 'Inactif'}
            </Badge>
            <h2 id="modal-title" className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
              {company.name}
            </h2>
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
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="overview" currentValue={activeTab} onValueChange={setActiveTab}>Aperçu</TabsTrigger>
            <TabsTrigger value="financials" currentValue={activeTab} onValueChange={setActiveTab}>Finances</TabsTrigger>
            <TabsTrigger value="documents" currentValue={activeTab} onValueChange={setActiveTab}>Documents</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" currentValue={activeTab}>
            <div className="flex flex-col md:flex-row gap-8 items-center mb-8">
              <img
                src={company.logo || '/default-logo.png'}
                alt={company.name}
                className="w-28 h-28 rounded-full object-cover border shadow"
              />
              <div className="flex-1">
                <div className="flex flex-wrap gap-2 items-center mb-2">
                  {company.sector || company.industry ? (
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm text-gray-600 dark:text-gray-300">
                      {company.sector || company.industry}
                    </span>
                  ) : null}
                  <Badge variant={company.status === 'active' ? 'success' : 'warning'}>
                    {company.status === 'active' ? 'Actif' : 'Inactif'}
                  </Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 mt-4">
                  <div>
                    <div className="mb-1"><span className="font-semibold">Identifiant :</span> <span className="text-gray-700 dark:text-gray-200">{company.id}</span></div>
                    {company.legalForm && (
                      <div className="mb-1"><span className="font-semibold">Forme juridique :</span> <span className="text-gray-700 dark:text-gray-200">{company.legalForm}</span></div>
                    )}
                    {company.rccm && (
                      <div className="mb-1"><span className="font-semibold">RCCM :</span> <span className="text-gray-700 dark:text-gray-200">{company.rccm}</span></div>
                    )}
                    {company.taxId && (
                      <div className="mb-1"><span className="font-semibold">Identifiant fiscal :</span> <span className="text-gray-700 dark:text-gray-200">{company.taxId}</span></div>
                    )}
                    {company.natId && (
                      <div className="mb-1"><span className="font-semibold">Identifiant national :</span> <span className="text-gray-700 dark:text-gray-200">{company.natId}</span></div>
                    )}
                  </div>
                  <div>
                    <div className="mb-1"><span className="font-semibold">Adresse :</span> <span className="text-gray-700 dark:text-gray-200">{[company.address?.street, company.address?.city, company.address?.country].filter(Boolean).join(', ') || '-'}</span></div>
                    <div className="mb-1"><span className="font-semibold">Contacts :</span> <span className="text-gray-700 dark:text-gray-200">{company.contacts?.email ? `Email : ${company.contacts.email}` : ''}{company.contacts?.email && company.contacts?.phone ? ' | ' : ''}{company.contacts?.phone ? `Téléphone : ${company.contacts.phone}` : ''}</span></div>
                    <div className="mb-1"><span className="font-semibold">Capital :</span> <span className="text-gray-700 dark:text-gray-200">{company.capital?.amount ? `${company.capital.amount.toLocaleString()} ${company.capital.currency}` : '-'} {company.capital?.isApplicable ? '(Applicable)' : ''}</span></div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div><span className="font-semibold">Année de création :</span> <span className="text-gray-700 dark:text-gray-200">{company.founded || '-'}</span></div>
                  <div><span className="font-semibold">Nombre d'employés :</span> <span className="text-gray-700 dark:text-gray-200">{company.employee_count || company.employees || '-'}</span></div>
                  <div><span className="font-semibold">Chiffre d'affaires :</span> <span className="text-gray-700 dark:text-gray-200">{company.annual_revenue ? formatCurrency(company.annual_revenue) : '-'}</span></div>
                  <div><span className="font-semibold">Cote crédit :</span> <span className="text-gray-700 dark:text-gray-200">{company.creditRating || '-'}</span></div>
                  <div><span className="font-semibold">Note ESG :</span> <span className="text-gray-700 dark:text-gray-200">{company.esgScore !== undefined ? company.esgScore : '-'}</span></div>
                </div>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="financials" currentValue={activeTab}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {company.financialHighlights &&
                Object.entries(company.financialHighlights).map(([key, value]) => (
                  <div key={key} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <h4 className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </h4>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {typeof value === 'number'
                        ? key.toLowerCase().includes('ratio') || key.toLowerCase().includes('growth')
                          ? `${value.toFixed(2)}%`
                          : formatCurrency(value as number)
                        : value}
                    </p>
                  </div>
                ))}
            </div>
          </TabsContent>
          <TabsContent value="documents" currentValue={activeTab}>
            {company.documents && company.documents.length > 0 ? (
              <CompanyDocuments
                documents={company.documents}
                onView={(doc) => {
                  window.open(doc.url, '_blank');
                }}
                onDownload={(doc) => {
                  const link = document.createElement('a');
                  link.href = doc.url;
                  link.download = doc.title;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
              />
            ) : (
              <p className="text-gray-500 dark:text-gray-400">Aucun document disponible.</p>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
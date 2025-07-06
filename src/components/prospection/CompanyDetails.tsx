import React, { useState, useEffect, useRef } from 'react';
import { Building, Users, TrendingUp, DollarSign, Calendar, X, Play } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { formatCurrency } from '../../utils/formatters';
import type { Company } from '../../types/company';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import { SecurityOpportunities } from './SecurityOpportunities';
import { CompanyDocuments } from './CompanyDocuments';

interface CompanyDetailsProps {
  company: Company;
  onClose: () => void;
  onContact: (company: Company) => void;
  onScheduleMeeting: (company: Company) => void;
}

export function CompanyDetails({
  company,
  onClose,
  onContact,
  onScheduleMeeting,
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
            <Button onClick={() => onContact(company)}>Contacter</Button>
            <Button variant="outline" onClick={() => onScheduleMeeting(company)}>
              Planifier RDV
            </Button>
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

        {/* Sections avec onglets */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="p-6">
          <TabsList>
            <TabsTrigger value="overview" currentValue={activeTab} onValueChange={setActiveTab}>
              Aperçu
            </TabsTrigger>
            <TabsTrigger value="financials" currentValue={activeTab} onValueChange={setActiveTab}>
              Données financières
            </TabsTrigger>
            <TabsTrigger value="securities" currentValue={activeTab} onValueChange={setActiveTab}>
              Valeurs mobilières
            </TabsTrigger>
            <TabsTrigger value="documents" currentValue={activeTab} onValueChange={setActiveTab}>
              Documents
            </TabsTrigger>
          </TabsList>
 
          {/* Aperçu */}
          <TabsContent value="overview" currentValue={activeTab}>
            <div className="space-y-6">
              {/* Vidéo de pitch */}
              {company.pitch_deck_url && (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Pitch de l'entreprise
                  </h3>
                  <div className="aspect-w-16 aspect-h-9">
                    <iframe
                      src={company.pitch_deck_url}
                      title="Company Pitch"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full rounded-lg"
                    />
                  </div>
                </div>
              )}

              {/* Informations générales */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center">
                  <Building className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Secteur</p>
                    <p className="font-medium text-gray-900 dark:text-white">{company.sector || 'Non disponible'}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Users className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Employés</p>
                    <p className="font-medium text-gray-900 dark:text-white">{company.employee_count}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <DollarSign className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Chiffre d'affaires</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {formatCurrency(company.annual_revenue)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <TrendingUp className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Croissance</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {company.financial_metrics.revenue_growth}%
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Données financières */}
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
                          : formatCurrency(value)
                        : value}
                    </p>
                  </div>
                ))}
            </div>
          </TabsContent>

          {/* Valeurs mobilières */}
          <TabsContent value="securities" currentValue={activeTab}>
            {company.securities && company.securities.length > 0 ? (
              <SecurityOpportunities
                opportunities={company.securities}
                onViewDetails={(opportunity) => {
                  console.log('Détails de l\'opportunité:', opportunity);
                }}
              />
            ) : (
              <p className="text-gray-500 dark:text-gray-400">Aucune opportunité de valeurs mobilières disponible.</p>
            )}
          </TabsContent>

          {/* Documents */}
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
                  link.download = doc.name;
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
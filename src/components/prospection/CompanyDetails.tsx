import { useState, useEffect, useRef } from 'react';
import { X, Globe, Facebook, Linkedin, Twitter, Youtube } from 'lucide-react';
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
  socialMedia?: {
    website?: string;
    facebook?: string;
    linkedin?: string;
    twitter?: string;
    youtube?: string;
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
        <div className="p-6 flex justify-between items-center border-b dark:border-gray-700">
          <div className="flex items-center space-x-4">
            <img
              src={company.logo || '/default-logo.png'}
              alt={`${company.name} logo`}
              className="w-16 h-16 rounded-lg object-contain border shadow"
            />
            <div>
              <Badge variant={company.status === 'active' ? 'success' : 'warning'} className="mb-1">
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
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="overview" currentValue={activeTab} onValueChange={setActiveTab}>Aperçu</TabsTrigger>
            <TabsTrigger value="documents" currentValue={activeTab} onValueChange={setActiveTab}>Documents</TabsTrigger>
            <TabsTrigger value="leadership" currentValue={activeTab} onValueChange={setActiveTab}>Direction</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" currentValue={activeTab} className="p-4">
            <div className="mb-8">
              <div className="flex flex-wrap gap-2 items-center mb-4">
                {company.sector || company.industry ? (
                  <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm text-gray-600 dark:text-gray-300">
                    {company.sector || company.industry}
                  </span>
                ) : null}
              </div>
              
              {/* Vidéo de présentation */}
              {company.presentation_video && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">Présentation vidéo</h3>
                  <div className="relative w-full overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm" style={{ paddingBottom: '56.25%' }}>
                    <iframe
                      src={company.presentation_video}
                      title={`Présentation de ${company.name}`}
                      className="absolute inset-0 w-full h-full"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                </div>
              )}
              
              {/* Liens sociaux */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Liens externes</h3>
                <div className="flex flex-wrap gap-3">
                  {company.socialMedia?.website && (
                    <a 
                      href={company.socialMedia.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 px-3 py-2 rounded-md bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-sm"
                    >
                      <Globe className="h-4 w-4" /> Site web
                    </a>
                  )}
                  {company.socialMedia?.facebook && (
                    <a 
                      href={company.socialMedia.facebook} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 px-3 py-2 rounded-md bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 text-sm text-blue-700 dark:text-blue-300"
                    >
                      <Facebook className="h-4 w-4" /> Facebook
                    </a>
                  )}
                  {company.socialMedia?.linkedin && (
                    <a 
                      href={company.socialMedia.linkedin} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 px-3 py-2 rounded-md bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 text-sm text-blue-700 dark:text-blue-300"
                    >
                      <Linkedin className="h-4 w-4" /> LinkedIn
                    </a>
                  )}
                  {company.socialMedia?.twitter && (
                    <a 
                      href={company.socialMedia.twitter} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 px-3 py-2 rounded-md bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 text-sm text-blue-600 dark:text-blue-300"
                    >
                      <Twitter className="h-4 w-4" /> Twitter
                    </a>
                  )}
                  {company.socialMedia?.youtube && (
                    <a 
                      href={company.socialMedia.youtube} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 px-3 py-2 rounded-md bg-red-100 hover:bg-red-200 dark:bg-red-900 dark:hover:bg-red-800 text-sm text-red-600 dark:text-red-300"
                    >
                      <Youtube className="h-4 w-4" /> YouTube
                    </a>
                  )}
                  {!company.socialMedia?.website && !company.socialMedia?.facebook && 
                   !company.socialMedia?.linkedin && !company.socialMedia?.twitter && 
                   !company.socialMedia?.youtube && (
                    <span className="text-gray-500 dark:text-gray-400">Aucun lien externe disponible</span>
                  )}
                </div>
              </div>

              {/* Informations de l'entreprise */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
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
          </TabsContent>
          <TabsContent value="leadership" currentValue={activeTab} className="p-4">
            {company.ceo ? (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                  {company.ceo.photo && (
                    <div className="flex-shrink-0">
                      <img 
                        src={company.ceo.photo} 
                        alt={company.ceo.name || 'CEO'} 
                        className="w-24 h-24 object-cover rounded-full border-2 border-gray-200 dark:border-gray-700"
                      />
                    </div>
                  )}
                  
                  <div>
                    <h3 className="text-lg font-bold">{company.ceo.name || 'PDG/Directeur'}</h3>
                    {company.ceo.title && <p className="text-sm text-gray-600 dark:text-gray-400">{company.ceo.title}</p>}
                    {company.ceo.gender && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Genre: {company.ceo.gender === 'male' ? 'Homme' : company.ceo.gender === 'female' ? 'Femme' : 'Autre'}
                      </p>
                    )}
                    
                    {company.ceo.bio && (
                      <div className="mt-3">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Biographie</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{company.ceo.bio}</p>
                      </div>
                    )}
                    
                    {company.ceo.linkedin && (
                      <div className="mt-3">
                        <a 
                          href={company.ceo.linkedin} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-3 py-2 rounded-md bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 text-sm text-blue-700 dark:text-blue-300"
                        >
                          <Linkedin className="h-4 w-4" /> Profil LinkedIn
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">Aucune information sur la direction n'est disponible.</p>
            )}
          </TabsContent>
          <TabsContent value="documents" currentValue={activeTab} className="p-4">
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
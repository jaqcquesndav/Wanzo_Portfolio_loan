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
                  <div className="relative w-full overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 shadow-md" style={{ paddingBottom: '56.25%' }}>
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
                      className="flex items-center gap-1 px-3 py-2 rounded-md bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-sm transition-colors duration-200"
                    >
                      {company.socialIcons?.website ? 
                        <company.socialIcons.website className="h-4 w-4" /> : 
                        <Globe className="h-4 w-4" />} 
                      Site web
                    </a>
                  )}
                  {company.socialMedia?.facebook && (
                    <a 
                      href={company.socialMedia.facebook} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 px-3 py-2 rounded-md bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/60 dark:hover:bg-blue-800 text-sm text-blue-700 dark:text-blue-300 transition-colors duration-200"
                    >
                      {company.socialIcons?.facebook ? 
                        <company.socialIcons.facebook className="h-4 w-4" /> : 
                        <Facebook className="h-4 w-4" />} 
                      Facebook
                    </a>
                  )}
                  {company.socialMedia?.linkedin && (
                    <a 
                      href={company.socialMedia.linkedin} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 px-3 py-2 rounded-md bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/60 dark:hover:bg-blue-800 text-sm text-blue-700 dark:text-blue-300 transition-colors duration-200"
                    >
                      {company.socialIcons?.linkedin ? 
                        <company.socialIcons.linkedin className="h-4 w-4" /> : 
                        <Linkedin className="h-4 w-4" />} 
                      LinkedIn
                    </a>
                  )}
                  {company.socialMedia?.twitter && (
                    <a 
                      href={company.socialMedia.twitter} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 px-3 py-2 rounded-md bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/60 dark:hover:bg-blue-800 text-sm text-blue-600 dark:text-blue-300 transition-colors duration-200"
                    >
                      {company.socialIcons?.twitter ? 
                        <company.socialIcons.twitter className="h-4 w-4" /> : 
                        <Twitter className="h-4 w-4" />} 
                      Twitter
                    </a>
                  )}
                  {company.socialMedia?.youtube && (
                    <a 
                      href={company.socialMedia.youtube} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 px-3 py-2 rounded-md bg-red-100 hover:bg-red-200 dark:bg-red-900/60 dark:hover:bg-red-800 text-sm text-red-600 dark:text-red-300 transition-colors duration-200"
                    >
                      {company.socialIcons?.youtube ? 
                        <company.socialIcons.youtube className="h-4 w-4" /> : 
                        <Youtube className="h-4 w-4" />} 
                      YouTube
                    </a>
                  )}
                  {!company.socialMedia?.website && !company.socialMedia?.facebook && 
                   !company.socialMedia?.linkedin && !company.socialMedia?.twitter && 
                   !company.socialMedia?.youtube && (
                    <span className="text-gray-500 dark:text-gray-400">Aucun lien externe disponible</span>
                  )}
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4">À propos de l'entreprise</h3>
                <p className="text-gray-700 dark:text-gray-300 mb-4">{company.description}</p>
                
                {/* Informations clés */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-blue-700 dark:text-blue-300 mb-1">Année de fondation</h4>
                    <p className="text-2xl font-bold text-blue-800 dark:text-blue-200">{company.founded || '-'}</p>
                  </div>
                  
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-green-700 dark:text-green-300 mb-1">Employés</h4>
                    <p className="text-2xl font-bold text-green-800 dark:text-green-200">{company.employee_count || company.employees || '-'}</p>
                  </div>
                  
                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-purple-700 dark:text-purple-300 mb-1">Chiffre d'affaires</h4>
                    <p className="text-2xl font-bold text-purple-800 dark:text-purple-200">{company.annual_revenue ? formatCurrency(company.annual_revenue) : '-'}</p>
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4">Informations juridiques et administratives</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
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
                    <div className="mb-1"><span className="font-semibold">Note ESG :</span> <span className="text-gray-700 dark:text-gray-200">{company.esgScore !== undefined ? company.esgScore : '-'}</span></div>
                    <div className="mb-1"><span className="font-semibold">Cote crédit :</span> <span className="text-gray-700 dark:text-gray-200">{company.creditRating || '-'}</span></div>
                  </div>
                </div>
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
            
            {company.leadership_team && company.leadership_team.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-4">Équipe de direction</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {company.leadership_team.map(member => (
                    <div key={member.id} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 flex gap-4">
                      {member.photo && (
                        <div className="flex-shrink-0">
                          <img 
                            src={member.photo} 
                            alt={member.name} 
                            className="w-16 h-16 object-cover rounded-full border-2 border-gray-200 dark:border-gray-700"
                          />
                        </div>
                      )}
                      <div>
                        <h4 className="font-medium">{member.name}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{member.title}</p>
                        {member.bio && (
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">{member.bio}</p>
                        )}
                        {member.linkedin && (
                          <a 
                            href={member.linkedin} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 mt-2 px-2 py-1 rounded text-xs bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 text-blue-700 dark:text-blue-300"
                          >
                            <Linkedin className="h-3 w-3" /> LinkedIn
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
          <TabsContent value="documents" currentValue={activeTab} className="p-4">
            {(company.documents && company.documents.length > 0) || 
             (company.financial_documents && company.financial_documents.length > 0) ? (
              <div>
                {company.financial_documents && company.financial_documents.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3">Documents financiers</h3>
                    <div className="grid gap-3">
                      {company.financial_documents.map(doc => (
                        <div key={doc.id} className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg flex justify-between items-center">
                          <div>
                            <h4 className="font-medium">{doc.name}</h4>
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                              <span className="uppercase bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 px-2 py-0.5 rounded text-xs">
                                {doc.type}
                              </span>
                              <span>{new Date(doc.date).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(doc.url, '_blank')}
                            >
                              Voir
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const link = document.createElement('a');
                                link.href = doc.url;
                                link.download = doc.name;
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                              }}
                            >
                              Télécharger
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {company.documents && company.documents.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Autres documents</h3>
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
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">Aucun document disponible.</p>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
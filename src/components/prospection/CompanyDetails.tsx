// src/components/prospection/CompanyDetails.tsx
import { useState, useEffect, useRef } from 'react';
import { X, Copy, CheckCircle2, MapPin, Building2, Phone, Mail, Globe, Clock, AlertCircle } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Table, TableBody, TableRow, TableCell } from '../ui/Table';
import { useCurrencyContext } from '../../hooks/useCurrencyContext';
import type { Company } from '../../types/company';
import { CreditScoreGauge } from './CreditScoreGauge';
import { FinancialRatingBadge } from './FinancialRatingBadge';

interface CompanyDetailsProps {
  company: Company;
  onClose: () => void;
  distance?: number; // Distance in km if from nearby search
}

export function CompanyDetails({
  company,
  onClose,
  distance
}: CompanyDetailsProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const { formatAmount } = useCurrencyContext();

  // Helper: Copy to clipboard
  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Helper: Format date
  const formatDate = (dateStr?: string): string => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Helper: Calculate data freshness indicator
  const getDataFreshnessStatus = (lastSync?: string): { label: string; color: string; icon: React.ReactNode } => {
    if (!lastSync) return { label: 'Non synchronisé', color: 'text-gray-500', icon: <AlertCircle className="w-4 h-4" /> };
    
    const hoursSinceSync = (Date.now() - new Date(lastSync).getTime()) / (1000 * 60 * 60);
    
    if (hoursSinceSync < 24) return { label: 'À jour', color: 'text-green-600', icon: <CheckCircle2 className="w-4 h-4" /> };
    if (hoursSinceSync < 72) return { label: 'Récent', color: 'text-yellow-600', icon: <Clock className="w-4 h-4" /> };
    return { label: 'Ancien', color: 'text-orange-600', icon: <AlertCircle className="w-4 h-4" /> };
  };

  // Helper: Render info row
  const InfoRow = ({ label, value, onCopy }: { label: string; value: string | number | React.ReactNode; onCopy?: () => void }) => (
    <TableRow>
      <TableCell className="font-medium text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800">{label}</TableCell>
      <TableCell>
        <div className="flex items-center justify-between">
          <span>{value}</span>
          {onCopy && (
            <Button variant="ghost" size="sm" onClick={onCopy} className="ml-2">
              {copiedField === label ? <CheckCircle2 className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  );

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

  const accountingFreshness = getDataFreshnessStatus(company.lastSyncFromAccounting);
  const customerFreshness = getDataFreshnessStatus(company.lastSyncFromCustomer);

  return (
    <div
      role="dialog"
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <div 
        ref={modalRef} 
        className="bg-white dark:bg-gray-800 rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b dark:border-gray-700 p-6 flex justify-between items-start z-10">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-6 h-6 text-blue-600" />
                <h2 id="modal-title" className="text-2xl font-bold text-gray-900 dark:text-white">
                  {company.name}
                </h2>
              </div>
              {distance && (
                <Badge variant="info">
                  <MapPin className="w-3 h-3 mr-1" />
                  {distance.toFixed(1)} km
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-3">
              <Badge variant={company.status === 'active' ? 'success' : 'default'}>
                {company.status === 'active' ? 'Actif' : company.status === 'qualified' ? 'Qualifié' : 'Inactif'}
              </Badge>
              
              {company.sector && (
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Secteur: <span className="font-medium">{company.sector}</span>
                </span>
              )}
              
              {company.size && (
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Taille: <span className="font-medium">{company.size}</span>
                </span>
              )}
              
              {company.profileCompleteness !== undefined && (
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Complétude: <span className="font-semibold text-blue-600">{company.profileCompleteness}%</span>
                </span>
              )}
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            aria-label="Fermer"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Tabs Navigation */}
        <div className="border-b dark:border-gray-700">
          <nav className="flex -mb-px">
            {[
              { id: 'overview', label: 'Vue d\'ensemble', icon: CheckCircle2 },
              { id: 'financial', label: 'Finances', icon: Building2 },
              { id: 'contacts', label: 'Contacts & Équipe', icon: Phone },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors
                  ${activeTab === tab.id 
                    ? 'border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-500' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }
                `}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Tab: Vue d'ensemble */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Credit Score & Rating */}
              <section>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Évaluation Financière</h3>
                
                <div className="grid grid-cols-3 gap-3 mb-6">
                  {/* Credit Score Gauge */}
                  {company.financial_metrics?.credit_score !== undefined && (
                    <div className="flex justify-center items-center p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <CreditScoreGauge score={company.financial_metrics.credit_score} size="small" showLabel />
                    </div>
                  )}
                  
                  {/* Financial Rating */}
                  {company.financial_metrics?.financial_rating && (
                    <div className="flex flex-col justify-center items-center p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <FinancialRatingBadge rating={company.financial_metrics.financial_rating} size="medium" showLabel />
                    </div>
                  )}
                  
                  {/* Profile Completeness */}
                  {company.profileCompleteness !== undefined && (
                    <div className="flex flex-col justify-center items-center p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{company.profileCompleteness}%</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Complétude</div>
                    </div>
                  )}
                </div>

                {/* General Information Table */}
                <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">Informations générales</h4>
                <div className="mb-6 border dark:border-gray-700 rounded-lg overflow-hidden">
                  <Table>
                    <TableBody>
                      <InfoRow label="Nom de l'entreprise" value={company.name} />
                      <InfoRow label="Secteur d'activité" value={company.sector} />
                      <InfoRow label="Taille" value={company.size} />
                      <InfoRow label="Nombre d'employés" value={company.employee_count} />
                      <InfoRow label="Statut" value={
                        <Badge variant={company.status === 'active' ? 'success' : company.status === 'qualified' ? 'info' : 'default'}>
                          {company.status}
                        </Badge>
                      } />
                      {company.website_url && (
                        <InfoRow label="Site web" value={
                          <a href={company.website_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                            {company.website_url} <Globe className="w-3 h-3" />
                          </a>
                        } />
                      )}
                      {company.pitch_deck_url && (
                        <InfoRow label="Pitch deck" value={
                          <a href={company.pitch_deck_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            Voir le pitch deck
                          </a>
                        } />
                      )}
                      {distance && <InfoRow label="Distance" value={`${distance.toFixed(1)} km`} />}
                    </TableBody>
                  </Table>
                </div>

                {/* Data Freshness */}
                <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">Fraîcheur des données</h4>
                <div className="border dark:border-gray-700 rounded-lg overflow-hidden">
                  <Table>
                    <TableBody>
                      <InfoRow 
                        label="Données comptables" 
                        value={
                          <div className="flex items-center gap-2">
                            {getDataFreshnessStatus(company.lastSyncFromAccounting).icon}
                            <span className={getDataFreshnessStatus(company.lastSyncFromAccounting).color}>
                              {getDataFreshnessStatus(company.lastSyncFromAccounting).label}
                            </span>
                            <span className="text-xs text-gray-500">({formatDate(company.lastSyncFromAccounting)})</span>
                          </div>
                        } 
                      />
                      <InfoRow 
                        label="Données clients" 
                        value={
                          <div className="flex items-center gap-2">
                            {getDataFreshnessStatus(company.lastSyncFromCustomer).icon}
                            <span className={getDataFreshnessStatus(company.lastSyncFromCustomer).color}>
                              {getDataFreshnessStatus(company.lastSyncFromCustomer).label}
                            </span>
                            <span className="text-xs text-gray-500">({formatDate(company.lastSyncFromCustomer)})</span>
                          </div>
                        } 
                      />
                    </TableBody>
                  </Table>
                </div>
              </section>
            </div>
          )}

          {/* Tab: Financial Details */}
          {activeTab === 'financial' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Métriques financières détaillées</h3>
              
              <div className="border dark:border-gray-700 rounded-lg overflow-hidden">
                <Table>
                  <TableBody>
                    {company.financial_metrics?.annual_revenue !== undefined && (
                      <InfoRow label="Chiffre d'affaires annuel" value={formatAmount(company.financial_metrics.annual_revenue)} />
                    )}
                    {company.financial_metrics?.revenue_growth !== undefined && (
                      <InfoRow 
                        label="Croissance du CA" 
                        value={
                          <span className={company.financial_metrics.revenue_growth >= 0 ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                            {company.financial_metrics.revenue_growth > 0 ? '+' : ''}{company.financial_metrics.revenue_growth}%
                          </span>
                        } 
                      />
                    )}
                    {company.financial_metrics?.profit_margin !== undefined && (
                      <InfoRow label="Marge bénéficiaire" value={`${company.financial_metrics.profit_margin}%`} />
                    )}
                    {company.financial_metrics?.cash_flow !== undefined && (
                      <InfoRow label="Flux de trésorerie" value={formatAmount(company.financial_metrics.cash_flow)} />
                    )}
                    {company.financial_metrics?.debt_ratio !== undefined && (
                      <InfoRow 
                        label="Ratio d'endettement" 
                        value={
                          <span className={company.financial_metrics.debt_ratio > 0.7 ? 'text-orange-600 font-semibold' : 'text-green-600 font-semibold'}>
                            {(company.financial_metrics.debt_ratio * 100).toFixed(1)}%
                          </span>
                        } 
                      />
                    )}
                    {company.financial_metrics?.working_capital !== undefined && (
                      <InfoRow label="Fonds de roulement" value={formatAmount(company.financial_metrics.working_capital)} />
                    )}
                    {company.financial_metrics?.credit_score !== undefined && (
                      <InfoRow label="Score de crédit" value={`${company.financial_metrics.credit_score}/100`} />
                    )}
                    {company.financial_metrics?.financial_rating && (
                      <InfoRow 
                        label="Rating financier" 
                        value={<FinancialRatingBadge rating={company.financial_metrics.financial_rating} size="small" showLabel={false} />} 
                      />
                    )}
                    {company.financial_metrics?.ebitda !== undefined && (
                      <InfoRow label="EBITDA" value={formatAmount(company.financial_metrics.ebitda)} />
                    )}
                  </TableBody>
                </Table>
              </div>

            </div>
          )}

          {/* Tab: Contacts & Team */}
          {activeTab === 'contacts' && (
            <div className="space-y-6">
              {/* Contact Information */}
              {company.contact_info && (
                <>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Coordonnées de l'entreprise</h3>
                  <div className="border dark:border-gray-700 rounded-lg overflow-hidden mb-6">
                    <Table>
                      <TableBody>
                        {company.contact_info.email && (
                          <InfoRow 
                            label="Email" 
                            value={company.contact_info.email}
                            onCopy={() => copyToClipboard(company.contact_info!.email!, 'Email')}
                          />
                        )}
                        {company.contact_info.phone && (
                          <InfoRow 
                            label="Téléphone" 
                            value={company.contact_info.phone}
                            onCopy={() => copyToClipboard(company.contact_info!.phone!, 'Téléphone')}
                          />
                        )}
                        {company.contact_info.website && (
                          <InfoRow 
                            label="Site web" 
                            value={
                              <a href={company.contact_info.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                                {company.contact_info.website} <Globe className="w-3 h-3" />
                              </a>
                            }
                          />
                        )}
                        {company.contact_info.address && (
                          <InfoRow label="Adresse" value={company.contact_info.address} />
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </>
              )}

              {/* Legal Information */}
              {company.legal_info && (
                <>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Informations légales</h3>
                  <div className="border dark:border-gray-700 rounded-lg overflow-hidden mb-6">
                    <Table>
                      <TableBody>
                        {company.legal_info.legalForm && (
                          <InfoRow label="Forme juridique" value={company.legal_info.legalForm} />
                        )}
                        {company.legal_info.rccm && (
                          <InfoRow 
                            label="RCCM" 
                            value={company.legal_info.rccm}
                            onCopy={() => copyToClipboard(company.legal_info!.rccm!, 'RCCM')}
                          />
                        )}
                        {company.legal_info.taxId && (
                          <InfoRow 
                            label="Numéro fiscal" 
                            value={company.legal_info.taxId}
                            onCopy={() => copyToClipboard(company.legal_info!.taxId!, 'Numéro fiscal')}
                          />
                        )}
                        {company.legal_info.yearFounded && (
                          <InfoRow label="Année de fondation" value={company.legal_info.yearFounded} />
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </>
              )}

              {/* Localisation */}
              {(company.locations && company.locations.length > 0) && (
                <>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Localisation{company.locations.length > 1 ? 's' : ''}
                  </h3>
                  <div className="space-y-4 mb-6">
                    {company.locations.map((location) => (
                      <div 
                        key={location.id} 
                        className={`border-2 rounded-lg overflow-hidden ${location.isPrimary ? 'border-blue-500' : 'border-gray-200 dark:border-gray-700'}`}
                      >
                        {location.isPrimary && (
                          <div className="bg-blue-500 text-white px-4 py-2 text-sm font-semibold">
                            Siège principal
                          </div>
                        )}
                        <Table>
                          <TableBody>
                            <InfoRow label="Adresse" value={location.address} />
                            <InfoRow label="Ville" value={location.city} />
                            <InfoRow label="Pays" value={location.country} />
                            {location.coordinates && (
                              <InfoRow 
                                label="Coordonnées GPS" 
                                value={`${location.coordinates.lat.toFixed(6)}, ${location.coordinates.lng.toFixed(6)}`} 
                              />
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* Owner */}
              {company.owner && (
                <>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Propriétaire Principal</h3>
                  <div className="border dark:border-gray-700 rounded-lg overflow-hidden mb-6">
                    <Table>
                      <TableBody>
                        <InfoRow label="Nom" value={company.owner.name} />
                        {company.owner.email && (
                          <InfoRow 
                            label="Email" 
                            value={
                              <a href={`mailto:${company.owner.email}`} className="text-blue-600 hover:underline">
                                {company.owner.email}
                              </a>
                            }
                            onCopy={() => copyToClipboard(company.owner!.email, 'Owner Email')}
                          />
                        )}
                        {company.owner.phone && (
                          <InfoRow 
                            label="Téléphone" 
                            value={company.owner.phone}
                            onCopy={() => copyToClipboard(company.owner!.phone!, 'Owner Phone')}
                          />
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </>
              )}
              
              {/* Contact Persons */}
              {company.contactPersons && company.contactPersons.length > 0 && (
                <>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Personnes à Contacter</h3>
                  <div className="space-y-4">
                    {company.contactPersons.map((contact, index) => (
                      <div key={index} className="border dark:border-gray-700 rounded-lg overflow-hidden">
                        <div className="bg-gray-50 dark:bg-gray-900 px-4 py-2 font-semibold">
                          {contact.name} {contact.role && `— ${contact.role}`}
                        </div>
                        <Table>
                          <TableBody>
                            {contact.email && (
                              <InfoRow 
                                label="Email" 
                                value={
                                  <a href={`mailto:${contact.email}`} className="text-blue-600 hover:underline">
                                    {contact.email}
                                  </a>
                                }
                                onCopy={() => copyToClipboard(contact.email, `Contact ${index + 1} Email`)}
                              />
                            )}
                            {contact.phone && (
                              <InfoRow 
                                label="Téléphone" 
                                value={contact.phone}
                                onCopy={() => copyToClipboard(contact.phone, `Contact ${index + 1} Phone`)}
                              />
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {!company.contact_info && !company.legal_info && !company.owner && (!company.contactPersons || company.contactPersons.length === 0) && (!company.locations || company.locations.length === 0) && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  Aucune information de contact disponible
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

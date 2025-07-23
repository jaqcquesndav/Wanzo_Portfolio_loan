import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/Dialog';
import { FormField } from '../ui/form/FormField';
import { Input } from '../ui/form/Input';
import { Select } from '../ui/form/Select';
import { Button } from '../ui/Button';
import { CreditRiskEntry, LeasingRiskEntry, InvestmentRiskEntry } from '../../data/mockCentraleRisque';
import { centraleRisqueStorageService, CENTRALE_RISQUE_KEYS } from '../../services/storage/centraleRisqueStorage';
import { companyStorageService } from '../../services/storage/companyStorage';
import { guaranteeStorageService } from '../../services/storage/guaranteeStorage';
import { isStorageInitialized, initializeAllStorageData } from '../../services/storage/initializeStorage';
import { CompanyData } from '../../data/companies/index';
import { Guarantee } from '../../types/guarantee';
import { Search } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { useFormatCurrency } from '../../hooks/useFormatCurrency';

interface AddRiskEntryFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  riskType: 'credit' | 'leasing' | 'investment';
}

export function AddRiskEntryForm({ isOpen, onClose, onSuccess, riskType }: AddRiskEntryFormProps) {
  const { formatCurrency } = useFormatCurrency();
  
  // State pour le chargement des données
  const [isLoading, setIsLoading] = useState(true);
  const [companies, setCompanies] = useState<CompanyData[]>([]);
  const [guarantees, setGuarantees] = useState<Guarantee[]>([]);
  
  // Common fields
  const [companyId, setCompanyId] = useState('');
  const [companySearchTerm, setCompanySearchTerm] = useState('');
  const [institution, setInstitution] = useState('');
  const [institutionRef, setInstitutionRef] = useState('');
  const [coteCredit, setCoteCredit] = useState('75'); // Note sur 100 au lieu de A,B,C,D
  const [guaranteeId, setGuaranteeId] = useState('');
  // Le nom de l'utilisateur est géré en interne pour la traçabilité uniquement
  const userName = 'Gestionnaire Portfolio'; // Valeur fixe pour la traçabilité
  
  // Credit specific fields
  const [encours, setEncours] = useState('');
  const [incidents, setIncidents] = useState('0');
  const [creditScore, setCreditScore] = useState('');
  const [debtRatio, setDebtRatio] = useState('');
  const [creditStatus, setCreditStatus] = useState<'Actif' | 'En défaut' | 'Clôturé'>('Actif');
  
  // Leasing specific fields
  const [equipmentType, setEquipmentType] = useState('');
  const [valeurFinancement, setValeurFinancement] = useState('');
  const [leasingStatus, setLeasingStatus] = useState<'Actif' | 'En défaut' | 'Clôturé'>('Actif');
  
  // Investment specific fields
  const [investmentType, setInvestmentType] = useState<'Action' | 'Obligation'>('Action');
  const [montantInvesti, setMontantInvesti] = useState('');
  const [valorisation, setValorisation] = useState('');
  const [rendementActuel, setRendementActuel] = useState('');
  const [investmentStatus, setInvestmentStatus] = useState<'Performant' | 'En difficulté' | 'Clôturé'>('Performant');
  
  // Errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Reset form on type change
  useEffect(() => {
    resetForm();
  }, [riskType]);
  
  // Initialiser et charger les données au montage du composant
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // S'assurer que toutes les données sont initialisées
        if (!isStorageInitialized()) {
          await initializeAllStorageData();
        }
        
        // Charger les entreprises
        const loadedCompanies = await companyStorageService.getCompanies();
        setCompanies(loadedCompanies);
        
        // Charger les garanties
        const loadedGuarantees = await guaranteeStorageService.getGuarantees();
        setGuarantees(loadedGuarantees);
        
        setIsLoading(false);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);
  
  const resetForm = () => {
    setCompanyId('');
    setCompanySearchTerm('');
    setInstitution('');
    setInstitutionRef('');
    setCoteCredit('75');
    setGuaranteeId('');
    // Conserver la valeur par défaut du userName
    
    setEncours('');
    setIncidents('0');
    setCreditScore('');
    setDebtRatio('');
    setCreditStatus('Actif');
    
    setEquipmentType('');
    setValeurFinancement('');
    setLeasingStatus('Actif');
    
    setInvestmentType('Action');
    setMontantInvesti('');
    setValorisation('');
    setRendementActuel('');
    setInvestmentStatus('Performant');
    
    setErrors({});
  };
  
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    // Common validations
    if (!companyId) newErrors.companyId = 'Veuillez sélectionner une entreprise';
    if (!institution) newErrors.institution = 'L\'institution est requise';
    if (!institutionRef) newErrors.institutionRef = 'La référence de l\'institution est requise';
    if (!coteCredit || isNaN(Number(coteCredit)) || Number(coteCredit) < 0 || Number(coteCredit) > 100) {
      newErrors.coteCredit = 'Veuillez entrer une cote crédit valide (0-100)';
    }
    
    // Garantie validation pour crédit
    if (riskType === 'credit' && !guaranteeId) {
      newErrors.guaranteeId = 'Veuillez sélectionner une garantie';
    }
    
    // Type specific validations
    if (riskType === 'credit') {
      if (!encours) newErrors.encours = 'L\'encours est requis';
      if (!creditScore) newErrors.creditScore = 'Le score de crédit est requis';
      if (!debtRatio) newErrors.debtRatio = 'Le ratio d\'endettement est requis';
    }
    else if (riskType === 'leasing') {
      if (!equipmentType) newErrors.equipmentType = 'Le type d\'équipement est requis';
      if (!valeurFinancement) newErrors.valeurFinancement = 'La valeur du financement est requise';
    }
    else if (riskType === 'investment') {
      if (!montantInvesti) newErrors.montantInvesti = 'Le montant investi est requis';
      if (!valorisation) newErrors.valorisation = 'La valorisation est requise';
      if (!rendementActuel) newErrors.rendementActuel = 'Le rendement actuel est requis';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const getCompanyById = (id: string): CompanyData | undefined => {
    return companies.find(company => company.id === id);
  };
  
  // Fonction pour filtrer les entreprises par terme de recherche
  const filterCompaniesBySearchTerm = () => {
    if (!companySearchTerm) return companies;
    
    const searchTermLower = companySearchTerm.toLowerCase();
    return companies.filter(company => 
      company.id.toLowerCase().includes(searchTermLower) || 
      company.name.toLowerCase().includes(searchTermLower)
    );
  };
  
  // Fonction pour obtenir les garanties disponibles pour l'entreprise sélectionnée
  const getAvailableGuarantees = () => {
    if (!companyId) return [];
    
    const company = getCompanyById(companyId);
    if (!company) return [];
    
    // Pour la rétrocompatibilité, on recherche les garanties par nom d'entreprise
    const guaranteesByCompanyName = guarantees.filter(guarantee => {
      // Vérification exacte du nom de l'entreprise (meilleure précision)
      const exactNameMatch = guarantee.company === company.name;
      
      // Vérification si le nom de l'entreprise contient l'ID (utile pour les références)
      const idInCompanyName = guarantee.company.includes(companyId);
      
      // Vérification si la référence du contrat est liée à l'entreprise (si disponible)
      const contractLinkedToCompany = guarantee.contractReference && 
                                      (guarantee.contractReference.includes(companyId) || 
                                       company.name.includes(guarantee.contractReference));
      
      return (exactNameMatch || idInCompanyName || contractLinkedToCompany) && 
             guarantee.status === 'active';
    });
    
    console.log("Entreprise sélectionnée:", company);
    console.log("Garanties trouvées pour cette entreprise:", guaranteesByCompanyName);
    
    return guaranteesByCompanyName;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      const company = getCompanyById(companyId);
      if (!company) {
        setErrors({ companyId: 'Entreprise non trouvée' });
        return;
      }
      
      const currentDate = new Date().toISOString();
      
      if (riskType === 'credit') {
        const newEntry: CreditRiskEntry = {
          id: uuidv4(),
          companyId,
          companyName: company.name,
          sector: company.sector,
          institution: `${institutionRef} - ${institution}`,
          encours: parseFloat(encours),
          statut: creditStatus,
          coteCredit,
          incidents: parseInt(incidents, 10),
          creditScore: parseFloat(creditScore),
          debtRatio: parseFloat(debtRatio),
          lastUpdated: currentDate,
          guaranteeId,
          createdBy: userName // Métadonnée pour traçabilité
        };
        
        // Get existing data and add new entry
        const existingData = await centraleRisqueStorageService.getCreditRiskData();
        const updatedData = [...existingData, newEntry];
        
        // Save to localStorage
        localStorage.setItem(CENTRALE_RISQUE_KEYS.CREDITS, JSON.stringify(updatedData));
      }
      else if (riskType === 'leasing') {
        const newEntry: LeasingRiskEntry = {
          id: uuidv4(),
          companyId,
          companyName: company.name,
          sector: company.sector,
          institution: `${institutionRef} - ${institution}`,
          equipmentType,
          valeurFinancement: parseFloat(valeurFinancement),
          statut: leasingStatus,
          coteCredit,
          incidents: parseInt(incidents, 10),
          lastUpdated: currentDate,
          createdBy: userName // Métadonnée pour traçabilité
        };
        
        // Get existing data and add new entry
        const existingData = await centraleRisqueStorageService.getLeasingRiskData();
        const updatedData = [...existingData, newEntry];
        
        // Save to localStorage
        localStorage.setItem(CENTRALE_RISQUE_KEYS.LEASING, JSON.stringify(updatedData));
      }
      else if (riskType === 'investment') {
        const newEntry: InvestmentRiskEntry = {
          id: uuidv4(),
          companyId,
          companyName: company.name,
          sector: company.sector,
          institution: `${institutionRef} - ${institution}`,
          investmentType,
          montantInvesti: parseFloat(montantInvesti),
          valorisation: parseFloat(valorisation),
          statut: investmentStatus,
          coteCredit,
          rendementActuel: parseFloat(rendementActuel),
          lastUpdated: currentDate,
          createdBy: userName // Métadonnée pour traçabilité
        };
        
        // Get existing data and add new entry
        const existingData = await centraleRisqueStorageService.getInvestmentRiskData();
        const updatedData = [...existingData, newEntry];
        
        // Save to localStorage
        localStorage.setItem(CENTRALE_RISQUE_KEYS.INVESTMENTS, JSON.stringify(updatedData));
      }
      
      // Notify success and close modal
      onSuccess();
      onClose();
      resetForm();
    } catch (error) {
      console.error('Erreur lors de l\'ajout du risque:', error);
      setErrors({ submit: 'Une erreur est survenue lors de l\'ajout du risque.' });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="p-0 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="sticky top-0 bg-white dark:bg-gray-900 z-10 p-6 pb-4 mb-0 border-b border-gray-200 dark:border-gray-700">
          <DialogTitle className="text-xl font-bold">
            {riskType === 'credit' ? 'Ajouter un risque crédit' : 
             riskType === 'leasing' ? 'Ajouter un risque leasing' : 
             'Ajouter un risque investissement'}
          </DialogTitle>
        </DialogHeader>
        
        {isLoading ? (
          <div className="p-6 flex flex-col items-center justify-center min-h-[200px]">
            <div className="w-10 h-10 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Chargement des données...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 pt-4">
            <div className="space-y-6">
              {/* Champs communs */}
              <div className="p-5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-gray-100">Informations générales</h3>
                <div className="grid grid-cols-1 gap-6">
                <FormField label="Entreprise (recherche par référence ou nom)" error={errors.companyId}>
                  <div className="relative">
                    <input 
                      type="text"
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md"
                      placeholder="Rechercher par ID ou nom..."
                      value={companySearchTerm}
                      onChange={(e) => {
                        setCompanySearchTerm(e.target.value);
                        // Réinitialiser l'entreprise sélectionnée si le champ de recherche est vidé
                        if (e.target.value === '') {
                          setCompanyId('');
                        }
                      }}
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                  
                  {companySearchTerm && !companyId && (
                    <div className="mt-2 max-h-60 overflow-y-auto border border-gray-200 rounded-md shadow-sm">
                      {filterCompaniesBySearchTerm().length > 0 ? (
                        <ul className="py-1 divide-y divide-gray-100">
                          {filterCompaniesBySearchTerm().map(company => (
                            <li 
                              key={company.id}
                              className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center justify-between"
                              onClick={() => {
                                setCompanyId(company.id);
                                setCompanySearchTerm(`${company.id} - ${company.name}`);
                                // Réinitialiser la garantie lorsqu'une nouvelle entreprise est sélectionnée
                                setGuaranteeId('');
                              }}
                            >
                              <div>
                                <div className="font-medium">{company.name}</div>
                                <div className="text-sm text-gray-500">ID: {company.id}</div>
                              </div>
                              <div className="text-sm text-gray-600">{company.sector}</div>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="px-4 py-3 text-sm text-gray-500">
                          Aucune entreprise trouvée
                        </div>
                      )}
                    </div>
                  )}
                  
                  {companyId && (
                    <div className="mt-2 p-3 border border-gray-200 rounded-md bg-gray-50 flex items-center justify-between">
                      <div>
                        <div className="font-medium">
                          {getCompanyById(companyId)?.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {companyId} | Secteur: {getCompanyById(companyId)?.sector}
                        </div>
                      </div>
                      <button 
                        type="button"
                        className="text-gray-400 hover:text-gray-600"
                        onClick={() => {
                          setCompanyId('');
                          setCompanySearchTerm('');
                          // Réinitialiser la garantie lorsque l'entreprise est supprimée
                          setGuaranteeId('');
                        }}
                      >
                        ×
                      </button>
                    </div>
                  )}
                </FormField>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField label="Référence de l'institution" error={errors.institutionRef}>
                    <Input 
                      type="text" 
                      value={institutionRef} 
                      onChange={(e) => setInstitutionRef(e.target.value)}
                      error={!!errors.institutionRef}
                      placeholder="INST-0001"
                    />
                  </FormField>
                  
                  <FormField label="Nom de l'institution" error={errors.institution}>
                    <Input 
                      type="text" 
                      value={institution} 
                      onChange={(e) => setInstitution(e.target.value)}
                      error={!!errors.institution}
                      placeholder="Nom de l'institution"
                    />
                  </FormField>
                </div>
              </div>
              </div>
              
              
              {/* Champs spécifiques au type de risque */}
              {riskType === 'credit' && (
                <div className="p-5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                  <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-gray-100">Informations du risque crédit</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField label="Garantie" error={errors.guaranteeId}>
                      <Select 
                        value={guaranteeId} 
                        onChange={(e) => setGuaranteeId(e.target.value)}
                        error={!!errors.guaranteeId}
                      >
                        <option value="">Sélectionner une garantie</option>
                        {getAvailableGuarantees().length > 0 ? (
                          getAvailableGuarantees().map(guarantee => (
                            <option key={guarantee.id} value={guarantee.id}>
                              {guarantee.id} - {guarantee.type} ({formatCurrency(guarantee.value, undefined, 'USD')})
                              {guarantee.contractReference ? ` | Contrat: ${guarantee.contractReference}` : ''}
                            </option>
                          ))
                        ) : (
                          <option value="" disabled>Aucune garantie disponible pour cette entreprise</option>
                        )}
                      </Select>
                      {companyId && getAvailableGuarantees().length === 0 && (
                        <div className="mt-1 text-sm text-amber-600">
                          Aucune garantie active n'est associée à cette entreprise. 
                          Vérifiez que des garanties ont été créées et qu'elles sont en statut "active".
                        </div>
                      )}
                      {guaranteeId && (
                        <div className="mt-2 p-2 border border-gray-200 bg-gray-50 rounded-md text-sm">
                          {(() => {
                            const selectedGuarantee = guarantees.find(g => g.id === guaranteeId);
                            if (!selectedGuarantee) return null;
                            
                            return (
                              <>
                                <div className="font-medium">{selectedGuarantee.type}</div>
                                <div className="flex justify-between mt-1">
                                  <span>Valeur: {formatCurrency(selectedGuarantee.value, undefined, 'USD')}</span>
                                  <span>ID: {selectedGuarantee.id}</span>
                                </div>
                                {selectedGuarantee.contractReference && (
                                  <div className="mt-1">Contrat: {selectedGuarantee.contractReference}</div>
                                )}
                              </>
                            );
                          })()}
                        </div>
                      )}
                    </FormField>
                    
                    <FormField label="Encours (FCFA)" error={errors.encours}>
                      <Input 
                        type="number" 
                        value={encours} 
                        onChange={(e) => setEncours(e.target.value)}
                        error={!!errors.encours}
                        placeholder="0"
                      />
                    </FormField>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormField label="Statut" error={errors.creditStatus}>
                      <Select 
                        value={creditStatus} 
                        onChange={(e) => setCreditStatus(e.target.value as 'Actif' | 'En défaut' | 'Clôturé')}
                        error={!!errors.creditStatus}
                      >
                        <option value="Actif">Actif</option>
                        <option value="En défaut">En défaut</option>
                        <option value="Clôturé">Clôturé</option>
                      </Select>
                    </FormField>
                    
                    <FormField label="Cote crédit (0-100)" error={errors.coteCredit}>
                      <Input 
                        type="number" 
                        value={coteCredit} 
                        onChange={(e) => setCoteCredit(e.target.value)}
                        min="0"
                        max="100"
                        error={!!errors.coteCredit}
                        placeholder="75"
                      />
                    </FormField>
                    
                    <FormField label="Incidents de paiement" error={errors.incidents}>
                      <Input 
                        type="number" 
                        value={incidents} 
                        onChange={(e) => setIncidents(e.target.value)}
                        error={!!errors.incidents}
                        placeholder="0"
                      />
                    </FormField>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField label="Score de crédit" error={errors.creditScore}>
                      <Input 
                        type="number" 
                        value={creditScore} 
                        onChange={(e) => setCreditScore(e.target.value)}
                        error={!!errors.creditScore}
                        placeholder="0-100"
                      />
                    </FormField>
                    
                    <FormField label="Ratio d'endettement" error={errors.debtRatio}>
                      <Input 
                        type="number" 
                        value={debtRatio} 
                        onChange={(e) => setDebtRatio(e.target.value)}
                        error={!!errors.debtRatio}
                        placeholder="0.00-1.00"
                      />
                    </FormField>
                  </div>
                </div>
              )}
              
              
              {/* Leasing specific fields */}
              {riskType === 'leasing' && (
                <div className="p-5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                  <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-gray-100">Informations du risque leasing</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField label="Type d'équipement" error={errors.equipmentType}>
                      <Input 
                        type="text" 
                        value={equipmentType} 
                        onChange={(e) => setEquipmentType(e.target.value)}
                        error={!!errors.equipmentType}
                        placeholder="Type d'équipement"
                      />
                    </FormField>
                    
                    <FormField label="Valeur de financement (FCFA)" error={errors.valeurFinancement}>
                      <Input 
                        type="number" 
                        value={valeurFinancement} 
                        onChange={(e) => setValeurFinancement(e.target.value)}
                        error={!!errors.valeurFinancement}
                        placeholder="0"
                      />
                    </FormField>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormField label="Statut" error={errors.leasingStatus}>
                      <Select 
                        value={leasingStatus} 
                        onChange={(e) => setLeasingStatus(e.target.value as 'Actif' | 'En défaut' | 'Clôturé')}
                        error={!!errors.leasingStatus}
                      >
                        <option value="Actif">Actif</option>
                        <option value="En défaut">En défaut</option>
                        <option value="Clôturé">Clôturé</option>
                      </Select>
                    </FormField>
                    
                    <FormField label="Cote crédit (0-100)" error={errors.coteCredit}>
                      <Input 
                        type="number" 
                        value={coteCredit} 
                        onChange={(e) => setCoteCredit(e.target.value)}
                        min="0"
                        max="100"
                        error={!!errors.coteCredit}
                        placeholder="75"
                      />
                    </FormField>
                    
                    <FormField label="Incidents de paiement" error={errors.incidents}>
                      <Input 
                        type="number" 
                        value={incidents} 
                        onChange={(e) => setIncidents(e.target.value)}
                        error={!!errors.incidents}
                        placeholder="0"
                      />
                    </FormField>
                  </div>
                </div>
              )}
              
              
              {/* Investment specific fields */}
              {riskType === 'investment' && (
                <div className="p-5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                  <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-gray-100">Informations du risque investissement</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField label="Type d'investissement" error={errors.investmentType}>
                      <Select 
                        value={investmentType} 
                        onChange={(e) => setInvestmentType(e.target.value as 'Action' | 'Obligation')}
                        error={!!errors.investmentType}
                      >
                        <option value="Action">Action</option>
                        <option value="Obligation">Obligation</option>
                      </Select>
                    </FormField>
                    
                    <FormField label="Montant investi (FCFA)" error={errors.montantInvesti}>
                      <Input 
                        type="number" 
                        value={montantInvesti} 
                        onChange={(e) => setMontantInvesti(e.target.value)}
                        error={!!errors.montantInvesti}
                        placeholder="0"
                      />
                    </FormField>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormField label="Valorisation actuelle (FCFA)" error={errors.valorisation}>
                      <Input 
                        type="number" 
                        value={valorisation} 
                        onChange={(e) => setValorisation(e.target.value)}
                        error={!!errors.valorisation}
                        placeholder="0"
                      />
                    </FormField>
                    
                    <FormField label="Rendement actuel (%)" error={errors.rendementActuel}>
                      <Input 
                        type="number" 
                        value={rendementActuel} 
                        onChange={(e) => setRendementActuel(e.target.value)}
                        error={!!errors.rendementActuel}
                        placeholder="0.00"
                      />
                    </FormField>
                    
                    <FormField label="Statut" error={errors.investmentStatus}>
                      <Select 
                        value={investmentStatus} 
                        onChange={(e) => setInvestmentStatus(e.target.value as 'Performant' | 'En difficulté' | 'Clôturé')}
                        error={!!errors.investmentStatus}
                      >
                        <option value="Performant">Performant</option>
                        <option value="En difficulté">En difficulté</option>
                        <option value="Clôturé">Clôturé</option>
                      </Select>
                    </FormField>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField label="Cote crédit (0-100)" error={errors.coteCredit}>
                      <Input 
                        type="number" 
                        value={coteCredit} 
                        onChange={(e) => setCoteCredit(e.target.value)}
                        min="0"
                        max="100"
                        error={!!errors.coteCredit}
                        placeholder="75"
                      />
                    </FormField>
                  </div>
                </div>
              )}
              
              {/* Error générale */}
              {errors.submit && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-500 text-sm">
                  {errors.submit}
                </div>
              )}
            </div>
            
            <DialogFooter className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                className="mr-2"
              >
                Annuler
              </Button>
              <Button type="submit">
                Ajouter
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

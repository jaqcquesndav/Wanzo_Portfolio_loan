import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/Dialog';
import { FormField } from '../ui/form/FormField';
import { Input } from '../ui/form/Input';
import { Select } from '../ui/form/Select';
import { Button } from '../ui/Button';
import { CreditRiskEntry, LeasingRiskEntry, InvestmentRiskEntry } from '../../data/mockCentraleRisque';
import { centraleRisqueStorageService, CENTRALE_RISQUE_KEYS } from '../../services/storage/centraleRisqueStorage';
import { CompanyData } from '../../data/companies';
import { mockCompanies } from '../../data/companies';
import { mockGuarantees } from '../../data/mockGuarantees';
import { Search } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { formatCurrency } from '../../utils/formatters';

interface AddRiskEntryFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  riskType: 'credit' | 'leasing' | 'investment';
}

export function AddRiskEntryForm({ isOpen, onClose, onSuccess, riskType }: AddRiskEntryFormProps) {
  // Common fields
  const [companyId, setCompanyId] = useState('');
  const [companySearchTerm, setCompanySearchTerm] = useState('');
  const [institution, setInstitution] = useState('');
  const [institutionRef, setInstitutionRef] = useState('');
  const [rating, setRating] = useState<'A' | 'B' | 'C' | 'D'>('A');
  const [guaranteeId, setGuaranteeId] = useState('');
  
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
  
  const resetForm = () => {
    setCompanyId('');
    setCompanySearchTerm('');
    setInstitution('');
    setInstitutionRef('');
    setRating('A');
    setGuaranteeId('');
    
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
    return mockCompanies.find(company => company.id === id);
  };
  
  // Fonction pour filtrer les entreprises par terme de recherche
  const filterCompaniesBySearchTerm = () => {
    if (!companySearchTerm) return mockCompanies;
    
    const searchTermLower = companySearchTerm.toLowerCase();
    return mockCompanies.filter(company => 
      company.id.toLowerCase().includes(searchTermLower) || 
      company.name.toLowerCase().includes(searchTermLower)
    );
  };
  
  // Fonction pour obtenir les garanties disponibles pour l'entreprise sélectionnée
  const getAvailableGuarantees = () => {
    if (!companyId) return [];
    
    const company = getCompanyById(companyId);
    if (!company) return [];
    
    return mockGuarantees.filter(guarantee => 
      guarantee.company === company.name &&
      guarantee.status === 'active'
    );
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
          rating,
          incidents: parseInt(incidents, 10),
          creditScore: parseFloat(creditScore),
          debtRatio: parseFloat(debtRatio),
          lastUpdated: currentDate,
          guaranteeId
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
          rating,
          incidents: parseInt(incidents, 10),
          lastUpdated: currentDate
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
          rating,
          rendementActuel: parseFloat(rendementActuel),
          lastUpdated: currentDate
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
      <DialogContent className="p-6 w-full max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold mb-2">
            {riskType === 'credit' ? 'Ajouter un risque crédit' : 
             riskType === 'leasing' ? 'Ajouter un risque leasing' : 
             'Ajouter un risque investissement'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Champs communs */}
            <div className="grid grid-cols-1 gap-6">
              <FormField label="Entreprise (recherche par référence ou nom)" error={errors.companyId}>
                <div className="relative">
                  <input 
                    type="text"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Rechercher par ID ou nom..."
                    value={companySearchTerm}
                    onChange={(e) => setCompanySearchTerm(e.target.value)}
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
                <div className="mt-2">
                  <Select 
                    value={companyId} 
                    onChange={(e) => setCompanyId(e.target.value)}
                    error={!!errors.companyId}
                  >
                    <option value="">Sélectionner une entreprise</option>
                    {filterCompaniesBySearchTerm().map(company => (
                      <option key={company.id} value={company.id}>
                        {company.id} - {company.name}
                      </option>
                    ))}
                  </Select>
                </div>
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
            
            {/* Champs spécifiques au type de risque */}
            {riskType === 'credit' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField label="Garantie" error={errors.guaranteeId}>
                    <Select 
                      value={guaranteeId} 
                      onChange={(e) => setGuaranteeId(e.target.value)}
                      error={!!errors.guaranteeId}
                    >
                      <option value="">Sélectionner une garantie</option>
                      {getAvailableGuarantees().map(guarantee => (
                        <option key={guarantee.id} value={guarantee.id}>
                          {guarantee.id} - {guarantee.type} ({formatCurrency(guarantee.value)})
                        </option>
                      ))}
                    </Select>
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
                  
                  <FormField label="Rating" error={errors.rating}>
                    <Select 
                      value={rating} 
                      onChange={(e) => setRating(e.target.value as 'A' | 'B' | 'C' | 'D')}
                      error={!!errors.rating}
                    >
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="C">C</option>
                      <option value="D">D</option>
                    </Select>
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
              </>
            )}
            
            {/* Leasing specific fields */}
            {riskType === 'leasing' && (
              <>
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
                  
                  <FormField label="Rating" error={errors.rating}>
                    <Select 
                      value={rating} 
                      onChange={(e) => setRating(e.target.value as 'A' | 'B' | 'C' | 'D')}
                      error={!!errors.rating}
                    >
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="C">C</option>
                      <option value="D">D</option>
                    </Select>
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
              </>
            )}
            
            {/* Investment specific fields */}
            {riskType === 'investment' && (
              <>
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
                  <FormField label="Rating" error={errors.rating}>
                    <Select 
                      value={rating} 
                      onChange={(e) => setRating(e.target.value as 'A' | 'B' | 'C' | 'D')}
                      error={!!errors.rating}
                    >
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="C">C</option>
                      <option value="D">D</option>
                    </Select>
                  </FormField>
                </div>
              </>
            )}
            
            {/* Error générale */}
            {errors.submit && (
              <div className="text-red-500 text-sm">{errors.submit}</div>
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
      </DialogContent>
    </Dialog>
  );
}

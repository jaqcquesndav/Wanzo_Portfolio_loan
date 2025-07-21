import { useState, useEffect } from 'react';
import { 
  CreditRequest, 
  CreditPeriodicity,
  CreditDistribution
} from '../../../../types/credit';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../../ui/Dialog';
import { Button } from '../../../ui/Button';
import { Input } from '../../../ui/Input';
import { Textarea } from '../../../ui/Textarea';
import { Checkbox } from '../../../ui/Checkbox';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../../ui/Tabs';
import { FormField } from '../../../ui/Form';

interface CreditRequestFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (request: Omit<CreditRequest, 'id' | 'createdAt' | 'status'>) => void;
  initialData?: Partial<CreditRequest>;
}

interface Member {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  description: string;
  interestRate: number;
  maxAmount: number;
  minAmount: number;
  defaultTerm: number;
}

interface CreditManager {
  id: string;
  name: string;
}

// Mock data pour les tests
const mockMembers: Member[] = [
  { id: 'mem-001', name: 'Entreprise Alpha SARL' },
  { id: 'mem-002', name: 'Beta Construction Inc.' },
  { id: 'mem-003', name: 'Delta Technologies' },
  { id: 'mem-004', name: 'Gamma Retail' },
  { id: 'grp-001', name: 'Coopérative Agricole Epsilon (Groupe)' },
];

const mockProducts: Product[] = [
  { 
    id: 'prod-001', 
    name: 'Crédit PME', 
    description: 'Financement pour petites et moyennes entreprises',
    interestRate: 8.5,
    maxAmount: 100000,
    minAmount: 10000,
    defaultTerm: 12
  },
  { 
    id: 'prod-002', 
    name: 'Crédit Équipement', 
    description: 'Financement pour l\'achat d\'équipements',
    interestRate: 7.25,
    maxAmount: 200000,
    minAmount: 20000,
    defaultTerm: 24
  },
  { 
    id: 'prod-003', 
    name: 'Crédit Innovation', 
    description: 'Financement pour projets innovants',
    interestRate: 6.75,
    maxAmount: 300000,
    minAmount: 50000,
    defaultTerm: 36
  },
  { 
    id: 'prod-004', 
    name: 'Crédit Agricole', 
    description: 'Financement pour projets agricoles',
    interestRate: 7,
    maxAmount: 150000,
    minAmount: 5000,
    defaultTerm: 18
  },
];

const mockManagers: CreditManager[] = [
  { id: 'mgr-001', name: 'Jean Dupont' },
  { id: 'mgr-002', name: 'Marie Laurent' },
  { id: 'mgr-003', name: 'Ahmed Moussaoui' },
];

const mockGroupMembers: Member[] = [
  { id: 'mem-005', name: 'Agriculteur 1' },
  { id: 'mem-015', name: 'Agriculteur 2' },
  { id: 'mem-016', name: 'Agriculteur 3' },
  { id: 'mem-017', name: 'Agriculteur 4' },
  { id: 'mem-018', name: 'Agriculteur 5' },
];

export function CreditRequestForm({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: CreditRequestFormProps) {
  const [activeTab, setActiveTab] = useState('general');
  const [isGroup, setIsGroup] = useState(initialData?.isGroup || false);
  const [memberId, setMemberId] = useState(initialData?.memberId || '');
  const [groupId, setGroupId] = useState(initialData?.groupId || '');
  const [productId, setProductId] = useState(initialData?.productId || '');
  const [receptionDate, setReceptionDate] = useState(
    initialData?.receptionDate || new Date().toISOString().split('T')[0]
  );
  const [requestAmount, setRequestAmount] = useState(
    initialData?.requestAmount?.toString() || ''
  );
  const [periodicity, setPeriodicity] = useState<CreditPeriodicity>(
    initialData?.periodicity || 'monthly'
  );
  const [interestRate, setInterestRate] = useState(
    initialData?.interestRate?.toString() || ''
  );
  const [reason, setReason] = useState(initialData?.reason || '');
  const [scheduleType, setScheduleType] = useState(
    initialData?.scheduleType || 'constant'
  );
  const [schedulesCount, setSchedulesCount] = useState(
    initialData?.schedulesCount?.toString() || ''
  );
  const [deferredPaymentsCount, setDeferredPaymentsCount] = useState(
    initialData?.deferredPaymentsCount?.toString() || '0'
  );
  const [gracePeriod, setGracePeriod] = useState(
    initialData?.gracePeriod?.toString() || '0'
  );
  const [financingPurpose, setFinancingPurpose] = useState(
    initialData?.financingPurpose || ''
  );
  const [creditManagerId, setCreditManagerId] = useState(
    initialData?.creditManagerId || ''
  );
  const [distributions, setDistributions] = useState<CreditDistribution[]>(
    initialData?.distributions || []
  );
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [groupMembers, setGroupMembers] = useState<Member[]>([]);
  
  // Charger les détails du produit sélectionné
  useEffect(() => {
    if (productId) {
      const product = mockProducts.find(p => p.id === productId);
      if (product) {
        setSelectedProduct(product);
        // Si c'est une nouvelle demande, on initialise les valeurs par défaut
        if (!initialData?.id) {
          setInterestRate(product.interestRate.toString());
          setSchedulesCount(product.defaultTerm.toString());
        }
      } else {
        setSelectedProduct(null);
      }
    } else {
      setSelectedProduct(null);
    }
  }, [productId, initialData?.id]);
  
  // Charger les membres du groupe
  useEffect(() => {
    if (isGroup) {
      // Dans une vraie application, on chargerait les membres du groupe
      setGroupMembers(mockGroupMembers);
      
      // Si c'est un nouveau groupe sans distributions, en créer par défaut
      if (distributions.length === 0) {
        const defaultDistributions = mockGroupMembers.map(member => ({
          id: `dist-${Date.now()}-${member.id}`,
          creditRequestId: 'pending',
          memberId: member.id,
          amount: 0,
          createdAt: new Date().toISOString()
        }));
        setDistributions(defaultDistributions);
      }
    }
  }, [isGroup, distributions.length]);
  
  // Calcul du montant total des distributions
  const totalDistributionAmount = distributions.reduce(
    (sum, dist) => sum + dist.amount, 
    0
  );
  
  // Mise à jour d'une distribution
  const updateDistribution = (memberId: string, amount: number) => {
    setDistributions(prev => 
      prev.map(dist => 
        dist.memberId === memberId 
          ? { ...dist, amount } 
          : dist
      )
    );
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const requestData: Omit<CreditRequest, 'id' | 'createdAt' | 'status'> = {
      memberId: isGroup ? groupId : memberId,
      productId,
      receptionDate,
      requestAmount: parseFloat(requestAmount),
      periodicity,
      interestRate: parseFloat(interestRate),
      reason,
      scheduleType: scheduleType as 'constant' | 'degressive',
      schedulesCount: parseInt(schedulesCount),
      deferredPaymentsCount: parseInt(deferredPaymentsCount),
      gracePeriod: gracePeriod ? parseInt(gracePeriod) : undefined,
      financingPurpose,
      creditManagerId,
      isGroup,
      groupId: isGroup ? groupId : undefined,
      distributions: isGroup ? distributions : undefined,
      updatedAt: initialData?.updatedAt ? new Date().toISOString() : undefined,
    };
    
    onSubmit(requestData);
    onClose();
  };
  
  const validateForm = () => {
    if (!memberId || !productId || !requestAmount || !interestRate || 
        !schedulesCount || !reason || !financingPurpose || !creditManagerId) {
      return false;
    }
    
    if (isGroup) {
      if (!groupId) return false;
      if (parseFloat(requestAmount) !== totalDistributionAmount) return false;
      if (distributions.some(d => d.amount <= 0)) return false;
    }
    
    return true;
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {initialData?.id ? 'Modifier la demande de crédit' : 'Nouvelle demande de crédit'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full justify-start mb-4">
              <TabsTrigger 
                value="general" 
                currentValue={activeTab} 
                onValueChange={setActiveTab}
              >
                Informations générales
              </TabsTrigger>
              <TabsTrigger 
                value="financing" 
                currentValue={activeTab} 
                onValueChange={setActiveTab}
              >
                Financement
              </TabsTrigger>
              {isGroup && (
                <TabsTrigger 
                  value="distribution" 
                  currentValue={activeTab} 
                  onValueChange={setActiveTab}
                >
                  Répartition
                </TabsTrigger>
              )}
            </TabsList>
            
            <TabsContent value="general" currentValue={activeTab}>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2 col-span-2 mb-2">
                  <Checkbox 
                    id="isGroup" 
                    checked={isGroup} 
                    onCheckedChange={(checked) => setIsGroup(!!checked)}
                    disabled={!!initialData?.id}
                  />
                  <label htmlFor="isGroup" className="ml-2">Demande de groupe</label>
                </div>
                
                {isGroup ? (
                  <FormField label="Groupe">
                    <select
                      id="groupId"
                      value={groupId}
                      onChange={(e) => setGroupId(e.target.value)}
                      className="w-full border rounded p-2"
                      required
                      disabled={!!initialData?.id}
                    >
                      <option value="">Sélectionner un groupe</option>
                      {mockMembers
                        .filter(m => m.id.startsWith('grp-'))
                        .map(member => (
                          <option key={member.id} value={member.id}>
                            {member.name}
                          </option>
                        ))}
                    </select>
                  </FormField>
                ) : (
                  <FormField label="Client">
                    <select
                      id="memberId"
                      value={memberId}
                      onChange={(e) => setMemberId(e.target.value)}
                      className="w-full border rounded p-2"
                      required
                      disabled={!!initialData?.id}
                    >
                      <option value="">Sélectionner un client</option>
                      {mockMembers
                        .filter(m => !m.id.startsWith('grp-'))
                        .map(member => (
                          <option key={member.id} value={member.id}>
                            {member.name}
                          </option>
                        ))}
                    </select>
                  </FormField>
                )}
                
                <FormField label="Produit de crédit">
                  <select
                    id="productId"
                    value={productId}
                    onChange={(e) => setProductId(e.target.value)}
                    className="w-full border rounded p-2"
                    required
                  >
                    <option value="">Sélectionner un produit</option>
                    {mockProducts.map(product => (
                      <option key={product.id} value={product.id}>
                        {product.name}
                      </option>
                    ))}
                  </select>
                </FormField>
                
                <FormField label="Date de réception">
                  <Input
                    id="receptionDate"
                    type="date"
                    value={receptionDate}
                    onChange={(e) => setReceptionDate(e.target.value)}
                    required
                  />
                </FormField>
                
                <FormField label="Montant demandé">
                  <Input
                    id="requestAmount"
                    type="number"
                    min={selectedProduct?.minAmount || 0}
                    max={selectedProduct?.maxAmount}
                    value={requestAmount}
                    onChange={(e) => setRequestAmount(e.target.value)}
                    required
                  />
                  {selectedProduct && (
                    <p className="text-xs text-gray-500">
                      Min: {selectedProduct.minAmount} | Max: {selectedProduct.maxAmount}
                    </p>
                  )}
                </FormField>
                
                <FormField label="Raison de la demande">
                  <Textarea
                    id="reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={3}
                    required
                  />
                </FormField>
                
                <FormField label="Objet de financement">
                  <Input
                    id="financingPurpose"
                    value={financingPurpose}
                    onChange={(e) => setFinancingPurpose(e.target.value)}
                    required
                  />
                </FormField>
              </div>
            </TabsContent>
            
            <TabsContent value="financing" currentValue={activeTab}>
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Périodicité">
                  <select
                    id="periodicity"
                    value={periodicity}
                    onChange={(e) => setPeriodicity(e.target.value as CreditPeriodicity)}
                    className="w-full border rounded p-2"
                    required
                  >
                    <option value="daily">Journalier</option>
                    <option value="weekly">Hebdomadaire</option>
                    <option value="biweekly">Bimensuel</option>
                    <option value="monthly">Mensuel</option>
                    <option value="quarterly">Trimestriel</option>
                    <option value="semiannual">Semestriel</option>
                    <option value="annual">Annuel</option>
                  </select>
                </FormField>
                
                <FormField label="Taux d'intérêt (%)">
                  <Input
                    id="interestRate"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={interestRate}
                    onChange={(e) => setInterestRate(e.target.value)}
                    required
                  />
                </FormField>
                
                <FormField label="Type d'échéance">
                  <select
                    id="scheduleType"
                    value={scheduleType}
                    onChange={(e) => setScheduleType(e.target.value as 'constant' | 'degressive')}
                    className="w-full border rounded p-2"
                    required
                  >
                    <option value="constant">Constant</option>
                    <option value="degressive">Dégressif</option>
                  </select>
                </FormField>
                
                <FormField label="Nombre d'échéances">
                  <Input
                    id="schedulesCount"
                    type="number"
                    min="1"
                    value={schedulesCount}
                    onChange={(e) => setSchedulesCount(e.target.value)}
                    required
                  />
                </FormField>
                
                <FormField label="Nombre de remboursements différés">
                  <Input
                    id="deferredPaymentsCount"
                    type="number"
                    min="0"
                    value={deferredPaymentsCount}
                    onChange={(e) => setDeferredPaymentsCount(e.target.value)}
                  />
                </FormField>
                
                <FormField label="Délai de grâce (en mois)">
                  <Input
                    id="gracePeriod"
                    type="number"
                    min="0"
                    value={gracePeriod}
                    onChange={(e) => setGracePeriod(e.target.value)}
                  />
                </FormField>
                
                <FormField label="Gestionnaire de crédit">
                  <select
                    id="creditManagerId"
                    value={creditManagerId}
                    onChange={(e) => setCreditManagerId(e.target.value)}
                    className="w-full border rounded p-2"
                    required
                  >
                    <option value="">Sélectionner un gestionnaire</option>
                    {mockManagers.map(manager => (
                      <option key={manager.id} value={manager.id}>
                        {manager.name}
                      </option>
                    ))}
                  </select>
                </FormField>
              </div>
            </TabsContent>
            
            {isGroup && (
              <TabsContent value="distribution" currentValue={activeTab}>
                <div className="border rounded-md p-4 bg-white dark:bg-gray-800">
                  <h3 className="text-lg font-medium mb-4">Répartition entre les membres</h3>
                  
                  <div className="space-y-4">
                    {distributions.map(distribution => {
                      const member = groupMembers.find(m => m.id === distribution.memberId);
                      
                      return (
                        <div key={distribution.id} className="flex items-center space-x-4">
                          <div className="flex-1">
                            <FormField label={member?.name || distribution.memberId}>
                              <Input
                                type="number"
                                min="0"
                                value={distribution.amount}
                                onChange={(e) => updateDistribution(
                                  distribution.memberId, 
                                  parseFloat(e.target.value) || 0
                                )}
                              />
                            </FormField>
                          </div>
                        </div>
                      );
                    })}
                    
                    <div className="flex items-center space-x-4 border-t pt-2 font-medium">
                      <div className="flex-1">Total</div>
                      <div className="w-32">
                        {new Intl.NumberFormat('fr-FR', {
                          style: 'currency',
                          currency: 'XOF',
                        }).format(totalDistributionAmount)}
                      </div>
                    </div>
                    
                    {parseFloat(requestAmount) !== totalDistributionAmount && (
                      <p className="text-red-500 text-sm">
                        Le total de la répartition ({totalDistributionAmount}) doit être égal au montant demandé ({requestAmount})
                      </p>
                    )}
                  </div>
                </div>
              </TabsContent>
            )}
          </Tabs>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={!validateForm()}>
              {initialData?.id ? 'Mettre à jour' : 'Créer la demande'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

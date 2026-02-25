import { useState, useCallback, useEffect, useMemo } from 'react';
import { portfolioTypeConfig } from '../config/portfolioTypes';
import { Breadcrumb } from '../components/common/Breadcrumb';
import { Tabs, TabsContent } from '../components/ui/Tabs';
import { TabsOverflow } from '../components/ui/TabsOverflow';
import { PortfolioSettingsDisplay } from '../components/portfolio/traditional/PortfolioSettingsDisplay';
import { PortfolioSettingsPanel } from '../components/portfolio/traditional/PortfolioSettingsPanel';
import { ProductForm } from '../components/portfolio/traditional/ProductForm';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { CreditRequestsTable } from '../components/portfolio/traditional/CreditRequestsTable';
import { DisbursementsTable } from '../components/portfolio/traditional/DisbursementsTable';
import { RepaymentsTable } from '../components/portfolio/traditional/RepaymentsTable';
import { CreditContractsList } from '../components/portfolio/traditional/credit-contract/CreditContractsList';
import { GuaranteesList } from '../components/portfolio/traditional/guarantee/GuaranteesList';
import { PortfolioWalletPanel, providerToTelecom } from '../components/portfolio/wallet/PortfolioWalletPanel';
import { usePortfolio } from '../hooks/usePortfolio';
import { usePortfolioContext } from '../contexts/usePortfolioContext';
import { mockCompanies } from '../data/mockCompanies';
import { mockCompanyDetails } from '../data/mockCompanyDetails';
import { useNotification } from '../contexts/useNotification';
import { useCreditRequests } from '../hooks/useCreditRequests';
import { useCreditContracts } from '../hooks/useCreditContracts';
import { PortfolioDetailsSkeleton } from '../components/ui/PortfolioDetailsSkeleton';
import { OnboardingBanner } from '../components/onboarding/OnboardingBanner';
import type { Portfolio as AnyPortfolio } from '../types/portfolio';
import type { TraditionalPortfolio } from '../types/traditional-portfolio';
import type { PortfolioType } from '../hooks/usePortfolio';
import type { FinancialProduct } from '../types/traditional-portfolio';
import type { ProductFormData } from '../components/portfolio/traditional/ProductForm';
import { useFinancialProducts } from '../hooks/useFinancialProducts';
import type { Company } from '../types/company';
import type { CreditContract } from '../types/credit-contract';
// import CreditRequestDetails from './CreditRequestDetails';
// import DisbursementDetails from './DisbursementDetails';
// import RepaymentDetails from './RepaymentDetails';
// import GuaranteeDetails from './GuaranteeDetails';

// TODO: brancher la logique d'authentification/autorisation ici
// import { useAuth } from '../contexts/AuthContext';

export default function TraditionalPortfolioDetails() {
  // Hooks React (toujours en haut, avant tout return ou condition)
  const { id, portfolioType = 'traditional' } = useParams();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const { setCurrentPortfolioId } = usePortfolioContext();
  const [showProductForm, setShowProductForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<FinancialProduct | undefined>(undefined);

  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'requests';
  const [tab, setTab] = useState(initialTab);

  // Charger les produits financiers à l'ouverture de l'onglet "settings" (sous-onglet Produits dedans)
  useEffect(() => {
    if (tab === 'settings' && id) {
      fetchProducts();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, id]);
  
  // État pour le modal de détails de l'entreprise
  const [companyDetailModalOpen, setCompanyDetailModalOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  // Sync current portfolio id in context for sidebar navigation
  useEffect(() => {
    if (id) setCurrentPortfolioId(id);
    return () => {
      // Only clear if the unmount is for this portfolio details page
      setCurrentPortfolioId(null);
    };
  }, [id, setCurrentPortfolioId]);

  // Update URL when tab changes
  useEffect(() => {
    const currentParams = new URLSearchParams(searchParams);
    if (tab !== 'requests') {
      currentParams.set('tab', tab);
    } else {
      currentParams.delete('tab');
    }
    navigate(`?${currentParams.toString()}`, { replace: true });
  }, [tab, navigate, searchParams]);
  
  // DEBUG: Affichage des paramètres pour diagnostic
  // console.log('TraditionalPortfolioDetails', { id, portfolioType, portfolio });
  // const { user } = useAuth(); // TODO: Sécurité

  // Hook factorisé pour la persistance multi-type (localStorage)
  const { portfolio, loading, addOrUpdate } = usePortfolio(id, portfolioType as PortfolioType);

  // Produits embarqués dans la réponse portfolio (champ financial_products)
  // Utilisés comme données initiales pour un affichage immédiat sans appel supplémentaire
  const embeddedProducts = useMemo(() => {
    if (!isTraditionalPortfolio(portfolio)) return [];
    const fp = (portfolio as TraditionalPortfolio).financial_products;
    return Array.isArray(fp) ? fp : [];
  }, [portfolio]);

  // Compte Mobile Money par défaut du portefeuille (autofill dépôt/retrait)
  const defaultMobileAccount = useMemo(() => {
    const mmAccounts = portfolio?.mobile_money_accounts;
    if (!Array.isArray(mmAccounts) || mmAccounts.length === 0) return undefined;
    const acc = mmAccounts.find((a) => (a as Record<string,unknown>).is_default || (a as Record<string,unknown>).is_primary)
      ?? mmAccounts[0];
    const raw = acc as Record<string, unknown>;
    const phone    = raw.phone_number as string;
    const provider = raw.provider as string;
    const name     = (raw.account_name ?? raw.name) as string;
    const currency = (raw.currency as string) ?? portfolio?.currency ?? 'CDF';
    if (!phone || !provider) return undefined;
    return { phone, telecom: providerToTelecom(provider), accountName: name, currency };
  }, [portfolio]);

  const {
    products: financialProducts,
    loading: productsLoading,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
  } = useFinancialProducts({
    portfolioId: id ?? '',
    autoFetch: false,
    initialProducts: embeddedProducts,
  });
  
  // Hook pour les demandes de crédit (portfolioId requis par le backend)
  const { 
    requests, 
    loading: requestsLoading, 
    changeRequestStatus,
    getMemberName,
    getCreditProductName
  } = useCreditRequests(id);
  
  // Hook pour les contrats de crédit
  const { addContract } = useCreditContracts(id || 'default');
  
  // Préparer les mappings pour les noms
  const safeRequests = Array.isArray(requests) ? requests : [];
  // Priorité: companyName fourni directement par l'API, sinon lookup mock
  const companyNames = Object.fromEntries(
    safeRequests.map(req => [req.memberId, req.companyName || getMemberName(req.memberId)])
  );
  const productNames = Object.fromEntries(safeRequests.map(req => [req.productId, getCreditProductName(req.productId)]));

  // Fonction pour créer un contrat depuis une demande approuvée
  const handleCreateContract = useCallback(async (requestId: string) => {
    const request = safeRequests.find(r => r.id === requestId);
    if (!request) {
      showNotification('Demande non trouvée', 'error');
      return;
    }
    
    if (request.status !== 'approved') {
      showNotification('La demande doit être approuvée pour créer un contrat', 'warning');
      return;
    }
    
    try {
      const memberName = getMemberName(request.memberId);
      const productName = getCreditProductName(request.productId);
      
      const contractData: Omit<CreditContract, 'id' | 'createdAt'> = {
        portfolioId: id || 'default',
        client_id: request.memberId,
        company_name: memberName,
        product_type: productName,
        contract_number: `CTR-${Date.now().toString().slice(-8)}`,
        amount: request.requestAmount,
        interest_rate: request.interestRate,
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + (request.schedulesCount * 30 * 24 * 60 * 60 * 1000)).toISOString(),
        status: 'active',
        terms: `${request.schedulesCount} échéances - ${request.periodicity}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        creditRequestId: request.id,
        memberId: request.memberId,
        memberName: memberName,
        productId: request.productId,
        productName: productName,
        disbursedAmount: 0,
        remainingAmount: request.requestAmount,
        duration: request.schedulesCount,
        gracePeriod: request.gracePeriod,
        amortization_method: request.scheduleType === 'constant' ? 'linear' : 'degressive',
      };
      
      const newContract = await addContract(contractData);
      await changeRequestStatus(requestId, 'disbursed');
      
      showNotification(`Contrat ${newContract.contract_number} créé avec succès pour ${memberName}`, 'success');
      setTab('contracts');
      
    } catch (error) {
      console.error('Erreur lors de la création du contrat:', error);
      showNotification('Erreur lors de la création du contrat', 'error');
    }
  }, [safeRequests, id, addContract, changeRequestStatus, getMemberName, getCreditProductName, showNotification]);

  // Hooks d'action (toujours avant tout return)
  const handleSaveSettings = useCallback(() => {
    showNotification('Paramètres sauvegardés', 'success');
  }, [showNotification]);
  // Actions CRUD factorisées pour tous types de portefeuilles
  // Gestion sécurisée des produits (uniquement pour les portefeuilles traditionnels)
  // Type guard pour TraditionalPortfolio
  function isTraditionalPortfolio(p: AnyPortfolio | undefined): p is TraditionalPortfolio {
    return !!p && p.type === 'traditional' && Array.isArray((p as TraditionalPortfolio).products);
  }

  // Fonction pour gérer l'affichage des détails d'une entreprise
  const handleViewCompany = (companyName: string) => {
    // Chercher l'entreprise dans mockCompanies
    const companyFound = mockCompanies.find(c => c.name === companyName);
    let companyToUse: Company;

    if (companyFound) {
      companyToUse = companyFound;
    } else if (companyName === 'TechInnovate Congo') {
      // Cas particulier pour TechInnovate Congo - conversion depuis mockCompanyDetails
      companyToUse = {
        id: mockCompanyDetails.id,
        name: mockCompanyDetails.name,
        sector: mockCompanyDetails.sector,
        size: 'medium', // Default value
        status: 'active',
        annual_revenue: 100000,
        employee_count: 50,
        financial_metrics: {
          revenue_growth: 0,
          profit_margin: 0,
          cash_flow: 0,
          debt_ratio: 0,
          working_capital: 0,
          credit_score: 0,
          financial_rating: 'B'
        },
        esg_metrics: {
          carbon_footprint: 0,
          environmental_rating: 'B',
          social_rating: 'B',
          governance_rating: 'B'
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } as Company;
    } else {
      // Créer une entreprise de base avec le nom fourni
      companyToUse = {
        id: 'unknown',
        name: companyName,
        sector: 'Non spécifié',
        size: 'small',
        status: 'active',
        annual_revenue: 0,
        employee_count: 0,
        financial_metrics: {
          revenue_growth: 0,
          profit_margin: 0,
          cash_flow: 0,
          debt_ratio: 0,
          working_capital: 0,
          credit_score: 0,
          financial_rating: 'C'
        },
        esg_metrics: {
          carbon_footprint: 0,
          environmental_rating: 'C',
          social_rating: 'C',
          governance_rating: 'C'
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } as Company;
    }

    setSelectedCompany(companyToUse);
    // Naviguer vers la page de consultation en passant les données via location state
    navigate(`/app/traditional/company/${encodeURIComponent(companyToUse.id || companyToUse.name)}/view`, { state: { company: companyToUse } });
    showNotification(`Détails de l'entreprise ${companyName} affichés`, 'info');
  };

  /** Soumission du formulaire produit — gère création ET modification */
  const handleProductFormSubmit = useCallback(async (data: ProductFormData) => {
    if (!id) return;
    try {
      // Convertir required_documents: { value: string }[] → string[]
      const requiredDocs = (data.required_documents ?? []).map((d) => d.value).filter(Boolean);

      if (selectedProduct) {
        // Mode édition
        await updateProduct(selectedProduct.id, {
          ...data,
          required_documents: requiredDocs,
          portfolio_id: id,
        });
        showNotification('Produit financier mis à jour avec succès', 'success');
      } else {
        // Mode création
        await createProduct({
          ...data,
          required_documents: requiredDocs,
          portfolio_id: id,
        });
        showNotification('Produit financier créé avec succès', 'success');
      }
      setShowProductForm(false);
      setSelectedProduct(undefined);
    } catch {
      showNotification('Erreur lors de l\'enregistrement du produit', 'error');
    }
  }, [id, selectedProduct, createProduct, updateProduct, showNotification]);

  const handleEditProduct = useCallback((product: FinancialProduct) => {
    setSelectedProduct(product);
    setShowProductForm(true);
  }, []);

  const handleDeleteProduct = useCallback(async (product: FinancialProduct) => {
    if (!window.confirm(`Désactiver le produit "${product.name}" ?`)) return;
    try {
      await deleteProduct(product.id);
      showNotification('Produit désactivé', 'success');
    } catch {
      showNotification('Erreur lors de la désactivation', 'error');
    }
  }, [deleteProduct, showNotification]);

  // Sécurité: fallback si id absent ou non valide
  if (!id) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">ID de portefeuille manquant</h2>
        <Button
          variant="outline"
          onClick={() => navigate('/app/dashboard')}
          className="mt-4"
        >
          Retour au dashboard
        </Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto p-4 sm:p-6">
        <PortfolioDetailsSkeleton />
      </div>
    );
  }

  if (!portfolio && !loading) {
    // Redirige automatiquement vers la liste sans afficher de page fantôme
    navigate(`/app/${portfolioType}`, { replace: true });
    return null;
  }

  // Guard : on ne continue que si portfolio est bien défini
  if (!portfolio) return null;

  // Utilisation de la config centralisée pour les tabs (préparation multi-portefeuille)
  const config = portfolioTypeConfig[portfolioType as keyof typeof portfolioTypeConfig] || portfolioTypeConfig['traditional'];

  // Déterminer si le portefeuille est "vide" (nouvel utilisateur qui vient de créer son premier portefeuille)
  const hasNoRequests = safeRequests.length === 0;
  const hasNoProducts = !productsLoading && financialProducts.length === 0;
  const isEmptyPortfolio = hasNoRequests && hasNoProducts;

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Bannière d'onboarding pour les portefeuilles vides */}
      {isEmptyPortfolio && (
        <OnboardingBanner 
          type="empty_portfolio" 
          portfolioId={id}
        />
      )}

      {/* Breadcrumb sécurisé */}
      <Breadcrumb
        items={[
          { label: 'Dashboard', href: `/app/${portfolioType}` },
          { label: portfolio.name, href: `/app/${portfolioType}/${id}` }
        ]}
        portfolioType={portfolioType}
      />

      {/* En-tête */}
      <div className="flex items-center space-x-4 mb-4">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          {portfolio.name}
        </h1>
      </div>

      {/* Tabs dynamiques */}
      <Tabs value={tab} onValueChange={setTab}>
        {/* Onglets dynamiques avec overflow responsive */}
        <TabsOverflow
          tabs={config.tabs.map(({ key, label }) => ({ key, label }))}
          value={tab}
          onValueChange={setTab}
        />

        {/* Onglets dynamiques */}
        {config.tabs.map((tabConfig) => {
          if (tabConfig.key === 'settings') {
            return (
              <TabsContent
                key={tabConfig.key}
                value={tabConfig.key}
                currentValue={tab}
              >
                {portfolio && (
                  <PortfolioSettingsDisplay
                    portfolio={portfolio as TraditionalPortfolio}
                    onEdit={async (updatedData) => {
                      try {
                        await addOrUpdate(updatedData);
                        showNotification('Paramètres du portefeuille sauvegardés avec succès', 'success');
                      } catch (error) {
                        console.error('Error saving portfolio settings:', error);
                        showNotification('Erreur lors de la sauvegarde des paramètres', 'error');
                      }
                    }}
                    onDelete={async () => {
                      try {
                        // TODO: Appeler l'API de suppression
                        showNotification('Portefeuille supprimé avec succès', 'success');
                        navigate('/portfolio');
                      } catch (error) {
                        console.error('Error deleting portfolio:', error);
                        showNotification('Erreur lors de la suppression du portefeuille', 'error');
                      }
                    }}
                    financialProducts={financialProducts}
                    productsLoading={productsLoading}
                    onAddProduct={() => { setSelectedProduct(undefined); setShowProductForm(true); }}
                    onEditProduct={handleEditProduct}
                    onDeleteProduct={handleDeleteProduct}
                  />
                )}
              </TabsContent>
            );
          }
          if (tabConfig.key === 'settings-edit') {
            return (
              <TabsContent
                key={tabConfig.key}
                value={tabConfig.key}
                currentValue={tab}
              >
                {portfolio && (
                  <PortfolioSettingsPanel
                    portfolio={portfolio as TraditionalPortfolio}
                    onSave={handleSaveSettings}
                  />
                )}
              </TabsContent>
            );
          }
          if (tabConfig.key === 'requests') {
            return (
              <TabsContent
                key={tabConfig.key}
                value={tabConfig.key}
                currentValue={tab}
              >
                {/* Utiliser le nouveau composant CreditRequestsTable avec les données nécessaires */}
                <CreditRequestsTable 
                  requests={safeRequests} 
                  loading={requestsLoading}
                  companyNames={companyNames}
                  productNames={productNames}
                  onValidate={(id) => changeRequestStatus(id, 'approved')}
                  onRefuse={(id) => changeRequestStatus(id, 'rejected')}
                  onDisburse={(id) => changeRequestStatus(id, 'disbursed')}
                  onView={(id) => navigate(`/portfolio/${id}/requests/${id}`)}
                  onViewCompany={(companyId, companyName) => {
                    // companyId est le UUID de l'entreprise (fourni par l'API dans companyId ou memberId)
                    // companyName est le nom lisible (fourni par l'API dans companyName)
                    let company = mockCompanies.find(c => c.id === companyId);
                    
                    // Si non trouvé par ID, chercher par nom
                    if (!company && companyName) {
                      company = mockCompanies.find(c => c.name === companyName);
                    }
                    
                    const resolvedName = companyName || getMemberName(companyId);
                    
                    // Si toujours pas trouvé, créer un objet Company minimal
                    if (!company) {
                      company = {
                        id: companyId,
                        name: resolvedName,
                        sector: 'Non spécifié',
                        size: 'PME' as CompanySize,
                        annual_revenue: 0,
                        employee_count: 0,
                        status: 'lead' as CompanyStatus,
                        financial_metrics: {
                          annual_revenue: 0,
                          revenue_growth: 0,
                          profit_margin: 0,
                          cash_flow: 0,
                          debt_ratio: 0,
                          working_capital: 0,
                          credit_score: 0,
                          financial_rating: 'NR' as const,
                          ebitda: 0
                        }
                      };
                    }
                    
                    setSelectedCompany(company);
                    navigate(`/app/traditional/company/${encodeURIComponent(company.id || company.name)}/view`, { state: { company } });
                  }}
                  onCreateContract={handleCreateContract}
                />
              </TabsContent>
            );
          }
          if (tabConfig.key === 'disbursements') {
            return (
              <TabsContent
                key={tabConfig.key}
                value={tabConfig.key}
                currentValue={tab}
              >
                <DisbursementsTable
                  portfolioId={id || ''}
                  onView={(disbursementId: string) => {
                    showNotification(`Décaissement ${disbursementId} sélectionné`, 'info');
                    // Navigation désactivée: navigate(`/app/${portfolioType}/portfolio/${id}/disbursements/${disbursementId}`)
                  }}
                  onViewCompany={(companyName: string) => {
                    handleViewCompany(companyName);
                  }}
                />
              </TabsContent>
            );
          }
          if (tabConfig.key === 'wallet') {
            return (
              <TabsContent
                key={tabConfig.key}
                value={tabConfig.key}
                currentValue={tab}
              >
                <PortfolioWalletPanel portfolioId={id || ''} defaultMobileAccount={defaultMobileAccount} />
              </TabsContent>
            );
          }
          if (tabConfig.key === 'repayments') {
            return (
              <TabsContent
                key={tabConfig.key}
                value={tabConfig.key}
                currentValue={tab}
              >
                <RepaymentsTable
                  portfolioId={id || ''}
                  onView={(repaymentId: string) => {
                    showNotification(`Remboursement ${repaymentId} sélectionné`, 'info');
                    // Navigation désactivée: navigate(`/app/${portfolioType}/portfolio/${id}/repayments/${repaymentId}`)
                  }}
                  onViewSchedule={(contractReference: string) => {
                    // Naviguer vers l'échéancier du contrat associé
                    navigate(`/app/portfolio/${id}/contracts/${contractReference}/schedule`);
                  }}
                  onViewCompany={(companyName: string) => {
                    handleViewCompany(companyName);
                  }}
                />
              </TabsContent>
            );
          }
          if (tabConfig.key === 'contracts') {
            return (
              <TabsContent
                key={tabConfig.key}
                value={tabConfig.key}
                currentValue={tab}
              >
                <CreditContractsList 
                  portfolioId={id || 'default'} 
                  onViewCompany={(companyName: string) => {
                    handleViewCompany(companyName);
                  }}
                />
              </TabsContent>
            );
          }
          if (tabConfig.key === 'guarantees') {
            return (
              <TabsContent
                key={tabConfig.key}
                value={tabConfig.key}
                currentValue={tab}
              >
                <GuaranteesList portfolioId={id || 'default'} />
              </TabsContent>
            );
          }
          return null;
        })}
      </Tabs>

      {/* Popups métier pour détails (UX professionnelle) */}
      {/* Plus de modales pour les détails métier, navigation uniquement */}
      {/* Modal création / édition de produit financier */}
      {showProductForm && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          role="dialog"
          aria-modal="true"
          aria-label={selectedProduct ? 'Modifier un produit financier' : 'Créer un produit financier'}
        >
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b dark:border-gray-700">
              <h2 className="text-xl font-semibold">
                {selectedProduct ? 'Modifier le produit financier' : 'Nouveau produit financier'}
              </h2>
            </div>
            <div className="p-6">
              <ProductForm
                product={selectedProduct}
                onSubmit={handleProductFormSubmit}
                onCancel={() => { setShowProductForm(false); setSelectedProduct(undefined); }}
              />
            </div>
          </div>
        </div>
      )}
      
      {/* CompanyDetails modal removed — navigation to CompanyViewPage used instead */}
    </div>
  );
}

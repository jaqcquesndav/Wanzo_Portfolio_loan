import { useState, useCallback, useEffect } from 'react';
import { portfolioTypeConfig } from '../config/portfolioTypes';
import { Breadcrumb } from '../components/common/Breadcrumb';
import { Tabs, TabsContent } from '../components/ui/Tabs';
import { TabsOverflow } from '../components/ui/TabsOverflow';
import { PortfolioSettingsDisplay } from '../components/portfolio/traditional/PortfolioSettingsDisplay';
import { PortfolioSettingsEditModal } from '../components/portfolio/traditional/PortfolioSettingsEditModal';
import { PortfolioSettingsPanel } from '../components/portfolio/traditional/PortfolioSettingsPanel';
import { Plus } from 'lucide-react';
import { FinancialProductsList } from '../components/portfolio/traditional/FinancialProductsList';
import { FinancialProductForm } from '../components/portfolio/traditional/FinancialProductForm';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { FundingRequestsTable } from '../components/portfolio/traditional/FundingRequestsTable';
import { DisbursementsTable } from '../components/portfolio/traditional/DisbursementsTable';
import { RepaymentsTable } from '../components/portfolio/traditional/RepaymentsTable';
import { GuaranteesList } from '../components/portfolio/traditional/guarantee/GuaranteesList';
import { CreditContractsList } from '../components/portfolio/traditional/credit-contract/CreditContractsList';
import { usePortfolio } from '../hooks/usePortfolio';
import { usePortfolioContext } from '../contexts/usePortfolioContext';
import { mockFundingRequests } from '../data/mockFundingRequests';
import { mockDisbursements } from '../data/mockDisbursements';
import { mockRepayments } from '../data/mockRepayments';
import { useNotification } from '../contexts/NotificationContext';
import { usePaymentOrder } from '../hooks/usePaymentOrderContext';
import { openPaymentOrder } from '../utils/openPaymentOrder';
import type { Portfolio as AnyPortfolio } from '../types/portfolio';
import type { TraditionalPortfolio } from '../types/traditional-portfolio';
import type { PortfolioType } from '../hooks/usePortfolio';
import type { FinancialProduct } from '../types/traditional-portfolio';
import type { ProductFormData } from '../components/portfolio/traditional/FinancialProductForm';
// import CreditRequestDetails from './CreditRequestDetails';
// import DisbursementDetails from './DisbursementDetails';
// import RepaymentDetails from './RepaymentDetails';
// import GuaranteeDetails from './GuaranteeDetails';

// TODO: brancher la logique d'authentification/autorisation ici
// import { useAuth } from '../contexts/AuthContext';

export default function TraditionalPortfolioDetails() {
  const [showEditModal, setShowEditModal] = useState(false);
  // Hooks React (toujours en haut, avant tout return ou condition)
  const { id, portfolioType = 'traditional' } = useParams();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const { setCurrentPortfolioId } = usePortfolioContext();
  const { showPaymentOrderModal } = usePaymentOrder();
  const [showProductForm, setShowProductForm] = useState(false);
// const [selectedProduct, setSelectedProduct] = useState<FinancialProduct | null>(null);
  const [tab, setTab] = useState('products');
  // const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  // const [selectedDisbursementId, setSelectedDisbursementId] = useState<string | null>(null);
  // const [selectedRepaymentId, setSelectedRepaymentId] = useState<string | null>(null);
  // const [selectedGuaranteeId, setSelectedGuaranteeId] = useState<string | null>(null);

  // Sync current portfolio id in context for sidebar navigation
  useEffect(() => {
    if (id) setCurrentPortfolioId(id);
    return () => {
      // Only clear if the unmount is for this portfolio details page
      setCurrentPortfolioId(null);
    };
  }, [id, setCurrentPortfolioId]);
  // DEBUG: Affichage des paramètres pour diagnostic
  // console.log('TraditionalPortfolioDetails', { id, portfolioType, portfolio });
  // const { user } = useAuth(); // TODO: Sécurité

  // Hook factorisé pour la persistance multi-type (localStorage)
  const { portfolio, loading, addOrUpdate } = usePortfolio(id, portfolioType as PortfolioType);

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

  const handleCreateProduct = useCallback(async (data: ProductFormData) => {
    if (!data.name || !data.type) {
      showNotification('Veuillez renseigner tous les champs obligatoires', 'error');
      return;
    }
    if (!portfolio || !isTraditionalPortfolio(portfolio)) return;
    try {
      const now = new Date().toISOString();
      const newProduct: FinancialProduct = {
        ...data,
        id: crypto.randomUUID(),
        status: 'active',
        created_at: now,
        updated_at: now
      };
      const products: FinancialProduct[] = [...portfolio.products, newProduct];
      await addOrUpdate({ products });
      showNotification('Produit financier créé avec succès', 'success');
      setShowProductForm(false);
    } catch {
      showNotification('Erreur lors de la création du produit', 'error');
    }
  }, [addOrUpdate, showNotification, portfolio]);

  // const handleUpdateProduct = useCallback(async (updatedProduct: FinancialProduct) => {
  //   if (!updatedProduct.id) {
  //     showNotification('Produit invalide', 'error');
  //     return;
  //   }
  //   if (!isTraditionalPortfolio(portfolio)) return;
  //   try {
  //     const products: FinancialProduct[] = portfolio.products.map((p) => p.id === updatedProduct.id ? updatedProduct : p);
  //     await addOrUpdate({ products });
  //     showNotification('Produit financier mis à jour avec succès', 'success');
  //   } catch {
  //     showNotification('Erreur lors de la mise à jour du produit', 'error');
  //   }
  // }, [addOrUpdate, showNotification, portfolio]);

  // Sécurité: fallback si id absent ou non valide
  if (!id) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900">ID de portefeuille manquant</h2>
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
      <div className="flex justify-center items-center h-64" role="status" aria-live="polite">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" aria-label="Chargement..." />
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

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
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
                  <>
                    <PortfolioSettingsDisplay
                      portfolio={portfolio as TraditionalPortfolio}
                      onEdit={() => setShowEditModal(true)}
                      onDelete={() => {
                        // TODO: brancher la suppression réelle ici
                        showNotification('Portefeuille supprimé (simulation)', 'success');
                      }}
                    />
                    <PortfolioSettingsEditModal
                      open={showEditModal}
                      portfolio={portfolio as TraditionalPortfolio}
                      onSave={handleSaveSettings}
                      onClose={() => setShowEditModal(false)}
                    />
                  </>
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
          if (tabConfig.key === 'products' && isTraditionalPortfolio(portfolio)) {
            const products = portfolio.products;
            return (
              <TabsContent
                key={tabConfig.key}
                value={tabConfig.key}
                currentValue={tab}
              >
                <div className="flex justify-end mb-4">
                  <Button onClick={() => setShowProductForm(true)} icon={<Plus className="h-5 w-5" aria-hidden="true" />}>Nouveau produit</Button>
                </div>
                {products && products.length > 0 ? (
                  <FinancialProductsList
                    products={products}
                    onViewDetails={(product) => {
                      showNotification(`Produit ${product.name} sélectionné`, 'info');
                      // Navigation désactivée: navigate(`/app/${portfolioType}/portfolio/${id}/products/${product.id}`)
                    }}
                  />
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <p>Aucun produit financier n'a encore été créé</p>
                    <Button
                      variant="outline"
                      onClick={() => setShowProductForm(true)}
                      className="mt-4"
                      icon={<Plus className="h-5 w-5" aria-hidden="true" />}
                    >
                      Créer un produit
                    </Button>
                  </div>
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
                <FundingRequestsTable
                  requests={mockFundingRequests}
                  onValidate={(requestId) => {
                    // Chercher la demande concernée
                    const request = mockFundingRequests.find(req => req.id === requestId);
                    if (!request) {
                      showNotification('Demande non trouvée', 'error');
                      return;
                    }
                    
                    // Ouvrir le modal d'ordre de paiement pour la validation
                    openPaymentOrder({
                      action: 'validate_funding',
                      portfolioId: id || '',
                      portfolioName: portfolio?.name,
                      itemId: request.id,
                      reference: request.id,
                      amount: request.amount,
                      company: request.company,
                      product: request.product
                    }, showPaymentOrderModal);
                    
                    // Note: Pour une démo, on affiche quand même la notification
                    // Dans une vraie app, cela serait fait après confirmation du paiement
                    showNotification(`Demande ${requestId} validée`, 'success');
                  }}
                  onRefuse={(requestId) => {
                    showNotification(`Demande ${requestId} refusée`, 'info');
                  }}
                  onDisburse={(requestId) => {
                    // Chercher la demande concernée pour le décaissement
                    const request = mockFundingRequests.find(req => req.id === requestId);
                    if (!request) {
                      showNotification('Demande non trouvée', 'error');
                      return;
                    }
                    
                    // Ouvrir le modal d'ordre de paiement pour le décaissement
                    openPaymentOrder({
                      action: 'validate_funding',
                      portfolioId: id || '',
                      portfolioName: portfolio?.name,
                      itemId: request.id,
                      reference: request.id,
                      amount: request.amount,
                      company: request.company,
                      product: request.product
                    }, showPaymentOrderModal);
                    
                    showNotification(`Fonds débloqués pour la demande ${requestId}`, 'success');
                  }}
                  onView={(requestId) => {
                    showNotification(`Demande ${requestId} sélectionnée`, 'info');
                    // Navigation désactivée: navigate(`/app/${portfolioType}/portfolio/${id}/requests/${requestId}`)
                  }}
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
                  disbursements={mockDisbursements}
                  onConfirm={() => {}}
                  onView={(disbursementId: string) => {
                    showNotification(`Décaissement ${disbursementId} sélectionné`, 'info');
                    // Navigation désactivée: navigate(`/app/${portfolioType}/portfolio/${id}/disbursements/${disbursementId}`)
                  }}
                />
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
                  repayments={mockRepayments}
                  onMarkPaid={() => {}}
                  onView={(repaymentId: string) => {
                    showNotification(`Remboursement ${repaymentId} sélectionné`, 'info');
                    // Navigation désactivée: navigate(`/app/${portfolioType}/portfolio/${id}/repayments/${repaymentId}`)
                  }}
                  onViewSchedule={(contractReference: string) => {
                    // Naviguer vers l'échéancier du contrat associé
                    navigate(`/app/portfolio/${id}/contracts/${contractReference}/schedule`);
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
          if (tabConfig.key === 'contracts') {
            return (
              <TabsContent
                key={tabConfig.key}
                value={tabConfig.key}
                currentValue={tab}
              >
                <CreditContractsList portfolioId={id || 'default'} />
              </TabsContent>
            );
          }
          return null;
        })}
      </Tabs>

      {/* Popups métier pour détails (UX professionnelle) */}
      {/* Plus de modales pour les détails métier, navigation uniquement */}
      {/* Modal de création de produit */}
      {showProductForm && isTraditionalPortfolio(portfolio) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" role="dialog" aria-modal="true" aria-label="Créer un produit financier">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b dark:border-gray-700">
              <h2 className="text-xl font-semibold">Nouveau produit financier</h2>
            </div>
            <div className="p-6">
              <FinancialProductForm
                portfolio={portfolio as TraditionalPortfolio}
                onSubmit={handleCreateProduct}
                onCancel={() => setShowProductForm(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
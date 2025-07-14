import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';

import { usePortfolio } from '../hooks/usePortfolio';
import { Tabs, TabsContent } from '../components/ui/Tabs';
import { TabsOverflow } from '../components/ui/TabsOverflow';
import { Breadcrumb } from '../components/common/Breadcrumb';
import { usePaymentOrder } from '../hooks/usePaymentOrderContext';
import { openPaymentOrder } from '../utils/openPaymentOrder';
// import { AssetsTable } from '../components/portfolio/investment/AssetsTable';
import { SubscriptionsTable } from '../components/portfolio/investment/SubscriptionsTable';
import { ValuationsTable } from '../components/portfolio/investment/ValuationsTable';
import { InvestmentPortfolioSettingsDisplay } from '../components/portfolio/investment/InvestmentPortfolioSettingsDisplay';
import { InvestmentPortfolioSettingsEditModal } from '../components/portfolio/investment/InvestmentPortfolioSettingsEditModal';
import { MarketSecuritiesTable } from '../components/portfolio/investment/market/MarketSecuritiesTable';
import { ActiveSecuritiesTable } from '../components/portfolio/investment/market/ActiveSecuritiesTable';
import { mockMarketSecurities } from '../data/mockMarketSecurities';
import { MarketSecurity } from '../types/market-securities';
import { InvestmentPortfolio, InvestmentAsset } from '../types/investment-portfolio';

import { ConfirmModal } from '../components/ui/ConfirmModal';
import { portfolioTypeConfig } from '../config/portfolioTypes';

export default function InvestmentPortfolioDetails() {


  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  // Forcer le type à 'investment' pour ce composant spécifique
  const portfolioType = 'investment';
  const { portfolio, loading, addOrUpdate } = usePortfolio(id || '', portfolioType);
  const { showPaymentOrderModal } = usePaymentOrder();
  const [tab, setTab] = useState('market');
  const [showEditModal, setShowEditModal] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Gestion harmonisée des erreurs et du chargement (comme la page traditionnelle)
  if (!id) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900">ID de portefeuille manquant</h2>
        <Button
          variant="outline"
          onClick={() => navigate(`/app/${portfolioType}`)}
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
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-red-600">Portefeuille introuvable</h2>
        <p className="text-gray-500 mt-2">Aucun portefeuille avec l'ID <span className="font-mono bg-gray-100 px-2 py-1 rounded">{id}</span> n'a été trouvé dans la base de données.</p>
        <div className="flex flex-col items-center gap-4 mt-6">
          <Button
            variant="outline"
            onClick={() => navigate(`/app/${portfolioType}`)}
          >
            Retour à la liste
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              localStorage.removeItem('mockDataInitialized');
              window.location.reload();
            }}
          >
            Réinitialiser les données mock
          </Button>
        </div>
      </div>
    );
  }


  // Ne pas afficher cette page si le portefeuille n'est pas de type investment
  if (!portfolio || portfolio.type !== 'investment') {
    navigate(`/app/${portfolioType}`, { replace: true });
    return null;
  }

  const handlePurchase = (security: MarketSecurity, quantity: number) => {
    // Ouvrir le modal d'ordre de paiement
    openPaymentOrder({
      action: 'buy_security',
      portfolioId: id || '',
      portfolioName: portfolio?.name,
      itemId: security.id,
      reference: security.reference || security.id,
      amount: security.unitPrice * quantity,
      company: security.companyName || security.issuer || '',
      product: security.name,
      additionalInfo: {
        securityType: security.type,
        quantity: quantity,
        unitPrice: security.unitPrice
      }
    }, showPaymentOrderModal);
    
    // Note: Idéalement, nous devrions créer un système de callback pour créer l'actif
    // uniquement après la confirmation du paiement. Pour l'instant, l'actif sera créé 
    // immédiatement pour la démonstration.
    
    console.log(`Ouverture du modal de paiement pour l'achat de ${quantity} de ${security.name}`);
    
    // La création de l'actif devrait être faite après confirmation du paiement
    // Cela nécessiterait un système d'écouteurs d'événements ou de callbacks
    // dans le PaymentOrderContext
  };

  const handleSell = (assetId: string, quantity: number) => {
    // Logique de vente
    console.log(`Vente de ${quantity} de l'actif ${assetId}`);
    // Mettre à jour le portefeuille (modifier ou supprimer un actif)
    
    // Type assertion to InvestmentPortfolio
    const investmentPortfolio = portfolio as InvestmentPortfolio;
    const updatedAssets = (investmentPortfolio.assets || []).filter((a) => a.id !== assetId); // Simplifié
    
    // Use type assertion for addOrUpdate to accept assets property
    addOrUpdate({ 
      ...investmentPortfolio, 
      assets: updatedAssets 
    } as unknown as Partial<InvestmentPortfolio>);
  };

  // Config dynamique selon le type de portefeuille (sécurise l'affichage des tabs)
  const config = portfolioTypeConfig[portfolioType] || portfolioTypeConfig['investment'];

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <Breadcrumb
        items={[
          { label: 'Dashboard', href: `/app/${portfolioType}` },
          { label: portfolio?.name || 'Portefeuille', href: `/app/${portfolioType}/${id}` },
        ]}
        portfolioType={portfolioType}
      />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{portfolio.name}</h1>
      </div>
      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsOverflow
          tabs={config.tabs.map((tab: { key: string; label: string }) => ({ key: tab.key, label: tab.label }))}
          value={tab}
          onValueChange={setTab}
        />
        <TabsContent value="market" currentValue={tab}>
          <MarketSecuritiesTable
            securities={mockMarketSecurities}
            loading={loading}
            onPurchase={handlePurchase}
          />
        </TabsContent>
        <TabsContent value="assets" currentValue={tab}>
          <ActiveSecuritiesTable
            assets={portfolio?.type === 'investment' 
              ? ((portfolio as InvestmentPortfolio).assets || []).map(asset => {
                  // Type asset comme un objet à structure dynamique
                  const assetObj = asset as { 
                    id: string; 
                    name: string; 
                    type: string;
                    value?: number;
                    created_at: string;
                    companyId?: string;
                    acquiredDate?: string;
                    initialValue?: number;
                    currentValue?: number;
                    status?: string;
                    updated_at?: string;
                  };
                  
                  // Adapter le format des assets mockés au format attendu par ActiveSecuritiesTable
                  if ('value' in assetObj && !('initialValue' in assetObj)) {
                    // Ancien format - convertir
                    return {
                      id: assetObj.id,
                      name: assetObj.name,
                      companyId: 'COMP-' + assetObj.id.substring(6), // Générer un ID de compagnie
                      type: assetObj.type === 'Venture' || assetObj.type === 'Private Equity' ? 'share' : 'other',
                      acquiredDate: assetObj.created_at,
                      initialValue: assetObj.value || 0,
                      currentValue: assetObj.value || 0,
                      status: 'active',
                      created_at: assetObj.created_at,
                      updated_at: assetObj.created_at
                    } as InvestmentAsset;
                  }
                  return asset as InvestmentAsset;
                })
              : []
            }
            loading={loading}
            onSell={handleSell}
          />
        </TabsContent>
        <TabsContent value="subscriptions" currentValue={tab}>
          <SubscriptionsTable
            subscriptions={portfolio.type === 'investment' && Array.isArray((portfolio as InvestmentPortfolio).subscriptions) ? (portfolio as InvestmentPortfolio).subscriptions! : []}
            loading={loading}
          />
        </TabsContent>
        <TabsContent value="valuations" currentValue={tab}>
          <ValuationsTable
            valuations={portfolio.type === 'investment' && Array.isArray((portfolio as InvestmentPortfolio).valuations) ? (portfolio as InvestmentPortfolio).valuations! : []}
            loading={loading}
          />
        </TabsContent>
        <TabsContent value="settings" currentValue={tab}>
          <InvestmentPortfolioSettingsDisplay
            portfolio={portfolio as InvestmentPortfolio}
            onEdit={() => setShowEditModal(true)}
            onDelete={() => {/* TODO: brancher la suppression réelle ici */}}
          />
          <InvestmentPortfolioSettingsEditModal
            open={showEditModal}
            portfolio={portfolio as InvestmentPortfolio}
            onSave={() => setShowEditModal(false)}
            onClose={() => setShowEditModal(false)}
          />
        </TabsContent>
      </Tabs>
      {/* Confirm delete modal for investment request (à déplacer si besoin) */}
      <ConfirmModal
        open={!!confirmDeleteId}
        title="Confirmation"
        message="Supprimer cette demande ?"
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        onConfirm={async () => {
          if (confirmDeleteId) {
            setConfirmDeleteId(null);
          }
        }}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </div>
  );
}



import { useParams } from 'react-router-dom';
import { Breadcrumb } from '../components/common/Breadcrumb';
import { usePortfolio } from '../hooks/usePortfolio';
import { usePortfolioType } from '../hooks/usePortfolioType';
import type { InvestmentPortfolio } from '../lib/indexedDbPortfolioService';




export default function InvestmentAssetDetail() {
  const { id: portfolioId, assetId } = useParams();
  let portfolioType = usePortfolioType();
  if (!portfolioType) portfolioType = 'investment';
  const { portfolio, loading } = usePortfolio(portfolioId, portfolioType);

  if (loading) {
    return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
  }
  // Type guard: check if portfolio is investment and has assets
  if (!portfolio || typeof portfolio !== 'object' || (portfolio as InvestmentPortfolio).type !== 'investment' || !Array.isArray((portfolio as InvestmentPortfolio).assets)) {
    return <div className="text-center py-12">Aucun portefeuille ou actif trouvé.</div>;
  }
  const assets = (portfolio as InvestmentPortfolio).assets;
  const asset = assets.find(a => a.id === assetId);
  if (!asset) {
    return <div className="text-center py-12">Actif introuvable.</div>;
  }
  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <Breadcrumb
        items={[
          { label: 'Dashboard', href: `/app/${portfolioType}` },
          { label: portfolio?.name || 'Portefeuille', href: `/app/${portfolioType}/${portfolioId}` },
          { label: 'Actifs', href: `/app/${portfolioType}/${portfolioId}?tab=assets` },
          { label: String(asset.name) }
        ]}
      />
      <h1 className="text-2xl font-semibold mb-4">Détail de l'actif</h1>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-4">
        <div><span className="font-semibold">Nom :</span> {String(asset.name)}</div>
        <div><span className="font-semibold">Type :</span> {String(asset.type)}</div>
        <div><span className="font-semibold">Valeur :</span> {typeof asset.value === 'number' ? asset.value.toLocaleString() : ''} {String(asset.currency)}</div>
        <div><span className="font-semibold">Créé le :</span> {String(asset.created_at)}</div>
        {/* Ajoutez ici d'autres champs métier si besoin */}
      </div>
    </div>
  );
}

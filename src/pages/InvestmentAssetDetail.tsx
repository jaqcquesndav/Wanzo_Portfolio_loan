
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { ArrowLeft } from 'lucide-react';
import { usePortfolio } from '../hooks/usePortfolio';

import type { InvestmentPortfolio } from '../lib/indexedDbPortfolioService';

function isInvestmentPortfolio(portfolio: unknown): portfolio is InvestmentPortfolio {
  return (
    typeof portfolio === 'object' &&
    portfolio !== null &&
    (portfolio as { type?: string }).type === 'investment' &&
    Array.isArray((portfolio as { assets?: unknown }).assets)
  );
}

export default function InvestmentAssetDetail() {
  const { id: portfolioId, assetId } = useParams();
  const navigate = useNavigate();
  const { portfolio, loading } = usePortfolio(portfolioId, 'investment');

  if (loading) {
    return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
  }
  // Type guard: check if portfolio is investment and has assets
  if (!isInvestmentPortfolio(portfolio)) {
    return <div className="text-center py-12">Aucun portefeuille ou actif trouvé.</div>;
  }
  const assets = portfolio.assets;
  const asset = assets.find(a => a.id === assetId);
  if (!asset) {
    return <div className="text-center py-12">Actif introuvable.</div>;
  }
  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <Button variant="ghost" onClick={() => navigate(-1)} icon={<ArrowLeft className="h-5 w-5" />}>Retour</Button>
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

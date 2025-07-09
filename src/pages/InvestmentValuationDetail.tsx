import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { ArrowLeft } from 'lucide-react';
import { usePortfolio } from '../hooks/usePortfolio';
import type { InvestmentPortfolio } from '../types/investment-portfolio';
import type { CompanyValuation } from '../types/securities';

export default function InvestmentValuationDetail() {
  const { id: portfolioId, valuationId } = useParams();
  const navigate = useNavigate();
  const { portfolio, loading } = usePortfolio(portfolioId, 'investment');

  if (loading) {
    return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
  }
  if (!portfolio || portfolio.type !== 'investment' || !Array.isArray((portfolio as InvestmentPortfolio).valuations)) {
    return <div className="text-center py-12">Aucun portefeuille ou valorisation trouvée.</div>;
  }
  const valuations = (portfolio as InvestmentPortfolio).valuations || [];
  const valuation = valuations.find((v: CompanyValuation) => v.id === valuationId);
  if (!valuation) {
    return <div className="text-center py-12">Valorisation introuvable.</div>;
  }
  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <Button variant="ghost" onClick={() => navigate(-1)} icon={<ArrowLeft className="h-5 w-5" />}>Retour</Button>
      <h1 className="text-2xl font-semibold mb-4">Détail de la valorisation</h1>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-4">
        <div><span className="font-semibold">ID :</span> {String(valuation.id)}</div>
        <div><span className="font-semibold">Entreprise :</span> {String(valuation.companyId)}</div>
        <div><span className="font-semibold">Valeur totale :</span> {typeof valuation.totalValue === 'number' ? valuation.totalValue.toLocaleString() : ''}</div>
        <div><span className="font-semibold">Prix par part :</span> {typeof valuation.sharePrice === 'number' ? valuation.sharePrice.toLocaleString() : ''}</div>
        <div><span className="font-semibold">Date :</span> {String(valuation.evaluationDate)}</div>
        <div><span className="font-semibold">Méthode :</span> {String(valuation.method)}</div>
        {/* Ajoutez ici d'autres champs métier si besoin */}
      </div>
    </div>
  );
}

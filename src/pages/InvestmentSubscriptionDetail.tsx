
import { useParams } from 'react-router-dom';
import { Breadcrumb } from '../components/common/Breadcrumb';
import { usePortfolio } from '../hooks/usePortfolio';
import { usePortfolioType } from '../hooks/usePortfolioType';
import type { InvestmentPortfolio } from '../types/investment-portfolio';
import type { SecuritySubscription } from '../types/securities';


export default function InvestmentSubscriptionDetail() {
  const { id: portfolioId, subscriptionId } = useParams();
  let portfolioType = usePortfolioType();
  if (!portfolioType) portfolioType = 'investment';
  const { portfolio, loading } = usePortfolio(portfolioId, portfolioType);

  if (loading) {
    return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
  }
  if (!portfolio || portfolio.type !== 'investment' || !Array.isArray((portfolio as InvestmentPortfolio).subscriptions)) {
    return <div className="text-center py-12">Aucun portefeuille ou souscription trouvée.</div>;
  }
  const subscriptions = (portfolio as InvestmentPortfolio).subscriptions || [];
  const subscription = subscriptions.find((s: SecuritySubscription) => s.id === subscriptionId);
  if (!subscription) {
    return <div className="text-center py-12">Souscription introuvable.</div>;
  }
  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <Breadcrumb
        items={[
          { label: 'Dashboard', href: `/app/${portfolioType}` },
          { label: portfolio?.name || 'Portefeuille', href: `/app/${portfolioType}/${portfolioId}` },
          { label: 'Souscriptions', href: `/app/${portfolioType}/${portfolioId}?tab=subscriptions` },
          { label: `#${subscription.id}` }
        ]}
      />
      <h1 className="text-2xl font-semibold mb-4">Détail de la souscription</h1>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-4">
        <div><span className="font-semibold">ID :</span> {String(subscription.id)}</div>
        <div><span className="font-semibold">Investisseur :</span> {String(subscription.investorId)}</div>
        <div><span className="font-semibold">Montant :</span> {typeof subscription.amount === 'number' ? subscription.amount.toLocaleString() : ''}</div>
        <div><span className="font-semibold">Statut :</span> {String(subscription.status)}</div>
        <div><span className="font-semibold">Date :</span> {String(subscription.created_at)}</div>
        {/* Ajoutez ici d'autres champs métier si besoin */}
      </div>
    </div>
  );
}

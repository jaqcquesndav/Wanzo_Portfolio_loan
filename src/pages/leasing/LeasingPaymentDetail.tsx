import { useParams } from 'react-router-dom';
import { Breadcrumb } from '../../components/common/Breadcrumb';
import { useLeasingPortfolio } from '../../hooks/useLeasingPortfolio';
import type { LeasingPayment } from '../../types/leasing-payment';

export default function LeasingPaymentDetail() {
  const { id: portfolioId, paymentId } = useParams();
  const { portfolio, loading } = useLeasingPortfolio(portfolioId!);

  if (loading) {
    return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
  }
  type LeasingPortfolioWithPayments = typeof portfolio & { payments: LeasingPayment[] };
  if (!portfolio || portfolio.type !== 'leasing' || !Array.isArray((portfolio as LeasingPortfolioWithPayments).payments)) {
    return <div className="text-center py-12">Aucun portefeuille ou paiement trouvé.</div>;
  }
  const payments = (portfolio as LeasingPortfolioWithPayments).payments;
  const payment = payments.find((p: LeasingPayment) => p.id === paymentId);
  if (!payment) {
    return <div className="text-center py-12">Paiement introuvable.</div>;
  }
  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <Breadcrumb
        items={[
          { label: 'Portefeuilles', href: `/app/leasing` },
          { label: portfolio?.name || 'Portefeuille', href: `/app/leasing/${portfolioId}` },
          { label: 'Paiements', href: `/app/leasing/${portfolioId}?tab=payments` },
          { label: `#${payment.id}` }
        ]}
      />
      <h1 className="text-2xl font-semibold mb-4">Détail du paiement</h1>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-4">
        <div><span className="font-semibold">ID :</span> {payment.id}</div>
        <div><span className="font-semibold">Date :</span> {payment.date}</div>
        <div><span className="font-semibold">Montant :</span> {payment.amount.toLocaleString()} €</div>
        <div><span className="font-semibold">Type :</span> {payment.type}</div>
        <div><span className="font-semibold">Statut :</span> {payment.status}</div>
        {/* Ajoutez ici d'autres champs métier si besoin */}
      </div>
    </div>
  );
}

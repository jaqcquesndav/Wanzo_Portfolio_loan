import { useParams } from 'react-router-dom';
import { Breadcrumb } from '../../components/common/Breadcrumb';
import { useLeasingPortfolio } from '../../hooks/useLeasingPortfolio';
import type { LeasingContract, LeasingPortfolio } from '../../types/leasing';

export default function LeasingContractDetail() {
  const { id: portfolioId, contractId } = useParams();
  const { portfolio, loading } = useLeasingPortfolio(portfolioId!);

  if (loading) {
    return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
  }
  type LeasingPortfolioWithContracts = LeasingPortfolio & { contracts: LeasingContract[] };
  if (!portfolio || portfolio.type !== 'leasing' || !Array.isArray((portfolio as LeasingPortfolioWithContracts).contracts)) {
    return <div className="text-center py-12">Aucun portefeuille ou contrat trouvé.</div>;
  }
  const contracts = (portfolio as LeasingPortfolioWithContracts).contracts;
  const contract = contracts.find((c: LeasingContract) => c.id === contractId);
  if (!contract) {
    return <div className="text-center py-12">Contrat introuvable.</div>;
  }
  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <Breadcrumb
        items={[
          { label: 'Portefeuilles', href: `/app/leasing` },
          { label: portfolio?.name || 'Portefeuille', href: `/app/leasing/${portfolioId}` },
          { label: 'Contrats', href: `/app/leasing/${portfolioId}?tab=contracts` },
          { label: `#${contract.id}` }
        ]}
      />
      <h1 className="text-2xl font-semibold mb-4">Détail du contrat</h1>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-4">
        <div><span className="font-semibold">Numéro :</span> {contract.id}</div>
        <div><span className="font-semibold">Client :</span> {contract.client_id}</div>
        <div><span className="font-semibold">Équipement :</span> {contract.equipment_id}</div>
        <div><span className="font-semibold">Montant :</span> {contract.monthly_payment.toLocaleString()} €</div>
        <div><span className="font-semibold">Durée :</span> {contract.start_date} - {contract.end_date}</div>
        <div><span className="font-semibold">Statut :</span> {contract.status}</div>
        {/* Ajoutez ici d'autres champs métier si besoin */}
      </div>
    </div>
  );
}

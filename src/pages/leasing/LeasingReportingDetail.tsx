import { useParams } from 'react-router-dom';
import { Breadcrumb } from '../../components/common/Breadcrumb';
import { useLeasingPortfolio } from '../../hooks/useLeasingPortfolio';

export default function LeasingReportingDetail() {
  const { id: portfolioId, reportId } = useParams();
  const { portfolio, loading } = useLeasingPortfolio(portfolioId!);

  if (loading) {
    return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
  }
  type LeasingPortfolioWithReports = typeof portfolio & { reports: { id: string; period: string; type: string; status: string }[] };
  if (!portfolio || portfolio.type !== 'leasing' || !Array.isArray((portfolio as LeasingPortfolioWithReports).reports)) {
    return <div className="text-center py-12">Aucun portefeuille ou reporting trouvé.</div>;
  }
  const reports = (portfolio as LeasingPortfolioWithReports).reports;
  const report = reports.find((r) => r.id === reportId);
  if (!report) {
    return <div className="text-center py-12">Reporting introuvable.</div>;
  }
  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <Breadcrumb
        items={[
          { label: 'Portefeuilles', href: `/app/leasing` },
          { label: portfolio?.name || 'Portefeuille', href: `/app/leasing/${portfolioId}` },
          { label: 'Reporting', href: `/app/leasing/${portfolioId}?tab=reporting` },
          { label: `#${report.id}` }
        ]}
      />
      <h1 className="text-2xl font-semibold mb-4">Détail du reporting</h1>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-4">
        <div><span className="font-semibold">ID :</span> {String(report.id)}</div>
        <div><span className="font-semibold">Période :</span> {String(report.period)}</div>
        <div><span className="font-semibold">Type :</span> {String(report.type)}</div>
        <div><span className="font-semibold">Statut :</span> {String(report.status)}</div>
        {/* Ajoutez ici d'autres champs métier si besoin */}
      </div>
    </div>
  );
}

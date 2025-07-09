
import { useParams } from 'react-router-dom';
import { Breadcrumb } from '../components/common/Breadcrumb';
import { usePortfolio } from '../hooks/usePortfolio';
import { usePortfolioType } from '../hooks/usePortfolioType';
import type { InvestmentPortfolio, PortfolioCompanyReport } from '../types/investment-portfolio';


export default function InvestmentReportingDetail() {
  const { id: portfolioId, reportId } = useParams();
  let portfolioType = usePortfolioType();
  if (!portfolioType) portfolioType = 'investment';
  const { portfolio, loading } = usePortfolio(portfolioId, portfolioType);

  if (loading) {
    return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
  }
  if (!portfolio || portfolio.type !== 'investment' || !Array.isArray((portfolio as InvestmentPortfolio).reports)) {
    return <div className="text-center py-12">Aucun portefeuille ou reporting trouvé.</div>;
  }
  const reports = (portfolio as InvestmentPortfolio).reports || [];
  const report = reports.find((r: PortfolioCompanyReport) => r.id === reportId);
  if (!report) {
    return <div className="text-center py-12">Reporting introuvable.</div>;
  }
  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <Breadcrumb
        items={[
          { label: 'Dashboard', href: `/app/${portfolioType}` },
          { label: portfolio?.name || 'Portefeuille', href: `/app/${portfolioType}/${portfolioId}` },
          { label: 'Reporting', href: `/app/${portfolioType}/${portfolioId}?tab=reporting` },
          { label: `#${report.id}` }
        ]}
      />
      <h1 className="text-2xl font-semibold mb-4">Détail du reporting</h1>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-4">
        <div><span className="font-semibold">ID :</span> {String(report.id)}</div>
        <div><span className="font-semibold">Période :</span> {String(report.period)}</div>
        <div><span className="font-semibold">KPI :</span> {JSON.stringify(report.kpis)}</div>
        {/* Ajoutez ici d'autres champs métier si besoin */}
      </div>
    </div>
  );
}

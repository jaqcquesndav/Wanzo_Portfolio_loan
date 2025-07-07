import { mockCompanies } from '../data/mockCompanies';
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePortfolioCompanyReports } from '../hooks/usePortfolioCompanyReports';
import { Breadcrumbs } from '../components/ui/Breadcrumbs';
import { NotFound } from '../components/ui/NotFound';

const PortfolioCompanyReportDetails: React.FC = () => {
  const { portfolioId, reportId } = useParams();
  const navigate = useNavigate();
  const { reports } = usePortfolioCompanyReports(portfolioId);
  const report = reports.find((r) => r.id === reportId);

  if (!report) return <NotFound message="Rapport d'entreprise introuvable." />;

  const company = mockCompanies.find(c => c.id === report.companyId);
  return (
    <div className="p-6">
      <Breadcrumbs
        items={[
          { label: 'Portefeuilles', to: '/app/portfolio' },
          { label: `Portfolio #${portfolioId}`, to: `/app/portfolio/${portfolioId}` },
          { label: 'Reporting', to: `/app/portfolio/${portfolioId}/investment/reports` },
          { label: `Rapport #${reportId}` }
        ]}
      />
      <h1 className="text-2xl font-bold mb-4">Détail du rapport d'entreprise</h1>
      <div className="bg-white rounded shadow p-4">
        <div className="mb-2"><strong>ID:</strong> {report.id}</div>
        <div className="mb-2"><strong>Entreprise:</strong> {company ? company.name : report.companyId}</div>
        <div className="mb-2"><strong>Période:</strong> {report.period}</div>
        {typeof report.kpis.ca !== 'undefined' && (
          <div className="mb-2"><strong>Chiffre d'affaires:</strong> {report.kpis.ca.toLocaleString()} FCFA</div>
        )}
        {typeof report.kpis.ebitda !== 'undefined' && (
          <div className="mb-2"><strong>EBITDA:</strong> {report.kpis.ebitda.toLocaleString()} FCFA</div>
        )}
        {typeof report.kpis.effectif !== 'undefined' && (
          <div className="mb-2"><strong>Effectif:</strong> {report.kpis.effectif}</div>
        )}
        <button className="mt-4 btn btn-secondary" onClick={() => navigate(-1)}>Retour</button>
      </div>
    </div>
  );
};

export default PortfolioCompanyReportDetails;

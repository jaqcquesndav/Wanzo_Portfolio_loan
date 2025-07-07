import React from 'react';
import { mockCompanies } from '../data/mockCompanies';
import { useParams, useNavigate } from 'react-router-dom';
import { useInvestmentRequests } from '../hooks/useInvestmentRequests';
import { Breadcrumbs } from '../components/ui/Breadcrumbs';
import { NotFound } from '../components/ui/NotFound';

const InvestmentRequestDetails: React.FC = () => {
  const { portfolioId, requestId } = useParams();
  const navigate = useNavigate();
  const { requests } = useInvestmentRequests(portfolioId);
  const request = requests.find((r) => r.id === requestId);

  if (!request) return <NotFound message="Demande d'investissement introuvable." />;

  const company = mockCompanies.find(c => c.id === request.companyId);
  return (
    <div className="p-6">
      <Breadcrumbs
        items={[
          { label: 'Portefeuilles', to: '/app/portfolio' },
          { label: `Portfolio #${portfolioId}`, to: `/app/portfolio/${portfolioId}` },
          { label: 'Demandes', to: `/app/portfolio/${portfolioId}/investment/requests` },
          { label: `Demande #${requestId}` }
        ]}
      />
      <h1 className="text-2xl font-bold mb-4">Détail de la demande d'investissement</h1>
      <div className="bg-white rounded shadow p-4">
        <div className="mb-2"><strong>ID:</strong> {request.id}</div>
        <div className="mb-2"><strong>Entreprise cible:</strong> {company ? company.name : request.companyId}</div>
        <div className="mb-2"><strong>Montant demandé:</strong> {request.amountRequested.toLocaleString()} FCFA</div>
        <div className="mb-2"><strong>Date de soumission:</strong> {new Date(request.created_at).toLocaleDateString()}</div>
        <div className="mb-2"><strong>Statut:</strong> {request.status}</div>
        <button className="mt-4 btn btn-secondary" onClick={() => navigate(-1)}>Retour</button>
      </div>
    </div>
  );
};

export default InvestmentRequestDetails;

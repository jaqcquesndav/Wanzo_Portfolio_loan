import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useExitEvents } from '../hooks/useExitEvents';
import { Breadcrumbs } from '../components/ui/Breadcrumbs';
import { NotFound } from '../components/ui/NotFound';
import type { ExitEvent } from '../types/investment-portfolio';
import { mockCompanies } from '../data/mockCompanies';

const ExitEventDetails: React.FC = () => {
  const { portfolioId, exitId } = useParams();
  const navigate = useNavigate();
  const { exits } = useExitEvents(portfolioId);
  const exit = exits.find((e: ExitEvent) => e.id === exitId);
  const company = exit ? mockCompanies.find(c => c.id === exit.companyId) : undefined;

  if (!exit) return <NotFound message="Événement de sortie introuvable." />;

  return (
    <div className="p-6">
      <Breadcrumbs
        items={[
          { label: 'Portefeuilles', to: '/app/portfolio' },
          { label: `Portfolio #${portfolioId}`, to: `/app/portfolio/${portfolioId}` },
          { label: 'Sorties', to: `/app/portfolio/${portfolioId}/investment/exits` },
          { label: `Sortie #${exitId}` }
        ]}
      />
      <h1 className="text-2xl font-bold mb-4">Détail de l'événement de sortie</h1>
      <div className="bg-white rounded shadow p-4">
        <div className="mb-2"><strong>ID:</strong> {exit.id}</div>
        <div className="mb-2"><strong>Entreprise:</strong> {company ? company.name : exit.companyId}</div>
        <div className="mb-2"><strong>Date de sortie:</strong> {exit.date}</div>
        <div className="mb-2"><strong>Montant récupéré:</strong> {exit.amount.toLocaleString()} FCFA</div>
        <div className="mb-2"><strong>Type de sortie:</strong> {exit.type}</div>
        <div className="mb-2"><strong>TRI:</strong> {exit.performance.tri}%</div>
        <div className="mb-2"><strong>Multiple:</strong> {exit.performance.multiple}x</div>
        <button className="mt-4 btn btn-secondary" onClick={() => navigate(-1)}>Retour</button>
      </div>
    </div>
  );
};

export default ExitEventDetails;

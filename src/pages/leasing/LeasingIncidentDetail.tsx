import { useParams } from 'react-router-dom';
import { Breadcrumb } from '../../components/common/Breadcrumb';
import { useLeasingPortfolio } from '../../hooks/useLeasingPortfolio';
import type { Incident } from '../../types/leasing-asset';

export default function LeasingIncidentDetail() {
  const { id: portfolioId, incidentId } = useParams();
  const { portfolio, loading } = useLeasingPortfolio(portfolioId!);

  if (loading) {
    return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
  }
  type LeasingPortfolioWithIncidents = typeof portfolio & { incidents: Incident[] };
  if (!portfolio || portfolio.type !== 'leasing' || !Array.isArray((portfolio as LeasingPortfolioWithIncidents).incidents)) {
    return <div className="text-center py-12">Aucun portefeuille ou incident trouvé.</div>;
  }
  const incidents = (portfolio as LeasingPortfolioWithIncidents).incidents;
  const incident = incidents.find((i: Incident) => i.id === incidentId);
  if (!incident) {
    return <div className="text-center py-12">Incident introuvable.</div>;
  }
  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <Breadcrumb
        items={[
          { label: 'Portefeuilles', href: `/app/leasing` },
          { label: portfolio?.name || 'Portefeuille', href: `/app/leasing/${portfolioId}` },
          { label: 'Incidents', href: `/app/leasing/${portfolioId}?tab=incidents` },
          { label: `#${incident.id}` }
        ]}
      />
      <h1 className="text-2xl font-semibold mb-4">Détail de l'incident</h1>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-4">
        <div><span className="font-semibold">ID :</span> {incident.id}</div>
        <div><span className="font-semibold">Équipement :</span> {incident.equipment_id}</div>
        <div><span className="font-semibold">Signalé par :</span> {incident.reported_by}</div>
        <div><span className="font-semibold">Date :</span> {incident.date_reported}</div>
        <div><span className="font-semibold">Description :</span> {incident.description}</div>
        <div><span className="font-semibold">Statut :</span> {incident.status}</div>
        {/* Ajoutez ici d'autres champs métier si besoin */}
      </div>
    </div>
  );
}

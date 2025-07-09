import { useParams } from 'react-router-dom';
import { Breadcrumb } from '../../components/common/Breadcrumb';
import { useLeasingPortfolio } from '../../hooks/useLeasingPortfolio';
import type { Maintenance } from '../../types/leasing-asset';

export default function LeasingMaintenanceDetail() {
  const { id: portfolioId, maintenanceId } = useParams();
  const { portfolio, loading } = useLeasingPortfolio(portfolioId!);

  if (loading) {
    return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
  }
  type LeasingPortfolioWithMaintenances = typeof portfolio & { maintenances: Maintenance[] };
  if (!portfolio || portfolio.type !== 'leasing' || !Array.isArray((portfolio as LeasingPortfolioWithMaintenances).maintenances)) {
    return <div className="text-center py-12">Aucun portefeuille ou maintenance trouvée.</div>;
  }
  const maintenances = (portfolio as LeasingPortfolioWithMaintenances).maintenances;
  const maintenance = maintenances.find((m: Maintenance) => m.id === maintenanceId);
  if (!maintenance) {
    return <div className="text-center py-12">Maintenance introuvable.</div>;
  }
  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <Breadcrumb
        items={[
          { label: 'Portefeuilles', href: `/app/leasing` },
          { label: portfolio?.name || 'Portefeuille', href: `/app/leasing/${portfolioId}` },
          { label: 'Maintenance', href: `/app/leasing/${portfolioId}?tab=maintenance` },
          { label: `#${maintenance.id}` }
        ]}
      />
      <h1 className="text-2xl font-semibold mb-4">Détail de la maintenance</h1>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-4">
        <div><span className="font-semibold">ID :</span> {maintenance.id}</div>
        <div><span className="font-semibold">Équipement :</span> {maintenance.equipment_id}</div>
        <div><span className="font-semibold">Type :</span> {maintenance.type}</div>
        <div><span className="font-semibold">Description :</span> {maintenance.description}</div>
        <div><span className="font-semibold">Date prévue :</span> {maintenance.scheduled_date}</div>
        <div><span className="font-semibold">Date réalisée :</span> {maintenance.completed_date || '—'}</div>
        <div><span className="font-semibold">Statut :</span> {maintenance.status}</div>
        {/* Ajoutez ici d'autres champs métier si besoin */}
      </div>
    </div>
  );
}

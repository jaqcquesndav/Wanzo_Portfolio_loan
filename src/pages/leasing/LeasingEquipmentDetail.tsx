import { useParams } from 'react-router-dom';
import { Breadcrumb } from '../../components/common/Breadcrumb';
import { useLeasingPortfolio } from '../../hooks/useLeasingPortfolio';
import type { Equipment } from '../../types/leasing';

export default function LeasingEquipmentDetail() {
  const { id: portfolioId, equipmentId } = useParams();
  const { portfolio, loading } = useLeasingPortfolio(portfolioId!);

  if (loading) {
    return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
  }
  if (!portfolio || portfolio.type !== 'leasing' || !Array.isArray(portfolio.equipment_catalog)) {
    return <div className="text-center py-12">Aucun portefeuille ou équipement trouvé.</div>;
  }
  const equipment = portfolio.equipment_catalog.find((eq: Equipment) => eq.id === equipmentId);
  if (!equipment) {
    return <div className="text-center py-12">Équipement introuvable.</div>;
  }
  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <Breadcrumb
        items={[
          { label: 'Portefeuilles', href: `/app/leasing` },
          { label: portfolio?.name || 'Portefeuille', href: `/app/leasing/${portfolioId}` },
          { label: 'Équipements', href: `/app/leasing/${portfolioId}?tab=equipments` },
          { label: `#${equipment.id}` }
        ]}
      />
      <h1 className="text-2xl font-semibold mb-4">Détail de l'équipement</h1>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-4">
        <div><span className="font-semibold">Nom :</span> {equipment.name}</div>
        <div><span className="font-semibold">Catégorie :</span> {equipment.category}</div>
        <div><span className="font-semibold">Fabricant :</span> {equipment.manufacturer}</div>
        <div><span className="font-semibold">Modèle :</span> {equipment.model}</div>
        <div><span className="font-semibold">Année :</span> {equipment.year}</div>
        <div><span className="font-semibold">Prix :</span> {equipment.price.toLocaleString()} €</div>
        <div><span className="font-semibold">État :</span> {equipment.condition === 'new' ? 'Neuf' : 'Occasion'}</div>
        <div><span className="font-semibold">Disponibilité :</span> {equipment.availability ? 'Disponible' : 'Indisponible'}</div>
        {/* Ajoutez ici d'autres champs métier si besoin */}
      </div>
    </div>
  );
}

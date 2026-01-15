import { useNavigate } from 'react-router-dom';
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { usePortfolioContext } from '../contexts/usePortfolioContext';
import { PaginatedTable } from '../components/ui/PaginatedTable';

// Données mockées pour l'exemple
const mockData = [
  { id: 1, date: '2025-07-01', montant: 15000, statut: 'En cours', client: 'Acme Corp', agent: 'John Doe' },
  { id: 2, date: '2025-07-03', montant: 22500, statut: 'Terminé', client: 'Globex Inc', agent: 'Jane Smith' },
  { id: 3, date: '2025-07-05', montant: 8750, statut: 'En attente', client: 'Initech LLC', agent: 'Mike Johnson' },
  { id: 4, date: '2025-07-07', montant: 36000, statut: 'En cours', client: 'Umbrella Corp', agent: 'Sarah Brown' },
  { id: 5, date: '2025-07-10', montant: 12750, statut: 'Terminé', client: 'Massive Dynamics', agent: 'Chris Wilson' },
  { id: 6, date: '2025-07-12', montant: 9800, statut: 'En attente', client: 'Stark Industries', agent: 'Alex Davis' },
  { id: 7, date: '2025-07-14', montant: 18500, statut: 'En cours', client: 'Wayne Enterprises', agent: 'Taylor Miller' },
  { id: 8, date: '2025-07-15', montant: 24300, statut: 'Terminé', client: 'Cyberdyne Systems', agent: 'Robin Lee' },
  { id: 9, date: '2025-07-17', montant: 7850, statut: 'En attente', client: 'Tyrell Corp', agent: 'Jordan Kim' },
  { id: 10, date: '2025-07-20', montant: 42500, statut: 'En cours', client: 'Weyland-Yutani', agent: 'Casey Morgan' },
  { id: 11, date: '2025-07-22', montant: 16700, statut: 'Terminé', client: 'OsCorp', agent: 'Pat Johnson' },
  { id: 12, date: '2025-07-25', montant: 29800, statut: 'En attente', client: 'Soylent Corp', agent: 'Riley Scott' }
];

const KPIDetail: React.FC = () => {
  const params = useParams();
  const { portfolioType: contextPortfolioType } = usePortfolioContext();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  // Filtrage des données basé sur la recherche
  const filteredData = mockData.filter(row =>
    Object.values(row).some(val =>
      String(val).toLowerCase().includes(search.toLowerCase())
    )
  );

  // Définition des colonnes du tableau
  const columns = [
    { header: 'ID', accessor: 'id' },
    { header: 'Date', accessor: 'date' },
    { 
      header: 'Montant', 
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      accessor: (row: any) => `${row.montant.toLocaleString()} €`
    },
    { header: 'Statut', accessor: 'statut' },
    { header: 'Client', accessor: 'client' },
    { header: 'Agent', accessor: 'agent' }
  ];

  return (
    <div className="min-h-screen w-full bg-gray-50 dark:bg-gray-950 p-6">
      {/* Breadcrumb */}
      <nav className="mb-4 flex items-center text-sm text-gray-500 dark:text-gray-300 gap-2">
        <button onClick={() => navigate(-1)} className="hover:underline text-primary font-medium">Retour</button>
        <span>/</span>
        <button
          onClick={() => {
            const type = params.portfolioType || contextPortfolioType || 'leasing';
            navigate(`/app/${type}`);
          }}
          className="hover:underline"
        >
          Dashboard
        </button>
        <span>/</span>
        <span className="capitalize">{params.indicator || ''}</span>
      </nav>
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-1">Détail indicateur : <span className="capitalize">{params.indicator}</span></h1>
          <div className="text-gray-500 dark:text-gray-400 text-sm">Portefeuille : {params.portfolioId}</div>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Recherche..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input input-bordered input-sm w-48"
          />
          <button
            className="btn btn-sm btn-primary"
            onClick={() => console.log('Export CSV')}
          >
            Export CSV
          </button>
        </div>
      </div>
      
      <PaginatedTable
        data={filteredData}
        columns={columns}
        keyField="id"
        itemsPerPage={8}
        className="rounded shadow bg-white dark:bg-gray-900"
        thClassName="px-3 py-2 text-left font-semibold bg-gray-100 dark:bg-gray-800"
        tdClassName="px-3 py-2 border-b border-gray-100 dark:border-gray-800"
        trClassName="hover:bg-gray-50 dark:hover:bg-gray-800"
      />
    </div>
  );
};

export default KPIDetail;

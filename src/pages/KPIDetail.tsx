import { useNavigate } from 'react-router-dom';
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { usePortfolioContext } from '../contexts/usePortfolioContext';



const KPIDetail: React.FC = () => {
  const params = useParams();
  const { portfolioType: contextPortfolioType } = usePortfolioContext();
  // Mapping label -> clé de mock data (désactivé car plus utilisé)
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  // const [filter, setFilter] = useState('');

  // Récupération des données mockées selon le portefeuille et l'indicateur
  // const indicatorKey = mapIndicatorLabelToKey(indicator);
  // const data: KPIDetailRow[] = useMemo(() => {
  //   return mockKPIDetails[portfolioId]?.[indicatorKey] || [];
  // }, [portfolioId, indicatorKey]);

  // Filtres simples (à adapter selon l'indicateur)
  // const filteredData = useMemo(() => {
  //   return data.filter(row =>
  //     Object.values(row).some(val =>
  //       String(val).toLowerCase().includes(search.toLowerCase())
  //     )
  //   );
  // }, [data, search]);

  // Colonnes dynamiques
  // const columns = data[0] ? Object.keys(data[0]) : [];

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
          <div className="text-gray-500 text-sm">Portefeuille : {params.portfolioId}</div>
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
            // onClick={() => exportToCSV(filteredData, `KPI_${indicator}_${portfolioId}.csv`)}
          >
            Export CSV
          </button>
        </div>
      </div>
      <div className="overflow-x-auto rounded shadow bg-white dark:bg-gray-900">
        <table className="min-w-full text-sm">
          <thead>
            <tr>
              {/* {columns.map(col => (
                <th key={col} className="px-3 py-2 text-left font-semibold bg-gray-100 dark:bg-gray-800">{col}</th>
              ))} */}
            </tr>
          </thead>
          <tbody>
            {/* {filteredData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-8 text-gray-400">Aucune donnée</td>
              </tr>
            ) : (
              filteredData.map((row, i) => (
                <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  {columns.map(col => (
                    <td key={col} className="px-3 py-2 border-b border-gray-100 dark:border-gray-800">{String((row as any)[col])}</td>
                  ))}
                </tr>
              ))
            )} */}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default KPIDetail;

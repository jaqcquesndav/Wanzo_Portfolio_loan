import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { mockKPIDetails } from '../data/mockKPIDetails';
import { KPIDetailRow } from '../types/kpi';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell, Pagination } from '../components/ui';
import { PerformanceIndicatorCard } from '../components/dashboard/PerformanceIndicatorCard';

// Mapping label -> clé de mock data
function mapIndicatorLabelToKey(label: string): string {
  switch (label.toLowerCase().replace(/\s/g, '')) {
    case 'balanceage':
      return 'balance_AGE';
    case 'impayés':
    case 'impayes':
      return 'impayes';
    case 'couverture':
      return 'couverture';
    case 'valeur':
      return 'valeur';
    case 'rendement':
      return 'rendement';
    case 'benchmark':
      return 'benchmark';
    default:
      return label;
  }
}

const PAGE_SIZE = 10;

const ReportKPIDetail: React.FC = () => {
  const { portfolioId = '', indicator = '' } = useParams();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const indicatorKey = mapIndicatorLabelToKey(indicator || '') as import('../types/kpi').KPIIndicatorType;
  const data: KPIDetailRow[] = useMemo(() => {
    if (mockKPIDetails[portfolioId] && mockKPIDetails[portfolioId][indicatorKey]) {
      return mockKPIDetails[portfolioId][indicatorKey];
    }
    return [];
  }, [portfolioId, indicatorKey]);

  const filteredData = useMemo(() => {
    return data.filter(row =>
      Object.values(row).some(val =>
        String(val).toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [data, search]);

  const paginatedData = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredData.slice(start, start + PAGE_SIZE);
  }, [filteredData, page]);

  const columns = data[0] ? Object.keys(data[0]) : [];
  const totalPages = Math.ceil(filteredData.length / PAGE_SIZE) || 1;

  return (
    <div className="min-h-screen w-full bg-gray-50 dark:bg-gray-950 flex flex-col p-6">
      {/* Breadcrumb */}
      <nav className="mb-4 flex items-center text-sm text-gray-500 dark:text-gray-300 gap-2">
        <button onClick={() => navigate('/reports')} className="hover:underline text-primary font-medium">Rapports</button>
        <span>/</span>
        <span className="capitalize">{indicator}</span>
      </nav>
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-1">Détail indicateur : <span className="capitalize">{indicator}</span></h1>
          <div className="text-gray-500 text-sm">Portefeuille : {portfolioId}</div>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Recherche..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input input-bordered input-sm w-48"
          />
        </div>
      </div>
      {/* KPI résumé */}
      <div className="mb-4">
        <PerformanceIndicatorCard
          label={indicator}
          value={(() => {
            // Affichage dynamique selon le type d'indicateur
            if (indicatorKey === 'valeur') {
              // Dernière valeur
              const last = filteredData[filteredData.length - 1] as { valeur?: number } | undefined;
              return last?.valeur ?? 0;
            }
            if (indicatorKey === 'rendement' || indicatorKey === 'benchmark') {
              // Dernier rendement/benchmark
              const last = filteredData[filteredData.length - 1] as { rendement?: string; benchmark?: string } | undefined;
              return last?.rendement || last?.benchmark || '';
            }
            // Somme des montants pour les autres indicateurs
            // Additionne les montants pour les types qui en ont
            return filteredData.reduce((acc, row) => {
              if ('montant' in row && typeof row.montant === 'number') return acc + row.montant;
              return acc;
            }, 0);
          })()}
          trend="neutral"
        />
      </div>
      <div className="overflow-x-auto rounded shadow bg-white dark:bg-gray-900">
        <Table>
          <TableHead>
            <TableRow>
              {columns.map(col => (
                <TableHeader key={col}>{col}</TableHeader>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell align="center">Aucune donnée</TableCell>
              </TableRow>
            ) : (
              paginatedData.map((row, i) => (
                <TableRow key={i}>
                  {columns.map(col => (
                    <TableCell key={col}>
                      {(() => {
                        // Affichage formaté selon la colonne
                        let value: string | number | undefined = undefined;
                        if (col in row) value = (row as Record<string, string | number>)[col];
                        if (col === 'montant' || col === 'valeur') {
                          return typeof value === 'number' ? value.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' }) : value;
                        }
                        return value ?? '';
                      })()}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
};

export default ReportKPIDetail;

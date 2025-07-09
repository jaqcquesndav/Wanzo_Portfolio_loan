
interface ReportingTableProps {
  reports: { id: string; period: string; type: string; status: string }[];
  loading?: boolean;
  onRowClick?: (report: { id: string; period: string; type: string; status: string }) => void;
}

export function ReportingTable({ reports, loading = false, onRowClick }: ReportingTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg shadow border border-gray-200 dark:border-gray-700 w-full">
      <table className="min-w-full bg-white dark:bg-gray-800">
        <thead>
          <tr className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
            <th className="px-4 py-2 text-left">Période</th>
            <th className="px-4 py-2 text-left">Type</th>
            <th className="px-4 py-2 text-left">Statut</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            Array.from({ length: 3 }).map((_, idx) => (
              <tr key={idx} className="animate-pulse">
                {Array.from({ length: 3 }).map((_, i) => (
                  <td key={i} className="px-4 py-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mx-auto" />
                  </td>
                ))}
              </tr>
            ))
          ) : reports.length === 0 ? (
            <tr>
              <td colSpan={3} className="text-center py-8 text-gray-400">Aucun reporting à afficher</td>
            </tr>
          ) : (
            reports.map((report) => (
              <tr
                key={report.id}
                className="group hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer"
                onClick={onRowClick ? () => onRowClick(report) : undefined}
              >
                <td className="px-4 py-2">{report.period}</td>
                <td className="px-4 py-2">{report.type}</td>
                <td className="px-4 py-2">{report.status}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

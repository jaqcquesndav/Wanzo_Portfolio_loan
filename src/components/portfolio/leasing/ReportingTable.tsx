export function ReportingTable() {
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
          <tr>
            <td colSpan={3} className="text-center py-8 text-gray-400">Aucun reporting à afficher</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

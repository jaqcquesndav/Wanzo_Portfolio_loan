import React from 'react';

export default function InvestmentReports() {
  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Rapports d'investissement</h1>
      <ul className="list-disc pl-6 space-y-2">
        <li>Performance des portefeuilles</li>
        <li>Allocation d'actifs</li>
        <li>Rendement par secteur</li>
        <li>Comparatif benchmark</li>
        <li>Export PDF/Excel/CSV</li>
      </ul>
    </div>
  );
}
